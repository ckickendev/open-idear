// =============================================================================
//  FEED CACHE UTILITY
//  src/lib/cache/feedCache.ts
//
//  Design Decisions:
//  - Provides safe, SSR-resilient localStorage caching for public feed payloads.
//  - Implements Stale-While-Revalidate (SWR) cache pattern to eliminate perceived
//    latency and ensure users never face empty screens when backend times out.
//  - Gracefully handles quota exceptions, JSON parse errors, and private browsing.
// =============================================================================

export interface CacheEnvelope<T> {
  data: T;
  timestamp: number;
}

const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getCachedFeed<T>(
  key: string,
  maxAgeMs: number = DEFAULT_MAX_AGE_MS
): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const envelope: CacheEnvelope<T> = JSON.parse(raw);
    if (!envelope || envelope.data === undefined || envelope.data === null) {
      return null;
    }

    // Check expiration - even if stale, we can still use it for fallback
    const isStale = Date.now() - envelope.timestamp > maxAgeMs;
    if (isStale) {
      return envelope.data; // Stale fallback is still better than empty screen
    }

    return envelope.data;
  } catch (error) {
    console.debug("[FeedCache] Read error for key:", key, error);
    return null;
  }
}

export function setCachedFeed<T>(key: string, data: T): void {
  if (typeof window === "undefined" || data === undefined || data === null) {
    return;
  }

  try {
    const envelope: CacheEnvelope<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch (error) {
    // QuotaExceededError or storage disabled in private mode
    console.debug("[FeedCache] Write error for key:", key, error);
  }
}

export function clearCachedFeed(key: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
