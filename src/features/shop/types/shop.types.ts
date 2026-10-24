// =============================================================================
//  OPENIDEAR SHOP — TYPESCRIPT DEFINITIONS (SPRINT S1)
//  src/features/shop/types/shop.types.ts
// =============================================================================

export type FulfillmentMode = "stock" | "supplier_order";

export type AvailabilityStatus =
  | "in_stock"
  | "available_on_order"
  | "out_of_stock"
  | "discontinued";

export type PublicationStatus = "draft" | "published" | "archived";

export interface ShopCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  parentCategory?: {
    _id: string;
    name: string;
    slug: string;
  } | string | null;
  displayOrder: number;
  isActive: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShopProductImage {
  url: string;
  publicId?: string | null;
  alt?: string;
  isPrimary?: boolean;
}

export interface ShopProductSpecification {
  group: string;
  name: string;
  value: string;
}

export interface ShopProductSupplier {
  name: string;
  sku: string;
  costPrice?: number | null;
  leadTimeDays: number;
}

export interface ShopProduct {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  } | string;
  summary?: string;
  description?: string;
  images: ShopProductImage[];
  sellingPrice: number;
  originalPrice?: number | null;
  specifications: ShopProductSpecification[];
  fulfillmentMode: FulfillmentMode;
  availabilityStatus: AvailabilityStatus;
  stockQuantity: number;
  supplierInfo?: ShopProductSupplier;
  status: PublicationStatus;
  views?: number;
  orderCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductAdminFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  fulfillmentMode?: string;
  availabilityStatus?: string;
  search?: string;
  sort?: string;
}

export interface ProductListResponse {
  products: ShopProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
