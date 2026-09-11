import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadMode } from "@/lib/media";

export const dynamic = "force-dynamic";

/** Tells the admin UI which upload mode to use (and whether cloud storage is ready). */
export async function GET() {
  await requireAdmin();
  const mode = uploadMode();
  return NextResponse.json({
    ok: true,
    data: {
      blob: mode === "blob",
      mode,
      hint:
        mode === "blob"
          ? null
          : "Cloud storage is not connected. In Vercel: Storage → Create Blob store → Connect to this project → Redeploy. Until then, paste an external image/video URL instead of uploading.",
    },
  });
}
