import { handleApiError, fail, ok } from "@/lib/api-helpers";
import { getCurrentUser } from "@/lib/auth";
import { getGuestToken } from "@/lib/session";
import { getAccessState } from "@/lib/access";

export const dynamic = "force-dynamic";

/**
 * GET /api/access/status — the authoritative copy-access state.
 * UI caching of this response is allowed for convenience only; every copy
 * action is still re-verified server-side via /api/copy/authorize.
 */
export async function GET() {
  try {
    const sessionToken = await getGuestToken();
    if (!sessionToken) return fail("SERVER_ERROR", "Session could not be established.", 500);

    const user = await getCurrentUser();
    const state = await getAccessState({ sessionToken, userId: user?.id });
    return ok(state);
  } catch (err) {
    return handleApiError(err);
  }
}
