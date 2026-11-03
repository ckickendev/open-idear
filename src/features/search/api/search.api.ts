import { api, ApiResponse } from "@/lib/api/axios";
import {
  GlobalSearchParams,
  GlobalSearchResult,
} from "../types/search.types";

export const searchApi = {
  /**
   * Fetches unified search results across Courses and Posts
   */
  globalSearch: async (
    params: GlobalSearchParams = {}
  ): Promise<ApiResponse<GlobalSearchResult>> => {
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.set("q", params.q.trim());
    if (params.type && params.type !== "all") queryParams.set("type", params.type);
    if (params.category) queryParams.set("category", params.category);
    if (params.isFree !== undefined && params.isFree !== "") {
      queryParams.set("isFree", String(params.isFree));
    }
    if (params.minPrice !== undefined && params.minPrice !== "") {
      queryParams.set("minPrice", String(params.minPrice));
    }
    if (params.maxPrice !== undefined && params.maxPrice !== "") {
      queryParams.set("maxPrice", String(params.maxPrice));
    }
    if (params.locale) queryParams.set("locale", params.locale);
    if (params.sort && params.sort !== "relevance") queryParams.set("sort", params.sort);
    if (params.page && Number(params.page) > 1) queryParams.set("page", String(params.page));
    if (params.limit) queryParams.set("limit", String(params.limit));

    const qs = queryParams.toString();
    const endpoint = `/search${qs ? `?${qs}` : ""}`;

    return await api.get<GlobalSearchResult>(endpoint);
  },
};
