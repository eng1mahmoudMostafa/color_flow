import { NextRequest } from "next/server";
import { handleApiError, ok } from "@/lib/api-helpers";
import { paletteQuerySchema } from "@/lib/validation";
import { listPalettes } from "@/lib/palettes";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const query = paletteQuerySchema.parse(params);
    const result = await listPalettes(query);
    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}
