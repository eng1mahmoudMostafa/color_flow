import { NextRequest } from 'next/server';
import { handleApiError, ok, fail } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth';
import { saveUploadedFile, MediaError } from '@/lib/media';
import { cleanupExpiredAds } from '@/lib/ad-cleanup';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    // Free space from expired ads before accepting a new upload.
    await cleanupExpiredAds(true);
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') return fail('BAD_REQUEST', 'No file provided.', 400);
    try {
      const result = await saveUploadedFile(file);
      return ok({ file: result });
    } catch (err) {
      if (err instanceof MediaError) return fail('BAD_REQUEST', err.message, 400);
      throw err;
    }
  } catch (err) {
    return handleApiError(err);
  }
}
