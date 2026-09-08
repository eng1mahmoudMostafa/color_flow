import { NextRequest } from "next/server";
import { handleApiError, ok, clientIp, assertSameOrigin } from "@/lib/api-helpers";
import { rateLimit, RATE_POLICIES } from "@/lib/rate-limit";
import { stableHash } from "@/lib/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";


/**
 * GET /api/ad/media â€” returns the active advertiser creatives in playback
 * order (slot 1 â†’ 2 â†’ 3, newest first within a slot) shown inside the
 * rewarded-ad modal, each with its own configured duration. Increments the
 * impression counter of every returned creative.
 */
export async function GET(req: NextRequest) {
  try {
    await assertSameOrigin(req);
    const rl = rateLimit({ key: `ad-media:${stableHash(clientIp(req))}`, limit: 60, windowMs: 60_000 });
    if (!rl.ok) return ok({ ads: [] });

    const ads = await prisma.advertisement.findMany({
      where: { active: true },
      orderBy: [{ slot: "asc" }, { createdAt: "desc" }],
      take: 3,
    });
    if (ads.length === 0) return ok({ ads: [] });

    await prisma.advertisement.updateMany({
      where: { id: { in: ads.map((a) => a.id) } },
      data: { impressions: { increment: 1 } },
    });

    return ok({
      ads: ads.map((ad) => ({
        id: ad.id,
        slot: ad.slot,
        title: ad.title,
        message: ad.message,
        mediaUrl: ad.mediaUrl,
        mediaType: ad.mediaType,
        linkUrl: ad.linkUrl,
        durationSeconds: ad.durationSeconds,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}