import { join, extname } from "node:path";
import { existsSync } from "node:fs";
import { unlink, mkdir, writeFile, readdir, stat } from "node:fs/promises";

export const UPLOAD_DIR = join(process.cwd(), "uploads", "ads");
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB per image
export const MAX_VIDEO_BYTES = 30 * 1024 * 1024; // 30 MB per video
/** Hard cap on total ad storage so a free hosting plan never fills up. */
export const MAX_TOTAL_BYTES = 50 * 1024 * 1024; // 50 MB
export class MediaError extends Error {}
export const ALLOWED_IMAGE = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
export const ALLOWED_VIDEO = [".mp4", ".webm", ".mov"];

/** Vercel Blob token — when set, uploads go to persistent Blob storage instead of the ephemeral disk. */
function blobToken(): string | null {
  const t =
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN ||
    "";
  return t.trim() ? t.trim() : null;
}

export function blobEnabled(): boolean {
  return Boolean(blobToken());
}

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

/** Is this an internally-served URL (starts with /ads-media/)? */
export function isLocalMediaUrl(url: string): boolean {
  return /^\/ads-media\//.test(url);
}

/** Is this a Vercel Blob URL (public.blob.vercel-storage.com)? */
export function isBlobMediaUrl(url: string): boolean {
  return /^https:\/\/[^/]*\.public\.blob\.vercel-storage\.com\//i.test(url.trim());
}

/** Resolve an internal media URL to an absolute file path (returns null if outside uploads). */
export function mediaPathFromUrl(url: string): string | null {
  if (!isLocalMediaUrl(url)) return null;
  const filename = url.replace(/^\/ads-media\//, "");
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return null;
  return join(UPLOAD_DIR, filename);
}

/** Delete the media backing a URL: local disk file or Vercel Blob object. */
export async function deleteMediaFile(mediaUrl: string): Promise<void> {
  if (isBlobMediaUrl(mediaUrl)) {
    const token = blobToken();
    if (!token) return;
    try {
      const { del } = await import("@vercel/blob");
      await del(mediaUrl, { token });
    } catch {
      /* best effort */
    }
    return;
  }
  const path = mediaPathFromUrl(mediaUrl);
  if (!path || !existsSync(path)) return;
  try {
    await unlink(path);
  } catch {
    /* best effort */
  }
}

/** Total bytes currently used by ad media on disk. */
export async function storageUsage(): Promise<number> {
  if (!existsSync(UPLOAD_DIR)) return 0;
  let total = 0;
  for (const name of await readdir(UPLOAD_DIR)) {
    try {
      total += (await stat(join(UPLOAD_DIR, name))).size;
    } catch {
      /* file vanished mid-scan */
    }
  }
  return total;
}

/**
 * Persist an uploaded file and return its site URL.
 * - Local dev (no BLOB token): saves to uploads/ads on disk, returns /ads-media/...
 * - Production on Vercel (BLOB_READ_WRITE_TOKEN set): uploads to Vercel Blob
 *   (persistent), returns the public Blob URL.
 */
export async function saveUploadedFile(file: File): Promise<{ mediaUrl: string; mediaType: "IMAGE" | "VIDEO"; filename: string }> {
  const ext = extname(file.name).toLowerCase();
  const allowed = [...ALLOWED_IMAGE, ...ALLOWED_VIDEO];
  if (!allowed.includes(ext)) throw new MediaError(`Unsupported file type: ${ext}`);
  const isVideo = ALLOWED_VIDEO.includes(ext);
  const maxFileBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxFileBytes) {
    throw new MediaError(`File too large (max ${Math.round(maxFileBytes / 1024 / 1024)} MB for ${isVideo ? "video" : "images"}).`);
  }

  const token = blobToken();
  if (token) {
    // Persistent cloud storage (survives redeploys). Enforce quota via Blob listing.
    const { put, list } = await import("@vercel/blob");
    try {
      let used = 0;
      let cursor: string | undefined;
      do {
        const page: { blobs: { size: number }[]; cursor?: string } = await list({ token, cursor });
        for (const b of page.blobs) used += b.size ?? 0;
        cursor = page.cursor;
      } while (cursor);
      if (used + file.size > MAX_TOTAL_BYTES) {
        throw new MediaError(
          `Storage limit reached (${Math.round(MAX_TOTAL_BYTES / 1024 / 1024)} MB). Delete some older ads first.`
        );
      }
    } catch (err) {
      if (err instanceof MediaError) throw err;
      /* listing failed — proceed with upload anyway */
    }
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    const contentType = CONTENT_TYPES[ext] ?? (isVideo ? "video/mp4" : "image/jpeg");
    const blob = await put(`ads/${filename}`, file, { access: "public", contentType, token });
    return { mediaUrl: blob.url, mediaType: isVideo ? "VIDEO" : "IMAGE", filename };
  }

  // Enforce the total storage quota so free hosting never fills up.
  const used = await storageUsage();
  if (used + file.size > MAX_TOTAL_BYTES) {
    throw new MediaError(
      `Storage limit reached (${Math.round(MAX_TOTAL_BYTES / 1024 / 1024)} MB). Delete some older ads first.`
    );
  }

  const mediaType = ALLOWED_IMAGE.includes(ext) ? "IMAGE" : "VIDEO";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;

  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(join(UPLOAD_DIR, filename), bytes);

  return { mediaUrl: `/ads-media/${filename}`, mediaType, filename };
}

/** Serve file bytes or null (with content type) for an internal media URL. */
export async function readMedia(mediaUrl: string): Promise<{ data: Uint8Array; contentType: string } | null> {
  const path = mediaPathFromUrl(mediaUrl);
  if (!path || !existsSync(path)) return null;
  const ext = extname(path).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const { readFile } = await import("node:fs/promises");
  const data = await readFile(path);
  return { data: new Uint8Array(data), contentType };
}

/** Client-safe alias: save an uploaded file and return its site URL. */
export async function uploadMedia(file: File): Promise<string> {
  const { mediaUrl } = await saveUploadedFile(file);
  return mediaUrl;
}

/** Client-safe alias for the admin dashboard delete path. */
export const deleteMedia = deleteMediaFile;