// ─── Affiliate Product ──────────────────────────────────────────────────────

export type AffiliateNetwork = "amazon" | "shareasale" | "cj" | "custom";

export interface AffiliateProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency: string;
  originalPrice?: number;
  affiliateUrl: string;
  affiliateNetwork: AffiliateNetwork;
  affiliateId?: string;
  category?: string;
  tags: string[];
  rating?: number;
  reviewCount: number;
  clickCount: number;
  conversionCount: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Affiliate Click Tracking ───────────────────────────────────────────────

export interface AffiliateClick {
  product: string;
  post: string;
  user?: string;
  clickedAt: string;
}

// ─── Editor Block Attributes ────────────────────────────────────────────────

export type ProductBlockLayout = "card" | "inline" | "banner";

export interface AffiliateBlockAttrs {
  productId: string | null;
  productName: string;
  productImage: string;
  price: number | null;
  currency: string;
  affiliateUrl: string;
  ctaText: string;
  layout: ProductBlockLayout;
}
