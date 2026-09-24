// =============================================================================
//  READING PROGRESS ENGINE — API CLIENT
//  src/features/reading/api/reading.api.ts
// =============================================================================

import { api } from "@/lib/api/axios";
import type {
  ContinueReadingItem,
  ReadingProgressData,
  ReadingStats,
  UpdateProgressPayload,
} from "../types/reading.types";

export const readingApi = {
  /**
   * GET /reading/continue
   * Returns list of recently read articles for the authenticated user.
   */
  getContinueReading: async (limit: number = 6): Promise<ContinueReadingItem[]> => {
    const response = await api.get<{ success: boolean; data: ContinueReadingItem[] }>(
      `/reading/continue?limit=${limit}`
    );
    if (!response.success || !response.data?.data) {
      return [];
    }
    return response.data.data;
  },

  /**
   * GET /reading/:articleId
   * Returns current reading progress, last heading, and last paragraph.
   */
  getReadingProgress: async (articleIdOrSlug: string): Promise<ReadingProgressData | null> => {
    const response = await api.get<{ success: boolean; data: ReadingProgressData }>(
      `/reading/${encodeURIComponent(articleIdOrSlug)}`
    );
    if (!response.success || !response.data?.data) {
      return null;
    }
    return response.data.data;
  },

  /**
   * PUT /reading/:articleId
   * Sends debounced/throttled reading progress updates.
   */
  updateReadingProgress: async (
    articleIdOrSlug: string,
    payload: UpdateProgressPayload
  ): Promise<ReadingProgressData | null> => {
    const response = await api.put<{ success: boolean; data: ReadingProgressData }>(
      `/reading/${encodeURIComponent(articleIdOrSlug)}`,
      payload
    );
    if (!response.success || !response.data?.data) {
      return null;
    }
    return response.data.data;
  },

  /**
   * GET /reading/stats/me
   * Fetches user reading statistics (completed articles, hours read, streak).
   */
  getReadingStats: async (): Promise<ReadingStats> => {
    const response = await api.get<{ success: boolean; stats: ReadingStats }>(
      `/reading/stats/me`
    );
    if (!response.success || !response.data?.stats) {
      return {
        completedArticles: 0,
        hoursRead: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    }
    return response.data.stats;
  },
};
