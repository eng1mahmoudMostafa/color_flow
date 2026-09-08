import "server-only";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type EventType =
  | "palette_view"
  | "color_view"
  | "generator_used"
  | "ad_started"
  | "ad_completed"
  | "access_granted"
  | "copy_clicked"
  | "palette_saved";

/**
 * Anonymous aggregate analytics. Stores the event type and coarse metadata
 * only — never IPs, user agents, or personal identifiers.
 */
export async function logEvent(type: EventType, meta?: Record<string, unknown>): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: { type, meta: (meta ?? undefined) as Prisma.InputJsonValue | undefined },
    });
  } catch {
    // Analytics must never break a user flow.
  }
}

export async function eventCounts(): Promise<Record<string, number>> {
  const grouped = await prisma.analyticsEvent.groupBy({
    by: ["type"],
    _count: { type: true },
  });
  return Object.fromEntries(grouped.map((g) => [g.type, g._count.type]));
}

/** Client-safe alias kept for the admin dashboard. */
export const trackEvent = logEvent;
