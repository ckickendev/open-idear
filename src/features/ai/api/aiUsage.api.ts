// =============================================================================
//  AI CREATOR USAGE — API CLIENT
//  src/features/ai/api/aiUsage.api.ts
// =============================================================================

import { api } from "@/lib/api/axios";
import type { UserUsageSummary } from "../types/aiUsage.types";

/**
 * Fetches authenticated creator's AI usage statistics from GET /api/ai/usage/me.
 */
export const getMyAIUsage = async (): Promise<UserUsageSummary> => {
  const response = await api.get<any>("/api/ai/usage/me");

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to fetch AI usage statistics.");
  }

  // Response payload may wrap data inside data property or directly
  const data = response.data?.data || response.data;

  return {
    totalGenerations: data.totalGenerations || 0,
    totalTokens: data.totalTokens || 0,
    estimatedCost: data.estimatedCost || 0,
    averageLatency: data.averageLatency || 0,
    mostUsedFeature: data.mostUsedFeature || null,
    featureUsage: data.featureUsage || [],
    dailyActivity: data.dailyActivity || [],
    recentHistory: data.recentHistory || [],
  };
};
