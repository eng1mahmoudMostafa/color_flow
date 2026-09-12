import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, ok, fail, assertSameOrigin } from '@/lib/api-helpers';
import { adminAdUpdateSchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { cleanupExpiredAds } from '@/lib/ad-cleanup';
import { deleteMediaFile } from '@/lib/media';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    try { await assertSameOrigin(req); } catch { /* cookie auth is sufficient */ }
    const { id } = await params;
    await cleanupExpiredAds();
    const existing = await prisma.advertisement.findUnique({ where: { id } });
    if (!existing) return ok({ error: 'Not found' }, { status: 404 });
    const body = adminAdUpdateSchema.parse(await req.json());
    // Moving an ad into a slot occupied by ANOTHER ad is rejected — one ad per slot.
    if (typeof body.slot === 'number' && body.slot !== existing.slot) {
      const occupant = await prisma.advertisement.findFirst({
        where: { slot: body.slot, NOT: { id } },
      });
      if (occupant) {
        return NextResponse.json(
          { ok: false, error: { code: 'SLOT_OCCUPIED', message: `Slot ${body.slot} is already occupied by "${occupant.title}". Choose another slot (1-3).` } },
          { status: 409 }
        );
      }
    }
    const ad = await prisma.advertisement.update({
      where: { id },
      data: { ...body, updatedAt: new Date() },
    });
    return ok({ ad });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    // Best-effort cleanup first — never let it block the actual delete.
    try { await cleanupExpiredAds(); } catch { /* ignore */ }
    const existing = await prisma.advertisement.findUnique({ where: { id } });
    if (!existing) return fail("NOT_FOUND", "Ad not found (it may already be deleted).", 404);
    // Delete the associated media file — failure here must NOT block the DB delete.
    if (existing.mediaUrl) {
      try { await deleteMediaFile(existing.mediaUrl); } catch { /* ignore */ }
    }
    await prisma.advertisement.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
