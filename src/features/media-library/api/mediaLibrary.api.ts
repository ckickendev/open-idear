import { api } from "@/lib/api/axios";
import type {
  MediaAsset,
  MediaFolder,
  MediaPagination,
  BrowseMediaParams,
  SearchMediaParams,
  UpdateMetadataPayload,
  BulkMovePayload,
  BulkTagPayload,
  BulkFavoritePayload,
  CreateFolderPayload,
  MediaUsageEntry,
} from "../types/mediaLibrary.types";

// ═══════════════════════════════════════════════════════════════════
//  MEDIA LIBRARY API CLIENT
//  All endpoints target /media/v2/* on the Express backend
// ═══════════════════════════════════════════════════════════════════

const BASE = "/media/v2";

// ─── Asset Endpoints ────────────────────────────────────────────

export const mediaLibraryApi = {
  /** Browse user's media with filters and pagination */
  browse: (params: BrowseMediaParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.sort) query.set("sort", params.sort);
    if (params.folder) query.set("folder", params.folder);
    if (params.type) query.set("type", params.type);
    if (params.isFavorite !== undefined)
      query.set("isFavorite", String(params.isFavorite));
    if (params.tag) query.set("tag", params.tag);

    const qs = query.toString();
    return api.get<{ media: MediaAsset[]; pagination: MediaPagination }>(
      `${BASE}${qs ? `?${qs}` : ""}`
    );
  },

  /** Full-text search */
  search: (params: SearchMediaParams) => {
    const query = new URLSearchParams({ q: params.q });
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    return api.get<{ media: MediaAsset[]; pagination: MediaPagination }>(
      `${BASE}/search?${query.toString()}`
    );
  },

  /** Get single media asset with full details */
  getById: (id: string) => {
    return api.get<MediaAsset>(`${BASE}/${id}`);
  },

  /** Check for duplicate by SHA-256 hash */
  checkDuplicate: (fileHash: string) => {
    return api.post<{ exists: boolean; media?: MediaAsset }>(
      `${BASE}/check-duplicate`,
      { fileHash }
    );
  },

  /** Upload a new image */
  upload: (
    file: File,
    options: { folderId?: string; description?: string; altText?: string } = {}
  ) => {
    const formData = new FormData();
    formData.append("image", file);
    if (options.folderId) formData.append("folderId", options.folderId);
    if (options.description)
      formData.append("description", options.description);
    if (options.altText) formData.append("altText", options.altText);

    return api.post<{
      isDuplicate: boolean;
      media: MediaAsset;
    }>(`${BASE}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** Update metadata (alt text, description, tags, folder, favorite) */
  updateMetadata: (id: string, payload: UpdateMetadataPayload) => {
    return api.patch<MediaAsset>(`${BASE}/${id}/metadata`, payload);
  },

  /** Save AI-generated metadata */
  saveAIMetadata: (
    id: string,
    payload: {
      altText: string;
      description: string;
      tags: string[];
      model?: string;
    }
  ) => {
    return api.post<MediaAsset>(`${BASE}/${id}/ai-metadata`, payload);
  },

  // ─── Usage Tracking ─────────────────────────────────────────────

  /** Get usage info for an asset */
  getUsage: (id: string) => {
    return api.get<{
      usageCount: number;
      usedIn: MediaUsageEntry[];
    }>(`${BASE}/${id}/usage`);
  },

  /** Track an asset being used in a post */
  addUsage: (
    mediaId: string,
    entityType: string,
    entityId: string,
    field = "content"
  ) => {
    return api.post(`${BASE}/${mediaId}/usage`, {
      entityType,
      entityId,
      field,
    });
  },

  /** Remove usage tracking */
  removeUsage: (
    mediaId: string,
    entityType: string,
    entityId: string
  ) => {
    return api.delete(`${BASE}/${mediaId}/usage`, {
      data: { entityType, entityId },
    });
  },

  // ─── Replace & Delete ───────────────────────────────────────────

  /** Replace an asset globally (new file, same mediaId) */
  replaceAsset: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    return api.post<{ media: MediaAsset; postsAffected: number }>(
      `${BASE}/${id}/replace`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  /** Soft-delete an asset */
  deleteAsset: (id: string) => {
    return api.delete(`${BASE}/${id}`);
  },

  // ─── Bulk Operations ───────────────────────────────────────────

  bulkMove: (payload: BulkMovePayload) => {
    return api.post<{ modified: number }>(`${BASE}/bulk/move`, payload);
  },

  bulkTag: (payload: BulkTagPayload) => {
    return api.post<{ modified: number }>(`${BASE}/bulk/tag`, payload);
  },

  bulkFavorite: (payload: BulkFavoritePayload) => {
    return api.post<{ modified: number }>(`${BASE}/bulk/favorite`, payload);
  },

  bulkDelete: (mediaIds: string[]) => {
    return api.post<{ deleted: number }>(`${BASE}/bulk/delete`, { mediaIds });
  },

  // ─── Folder Endpoints ──────────────────────────────────────────

  getFolders: (tree = false) => {
    return api.get<MediaFolder[]>(
      `${BASE}/folders${tree ? "?tree=true" : ""}`
    );
  },

  createFolder: (payload: CreateFolderPayload) => {
    return api.post<MediaFolder>(`${BASE}/folders`, payload);
  },

  updateFolder: (id: string, payload: { name?: string; color?: string }) => {
    return api.patch<MediaFolder>(`${BASE}/folders/${id}`, payload);
  },

  deleteFolder: (id: string) => {
    return api.delete(`${BASE}/folders/${id}`);
  },
};
