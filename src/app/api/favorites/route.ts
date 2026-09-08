import { NextRequest } from "next/server";
import { handleApiError, ok, clientIp, assertSameOrigin } from "@/lib/api-helpers";
import { favoriteSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { getGuestToken } from "@/lib/session";
import { rateLimit, RATE_POLICIES } from "@/lib/rate-limit";
import { stableHash } from "@/lib/session";
import { prisma } from "@/lib/db";
import { logEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

/** Favorites are a registered-user feature; guests are pointed to sign-up. */
async function requireUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const ip = stableHash(clientIp(req));
    const rl = rateLimit({ key: `favorites:${ip}`, ...RATE_POLICIES.favorites });
    if (!rl.ok) return ok({ added: false, reason: "rate_limited" }, { status: 429 });

    const userId = await requireUserId();
    if (!userId) return ok({ added: false, reason: "auth_required" });

    const body = await req.json();
    const { paletteId, colorId } = favoriteSchema.parse(body);

    const existing = await prisma.favorite.findFirst({
      where: { userId, paletteId: paletteId ?? null, colorId: colorId ?? null },
    });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return ok({ added: false, toggled: "removed" });
    }

    await prisma.favorite.create({
      data: { userId, paletteId: paletteId ?? null, colorId: colorId ?? null },
    });
    await logEvent("palette_saved", { kind: paletteId ? "palette" : "color" });
    return ok({ added: true, toggled: "added" });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const userId = await requireUserId();
    if (!userId) return ok({ removed: false, reason: "auth_required" });

    const body = await req.json();
    const { paletteId, colorId } = favoriteSchema.parse(body);

    await prisma.favorite.deleteMany({
      where: { userId, paletteId: paletteId ?? null, colorId: colorId ?? null },
    });
    return ok({ removed: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET() {
  try {
    const userId = await requireUserId();
    if (!userId) return ok({ favorites: { palettes: [], colors: [] } });

    const favs = await prisma.favorite.findMany({
      where: { userId },
      include: {
        palette: { include: { colors: { orderBy: { position: "asc" } } } },
        color: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({
      favorites: {
        palettes: favs
          .filter((f) => f.palette)
          .map((f) => ({
            id: f.id,
            slug: f.palette!.slug,
            name: f.palette!.name,
            category: f.palette!.category,
            colors: f.palette!.colors.map((c) => c.hex),
          })),
        colors: favs
          .filter((f) => f.color)
          .map((f) => ({
            id: f.id,
            hex: f.color!.hex,
            name: f.color!.name,
          })),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
