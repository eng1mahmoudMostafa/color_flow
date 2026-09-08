import { handleApiError, ok, assertSameOrigin } from "@/lib/api-helpers";
import { clearAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req as never);
    await clearAuthCookie();
    return ok({ loggedOut: true });
  } catch (err) {
    return handleApiError(err);
  }
}
