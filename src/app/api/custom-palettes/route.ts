import { NextRequest } from "next/server";
import { handleApiError, fail, ok, assertSameOrigin } from "@/lib/api-helpers";
import { customPaletteSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { colorInfoFromHex } from "@/lib/palettes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return ok({ palettes: [] });

    const rows = await prisma.customPalette.findMany({
      where: { userId: user.id },
      include: { colors: { orderBy: { position: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });

    return ok({
      palettes: rows.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        tags: p.tags,
        isPublic: p.isPublic,
        updatedAt: p.updatedAt.toISOString(),
        colors: p.colors.map((c) => colorInfoFromHex(c.name, c.hex)),
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const user = await getCurrentUser();
    if (!user) return fail("UNAUTHORIZED", "Sign in to create custom palettes.", 401);

    const body = await req.json();
    const data = customPaletteSchema.parse(body);

    const created = await prisma.customPalette.create({
      data: {
        userId: user.id,
        name: data.name,
        description: data.description,
        tags: data.tags,
        isPublic: data.isPublic,
        colors: {
          create: data.colors.map((c, i) => ({
            name: c.name,
            hex: c.hex.toLowerCase(),
            position: i,
          })),
        },
      },
      include: { colors: { orderBy: { position: "asc" } } },
    });

    return ok({
      id: created.id,
      name: created.name,
      colors: created.colors.map((c) => c.hex),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
