"use client";

// =============================================================================
//  OPENIDEAR SHOP — STOREFRONT CATALOG CONTAINER (SPRINT S2)
//  src/features/shop/components/catalog/StorefrontCatalog.tsx
// =============================================================================

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShopCategory,
  PublicShopProduct,
  PublicProductFilterParams,
  FulfillmentMode,
} from "../../types/shop.types";
import { shopPublicApi } from "../../api/shopPublic.api";
import { StorefrontHeader } from "./StorefrontHeader";
import { SearchBar } from "./SearchBar";
import { FilterSidebar } from "./FilterSidebar";
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
}

export function StorefrontCatalog({
  initialCategories,
  initialProducts,
  initialPagination,
}: StorefrontCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Internal catalog state
  const [categories] = useState<ShopCategory[]>(initialCategories);
  const [products, setProducts] = useState<PublicShopProduct[]>(initialProducts);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Parse filters from URL searchParams
  const getFiltersFromUrl = useCallback((): PublicProductFilterParams => {
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;
    const category = searchParams.get("category") || undefined;
    const fulfillmentMode = (searchParams.get("fulfillmentMode") as FulfillmentMode) || undefined;
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const search = searchParams.get("search") || undefined;
    const sort = (searchParams.get("sort") as PublicProductFilterParams["sort"]) || "newest";

    return {
      page,
      limit: 20,
      category,
      fulfillmentMode,
      minPrice,
      maxPrice,
      search,
      sort,
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<PublicProductFilterParams>(getFiltersFromUrl());

  // Fetch products whenever filters change
  const fetchProducts = useCallback(
    async (currentFilters: PublicProductFilterParams) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await shopPublicApi.getProducts(currentFilters);
        setProducts(res.products);
        setPagination(res.pagination);
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
    setFilters(urlFilters);
    fetchProducts(urlFilters);
  }, [searchParams, getFiltersFromUrl, fetchProducts]);

  // Update URL search parameters
  const updateUrl = (newFilters: Partial<PublicProductFilterParams>) => {
    const merged = { ...filters, ...newFilters };
    const params = new URLSearchParams();

    if (merged.page && merged.page > 1) params.set("page", String(merged.page));
    if (merged.category) params.set("category", merged.category);
    if (merged.fulfillmentMode) params.set("fulfillmentMode", merged.fulfillmentMode);
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      {/* ─── Storefront Header ─────────────────────────────────────────── */}
      <StorefrontHeader />

      {/* ─── Search & Sort Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
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
            className="lg:hidden gap-1.5 h-10 px-3 cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
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
              className="pl-9 pr-8 py-2 text-xs font-medium bg-card border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer appearance-none h-10"
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

      {/* ─── Catalog Body (Sidebar + Grid) ─────────────────────────────── */}
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
        <div className="flex-1 w-full space-y-8">
          {/* Results count & active tags */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {products.length} of {pagination.total} products
            </span>
            {filters.category && (
              <span className="font-medium text-foreground">
                Category:{" "}
                {categories.find((c) => c.slug === filters.category)?.name ||
                  filters.category}
              </span>
            )}
          </div>

          {/* Product Grid */}
          <ProductGrid
            products={products}
            isLoading={isLoading || isPending}
            error={error}
            onRetry={() => fetchProducts(filters)}
            onResetFilters={handleResetFilters}
          />

          {/* ─── Pagination ──────────────────────────────────────────────── */}
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
                    // Show current, first, last, and immediate neighbors
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
                            p === pagination.page ? "font-bold" : ""
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
