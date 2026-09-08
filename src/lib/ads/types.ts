/**
 * AdProvider — abstract interface for the rewarded-ad flow that unlocks
 * 24-hour copy access.
 *
 * IMPORTANT — provider policy note:
 * This abstraction intentionally does NOT assume any specific ad network.
 * Any real provider (e.g. a rewarded-video network) must be integrated
 * according to that provider's own SDK requirements, placement policies,
 * and publisher terms. The 30-second duration here is a product decision for
 * the demo experience and is NOT a claim of automatic compliance with any
 * advertising network. Where a real provider requires its own SDK, callback
 * signatures, or server-to-server postback (S2S reward callbacks), implement
 * them inside the concrete provider class — never by weakening the routes.
 */

export type AdSessionContext = {
  /** Stable anonymous session token (guest cookie) — stored hashed. */
  sessionToken: string;
  userId?: string | null;
};

export type AdStartResult = {
  adSessionId: string;
  provider: string;
  durationSeconds: number;
  /** True when an existing pending session was reused (no stacking sessions). */
  resumed: boolean;
};

export type AdStatus = "pending" | "verified" | "failed" | "expired" | "not_found";

export type AdStatusResult = {
  status: AdStatus;
  startedAt: Date | null;
  remainingSeconds: number;
};

export type AdVerificationResult = {
  verified: boolean;
  reason?: "AD_NOT_FINISHED" | "SESSION_EXPIRED" | "ALREADY_VERIFIED" | "NOT_FOUND" | "PROVIDER_REJECTED";
  providerPayload?: Record<string, unknown>;
};

export type AdFinishResult = {
  accessGranted: boolean;
  expiresAt: Date | null;
};

export interface AdProvider {
  readonly name: string;
  /** Configured ad duration in seconds. */
  readonly durationSeconds: number;

  /** Begin a rewarded-ad session. */
  startAd(ctx: AdSessionContext): Promise<AdStartResult>;

  /** Query the current status of an ad session. */
  getAdStatus(adSessionId: string): Promise<AdStatusResult>;

  /**
   * Verify that the ad actually completed. Must use server-side time and
   * provider-side evidence — never a client-declared "I finished" flag.
   */
  verifyCompletion(adSessionId: string): Promise<AdVerificationResult>;

  /**
   * Finalize a verified session. On success the caller grants 24-hour access
   * (expiresAt = server time + 24h). Returns whether access was granted.
   */
  finishAd(adSessionId: string): Promise<AdFinishResult>;
}
