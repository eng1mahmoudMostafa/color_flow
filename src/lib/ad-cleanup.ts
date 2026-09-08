import { prisma } from "@/lib/db";
import { deleteMediaFile } from "@/lib/media";

/** Ad lifetime in ms: 30 days. */
export const AD_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Lazily delete every non-permanent ad whose `expiresAt` has passed, removing
 * its stored media file from disk as well. Run on ad read/write to keep the
 * storage (and DB) from accumulating expired creatives without needing a cron.
 * Rate-guarded in-memory so it runs at most once per bucket on a given node.
 */
let lastCleanup = 0;
let runningCleanup: Promise<number> | null = null;

export function nextExpiry(): Date {
  return new Date(Date.now() + AD_LIFETIME_MS);
}

export async function cleanupExpiredAds(force = false): Promise<number> {
  const now = Date.now();
  if (!force && now - lastCleanup < 60_000) return 0;
  lastCleanup = now;

  if (runningCleanup) return runningCleanup;
  runningCleanup = (async () => {
    try {
      const expired = await prisma.advertisement.findMany({
        where: { permanent: false, expiresAt: { lte: new Date(now) } },
        select: { id: true, mediaUrl: true },
      });
      for (const ad of expired) {
        await deleteMediaFile(ad.mediaUrl);
      }
      if (expired.length > 0) {
        await prisma.advertisement.deleteMany({
          where: { id: { in: expired.map((a) => a.id) } },
        });
      }
      return expired.length;
    } finally {
      runningCleanup = null;
    }
  })();
  return runningCleanup;
}

/**
 * Delete orphaned media files: files on disk that no Advertisement row
 * references (e.g. uploads whose Create was never completed). Keeps storage
 * from growing without bound on free hosting plans.
 */
export async function cleanupOrphanMedia(): Promise<number> {
  const { UPLOAD_DIR, mediaPathFromUrl } = await import("@/lib/media");
  const { readdir, unlink } = await import("node:fs/promises");
  const { existsSync } = await import("node:fs");
  const { join } = await import("node:path");
  if (!existsSync(UPLOAD_DIR)) return 0;

  const referenced = new Set(
    (await prisma.advertisement.findMany({ select: { mediaUrl: true } }))
      .map((a) => mediaPathFromUrl(a.mediaUrl))
      .filter((p): p is string => Boolean(p))
  );

  let removed = 0;
  for (const name of await readdir(UPLOAD_DIR)) {
    const full = join(UPLOAD_DIR, name);
    if (referenced.has(full)) continue;
    try {
      await unlink(full);
      removed++;
    } catch {
      /* best effort */
    }
  }
  return removed;
}