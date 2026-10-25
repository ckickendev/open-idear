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
  reservedQuantity?: number;
  availableQuantity?: number;
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

// ─── PUBLIC CATALOG TYPES (SPRINT S2) ─────────────────────────────────────────

export interface PublicShopProductCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface PublicShopProduct {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: PublicShopProductCategory;
  summary?: string;
  description?: string;
  images: ShopProductImage[];
  sellingPrice: number;
  originalPrice?: number | null;
  specifications: ShopProductSpecification[];
  fulfillmentMode: FulfillmentMode;
  availabilityStatus: AvailabilityStatus;
  stockQuantity: number;
  status: "published";
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicProductFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  fulfillmentMode?: FulfillmentMode;
  availabilityStatus?: AvailabilityStatus;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
}

export interface PublicProductListResponse {
  products: PublicShopProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  error?: string | null;
}

// ─── ORDER & INQUIRY WORKFLOW TYPES (SPRINT S3) ──────────────────────────────

export type ShopOrderStatus =
  | "inquiry_received"
  | "contacted"
  | "awaiting_customer_confirmation"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface SupplierVerification {
  verified: boolean;
  verifiedAt?: string | null;
  verifiedBy?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  supplierCostPrice?: number | null;
  confirmedLeadTimeDays?: number | null;
  notes?: string;
}

export interface ShopOrderItem {
  product: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  thumbnail?: string | null;
  fulfillmentMode: FulfillmentMode;
  supplierVerification?: SupplierVerification;
}

export interface ShopOrderCustomer {
  name: string;
  contactMethod: string;
  deliveryArea?: string;
}

export interface ShopOrderStatusHistory {
  status: ShopOrderStatus;
  changedAt: string;
  changedBy?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  note?: string;
}

export interface ShopOrder {
  _id: string;
  orderReference: string;
  customer: ShopOrderCustomer;
  items: ShopOrderItem[];
  subtotal: number;
  currency: string;
  customerNote?: string;
  adminNote?: string;
  status: ShopOrderStatus;
  statusHistory: ShopOrderStatusHistory[];
  idempotencyKey?: string;
  inventoryReserved?: boolean;
  inventoryFulfilled?: boolean;
  reservationExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VerifySupplierPayload {
  verified?: boolean;
  supplierCostPrice?: number | null;
  confirmedLeadTimeDays?: number;
  notes?: string;
}

export interface OrderAttribution {
  articleId?: string;
  articleSlug?: string;
  embedId?: string;
  source?: string;
}

export interface EmbedAnalyticsEventPayload {
  eventType: "impression" | "click";
  productId: string;
  articleId?: string;
  articleSlug?: string;
  embedId?: string;
}

export interface CreateInquiryPayload {
  productId: string;
  quantity: number;
  customer: {
    name: string;
    contactMethod: string;
    deliveryArea?: string;
  };
  customerNote?: string;
  idempotencyKey?: string;
  attribution?: OrderAttribution;
}

export interface InquiryConfirmationResponse {
  orderReference: string;
  status: ShopOrderStatus;
  createdAt: string;
  customer: {
    name: string;
    contactMethod: string;
    deliveryArea: string | null;
  };
  items: ShopOrderItem[];
  subtotal: number;
  currency: string;
  customerNote: string | null;
  notices: string[];
}

export interface OrderAdminFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface OrderListResponse {
  orders: ShopOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ─── COMMERCE FUNNEL & LAUNCH ANALYTICS TYPES (SPRINT S6) ────────────────────

export interface AnalyticsTimeRange {
  range: "7d" | "30d" | "90d" | "all" | "custom";
  startDate: string;
  endDate: string;
  timezone: string;
}

export interface FunnelMetrics {
  productDetailViews: number;
  productEmbedImpressions: number;
  productEmbedClicks: number;
  embedClickThroughRatePct: number;
  inquiriesReceived: number;
  contacted: number;
  awaitingCustomerConfirmation: number;
  ordersConfirmed: number;
  ordersCompleted: number;
  ordersCancelled: number;
  inquiryToConfirmRatePct: number;
  inquiryToCompleteRatePct: number;
  cancellationRatePct: number;
}

export interface ContributionMarginMetrics {
  estimatedContributionMargin: number;
  contributionMarginPercentage: number;
  verifiedCostItemCoveragePct: number;
  notes: string;
}

export interface RevenueMetrics {
  currency: string;
  inquiryPipelineValue: number;
  grossConfirmedValue: number;
  completedRevenue: number;
  cancelledLostValue: number;
  averageOrderValue: number;
  contributionMargin: ContributionMarginMetrics | null;
}

export interface TopArticleAttribution {
  articleSlug: string;
  inquiries: number;
  confirmed: number;
  completed: number;
  grossValue: number;
  completedRevenue: number;
}

export interface AttributionMetrics {
  attributedInquiriesCount: number;
  attributedConfirmedCount: number;
  attributedCompletedCount: number;
  attributedCompletedRevenue: number;
  attributionSharePct: number;
  topArticles: TopArticleAttribution[];
}

export interface ProductPerformanceMetric {
  id: string;
  name: string;
  slug: string;
  sku: string;
  sellingPrice: number;
  views: number;
  embedImpressions: number;
  embedClicks: number;
  ctr: number;
  orderCount: number;
  status: string;
}

export interface DataIntegrityNotes {
  uniqueVisitorsDisclaimer: string;
  cancelledOrdersDisclaimer: string;
  attributionModel: string;
  costPriceIsolation: string;
}

export interface CommerceAnalyticsOverview {
  timeRange: AnalyticsTimeRange;
  funnel: FunnelMetrics;
  revenue: RevenueMetrics;
  attribution: AttributionMetrics;
  productPerformance: ProductPerformanceMetric[];
  dataIntegrityNotes: DataIntegrityNotes;
}


