// =============================================================================
//  KNOWLEDGE COLLECTIONS — API CLIENT
//  src/features/collections/api/collection.api.ts
// =============================================================================

import { api } from "@/lib/api/axios";
import type {
  CheckCollectionItem,
  CollectionData,
  CollectionDetailResponse,
  CreateCollectionPayload,
  UpdateCollectionPayload,
} from "../types/collection.types";

export const collectionApi = {
  /**
   * GET /collections/me
   * Fetches all collections owned by current user with counts and preview thumbnails.
   */
  getMyCollections: async (): Promise<CollectionData[]> => {
    const res = await api.get<{ success: boolean; data: CollectionData[] }>("/collections/me");
    if (!res.success || !res.data?.data) {
      return [];
    }
    return res.data.data;
  },

  /**
   * GET /collections/check-article/:articleId
   * Checks which collections contain the article (for the Save checklist modal).
   */
  checkArticleCollections: async (articleId: string): Promise<CheckCollectionItem[]> => {
    const res = await api.get<{ success: boolean; data: CheckCollectionItem[] }>(
      `/collections/check-article/${articleId}`
    );
    if (!res.success || !res.data?.data) {
      return [];
    }
    return res.data.data;
  },

  /**
   * POST /collections/toggle-save
   * Adds or removes an article from a specific collection.
   */
  toggleArticleSave: async (payload: {
    collectionId: string;
    articleId: string;
    save: boolean;
    note?: string;
  }): Promise<boolean> => {
    const res = await api.post<{ success: boolean; isSaved: boolean }>(
      "/collections/toggle-save",
      payload
    );
    return Boolean(res.success);
  },

  /**
   * GET /collections/:idOrSlug
   * Fetches public or unlisted collection details and items.
   */
  getCollection: async (idOrSlug: string): Promise<CollectionDetailResponse | null> => {
    const res = await api.get<{ success: boolean; data: CollectionDetailResponse }>(
      `/collections/${encodeURIComponent(idOrSlug)}`
    );
    if (!res.success || !res.data?.data) {
      return null;
    }
    return res.data.data;
  },

  /**
   * POST /collections
   * Creates a new collection.
   */
  createCollection: async (payload: CreateCollectionPayload): Promise<CollectionData | null> => {
    const res = await api.post<{ success: boolean; data: CollectionData }>(
      "/collections",
      payload
    );
    if (!res.success || !res.data?.data) {
      return null;
    }
    return res.data.data;
  },

  /**
   * PUT /collections/:id
   * Updates collection metadata.
   */
  updateCollection: async (
    id: string,
    payload: UpdateCollectionPayload
  ): Promise<CollectionData | null> => {
    const res = await api.put<{ success: boolean; data: CollectionData }>(
      `/collections/${id}`,
      payload
    );
    if (!res.success || !res.data?.data) {
      return null;
    }
    return res.data.data;
  },

  /**
   * DELETE /collections/:id
   * Deletes collection and associated items.
   */
  deleteCollection: async (id: string): Promise<boolean> => {
    const res = await api.delete<{ success: boolean }>(`/collections/${id}`);
    return Boolean(res.success);
  },

  /**
   * DELETE /collections/:id/items/:articleId
   * Removes an article from a collection.
   */
  removeArticle: async (id: string, articleId: string): Promise<boolean> => {
    const res = await api.delete<{ success: boolean }>(
      `/collections/${id}/items/${articleId}`
    );
    return Boolean(res.success);
  },

  /**
   * PUT /collections/:id/reorder
   * Reorders items in a collection.
   */
  reorderArticles: async (
    id: string,
    itemOrders: (string | { articleId: string; order: number })[]
  ): Promise<boolean> => {
    const res = await api.put<{ success: boolean }>(`/collections/${id}/reorder`, {
      itemOrders,
    });
    return Boolean(res.success);
  },
};
