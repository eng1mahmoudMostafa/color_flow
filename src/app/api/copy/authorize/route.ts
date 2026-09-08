import { NextRequest } from "next/server";
import { handleApiError, fail, ok, clientIp, assertSameOrigin } from "@/lib/api-helpers";
import { copyAuthorizeSchema } from "@/lib/validation";
import { stableHash } from "@/lib/session";
import { rateLimit, RATE_POLICIES } from "@/lib/rate-limit";
import { logEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

/**
 * POST /api/copy/authorize
 *
 * Copying is free: this endpoint always authorizes. It is kept for API
 * compatibility (and coarse analytics) — no ad session, no lock, no expiry.
 */
export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const ip = stableHash(clientIp(req));
    const rl = rateLimit({ key: `copy-auth:${ip}`, ...RATE_POLICIES.copyAuthorize });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests. Please slow down.", 429, {
        retryAfterSeconds: rl.retryAfterSeconds,
      });
    }

    // Body is optional; hex (when present) is validated and logged coarsely.
    let hex: string | undefined;
    try {
      const body = await req.json();
      ({ hex } = copyAuthorizeSchema.parse(body));
    } catch {
      hex = undefined;
    }

    await logEvent("copy_clicked", { authorized: true, hex: hex ?? null });
    return ok({
      authorized: true,
      expiresAt: null,
      remainingMs: null,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
