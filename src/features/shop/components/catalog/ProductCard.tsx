"use client";

// =============================================================================
//  OPENIDEAR SHOP — PC HARDWARE PRODUCT CARD
//  src/features/shop/components/catalog/ProductCard.tsx
// =============================================================================

import Link from "next/link";
import Image from "next/image";
import { Cpu, ArrowUpRight, Package, Box, Tag } from "lucide-react";
import type { PublicShopProduct } from "../../types/shop.types";
import { formatVND, getAvailabilityInfo } from "../../utils/formatters";

interface ProductCardProps {
  product: PublicShopProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url;

  const availability = getAvailabilityInfo(
    product.availabilityStatus,
    product.fulfillmentMode,
    product.stockQuantity
  );

  const hasValidPrice = typeof product.sellingPrice === "number" && product.sellingPrice > 0;

  return (
    <article className="group relative flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden hover:border-blue-500/50 hover:shadow-md transition-all duration-300">
      {/* ─── 1. Product Image Container (Consistent Aspect Ratio) ──────── */}
      <Link
        href={`/shop/${product.slug}`}
        className="relative block w-full aspect-4/3 bg-zinc-50/70 dark:bg-zinc-900/50 overflow-hidden border-b border-border/60"
        tabIndex={-1}
        aria-hidden="true"
      >
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-3.5 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground/60 gap-2 p-4">
            <Cpu className="h-10 w-10 stroke-[1.2] text-blue-500/40" />
            <span className="text-[11px] font-mono text-muted-foreground">
              OEM Spec Image Pending
            </span>
          </div>
        )}

        {/* Fulfillment Type Tag */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {product.fulfillmentMode === "supplier_order" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
              <Package className="h-3 w-3" />
              Supplier Order
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
              <Box className="h-3 w-3" />
              In Stock
            </span>
          )}
        </div>
      </Link>

      {/* ─── 2. Card Information Body ───────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 justify-between gap-3">
        <div className="space-y-2">
          {/* Category Tag & Availability Indicator */}
          <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
            <span className="inline-flex items-center gap-1 font-medium truncate max-w-[140px] text-zinc-500 dark:text-zinc-400">
              <Tag className="h-3 w-3 shrink-0 text-blue-600/70" />
              <span className="truncate">{product.category?.name || "PC Hardware"}</span>
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${availability.badgeClass}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${availability.dotClass}`} />
              {availability.label}
            </span>
          </div>

          {/* Product Name (Primary Identifier) */}
          <h3 className="font-bold text-foreground text-sm line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <Link href={`/shop/${product.slug}`} className="focus:outline-hidden">
              <span className="absolute inset-0 z-10" />
              {product.name}
            </Link>
          </h3>

          {/* Short Specification / Summary (if available) */}
          {product.summary ? (
            <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
              {product.summary}
            </p>
          ) : product.sku ? (
            <p className="text-[11px] font-mono text-muted-foreground/80 line-clamp-1">
              SKU: {product.sku}
            </p>
          ) : null}
        </div>

        {/* ─── 3. Current Price & Action CTA ────────────────────────────── */}
        <div className="pt-2.5 border-t border-border/50 flex items-end justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Authoritative Price
            </span>
            <span className="text-base font-extrabold text-foreground tracking-tight truncate">
              {hasValidPrice ? (
                formatVND(product.sellingPrice)
              ) : (
                <span className="text-xs text-muted-foreground font-medium">
                  Price on Inquiry
                </span>
              )}
            </span>
          </div>

          <div
            className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-2xs shrink-0"
            aria-hidden="true"
          >
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </article>
  );
}
