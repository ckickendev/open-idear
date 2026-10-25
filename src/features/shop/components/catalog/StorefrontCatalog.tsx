"use client";

// =============================================================================
//  OPENIDEAR SHOP — STOREFRONT CATALOG CONTAINER
//  src/features/shop/components/catalog/StorefrontCatalog.tsx
// =============================================================================

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  ShopCategory,
  PublicShopProduct,
  PublicProductFilterParams,
  FulfillmentMode,
} from "../../types/shop.types";
import { shopPublicApi } from "../../api/shopPublic.api";
import { StorefrontHeader } from "./StorefrontHeader";
import { CategoryShortcuts } from "./CategoryShortcuts";
import { SearchBar } from "./SearchBar";
import { FilterSidebar } from "./FilterSidebar";
import { ActiveFilterChips } from "./ActiveFilterChips";
import { ProductGrid } from "./ProductGrid";
import {
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StorefrontCatalogProps {
  initialCategories: ShopCategory[];
  initialProducts: PublicShopProduct[];
  initialPagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  initialError?: string | null;
}

export function StorefrontCatalog({
  initialCategories,
  initialProducts,
  initialPagination,
  initialError = null,
}: StorefrontCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Internal catalog state
  const [categories] = useState<ShopCategory[]>(initialCategories);
  const [products, setProducts] = useState<PublicShopProduct[]>(initialProducts);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Parse filters from URL searchParams
  const getFiltersFromUrl = useCallback((): PublicProductFilterParams => {
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;
    const category = searchParams.get("category") || undefined;
    const fulfillmentMode =
      (searchParams.get("fulfillmentMode") as FulfillmentMode) || undefined;
    const availabilityStatus =
      (searchParams.get("availabilityStatus") as PublicProductFilterParams["availabilityStatus"]) ||
      undefined;
    const minPrice = searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined;
    const search = searchParams.get("search") || undefined;
    const sort =
      (searchParams.get("sort") as PublicProductFilterParams["sort"]) || "newest";

    return {
      page,
      limit: 20,
      category,
      fulfillmentMode,
      availabilityStatus,
      minPrice,
      maxPrice,
      search,
      sort,
    };
  }, [searchParams]);

  // Canonical string representation of active filters
  const getFilterSignature = useCallback((f: PublicProductFilterParams) => {
    return JSON.stringify({
      page: f.page || 1,
      category: f.category || "",
      fulfillmentMode: f.fulfillmentMode || "",
      availabilityStatus: f.availabilityStatus || "",
      minPrice: f.minPrice ?? null,
      maxPrice: f.maxPrice ?? null,
      search: f.search || "",
      sort: f.sort || "newest",
    });
  }, []);

  const [filters, setFilters] = useState<PublicProductFilterParams>(getFiltersFromUrl());

  // Track the signature of the data currently rendered in state.
  const lastFetchedSignatureRef = useRef<string>(
    getFilterSignature(getFiltersFromUrl())
  );

  // Fetch products whenever filters change
  const fetchProducts = useCallback(
    async (currentFilters: PublicProductFilterParams) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await shopPublicApi.getProducts(currentFilters);
        if (res.error) {
          setError(res.error);
        } else {
          setProducts(res.products);
          setPagination(res.pagination);
        }
      } catch (err: unknown) {
        console.error("Failed to load products:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load products from server"
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Sync state with URL params
  useEffect(() => {
    const urlFilters = getFiltersFromUrl();
    const currentSignature = getFilterSignature(urlFilters);
    setFilters(urlFilters);

    // Skip redundant fetch if server-rendered data already satisfies current URL query
    if (currentSignature === lastFetchedSignatureRef.current) {
      return;
    }

    lastFetchedSignatureRef.current = currentSignature;
    fetchProducts(urlFilters);
  }, [searchParams, getFiltersFromUrl, getFilterSignature, fetchProducts]);

  // Update URL search parameters
  const updateUrl = (newFilters: Partial<PublicProductFilterParams>) => {
    const merged = { ...filters, ...newFilters };
    const params = new URLSearchParams();

    if (merged.page && merged.page > 1) params.set("page", String(merged.page));
    if (merged.category) params.set("category", merged.category);
    if (merged.fulfillmentMode) params.set("fulfillmentMode", merged.fulfillmentMode);
    if (merged.availabilityStatus) params.set("availabilityStatus", merged.availabilityStatus);
    if (merged.minPrice !== undefined) params.set("minPrice", String(merged.minPrice));
    if (merged.maxPrice !== undefined) params.set("maxPrice", String(merged.maxPrice));
    if (merged.search) params.set("search", merged.search);
    if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort);

    const qs = params.toString();
    startTransition(() => {
      router.push(`/shop${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  };

  const handleFilterChange = (updates: Partial<PublicProductFilterParams>) => {
    updateUrl({ ...updates, page: 1 });
  };

  const handleRemoveSingleFilter = (key: keyof PublicProductFilterParams) => {
    updateUrl({ [key]: undefined, page: 1 });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      router.push("/shop", { scroll: false });
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    updateUrl({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters = Boolean(
    filters.category ||
      filters.fulfillmentMode ||
      filters.availabilityStatus ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.search
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      {/* ─── 1. Storefront Header Banner ────────────────────────────────── */}
      <StorefrontHeader />

      {/* ─── 2. Category Shortcuts Bar ───────────────────────────────────── */}
      <CategoryShortcuts
        categories={categories}
        activeCategory={filters.category}
        onSelectCategory={(slug) => handleFilterChange({ category: slug })}
      />

      {/* ─── 3. Search & Sort Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="flex-1 max-w-lg">
          <SearchBar
            value={filters.search || ""}
            onChange={(val) => handleFilterChange({ search: val || undefined })}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden gap-1.5 h-10 px-3 cursor-pointer border-border"
          >
            <SlidersHorizontal className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-xs">Filters</span>
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-blue-600" />
            )}
          </Button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <ArrowUpDown className="h-3.5 w-3.5" />
            </div>
            <select
              value={filters.sort || "newest"}
              onChange={(e) =>
                handleFilterChange({
                  sort: e.target.value as PublicProductFilterParams["sort"],
                })
              }
              className="pl-9 pr-8 py-2 text-xs font-semibold bg-card border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 transition-all cursor-pointer appearance-none h-10 shadow-2xs"
              aria-label="Sort products by"
            >
              <option value="newest">Sort: Newest Added</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── 4. Active Filter Chips ─────────────────────────────────────── */}
      <ActiveFilterChips
        filters={filters}
        categories={categories}
        onRemoveFilter={handleRemoveSingleFilter}
        onResetAll={handleResetFilters}
      />

      {/* ─── 5. Catalog Body (Sidebar + Grid) ────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Filter Sidebar (Desktop + Mobile Drawer) */}
        <FilterSidebar
          categories={categories}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          isMobileOpen={isMobileFilterOpen}
          onMobileClose={() => setIsMobileFilterOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 w-full space-y-6 min-w-0">
          {/* Results count indicator */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
            <span className="font-medium">
              {pagination.total > 0 ? (
                <>
                  Showing <strong className="text-foreground">{products.length}</strong>{" "}
                  of <strong className="text-foreground">{pagination.total}</strong> products
                </>
              ) : (
                <span>0 products available</span>
              )}
            </span>

            {filters.category && (
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Category:{" "}
                {categories.find((c) => c.slug === filters.category)?.name ||
                  filters.category}
              </span>
            )}
          </div>

          {/* Product Grid with error, empty, loading handling */}
          <ProductGrid
            products={products}
            isLoading={isLoading || isPending}
            error={error}
            hasActiveFilters={hasActiveFilters}
            onRetry={() => fetchProducts(filters)}
            onResetFilters={handleResetFilters}
          />

          {/* ─── 6. Pagination Controls ──────────────────────────────────── */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="gap-1 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === pagination.pages ||
                      Math.abs(p - pagination.page) <= 1
                    );
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const isGap = prev && p - prev > 1;

                    return (
                      <div key={p} className="flex items-center">
                        {isGap && (
                          <span className="px-2 text-muted-foreground text-xs">
                            ...
                          </span>
                        )}
                        <Button
                          variant={p === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(p)}
                          className={`h-8 w-8 p-0 cursor-pointer text-xs ${
                            p === pagination.page
                              ? "bg-blue-600 text-white font-bold"
                              : ""
                          }`}
                        >
                          {p}
                        </Button>
                      </div>
                    );
                  })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
