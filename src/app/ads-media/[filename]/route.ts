import { NextRequest } from "next/server";
import { handleApiError, ok } from "@/lib/api-helpers";
import { readMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return ok({ error: "Invalid filename" }, { status: 400 });
    const result = await readMedia(`/ads-media/${filename}`);
    if (!result) return ok({ error: "Not found" }, { status: 404 });
    return new Response(new Blob([result.data.buffer as ArrayBuffer]), {
      status: 200,
      headers: { "Content-Type": result.contentType, "Cache-Control": "public, max-age=86400" },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
