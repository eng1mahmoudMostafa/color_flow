import { NextRequest } from "next/server";
import { handleApiError, fail, ok, clientIp, assertSameOrigin } from "@/lib/api-helpers";
import { getCurrentUser } from "@/lib/auth";
import { getGuestToken } from "@/lib/session";
import { rateLimit, RATE_POLICIES } from "@/lib/rate-limit";
import { stableHash } from "@/lib/session";
import { getAdProvider } from "@/lib/ads";
import { getAccessState } from "@/lib/access";

export const dynamic = "force-dynamic";

/**
 * POST /api/ad/start — begins a rewarded-ad session via the configured provider.
 * Rate-limited aggressively; users with active access never need this endpoint.
 */
export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const ip = stableHash(clientIp(req));
    const rl = rateLimit({ key: `ad-start:${ip}`, ...RATE_POLICIES.adStart });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many unlock attempts. Please try again later.", 429, {
        retryAfterSeconds: rl.retryAfterSeconds,
      });
    }

    const sessionToken = await getGuestToken();
    if (!sessionToken) return fail("SERVER_ERROR", "Session could not be established.", 500);

    const user = await getCurrentUser();
    const state = await getAccessState({ sessionToken, userId: user?.id });
    if (state.unlocked) {
      return ok({ alreadyUnlocked: true, expiresAt: state.expiresAt, remainingMs: state.remainingMs });
    }

    const provider = getAdProvider();
    const result = await provider.startAd({ sessionToken, userId: user?.id ?? null });
    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}
