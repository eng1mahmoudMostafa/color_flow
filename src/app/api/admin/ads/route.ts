import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, ok, assertSameOrigin } from '@/lib/api-helpers';
import { adminAdSchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { nextExpiry, cleanupExpiredAds, cleanupOrphanMedia } from '@/lib/ad-cleanup';
import { storageUsage, MAX_TOTAL_BYTES } from '@/lib/media';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const [removed, orphans] = await Promise.all([cleanupExpiredAds(), cleanupOrphanMedia()]);
    const [ads, storageUsedBytes] = await Promise.all([
      prisma.advertisement.findMany({
        orderBy: [{ permanent: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true, title: true, message: true, mediaUrl: true,
          mediaType: true, linkUrl: true, durationSeconds: true,
          slot: true, active: true, permanent: true, expiresAt: true,
          impressions: true, clicks: true, createdAt: true,
        },
      }),
      storageUsage(),
    ]);
    return ok({
      ads,
      storage: {
        usedBytes: storageUsedBytes,
        limitBytes: MAX_TOTAL_BYTES,
        removedExpired: removed,
        removedOrphans: orphans,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await assertSameOrigin(req);
    const body = adminAdSchema.parse(await req.json());
    // A slot holds exactly one ad — reject creating into an occupied slot
    // (prevents two ads stacking in one slot and the "delete didn't work" confusion).
    const occupant = await prisma.advertisement.findFirst({ where: { slot: body.slot } });
    if (occupant) {
      return NextResponse.json(
        { ok: false, error: { code: "SLOT_OCCUPIED", message: `Slot ${body.slot} is already occupied by "${occupant.title}". Delete it first or choose another slot (1-3).` } },
        { status: 409 }
      );
    }
    const ad = await prisma.advertisement.create({
      data: {
        title: body.title,
        message: body.message,
        mediaUrl: body.mediaUrl,
        mediaType: body.mediaType,
        linkUrl: body.linkUrl ?? null,
        durationSeconds: body.durationSeconds,
        slot: body.slot,
        active: body.active ?? true,
        expiresAt: nextExpiry(),
      },
    });
    return ok({ ad }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
