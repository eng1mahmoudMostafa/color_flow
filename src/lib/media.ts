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

/** Resolve an internal media URL to an absolute file path (returns null if outside uploads). */
export function mediaPathFromUrl(url: string): string | null {
  if (!isLocalMediaUrl(url)) return null;
  const filename = url.replace(/^\/ads-media\//, "");
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return null;
  return join(UPLOAD_DIR, filename);
}

/** Delete the local file backing a media URL, if it is internally hosted. */
export async function deleteMediaFile(mediaUrl: string): Promise<void> {
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

/** Persist an uploaded file to local storage and return its site URL. */
export async function saveUploadedFile(file: File): Promise<{ mediaUrl: string; mediaType: "IMAGE" | "VIDEO"; filename: string }> {
  const ext = extname(file.name).toLowerCase();
  const allowed = [...ALLOWED_IMAGE, ...ALLOWED_VIDEO];
  if (!allowed.includes(ext)) throw new MediaError(`Unsupported file type: ${ext}`);
  const isVideo = ALLOWED_VIDEO.includes(ext);
  const maxFileBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxFileBytes) {
    throw new MediaError(`File too large (max ${Math.round(maxFileBytes / 1024 / 1024)} MB for ${isVideo ? "video" : "images"}).`);
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