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

    if (!res.success) {
      return {
        products: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 20,
          pages: 1,
        },
        error: res.message || "Failed to load products from server",
      };
    }

    return {
      products: res.data?.data || [],
      pagination: res.data?.pagination || {
        total: 0,
        page: 1,
        limit: 20,
        pages: 1,
      },
      error: null,
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

interface BatchQueueItem {
  id: string;
  resolve: (product: PublicShopProduct | null) => void;
  reject: (err: unknown) => void;
}

let pendingBatchQueue: BatchQueueItem[] = [];
let batchScheduled = false;
const productEmbedCache = new Map<string, PublicShopProduct>();

/**
 * Microtask / short-debounce batch loader for product embeds.
 * Combines concurrent embed requests into a single `/shop/products/batch` call.
 */
export function loadBatchedProduct(
  idOrSlug: string
): Promise<PublicShopProduct | null> {
  const cleanId = (idOrSlug || "").trim();
  if (!cleanId) return Promise.resolve(null);

  if (productEmbedCache.has(cleanId)) {
    return Promise.resolve(productEmbedCache.get(cleanId)!);
  }

  return new Promise((resolve, reject) => {
    pendingBatchQueue.push({ id: cleanId, resolve, reject });

    if (!batchScheduled) {
      batchScheduled = true;
      setTimeout(async () => {
        batchScheduled = false;
        const currentQueue = pendingBatchQueue;
        pendingBatchQueue = [];

        if (currentQueue.length === 0) return;

        // Collect unique uncached IDs
        const idsToFetch = Array.from(
          new Set(
            currentQueue
              .map((q) => q.id)
              .filter((id) => !productEmbedCache.has(id))
          )
        );

        if (idsToFetch.length === 0) {
          for (const q of currentQueue) {
            q.resolve(productEmbedCache.get(q.id) || null);
          }
          return;
        }

        try {
          const products = await shopPublicApi.getBatchProducts(idsToFetch);
          for (const prod of products) {
            if (prod._id) productEmbedCache.set(prod._id, prod);
            if (prod.slug) productEmbedCache.set(prod.slug, prod);
          }

          for (const q of currentQueue) {
            const found = productEmbedCache.get(q.id) || null;
            q.resolve(found);
          }
        } catch {
          // Graceful fallback to single product fetch on batch error
          for (const q of currentQueue) {
            try {
              const single = await shopPublicApi.getProductBySlug(q.id);
              if (single) {
                if (single._id) productEmbedCache.set(single._id, single);
                if (single.slug) productEmbedCache.set(single.slug, single);
              }
              q.resolve(single);
            } catch {
              q.resolve(null);
            }
          }
        }
      }, 10);
    }
  });
}

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
        error: `API returned HTTP ${res.status}`,
      };
    }

    const json = await res.json();
    return {
      products: json.data || [],
      pagination: json.pagination || { total: 0, page: 1, limit: 20, pages: 1 },
      error: null,
    };
  } catch (err) {
    console.error("fetchPublicProductsServer error:", err);
    return {
      products: [],
      pagination: { total: 0, page: 1, limit: 20, pages: 1 },
      error:
        err instanceof Error
          ? err.message
          : "Network error connecting to shop server",
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
