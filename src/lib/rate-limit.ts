/**
 * Rate limiting. Uses an in-memory sliding window by default (fine for a single
 * serverless instance / dev). When REDIS_URL is configured, swap the `consume`
 * implementation for a Redis-backed token bucket — the call sites do not change.
 */

type Bucket = { hits: number[]; };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

export function rateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0] ?? now;
    buckets.set(key, bucket);
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((windowMs - (now - oldest)) / 1000),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);

  // Opportunistic cleanup so the map does not grow unbounded.
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) {
      if (b.hits.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }

  return { ok: true, remaining: limit - bucket.hits.length, retryAfterSeconds: 0 };
}

/** Standard preset policies used across the API. */
export const RATE_POLICIES = {
  search: { limit: 60, windowMs: 60_000 },
  generator: { limit: 30, windowMs: 60_000 },
  adStart: { limit: 5, windowMs: 60 * 60_000 }, // 5 unlock attempts / hour
  adVerify: { limit: 10, windowMs: 60_000 },
  copyAuthorize: { limit: 120, windowMs: 60_000 },
  auth: { limit: 10, windowMs: 60_000 },
  favorites: { limit: 60, windowMs: 60_000 },
  events: { limit: 120, windowMs: 60_000 },
  register: { limit: 3, windowMs: 60 * 60_000 }, // 3 registrations / hour / IP
} as const;
