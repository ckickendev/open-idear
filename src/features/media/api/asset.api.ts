import { api } from "@/lib/api/axios";

export interface Asset {
  _id: string;
  ownerId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  hash: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  width: number;
  height: number;
  description: string;
  alt: string;
  tags: string[];
  usedInPosts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AssetsPaginationResult {
  items: Asset[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const assetApi = {
  /**
   * Upload and register a new image asset.
   */
  upload: (
    file: File,
    metadata: { description?: string; alt?: string; tags?: string } = {}
  ) => {
    const formData = new FormData();
    formData.append("image", file);
    if (metadata.description) formData.append("description", metadata.description);
    if (metadata.alt) formData.append("alt", metadata.alt);
    if (metadata.tags) formData.append("tags", metadata.tags);

    return api.post<Asset>("/assets", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Browse assets with filtering, sorting, pagination, or query search.
   */
  browse: (params: { q?: string; page?: number; limit?: number; sort?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.sort) query.set("sort", params.sort);

    const qs = query.toString();
    return api.get<AssetsPaginationResult>(`/assets${qs ? `?${qs}` : ""}`);
  },

  /**
   * Get single asset resource details by ID.
   */
  getById: (id: string) => {
    return api.get<Asset>(`/assets/${id}`);
  },

  /**
   * Soft delete target asset.
   */
  delete: (id: string) => {
    return api.delete<{ message: string }>(`/assets/${id}`);
  },
};
