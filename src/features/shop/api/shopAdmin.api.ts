// =============================================================================
//  OPENIDEAR SHOP — ADMIN API CLIENT (SPRINT S1)
//  src/features/shop/api/shopAdmin.api.ts
// =============================================================================

import { api, ApiResponse } from "@/lib/api/axios";
import type {
  ShopCategory,
  ShopProduct,
  ProductAdminFilterParams,
  ShopOrder,
  OrderAdminFilterParams,
  ShopOrderStatus,
  VerifySupplierPayload,
  CommerceAnalyticsOverview,
} from "../types/shop.types";

export const shopAdminApi = {
  // ─── CATEGORY ENDPOINTS ───────────────────────────────────────────────────

  getCategories: async (): Promise<ApiResponse<ShopCategory[]>> => {
    const res = await api.get<{ status: string; data: ShopCategory[] }>(
      "/shop/categories/admin"
    );
    return {
      ...res,
      data: res.data?.data || [],
    };
  },

  createCategory: async (
    payload: Partial<ShopCategory>
  ): Promise<ApiResponse<ShopCategory>> => {
    return api.post<ShopCategory>("/shop/categories", payload);
  },

  updateCategory: async (
    id: string,
    payload: Partial<ShopCategory>
  ): Promise<ApiResponse<ShopCategory>> => {
    return api.patch<ShopCategory>(`/shop/categories/${id}`, payload);
  },

  deleteCategory: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return api.delete<{ message: string }>(`/shop/categories/${id}`);
  },

  // ─── PRODUCT ENDPOINTS ────────────────────────────────────────────────────

  getProducts: async (
    params?: ProductAdminFilterParams
  ): Promise<
    ApiResponse<{
      products: ShopProduct[];
      pagination: { total: number; page: number; limit: number; pages: number };
    }>
  > => {
    const res = await api.get<{
      status: string;
      data: ShopProduct[];
      pagination: { total: number; page: number; limit: number; pages: number };
    }>("/shop/products/admin", { params });

    return {
      ...res,
      data: {
        products: res.data?.data || [],
        pagination: res.data?.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          pages: 1,
        },
      },
    };
  },

  getProductById: async (id: string): Promise<ApiResponse<ShopProduct>> => {
    const res = await api.get<{ status: string; data: ShopProduct }>(
      `/shop/products/admin/${id}`
    );
    return {
      ...res,
      data: res.data?.data,
    };
  },

  createProduct: async (
    payload: Partial<ShopProduct>
  ): Promise<ApiResponse<ShopProduct>> => {
    return api.post<ShopProduct>("/shop/products", payload);
  },

  updateProduct: async (
    id: string,
    payload: Partial<ShopProduct>
  ): Promise<ApiResponse<ShopProduct>> => {
    return api.patch<ShopProduct>(`/shop/products/${id}`, payload);
  },

  updateStock: async (
    id: string,
    stockQuantity: number
  ): Promise<ApiResponse<{ _id: string; stockQuantity: number; availabilityStatus: string }>> => {
    return api.patch(`/shop/products/${id}/stock`, { stockQuantity });
  },

  deleteProduct: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return api.delete<{ message: string }>(`/shop/products/${id}`);
  },

  // ─── ORDER & INQUIRY ENDPOINTS (SPRINT S3) ────────────────────────────────

  getOrders: async (
    params?: OrderAdminFilterParams
  ): Promise<
    ApiResponse<{
      orders: ShopOrder[];
      pagination: { total: number; page: number; limit: number; pages: number };
    }>
  > => {
    const res = await api.get<{
      status: string;
      data: ShopOrder[];
      pagination: { total: number; page: number; limit: number; pages: number };
    }>("/shop/orders/admin", { params });

    return {
      ...res,
      data: {
        orders: res.data?.data || [],
        pagination: res.data?.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          pages: 1,
        },
      },
    };
  },

  getOrderById: async (id: string): Promise<ApiResponse<ShopOrder>> => {
    const res = await api.get<{ status: string; data: ShopOrder }>(
      `/shop/orders/admin/${id}`
    );
    return {
      ...res,
      data: res.data?.data,
    };
  },

  updateOrderStatus: async (
    id: string,
    status: ShopOrderStatus,
    note?: string
  ): Promise<ApiResponse<ShopOrder>> => {
    const res = await api.patch<{ status: string; data: ShopOrder }>(
      `/shop/orders/admin/${id}/status`,
      { status, note }
    );
    return {
      ...res,
      data: res.data?.data,
    };
  },

  updateOrderAdminNote: async (
    id: string,
    adminNote: string
  ): Promise<ApiResponse<ShopOrder>> => {
    const res = await api.patch<{ status: string; data: ShopOrder }>(
      `/shop/orders/admin/${id}/notes`,
      { adminNote }
    );
    return {
      ...res,
      data: res.data?.data,
    };
  },

  verifySupplierItem: async (
    orderId: string,
    itemId: string | number,
    payload: VerifySupplierPayload
  ): Promise<ApiResponse<ShopOrder>> => {
    const res = await api.patch<{ status: string; data: ShopOrder }>(
      `/shop/orders/admin/${orderId}/items/${itemId}/verify-supplier`,
      payload
    );
    return {
      ...res,
      data: res.data?.data,
    };
  },

  releaseExpiredReservations: async (): Promise<
    ApiResponse<{ count: number; releasedOrderReferences: string[] }>
  > => {
    const res = await api.post<{
      status: string;
      data: { count: number; releasedOrderReferences: string[] };
    }>("/shop/orders/admin/release-expired");
    return {
      ...res,
      data: res.data?.data,
    };
  },

  // ─── COMMERCE FUNNEL & LAUNCH ANALYTICS (SPRINT S6) ───────────────────────

  getAnalyticsOverview: async (params?: {
    range?: "7d" | "30d" | "90d" | "all" | "custom";
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<CommerceAnalyticsOverview>> => {
    const res = await api.get<{
      status: string;
      data: CommerceAnalyticsOverview;
    }>("/shop/analytics/overview", { params });
    return {
      ...res,
      data: res.data?.data,
    };
  },
};

