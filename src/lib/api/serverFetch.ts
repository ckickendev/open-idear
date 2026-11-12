import { ENV } from "@/api/const";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://open-trash-tech-be.onrender.com/api";

export interface ServerFetchOptions {
  tags?: string[];
  revalidate?: number | false;
  timeoutMs?: number;
  headers?: Record<string, string>;
  cache?: RequestCache;
}

export interface ServerFetchResult<T> {
  data: T | null;
  status: number;
  ok: boolean;
}

/**
 * Robust Next.js 15 Data Cache fetcher with built-in timeouts,
 * tag-based revalidation, and graceful fallback handling.
 */
export async function serverFetch<T = any>(
  endpoint: string,
  options: ServerFetchOptions = {}
): Promise<ServerFetchResult<T>> {
  const {
    tags,
    revalidate = 3600,
    timeoutMs = 12000,
    headers = {},
    cache,
  } = options;

  const base = (ENV.ROOT_API || API_BASE_URL).replace(/\/$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith("http") ? endpoint : `${base}${cleanEndpoint}`;

  try {
    const fetchOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      signal: AbortSignal.timeout(timeoutMs),
    };

    if (cache) {
      fetchOptions.cache = cache;
    }

    if (tags || typeof revalidate !== "undefined") {
      fetchOptions.next = {
        ...(tags ? { tags } : {}),
        ...(typeof revalidate !== "undefined" ? { revalidate } : {}),
      };
    }

    const res = await fetch(url, fetchOptions);

    if (res.status === 404) {
      return { data: null, status: 404, ok: false };
    }

    if (!res.ok) {
      console.warn(`[serverFetch] HTTP ${res.status} returned from ${url}`);
      return { data: null, status: res.status, ok: false };
    }

    const data = await res.json();
    return { data, status: res.status, ok: true };
  } catch (err: any) {
    if (err?.name === "TimeoutError") {
      console.warn(`[serverFetch] Timeout after ${timeoutMs}ms: ${url}`);
    } else {
      console.warn(`[serverFetch] Error connecting to ${url}:`, err?.message || err);
    }
    return { data: null, status: 500, ok: false };
  }
}

