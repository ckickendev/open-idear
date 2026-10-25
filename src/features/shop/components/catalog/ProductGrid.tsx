"use client";

// =============================================================================
//  OPENIDEAR SHOP — PRODUCT GRID (SPRINT S2)
//  src/features/shop/components/catalog/ProductGrid.tsx
// =============================================================================

import { ProductCard } from "./ProductCard";
import type { PublicShopProduct } from "../../types/shop.types";
import { AlertCircle, RefreshCw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  products: PublicShopProduct[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onResetFilters?: () => void;
}

export function ProductGrid({
  products,
  isLoading,
  error,
  onRetry,
  onResetFilters,
}: ProductGridProps) {
  // ─── Loading Skeletons ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-border bg-card overflow-hidden animate-pulse"
          >
            <div className="aspect-[4/3] bg-muted/60" />
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-3 w-16 bg-muted rounded-sm" />
                <div className="h-3 w-12 bg-muted rounded-full" />
              </div>
              <div className="space-y-1.5">
                <div className="h-4 w-5/6 bg-muted rounded-sm" />
                <div className="h-4 w-2/3 bg-muted rounded-sm" />
              </div>
              <div className="pt-2 border-t border-border/40 flex justify-between items-center">
                <div className="space-y-1">
                  <div className="h-2.5 w-12 bg-muted rounded-sm" />
                  <div className="h-4 w-20 bg-muted rounded-sm" />
                </div>
                <div className="h-8 w-8 bg-muted rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-destructive/20 rounded-2xl bg-destructive/5 space-y-4">
        <div className="p-3 bg-destructive/10 text-destructive rounded-full">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="text-lg font-semibold text-foreground">
            Unable to load catalog
          </h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  // ─── Empty State ─────────────────────────────────────────────────────────
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-border rounded-2xl bg-muted/20 space-y-4">
        <div className="p-4 bg-muted/50 text-muted-foreground rounded-2xl">
          <SearchX className="h-10 w-10 stroke-[1.5]" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="text-lg font-semibold text-foreground">
            No products found
          </h3>
          <p className="text-sm text-muted-foreground">
            No hardware items match your current filter selection or search query.
          </p>
        </div>
        {onResetFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="mt-2 cursor-pointer"
          >
            Reset all filters
          </Button>
        )}
      </div>
    );
  }

  // ─── Product Grid ────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
