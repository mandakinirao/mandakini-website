/**
 * Shared in-memory rate limiter.
 * Fine for a single-instance deployment; swap the Map for Redis if
 * the app ever runs across multiple Vercel regions.
 */

const windows = new Map<string, number[]>()

// Prune stale buckets every 15 min to prevent unbounded memory growth.
const PRUNE_INTERVAL_MS = 15 * 60 * 1000
const MAX_BUCKET_AGE_MS = 60 * 60 * 1000 // keep at most 1 h of history

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cutoff = Date.now() - MAX_BUCKET_AGE_MS
    windows.forEach((times: number[], key: string) => {
      const fresh = times.filter((t: number) => t > cutoff)
      if (fresh.length === 0) windows.delete(key)
      else windows.set(key, fresh)
    })
  }, PRUNE_INTERVAL_MS).unref?.()
}

export interface RateLimitResult {
  limited: boolean
  /** Seconds until the oldest hit falls outside the window. */
  retryAfterSec: number
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const recent = (windows.get(key) ?? []).filter((t) => now - t < windowMs)

  if (recent.length >= limit) {
    const retryAfterSec = Math.ceil((recent[0] + windowMs - now) / 1000)
    return { limited: true, retryAfterSec }
  }

  recent.push(now)
  windows.set(key, recent)
  return { limited: false, retryAfterSec: 0 }
}
