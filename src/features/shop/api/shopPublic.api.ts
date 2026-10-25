// =============================================================================
//  OPENIDEAR SHOP — PUBLIC CATALOG API CLIENT (SPRINT S2)
//  src/features/shop/api/shopPublic.api.ts
// =============================================================================

import { ENV } from "@/api/const";
import { api } from "@/lib/api/axios";
import type {
  ShopCategory,
  PublicShopProduct,
  PublicProductFilterParams,
  PublicProductListResponse,
  CreateInquiryPayload,
  InquiryConfirmationResponse,
  EmbedAnalyticsEventPayload,
} from "../types/shop.types";

/**
 * Client-side public API methods for Shop Storefront.
 */
export const shopPublicApi = {
  /**
   * Fetch active public categories.
   */
  getCategories: async (): Promise<ShopCategory[]> => {
    const res = await api.get<{ status: string; data: ShopCategory[] }>(
      "/shop/categories"
    );
    return res.data?.data || [];
  },

  /**
   * Fetch published products with filters & pagination.
   */
  getProducts: async (
    params?: PublicProductFilterParams
  ): Promise<PublicProductListResponse> => {
    const res = await api.get<{
      status: string;
      data: PublicShopProduct[];
      pagination: { total: number; page: number; limit: number; pages: number };
    }>("/shop/products", { params });

    return {
      products: res.data?.data || [],
      pagination: res.data?.pagination || {
        total: 0,
        page: 1,
        limit: 20,
        pages: 1,
      },
    };
  },

  /**
   * Fetch single published product by slug.
   */
  getProductBySlug: async (slug: string): Promise<PublicShopProduct | null> => {
    try {
      const res = await api.get<{ status: string; data: PublicShopProduct }>(
        `/shop/products/${encodeURIComponent(slug)}`
      );
      return res.data?.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch batch published products by IDs (max 20).
   */
  getBatchProducts: async (ids: string[]): Promise<PublicShopProduct[]> => {
    if (!ids || ids.length === 0) return [];
    try {
      const res = await api.get<{ status: string; data: PublicShopProduct[] }>(
        "/shop/products/batch",
        { params: { ids: ids.join(",") } }
      );
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Submit purchase inquiry for a product.
   */
  submitInquiry: async (
    payload: CreateInquiryPayload
  ): Promise<InquiryConfirmationResponse> => {
    const res = await api.post<{
      status: string;
      message: string;
      data: InquiryConfirmationResponse;
    }>("/shop/orders/inquiries", payload);

    return res.data.data;
  },

  /**
   * Record lightweight embed analytics events (impression / click).
   * Safe fire-and-forget telemetry.
   */
  recordAnalyticsEvent: async (
    data: EmbedAnalyticsEventPayload
  ): Promise<boolean> => {
    try {
      await api.post("/shop/products/analytics/event", data);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Server-side public fetchers for Next.js App Router (RSC & generateMetadata).
 */
export async function fetchPublicCategoriesServer(): Promise<ShopCategory[]> {
  try {
    const res = await fetch(`${ENV.ROOT_API}/shop/categories`, {
      next: { revalidate: 300 }, // 5 minutes cache
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("fetchPublicCategoriesServer error:", err);
    return [];
  }
}

export async function fetchPublicProductsServer(
  params?: PublicProductFilterParams
): Promise<PublicProductListResponse> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.category) searchParams.set("category", params.category);
    if (params?.fulfillmentMode) searchParams.set("fulfillmentMode", params.fulfillmentMode);
    if (params?.availabilityStatus) searchParams.set("availabilityStatus", params.availabilityStatus);
    if (params?.minPrice !== undefined) searchParams.set("minPrice", String(params.minPrice));
    if (params?.maxPrice !== undefined) searchParams.set("maxPrice", String(params.maxPrice));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.sort) searchParams.set("sort", params.sort);

    const qs = searchParams.toString();
    const url = `${ENV.ROOT_API}/shop/products${qs ? `?${qs}` : ""}`;

    const res = await fetch(url, {
      next: { revalidate: 60 }, // 1 minute cache
    });

    if (!res.ok) {
      return {
        products: [],
        pagination: { total: 0, page: 1, limit: 20, pages: 1 },
      };
    }

    const json = await res.json();
    return {
      products: json.data || [],
      pagination: json.pagination || { total: 0, page: 1, limit: 20, pages: 1 },
    };
  } catch (err) {
    console.error("fetchPublicProductsServer error:", err);
    return {
      products: [],
      pagination: { total: 0, page: 1, limit: 20, pages: 1 },
    };
  }
}

export async function fetchPublicProductBySlugServer(
  slug: string
): Promise<PublicShopProduct | null> {
  try {
    const res = await fetch(
      `${ENV.ROOT_API}/shop/products/${encodeURIComponent(slug)}`,
      {
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error("fetchPublicProductBySlugServer error:", err);
    return null;
  }
}
