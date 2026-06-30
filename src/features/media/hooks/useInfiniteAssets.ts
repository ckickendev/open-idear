"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { assetApi, type Asset } from "../api/asset.api";

export interface InfiniteAssetsParams {
  readonly q?: string;
  readonly limit?: number;
  readonly sort?: string;
}

/**
 * useInfiniteAssets
 *
 * Manages an accumulated asset list for infinite-scroll UIs.
 *
 * Fix: the previous version had a race between two useEffects — one to reset
 * state (on q/sort change) and one to fetch. If React batched them differently
 * the stale page value could be fetched before the reset completed. Now the
 * reset is detected inside fetchBatch by comparing against a prevQuery ref,
 * ensuring a single synchronous state update before the fetch result is applied.
 */
export function useInfiniteAssets({
  q = "",
  limit = 20,
  sort = "-createdAt",
}: InfiniteAssetsParams = {}) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track last-fetched query key so fetchBatch can self-reset when it changes.
  const prevQueryRef = useRef<string>("");
  const queryKey = `${q}|${sort}`;

  const fetchBatch = useCallback(async () => {
    const isNewQuery = prevQueryRef.current !== queryKey;

    // Reset accumulated list synchronously before fetching when the query changed.
    if (isNewQuery) {
      prevQueryRef.current = queryKey;
      setAssets([]);
      setHasMore(false);
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await assetApi.browse({
        q,
        page: isNewQuery ? 1 : page,
        limit,
        sort,
      });

      if (result.success && result.data) {
        setAssets((prev) => {
          const incoming = result.data.items;
          if (isNewQuery) return incoming; // fresh list — no dedup needed

          // Append with dedup for subsequent pages
          const seen = new Set<string>(prev.map((a) => a._id));
          return [...prev, ...incoming.filter((a) => !seen.has(a._id))];
        });
        setHasMore(result.data.pagination.hasMore);
      } else {
        setError(result.message ?? "Failed to search assets.");
      }
    } catch (err: any) {
      setError(err?.message ?? "An error occurred during asset search.");
    } finally {
      setIsLoading(false);
    }
  }, [q, page, limit, sort, queryKey]);

  useEffect(() => {
    fetchBatch();
  }, [fetchBatch]);

  // Reset page to 1 when query changes so loadMore increments from the right base.
  useEffect(() => {
    setPage(1);
  }, [q, sort]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage((p) => p + 1);
    }
  }, [hasMore, isLoading]);

  return { assets, isLoading, hasMore, error, loadMore };
}

export type UseInfiniteAssetsReturn = ReturnType<typeof useInfiniteAssets>;
