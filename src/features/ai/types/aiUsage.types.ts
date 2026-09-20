// =============================================================================
//  AI CREATOR USAGE — TYPES
//  src/features/ai/types/aiUsage.types.ts
//
//  Design Decisions:
//  - Strictly typed DTOs mirroring backend /api/ai/usage/me response.
//  - Clean contract for Hero Metrics, Feature Usage progress bars,
//    Daily Activity chart, and Recent History table.
// =============================================================================

export interface UserHistoryItem {
  readonly id: string;
  readonly featureId: string;
  readonly featureName: string;
  readonly provider: string;
  readonly model?: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly totalTokens: number;
  readonly latency: number;
  readonly estimatedCostUSD: number;
  readonly status: "SUCCESS" | "FAILED";
  readonly createdAt: string;
}

export interface FeatureUsageItem {
  readonly featureId: string;
  readonly name: string;
  readonly category: string;
  readonly count: number;
  readonly percentage: number;
  readonly totalTokens: number;
}

export interface DailyActivityItem {
  readonly date: string; // "YYYY-MM-DD"
  readonly count: number;
  readonly totalTokens: number;
}

export interface MostUsedFeature {
  readonly featureId: string;
  readonly name: string;
  readonly count: number;
}

export interface UserUsageSummary {
  readonly totalGenerations: number;
  readonly totalTokens: number;
  readonly estimatedCost: number;
  readonly averageLatency: number;
  readonly mostUsedFeature: MostUsedFeature | null;
  readonly featureUsage: readonly FeatureUsageItem[];
  readonly dailyActivity: readonly DailyActivityItem[];
  readonly recentHistory: readonly UserHistoryItem[];
}
