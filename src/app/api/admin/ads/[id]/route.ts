import { NextRequest } from 'next/server';
import { handleApiError, ok, assertSameOrigin } from '@/lib/api-helpers';
import { adminAdUpdateSchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { cleanupExpiredAds } from '@/lib/ad-cleanup';
import { deleteMediaFile } from '@/lib/media';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await assertSameOrigin(req);
    const { id } = await params;
    await cleanupExpiredAds();
    const existing = await prisma.advertisement.findUnique({ where: { id } });
    if (!existing) return ok({ error: 'Not found' }, { status: 404 });
    const body = adminAdUpdateSchema.parse(await req.json());
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
    await assertSameOrigin(req);
    const { id } = await params;
    await cleanupExpiredAds();
    const existing = await prisma.advertisement.findUnique({ where: { id } });
    if (!existing) return ok({ error: 'Not found' }, { status: 404 });
    // Delete the associated media file from disk
    if (existing.mediaUrl) {
      await deleteMediaFile(existing.mediaUrl);
    }
    await prisma.advertisement.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
