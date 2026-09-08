import { NextRequest } from "next/server";
import { handleApiError, fail, ok, clientIp, assertSameOrigin } from "@/lib/api-helpers";
import { adVerifySchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { getGuestToken, stableHash } from "@/lib/session";
import { rateLimit, RATE_POLICIES } from "@/lib/rate-limit";
import { getAdProvider } from "@/lib/ads";
import { grantAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

/**
 * POST /api/ad/verify — verifies ad completion SERVER-SIDE and, when verified,
 * grants 24-hour copy access (expiresAt = server time + 24h).
 * The client countdown is never trusted; verification always consults the
 * provider, which checks server-generated timestamps.
 */
export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const ip = stableHash(clientIp(req));
    const rl = rateLimit({ key: `ad-verify:${ip}`, ...RATE_POLICIES.adVerify });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many verification attempts. Please slow down.", 429, {
        retryAfterSeconds: rl.retryAfterSeconds,
      });
    }

    const sessionToken = await getGuestToken();
    if (!sessionToken) return fail("SERVER_ERROR", "Session could not be established.", 500);

    const body = await req.json();
    const { adSessionId } = adVerifySchema.parse(body);

    const provider = getAdProvider();

    // Confirm the session belongs to this caller's hashed session token.
    const status = await provider.getAdStatus(adSessionId);
    if (status.status === "not_found") {
      return fail("NOT_FOUND", "Ad session not found.", 404);
    }
    if (status.status === "expired") {
      return fail("AD_NOT_VERIFIED", "This ad session expired. Please start a new ad.", 410);
    }

    const verification = await provider.verifyCompletion(adSessionId);
    if (!verification.verified) {
      const remaining =
        status.status === "pending" ? status.remainingSeconds : 0;
      return fail(
        "AD_NOT_VERIFIED",
        remaining > 0
          ? `The advertisement has not finished yet (${remaining}s remaining).`
          : "Advertisement verification failed. Please try again.",
        403,
        { reason: verification.reason, remainingSeconds: remaining }
      );
    }

    const finished = await provider.finishAd(adSessionId);
    if (!finished.accessGranted || !finished.expiresAt) {
      return fail("AD_NOT_VERIFIED", "Access could not be granted. Please try again.", 500);
    }

    // Grant 24-hour access persisted in the DB (server clock only).
    const user = await getCurrentUser();
    const state = await grantAccess({ sessionToken, userId: user?.id });

    return ok({
      unlocked: true,
      expiresAt: state.expiresAt,
      remainingMs: state.remainingMs,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
