// In-memory sliding-window rate limiter.
//
// NOTE: this state lives in a single serverless instance's memory and resets on
// cold start / scales horizontally, so it is a first line of defence only — it
// stops naive bursts and bot scripts, not a distributed attack. For a
// production paid product, back this with Upstash Redis (`@upstash/ratelimit`)
// or a Postgres-backed counter so limits hold across instances.

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

const buckets = new Map<string, number[]>();
const MAX_TRACKED_KEYS = 10_000;

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((timestamps[0] + windowMs - now) / 1000));
    buckets.set(key, timestamps);
    return { allowed: false, retryAfterSeconds };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);

  // Guard against unbounded memory growth from abusive/unique keys.
  if (buckets.size > MAX_TRACKED_KEYS) {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey !== undefined) buckets.delete(oldestKey);
  }

  return { allowed: true, retryAfterSeconds: 0 };
}
