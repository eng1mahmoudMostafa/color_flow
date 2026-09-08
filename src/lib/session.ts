import { createHash, randomUUID } from "crypto";
import { cookies } from "next/headers";

export const GUEST_COOKIE = "cf_sid";
export const AUTH_COOKIE = "cf_auth";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Anonymous guest identity. HTTP-only, server-generated, never trusted by the
 * client. Used to attach 24-hour copy access to guests without registration.
 */
export function generateGuestToken(): string {
  return randomUUID();
}

/**
 * Reads the guest session token. In Route Handlers / Server Actions a missing
 * cookie is created and persisted; in Server Components (read-only) it only
 * reads and returns null when absent.
 */
export async function getGuestToken(): Promise<string | null> {
  const store = await cookies();
  const existing = store.get(GUEST_COOKIE)?.value;
  if (existing) return existing;

  try {
    const token = generateGuestToken();
    store.set(GUEST_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return token;
  } catch {
    // Read-only context (server component render) — nothing we can set.
    return null;
  }
}

/** Stable hashing helper for rate-limit keys / logging (never store raw secrets). */
export function stableHash(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 32);
}
