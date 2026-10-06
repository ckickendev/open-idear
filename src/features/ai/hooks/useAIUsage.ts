"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyAIUsage } from "../api/aiUsage.api";
import type { UserUsageSummary } from "../types/aiUsage.types";

export const AI_USAGE_QUERY_KEY = ["ai", "usage", "me"] as const;

/**
 * TanStack Query hook for monitoring creator AI usage.
 * Automatically caches, deduplicates, and manages query loading/error state.
 */
export function useMyAIUsage() {
  return useQuery<UserUsageSummary, Error>({
    queryKey: AI_USAGE_QUERY_KEY,
    queryFn: getMyAIUsage,
    staleTime: 60 * 1000, // Fresh for 1 minute
    refetchOnWindowFocus: true,
  });
}
