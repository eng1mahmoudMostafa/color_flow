import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from "@/lib/media";

export const dynamic = "force-dynamic";

/**
 * Token endpoint for client-direct uploads to Vercel Blob.
 * The browser uploads the file straight to Blob storage (bypassing the
 * 4.5 MB serverless request-body limit), then sends us only the final URL.
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const token =
      process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.VERCEL_BLOB_READ_WRITE_TOKEN ||
      "";
    if (!token.trim()) {
      return NextResponse.json(
        { ok: false, error: "Blob storage is not connected. Create a Blob store in Vercel → Storage and connect it to this project, then Redeploy." },
        { status: 500 }
      );
    }
    const body = (await req.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request: req,
      token,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "image/svg+xml",
          "video/mp4",
          "video/webm",
          "video/quicktime",
        ],
        maximumSizeInBytes: MAX_VIDEO_BYTES,
        addRandomSuffix: true,
      }),
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    return handleApiError(err);
  }
}
