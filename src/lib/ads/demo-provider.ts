import "server-only";
import { prisma } from "@/lib/db";
import { stableHash } from "@/lib/session";
import { logEvent } from "@/lib/events";
import type {
  AdFinishResult,
  AdProvider,
  AdSessionContext,
  AdStartResult,
  AdStatusResult,
  AdVerificationResult,
} from "./types";

export const DEMO_AD_DURATION_SECONDS = 30;
/** Hard ceiling: a pending demo session older than this is marked EXPIRED. */
const PENDING_TTL_MS = 10 * 60 * 1000;
/** Small server-side tolerance for network latency around the 30s wall. */
const TOLERANCE_MS = 750;

/**
 * The required watch time equals the SUM of durations of all active ads
 * (slot 1 → 3). Cached for 20 seconds to avoid a DB round-trip on every
 * request. Falls back to DEMO_AD_DURATION_SECONDS when no ads are active.
 */
let totalSecondsCache: { value: number; expiresAt: number } | null = null;
export async function getActiveAdTotalSeconds(): Promise<number> {
  const now = Date.now();
  if (totalSecondsCache && totalSecondsCache.expiresAt > now) return totalSecondsCache.value;
  const rows = await prisma.advertisement.findMany({
    where: { active: true },
    select: { durationSeconds: true },
    take: 3,
    orderBy: [{ slot: "asc" }, { createdAt: "desc" }],
  });
  const total =
    rows.length > 0
      ? Math.min(360, rows.reduce((sum, r) => sum + r.durationSeconds, 0))
      : DEMO_AD_DURATION_SECONDS;
  totalSecondsCache = { value: total, expiresAt: now + 20_000 };
  return total;
}

/**
 * DemoAdProvider — development provider that simulates a 30-second rewarded ad.
 *
 * Anti-abuse properties:
 *  - Ad sessions are server records with server-generated startedAt timestamps.
 *  - verifyCompletion compares elapsed server time against the 30s duration.
 *    A client cannot verify early by tampering with the countdown or payload.
 *  - Only one pending session per session token — rapid re-attempts reuse the
 *    same session instead of stacking new ones.
 *  - Pending sessions expire; abandoned sessions can never be verified.
 */
export class DemoAdProvider implements AdProvider {
  readonly name = "demo";
  readonly durationSeconds = DEMO_AD_DURATION_SECONDS;

  async startAd(ctx: AdSessionContext): Promise<AdStartResult> {
    const now = new Date();
    const hashed = stableHash(ctx.sessionToken);
    const durationSeconds = await getActiveAdTotalSeconds();

    // Reuse an in-flight pending session (prevents simultaneous session abuse).
    const pending = await prisma.adSession.findFirst({
      where: {
        sessionToken: hashed,
        verificationStatus: "PENDING",
        startedAt: { gt: new Date(now.getTime() - PENDING_TTL_MS) },
      },
      orderBy: { startedAt: "desc" },
    });

    if (pending) {
      return {
        adSessionId: pending.id,
        provider: this.name,
        durationSeconds,
        resumed: true,
      };
    }

    const session = await prisma.adSession.create({
      data: {
        sessionToken: hashed,
        userId: ctx.userId ?? null,
        provider: this.name,
        startedAt: now,
        verificationStatus: "PENDING",
      },
    });

    await logEvent("ad_started", { provider: this.name });

    return {
      adSessionId: session.id,
      provider: this.name,
      durationSeconds,
      resumed: false,
    };
  }

  async getAdStatus(adSessionId: string): Promise<AdStatusResult> {
    const session = await prisma.adSession.findUnique({ where: { id: adSessionId } });
    if (!session) {
      return { status: "not_found", startedAt: null, remainingSeconds: 0 };
    }

    const now = Date.now();
    const elapsed = now - session.startedAt.getTime();

    if (session.verificationStatus === "VERIFIED") {
      return { status: "verified", startedAt: session.startedAt, remainingSeconds: 0 };
    }
    if (session.verificationStatus === "FAILED") {
      return { status: "failed", startedAt: session.startedAt, remainingSeconds: 0 };
    }
    if (session.verificationStatus === "EXPIRED" || elapsed > PENDING_TTL_MS) {
      return { status: "expired", startedAt: session.startedAt, remainingSeconds: 0 };
    }

    return {
      status: "pending",
      startedAt: session.startedAt,
      remainingSeconds: Math.max(
        0,
        Math.ceil(((await getActiveAdTotalSeconds()) * 1000 - elapsed) / 1000)
      ),
    };
  }

  async verifyCompletion(adSessionId: string): Promise<AdVerificationResult> {
    const session = await prisma.adSession.findUnique({ where: { id: adSessionId } });
    if (!session) {
      return { verified: false, reason: "NOT_FOUND" };
    }
    if (session.verificationStatus === "VERIFIED") {
      return { verified: true, reason: "ALREADY_VERIFIED" };
    }
    if (session.verificationStatus !== "PENDING") {
      return { verified: false, reason: "PROVIDER_REJECTED" };
    }

    const now = new Date();
    const elapsed = now.getTime() - session.startedAt.getTime();

    if (elapsed > PENDING_TTL_MS) {
      await prisma.adSession.update({
        where: { id: session.id },
        data: { verificationStatus: "EXPIRED" },
      });
      return { verified: false, reason: "SESSION_EXPIRED" };
    }

    if (elapsed < (await getActiveAdTotalSeconds()) * 1000 - TOLERANCE_MS) {
      // Server clock proves the ad has NOT run long enough.
      await prisma.adSession.update({
        where: { id: session.id },
        data: { attempts: { increment: 1 } },
      });
      return { verified: false, reason: "AD_NOT_FINISHED" };
    }

    await prisma.adSession.update({
      where: { id: session.id },
      data: { verificationStatus: "VERIFIED", completedAt: now },
    });

    await logEvent("ad_completed", { provider: this.name });

    return { verified: true, reason: "ALREADY_VERIFIED" };
  }

  async finishAd(adSessionId: string): Promise<AdFinishResult> {
    const session = await prisma.adSession.findUnique({ where: { id: adSessionId } });
    if (!session || session.verificationStatus !== "VERIFIED") {
      return { accessGranted: false, expiresAt: null };
    }

    const { grantAccess } = await import("@/lib/access");
    const state = await grantAccess({
      sessionToken: session.sessionToken,
      userId: session.userId,
    });

    return {
      accessGranted: true,
      expiresAt: state.expiresAt ? new Date(state.expiresAt) : null,
    };
  }
}
