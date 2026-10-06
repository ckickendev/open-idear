// =============================================================================
//  ARTICLE VERSIONING — API CLIENT
//  src/features/article/versioning/api/versioning.api.ts
// =============================================================================

import { api } from "@/lib/api/axios";
import type {
  ArticleHistoryResponse,
  ArticleVersionResponse,
  CreateVersionPayload,
} from "../types/versioning.types";

export const versioningApi = {
  /**
   * Fetches full version timeline for an article by slug.
   * GET /articles/:slug/history
   */
  getArticleHistory: async (slug: string): Promise<ArticleHistoryResponse> => {
    const response = await api.get<ArticleHistoryResponse>(`/articles/${encodeURIComponent(slug)}/history`);
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to load article version history.");
    }
    return response.data;
  },

  /**
   * Fetches full content of a specific historical version snapshot.
   * GET /articles/:slug/version/:version
   */
  getArticleVersion: async (slug: string, version: string): Promise<ArticleVersionResponse> => {
    const response = await api.get<ArticleVersionResponse>(
      `/articles/${encodeURIComponent(slug)}/version/${encodeURIComponent(version)}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || `Failed to load article version ${version}.`);
    }
    return response.data;
  },

  /**
   * Creates an immutable new version for an article. Owner only.
   * POST /articles/:id/version
   */
  createArticleVersion: async (postId: string, payload: CreateVersionPayload) => {
    const response = await api.post(`/articles/${postId}/version`, payload);
    if (!response.success) {
      throw new Error(response.message || "Failed to create new article version.");
    }
    return response.data;
  },

  /**
   * Creates a NEW version snapshot from an old version (rollback). Owner only.
   * PATCH /articles/:id/rollback/:version
   */
  rollbackArticleVersion: async (postId: string, version: string, changelog?: string) => {
    const response = await api.patch(
      `/articles/${postId}/rollback/${encodeURIComponent(version)}`,
      { changelog }
    );
    if (!response.success) {
      throw new Error(response.message || `Failed to rollback to version ${version}.`);
    }
    return response.data;
  },
};
