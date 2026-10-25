"use client";

// =============================================================================
//  OPENIDEAR SHOP — PRODUCT CARD (SPRINT S2)
//  src/features/shop/components/catalog/ProductCard.tsx
// =============================================================================

import Link from "next/link";
import Image from "next/image";
import { Cpu, ArrowUpRight, Package, Box } from "lucide-react";
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

  return (
    <article className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300">
      {/* ─── Product Image Container ─────────────────────────────────────── */}
      <Link
        href={`/shop/${product.slug}`}
        className="relative block w-full aspect-[4/3] bg-muted/40 overflow-hidden border-b border-border/50"
        tabIndex={-1}
        aria-hidden="true"
      >
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground/60 gap-2 p-4">
            <Cpu className="h-10 w-10 stroke-[1.2]" />
            <span className="text-xs font-mono">No image available</span>
          </div>
        )}

        {/* Fulfillment Type Tag */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {product.fulfillmentMode === "supplier_order" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 backdrop-blur-sm shadow-xs">
              <Package className="h-3 w-3" />
              Supplier Order
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 backdrop-blur-sm shadow-xs">
              <Box className="h-3 w-3" />
              In Stock
            </span>
          )}
        </div>
      </Link>

      {/* ─── Card Body ──────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 justify-between gap-3">
        <div className="space-y-1.5">
          {/* Category & Availability Dot */}
          <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
            <span className="font-medium truncate max-w-[150px]">
              {product.category?.name || "Hardware"}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${availability.badgeClass}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${availability.dotClass}`} />
              {availability.label}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            <Link href={`/shop/${product.slug}`} className="focus:outline-hidden">
              <span className="absolute inset-0 z-10" />
              {product.name}
            </Link>
          </h3>

          {/* Short Specs / Summary snippet if available */}
          {product.summary && (
            <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
              {product.summary}
            </p>
          )}
        </div>

        {/* ─── Price & Action ───────────────────────────────────────────── */}
        <div className="pt-2 border-t border-border/40 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-muted-foreground">
              Selling Price
            </span>
            <span className="text-base font-bold text-foreground tracking-tight">
              {formatVND(product.sellingPrice)}
            </span>
          </div>

          <div className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 shadow-2xs">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </article>
  );
}
