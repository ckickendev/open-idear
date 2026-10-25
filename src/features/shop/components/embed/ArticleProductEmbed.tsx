// =============================================================================
//  ARTICLE PRODUCT EMBED — SPRINT S5 CONTENT COMMERCE
//  src/features/shop/components/embed/ArticleProductEmbed.tsx
//
//  Design Decisions:
//  - Resolves live public product information dynamically at render time.
//  - Never exposes internal supplier cost, distributor SKU, or inventory buffers.
//  - Deduplicated impression tracking with IntersectionObserver and session Set.
//  - Click attribution passes `from_article` and `embed_id` to product detail URL.
//  - Gracefully handles published, supplier-order, out-of-stock, and unavailable states.
// =============================================================================

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ExternalLink,
  PackageCheck,
  PackageX,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { shopPublicApi, loadBatchedProduct } from "@/features/shop/api/shopPublic.api";
import type { PublicShopProduct } from "@/features/shop/types/shop.types";
import { formatVND } from "@/features/shop/utils/formatters";

// In-memory session deduplication for embed impressions
const recordedImpressionKeys = new Set<string>();

export interface ArticleProductEmbedProps {
  productId: string;
  contextualLabel?: string;
  layout?: "card" | "compact" | "banner";
  articleSlug?: string;
  articleId?: string;
  embedId?: string;
}

export const ArticleProductEmbed: React.FC<ArticleProductEmbedProps> = ({
  productId,
  contextualLabel,
  layout = "card",
  articleSlug,
  articleId,
  embedId,
}) => {
  const [product, setProduct] = useState<PublicShopProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const impressionTrackedRef = useRef(false);

  // 1. Resolve live public product data via microtask batching
  useEffect(() => {
    let isMounted = true;
    if (!productId) {
      setLoading(false);
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    loadBatchedProduct(productId)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setProduct(data);
          setError(false);
        } else {
          setProduct(null);
          setError(true);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // 2. Telemetry: Deduplicated Impression Tracking with IntersectionObserver
  useEffect(() => {
    if (!product || impressionTrackedRef.current) return;

    const key = `${product._id}:${articleSlug || ""}:${embedId || ""}`;
    if (recordedImpressionKeys.has(key)) {
      impressionTrackedRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !impressionTrackedRef.current) {
          impressionTrackedRef.current = true;
          recordedImpressionKeys.add(key);

          // Fire-and-forget impression event
          shopPublicApi.recordAnalyticsEvent({
            eventType: "impression",
            productId: product._id,
            articleId,
            articleSlug,
            embedId,
          });

          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [product, articleId, articleSlug, embedId]);

  // 3. Telemetry: Click tracking
  const handleProductClick = () => {
    if (!product) return;
    shopPublicApi.recordAnalyticsEvent({
      eventType: "click",
      productId: product._id,
      articleId,
      articleSlug,
      embedId,
    });
  };

  // If loading, show clean skeleton
  if (loading) {
    return (
      <aside
        ref={containerRef}
        aria-label="Loading product recommendation"
        className="my-8 p-4 rounded-2xl border border-[var(--color-editor-border)] bg-[var(--color-editor-surface)]/60 animate-pulse"
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-[var(--color-editor-elevated)] shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-[var(--color-editor-elevated)] rounded" />
            <div className="h-4 w-3/4 bg-[var(--color-editor-elevated)] rounded" />
            <div className="h-4 w-28 bg-[var(--color-editor-elevated)] rounded" />
          </div>
        </div>
      </aside>
    );
  }

  // Graceful handling for missing, draft, discontinued, or deleted products
  if (error || !product) {
    return (
      <aside
        ref={containerRef}
        className="my-6 p-4 rounded-xl border border-dashed border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]/30 text-[var(--color-editor-muted)] text-xs flex items-center gap-3"
      >
        <ShoppingBag size={16} className="opacity-50 shrink-0" />
        <span className="italic">
          Hardware item previously referenced in this section is currently unavailable in the verified catalog.
        </span>
      </aside>
    );
  }

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "/placeholder-product.svg";

  // Build target URL with attribution parameters
  const queryParams = new URLSearchParams();
  if (articleSlug) queryParams.set("from_article", articleSlug);
  if (embedId) queryParams.set("embed_id", embedId);
  const targetUrl = `/shop/${product.slug}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const isOutOfStock = product.availabilityStatus === "out_of_stock";
  const isSupplierOrder = product.availabilityStatus === "available_on_order";

  // Compact layout
  if (layout === "compact") {
    return (
      <aside
        ref={containerRef}
        className="my-6 not-prose rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.04] via-transparent to-transparent p-3.5 hover:border-emerald-500/40 transition-all shadow-sm"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primaryImage}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover border border-[var(--color-editor-border)] shrink-0"
            />
            <div className="min-w-0">
              {contextualLabel && (
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 mb-0.5 flex items-center gap-1">
                  <Sparkles size={10} />
                  <span>{contextualLabel}</span>
                </div>
              )}
              <h4 className="text-xs font-bold text-foreground truncate">
                {product.name}
              </h4>
              <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatVND(product.sellingPrice)}
              </p>
            </div>
          </div>

          <Link
            href={targetUrl}
            onClick={handleProductClick}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow-sm"
          >
            <span>View</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </aside>
    );
  }

  // Standard card layout
  return (
    <aside
      ref={containerRef}
      className="my-8 not-prose rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.04] to-transparent p-5 sm:p-6 hover:border-emerald-500/40 transition-all shadow-sm group"
    >
      {/* Editorial context header if authored */}
      {contextualLabel && (
        <div className="mb-3.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <Sparkles size={13} />
          <span>{contextualLabel}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Product image */}
        <Link
          href={targetUrl}
          onClick={handleProductClick}
          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] shrink-0 group-hover:scale-[1.02] transition-transform"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </Link>

        {/* Product details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {typeof product.category === "object" && product.category?.name && (
              <span className="text-[10px] font-medium text-muted-foreground bg-[var(--color-editor-elevated)] px-2 py-0.5 rounded-full">
                {product.category.name}
              </span>
            )}

            {/* Availability status badge */}
            {isOutOfStock ? (
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <PackageX size={10} />
                Out of Stock
              </span>
            ) : isSupplierOrder ? (
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock size={10} />
                Supplier Order
              </span>
            ) : (
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <PackageCheck size={10} />
                Verified & In Stock
              </span>
            )}
          </div>

          <Link
            href={targetUrl}
            onClick={handleProductClick}
            className="text-base font-bold text-foreground hover:text-emerald-500 transition-colors line-clamp-2"
          >
            {product.name}
          </Link>

          {product.summary && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {product.summary}
            </p>
          )}

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatVND(product.sellingPrice)}
            </span>
            {product.originalPrice &&
              product.originalPrice > product.sellingPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatVND(product.originalPrice)}
                </span>
              )}
          </div>
        </div>

        {/* Action button */}
        <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
          <Link
            href={targetUrl}
            onClick={handleProductClick}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md hover:shadow-emerald-500/20"
          >
            <ShoppingBag size={14} />
            <span>{isOutOfStock ? "View Specifications" : "Inquire Product"}</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default ArticleProductEmbed;
