import { NextRequest } from "next/server";
import { handleApiError, fail, ok } from "@/lib/api-helpers";
import { getPaletteBySlug } from "@/lib/palettes";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const palette = await getPaletteBySlug(slug);
    if (!palette) return fail("NOT_FOUND", "Palette not found.", 404);
    return ok(palette);
  } catch (err) {
    return handleApiError(err);
  }
}
