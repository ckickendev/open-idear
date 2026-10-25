"use client";

// =============================================================================
//  OPENIDEAR SHOP — PC HARDWARE PRODUCT GRID
//  src/features/shop/components/catalog/ProductGrid.tsx
// =============================================================================

import { ProductCard } from "./ProductCard";
import type { PublicShopProduct } from "../../types/shop.types";
import { AlertCircle, RefreshCw, SearchX, Cpu, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  products: PublicShopProduct[];
  isLoading: boolean;
  error?: string | null;
  hasActiveFilters?: boolean;
  onRetry?: () => void;
  onResetFilters?: () => void;
}

export function ProductGrid({
  products,
  isLoading,
  error,
  hasActiveFilters = false,
  onRetry,
  onResetFilters,
}: ProductGridProps) {
  // ─── 1. Loading Skeletons State ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden animate-pulse shadow-xs"
          >
            <div className="aspect-4/3 bg-muted/60" />
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-3 w-20 bg-muted rounded-md" />
                <div className="h-3.5 w-16 bg-muted rounded-full" />
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="h-4 w-5/6 bg-muted rounded-md" />
                <div className="h-4 w-3/4 bg-muted rounded-md" />
              </div>
              <div className="h-3 w-1/2 bg-muted/70 rounded-md" />
              <div className="pt-3 border-t border-border/40 flex justify-between items-end">
                <div className="space-y-1.5">
                  <div className="h-2.5 w-14 bg-muted rounded-md" />
                  <div className="h-5 w-24 bg-muted rounded-md" />
                </div>
                <div className="h-8 w-8 bg-muted rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── 2. API / Server Error State ────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-destructive/20 rounded-2xl bg-destructive/5 space-y-4">
        <div className="p-3.5 bg-destructive/10 text-destructive rounded-2xl">
          <AlertCircle className="h-8 w-8 stroke-[1.8]" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-lg font-bold text-foreground">
            Unable to Connect to Hardware Catalog
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {error || "The shop server could not be reached. Please verify your connection or try again."}
          </p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2 cursor-pointer mt-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </Button>
        )}
      </div>
    );
  }

  // ─── 3. Filter With Zero Matches State ───────────────────────────────────
  if (products.length === 0 && hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-border rounded-2xl bg-muted/20 space-y-4">
        <div className="p-4 bg-muted/60 text-muted-foreground rounded-2xl">
          <SearchX className="h-10 w-10 stroke-[1.5]" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-lg font-bold text-foreground">
            No Matching Hardware Found
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            No PC components match your current filter criteria or search keyword. Try broadening your price range or clearing filters.
          </p>
        </div>
        {onResetFilters && (
          <Button
            variant="default"
            size="sm"
            onClick={onResetFilters}
            className="mt-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
          >
            Reset All Filters
          </Button>
        )}
      </div>
    );
  }

  // ─── 4. Empty Catalog State (0 Total Products in Database) ───────────────
  if (products.length === 0 && !hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-border rounded-2xl bg-card space-y-5">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-200 dark:border-blue-900">
          <Cpu className="h-12 w-12 stroke-[1.3]" />
        </div>
        <div className="space-y-2 max-w-md">
          <h3 className="text-xl font-extrabold text-foreground tracking-tight">
            Hardware Catalog Under Preparation
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Our engineering team is currently compiling and verifying physical inventory and supplier authorizations for PC components. Only verified OEM products with authoritative pricing are listed.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="gap-1.5 cursor-pointer text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Catalog</span>
            </Button>
          )}

          <a
            href="/help"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Consult Technical Team</span>
          </a>
        </div>
      </div>
    );
  }

  // ─── 5. Populated Grid (Desktop: 4 cols, Tablet: 2-3 cols, Mobile: 1-2 cols) ─
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
