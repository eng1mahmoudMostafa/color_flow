import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { blobEnabled } from "@/lib/media";

export const dynamic = "force-dynamic";

/** Tells the admin UI whether cloud (Blob) uploads are available. */
export async function GET() {
  await requireAdmin();
  return NextResponse.json({ ok: true, data: { blob: blobEnabled() } });
}
