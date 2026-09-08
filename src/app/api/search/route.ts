import { NextRequest } from "next/server";
import { handleApiError, ok, clientIp } from "@/lib/api-helpers";
import { searchSchema } from "@/lib/validation";
import { listPalettes } from "@/lib/palettes";
import { rateLimit, RATE_POLICIES } from "@/lib/rate-limit";
import { stableHash } from "@/lib/session";
import { CATEGORY_LABELS } from "@/lib/data/palettes";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const ip = stableHash(clientIp(req));
    const rl = rateLimit({ key: `search:${ip}`, ...RATE_POLICIES.search });
    if (!rl.ok) {
      return ok({ results: [], rateLimited: true, retryAfterSeconds: rl.retryAfterSeconds });
    }

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const { q, limit } = searchSchema.parse(params);

    const { palettes } = await listPalettes({ q, perPage: limit });

    // Category-name matches (e.g. "luxury", "dark").
    const qLower = q.toLowerCase();
    const categoryMatches = Object.entries(CATEGORY_LABELS)
      .filter(
        ([key, label]) =>
          label.toLowerCase().includes(qLower) || key.toLowerCase().includes(qLower)
      )
      .slice(0, 3)
      .map(([key, label]) => ({ type: "category" as const, key, label }));

    return ok({
      results: palettes.map((p) => ({
        type: "palette" as const,
        slug: p.slug,
        name: p.name,
        category: p.category,
        colors: p.colors.slice(0, 5).map((c) => c.hex),
      })),
      categories: categoryMatches,
      rateLimited: false,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
