import { handleApiError, fail, ok } from "@/lib/api-helpers";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { eventCounts } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    const [palettes, users, adSessions, activeAccess, events, totalAds, activeAds, adAgg] = await Promise.all([
      prisma.palette.count(),
      prisma.user.count(),
      prisma.adSession.count(),
      prisma.accessSession.count({ where: { expiresAt: { gt: new Date() } } }),
      eventCounts(),
      prisma.advertisement.count(),
      prisma.advertisement.count({ where: { active: true } }),
      prisma.advertisement.aggregate({ _sum: { impressions: true, clicks: true } }),
    ]);

    const verifiedAds = await prisma.adSession.count({
      where: { verificationStatus: "VERIFIED" },
    });
    const failedAds = await prisma.adSession.count({
      where: { verificationStatus: { in: ["FAILED", "EXPIRED"] } },
    });

    return ok({
      overview: { palettes, users, adSessions, activeAccess },
      ads: { verifiedAds, failedAds, conversion: adSessions ? verifiedAds / adSessions : 0 },
      events,
      totalPalettes: palettes,
      totalAds,
      activeAds,
      totalImpressions: adAgg._sum.impressions ?? 0,
      totalClicks: adAgg._sum.clicks ?? 0,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
