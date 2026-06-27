"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { mediaLibraryApi } from "../api/mediaLibrary.api";
import type { MediaAsset, MediaPagination } from "../types/mediaLibrary.types";

// ═══════════════════════════════════════════════════════════════════
//  useMediaSearch — debounced full-text search with abort control
// ═══════════════════════════════════════════════════════════════════

export function useMediaSearch(debounceMs = 300) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<MediaAsset[]>([]);
  const [pagination, setPagination] = useState<MediaPagination | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Execute search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setPagination(null);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsSearching(true);

    mediaLibraryApi
      .search({ q: debouncedQuery, page: 1, limit: 30 })
      .then((res) => {
        if (res.success) {
          setResults(res.data.media);
          setPagination(res.data.pagination);
        }
      })
      .catch(() => {
        // Abort errors are expected — ignore
      })
      .finally(() => setIsSearching(false));

    return () => abortRef.current?.abort();
  }, [debouncedQuery]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setResults([]);
    setPagination(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    pagination,
    isSearching,
    isActive: !!query.trim(),
    clearSearch,
  };
}
