import { NextRequest } from "next/server";
import { handleApiError, ok, assertSameOrigin } from "@/lib/api-helpers";
import { adClickSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST /api/ad/click — records a click on an advertiser's link. */
export async function POST(req: NextRequest) {
  try {
    await assertSameOrigin(req);
    const { id } = adClickSchema.parse(await req.json());
    await prisma.advertisement.updateMany({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
    return ok({ counted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
