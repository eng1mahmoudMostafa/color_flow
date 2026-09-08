import "server-only";
import { prisma } from "@/lib/db";
import { stableHash } from "@/lib/session";
import { logEvent } from "@/lib/events";

export const ACCESS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours — server clock only.

export type AccessState = {
  unlocked: boolean;
  source: "user" | "guest" | null;
  grantedAt: string | null;
  expiresAt: string | null;
  remainingMs: number;
};

/**
 * Server-side source of truth for copy access.
 * Verifies `currentServerTime < expiresAt` against the AccessSession record.
 * Never consults client clocks, localStorage, or client-provided timestamps.
 */
export async function getAccessState(params: {
  sessionToken: string | null;
  userId?: string | null;
}): Promise<AccessState> {
  const now = new Date();

  if (params.userId) {
    const record = await prisma.accessSession.findFirst({
      where: { userId: params.userId, expiresAt: { gt: now } },
      orderBy: { expiresAt: "desc" },
    });
    if (record) return toState(record, "user", now);
  }

  if (params.sessionToken) {
    const hashed = stableHash(params.sessionToken);
    const record = await prisma.accessSession.findFirst({
      where: { sessionToken: hashed, expiresAt: { gt: now } },
      orderBy: { expiresAt: "desc" },
    });
    if (record) return toState(record, "guest", now);
  }

  return {
    unlocked: false,
    source: null,
    grantedAt: null,
    expiresAt: null,
    remainingMs: 0,
  };
}

function toState(
  record: { grantedAt: Date; expiresAt: Date },
  source: "user" | "guest",
  now: Date
): AccessState {
  return {
    unlocked: true,
    source,
    grantedAt: record.grantedAt.toISOString(),
    expiresAt: record.expiresAt.toISOString(),
    remainingMs: Math.max(0, record.expiresAt.getTime() - now.getTime()),
  };
}

/**
 * Grants 24-hour copy access. `expiresAt = server now + 24h`.
 * The sessionToken is stored hashed — a leaked DB row cannot be replayed elsewhere.
 */
export async function grantAccess(params: {
  sessionToken: string;
  userId?: string | null;
}): Promise<AccessState> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ACCESS_DURATION_MS);

  // Extend an existing active grant instead of stacking rows.
  const existing = await prisma.accessSession.findFirst({
    where: {
      sessionToken: stableHash(params.sessionToken),
      expiresAt: { gt: now },
    },
    orderBy: { expiresAt: "desc" },
  });

  const record = existing
    ? await prisma.accessSession.update({
        where: { id: existing.id },
        data: { userId: params.userId ?? existing.userId, expiresAt },
      })
    : await prisma.accessSession.create({
        data: {
          sessionToken: stableHash(params.sessionToken),
          userId: params.userId ?? null,
          grantedAt: now,
          expiresAt,
        },
      });

  await logEvent("access_granted", { source: params.userId ? "user" : "guest" });

  return toState(record, params.userId ? "user" : "guest", now);
}
