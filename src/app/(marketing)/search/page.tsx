"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  X,
  Filter,
  Grid,
  List,
  ArrowUpDown,
  SearchX,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
} from "lucide-react";
import { searchApi } from "@/features/search/api/search.api";
import {
  GlobalSearchResult,
  SearchItemType,
  SearchSort,
} from "@/features/search/types/search.types";
import { SearchCourseCard } from "@/features/search/components/SearchCourseCard";
import { SearchPostCard } from "@/features/search/components/SearchPostCard";
import { SearchSidebar } from "@/features/search/components/SearchSidebar";

const SUGGESTED_KEYWORDS = [
  "Đầu tư",
  "Chứng khoán",
  "Build PC",
  "Next.js",
  "Lập trình",
  "Passive Investing",
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL query params
  const initialQuery = searchParams.get("q") || "";
  const initialType = (searchParams.get("type") as SearchItemType) || "all";
  const initialCategory = searchParams.get("category") || "";
  const initialSort = (searchParams.get("sort") as SearchSort) || "relevance";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialFree = searchParams.get("isFree") === "true";
  const initialMinPrice = searchParams.get("minPrice") || "";
  const initialMaxPrice = searchParams.get("maxPrice") || "";

  // Component state
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [type, setType] = useState<SearchItemType>(initialType);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SearchSort>(initialSort);
  const [page, setPage] = useState(initialPage);
  const [priceRange, setPriceRange] = useState<string>(
    initialFree
      ? "free"
      : initialMinPrice === "500000"
      ? "above500"
      : initialMaxPrice === "500000"
      ? "under500"
      : "all"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Result state
  const [searchResult, setSearchResult] = useState<GlobalSearchResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Sync state when URL searchParams change
  useEffect(() => {
    setSearchInput(initialQuery);
    setType(initialType);
    setCategory(initialCategory);
    setSort(initialSort);
    setPage(initialPage);
  }, [initialQuery, initialType, initialCategory, initialSort, initialPage]);

  // Push updated params to URL
  const updateUrlParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  };

  // Fetch search data
  useEffect(() => {
    let isCancelled = false;

    const executeSearch = async () => {
      setIsLoading(true);
      try {
        let isFreeParam: boolean | undefined = undefined;
        let minPriceParam: number | undefined = undefined;
        let maxPriceParam: number | undefined = undefined;

        if (priceRange === "free") isFreeParam = true;
        else if (priceRange === "under500") maxPriceParam = 500000;
        else if (priceRange === "above500") minPriceParam = 500000;

        const res = await searchApi.globalSearch({
          q: searchInput,
          type,
          category: category || undefined,
          isFree: isFreeParam,
          minPrice: minPriceParam,
          maxPrice: maxPriceParam,
          sort,
          page,
          limit: 12,
        });

        if (!isCancelled && res.success && res.data) {
          const payload = (res.data as any).data || res.data;
          setSearchResult(payload);
        }
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    executeSearch();

    return () => {
      isCancelled = true;
    };
  }, [searchInput, type, category, priceRange, sort, page]);

  // Search input submission
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    updateUrlParams({
      q: searchInput.trim() || null,
      page: null,
    });
  };

  // Filter change handlers
  const handleTypeChange = (newType: SearchItemType) => {
    setType(newType);
    setPage(1);
    updateUrlParams({
      type: newType === "all" ? null : newType,
      page: null,
    });
  };

  const handleCategoryChange = (newCategorySlug: string) => {
    setCategory(newCategorySlug);
    setPage(1);
    updateUrlParams({
      category: newCategorySlug || null,
      page: null,
    });
  };

  const handlePriceRangeChange = (newRange: string) => {
    setPriceRange(newRange);
    setPage(1);

    const updates: Record<string, string | null> = {
      isFree: newRange === "free" ? "true" : null,
      minPrice: newRange === "above500" ? "500000" : null,
      maxPrice: newRange === "under500" ? "500000" : null,
      page: null,
    };
    updateUrlParams(updates);
  };

  const handleSortChange = (newSort: SearchSort) => {
    setSort(newSort);
    setPage(1);
    updateUrlParams({
      sort: newSort === "relevance" ? null : newSort,
      page: null,
    });
  };

  const handleResetFilters = () => {
    setCategory("");
    setPriceRange("all");
    setType("all");
    setSort("relevance");
    setPage(1);
    updateUrlParams({
      type: null,
      category: null,
      isFree: null,
      minPrice: null,
      maxPrice: null,
      sort: null,
      page: null,
    });
  };

  const counts = searchResult?.counts || { all: 0, courses: 0, posts: 0 };
  const pagination = searchResult?.pagination || {
    currentPage: 1,
    limit: 12,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ── Top Hero / Search Banner ────────────────────────────────────────── */}
      <div className="border-b border-border bg-card/60 backdrop-blur-md pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
            <Sparkles size={13} />
            <span>Tìm kiếm hợp nhất • OpenIdear Unified Search</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
            Khám Phá Khóa Học & Bài Viết
          </h1>

          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full max-w-2xl flex items-center"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Nhập từ khóa tìm kiếm khóa học, bài viết, công nghệ..."
                className="w-full h-12 pl-12 pr-12 rounded-2xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all shadow-sm placeholder:text-muted-foreground"
              />
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateUrlParams({ q: null, page: null });
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="ml-2.5 h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-md transition-all shrink-0 cursor-pointer"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Quick Keyword Pills */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap text-xs text-muted-foreground">
            <span className="font-medium">Gợi ý tìm kiếm:</span>
            {SUGGESTED_KEYWORDS.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => {
                  setSearchInput(kw);
                  setPage(1);
                  updateUrlParams({ q: kw, page: null });
                }}
                className="px-2.5 py-1 rounded-lg bg-muted hover:bg-accent text-foreground transition-colors cursor-pointer"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content Area ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Top Control Bar: Tabs, View Toggle, Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-border">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border overflow-x-auto">
            <button
              type="button"
              onClick={() => handleTypeChange("all")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                type === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Tất cả ({counts.all})
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange("courses")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                type === "courses"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <BookOpen size={13} />
              <span>Khóa học ({counts.courses})</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange("posts")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                type === "posts"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <FileText size={13} />
              <span>Bài viết ({counts.posts})</span>
            </button>
          </div>

          {/* Right Controls: Sort & Mobile Filter Toggle & View Mode */}
          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Filter size={14} className="text-primary" />
              <span>Bộ lọc</span>
              {(category || priceRange !== "all") && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                Sắp xếp:
              </span>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value as SearchSort)}
                className="h-9 px-3 rounded-xl bg-card border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="relevance">Liên quan nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến nhất</option>
                <option value="price_asc">Giá: Thấp đến cao</option>
                <option value="price_desc">Giá: Cao đến thấp</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center p-1 rounded-xl bg-card border border-border">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Lưới"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="Danh sách"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* ── 2-Column Search Body ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
          {/* Left Column: Sidebar Filters */}
          <div
            className={`lg:block ${
              isMobileFilterOpen ? "block" : "hidden"
            } lg:col-span-1`}
          >
            <SearchSidebar
              type={type}
              selectedCategory={category}
              selectedPriceRange={priceRange}
              availableCategories={searchResult?.availableCategories || []}
              onTypeChange={handleTypeChange}
              onCategoryChange={handleCategoryChange}
              onPriceRangeChange={handlePriceRangeChange}
              onResetFilters={handleResetFilters}
              counts={counts}
            />
          </div>

          {/* Right Column: Search Results */}
          <div className="lg:col-span-3 flex flex-col">
            {/* Status bar */}
            {searchInput && (
              <p className="text-xs text-muted-foreground mb-4">
                Tìm thấy{" "}
                <span className="font-bold text-foreground">
                  {pagination.totalItems}
                </span>{" "}
                kết quả cho từ khóa &ldquo;
                <span className="font-semibold text-primary">{searchInput}</span>
                &rdquo;
              </p>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div
                className={`grid gap-4 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-border bg-card p-4 animate-pulse flex flex-col gap-3"
                  >
                    <div className="w-full aspect-video rounded-xl bg-muted" />
                    <div className="w-1/3 h-4 rounded bg-muted" />
                    <div className="w-3/4 h-5 rounded bg-muted" />
                    <div className="w-full h-3 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : pagination.totalItems === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-card border border-border min-h-[380px]">
                <div className="w-16 h-16 rounded-2xl bg-muted/60 border border-border flex items-center justify-center mb-4 text-muted-foreground">
                  <SearchX size={32} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1.5">
                  Không Tìm Thấy Kết Quả Phù Hợp
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mb-6 leading-relaxed">
                  Chúng tôi không tìm thấy khóa học hay bài viết nào khớp với từ
                  khóa hoặc bộ lọc của bạn. Bạn hãy thử kiểm tra lại chính tả hoặc
                  chọn từ khóa gợi ý bên dưới.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                  {SUGGESTED_KEYWORDS.map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => {
                        setSearchInput(kw);
                        setPage(1);
                        updateUrlParams({ q: kw, page: null });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-muted hover:bg-secondary text-xs font-medium text-foreground transition-colors cursor-pointer"
                    >
                      {kw}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Xóa toàn bộ bộ lọc
                </button>
              </div>
            ) : (
              /* Results List / Grid */
              <>
                <div
                  className={`grid gap-5 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {searchResult?.items.map((item) => {
                    if (item.type === "course") {
                      return (
                        <SearchCourseCard
                          key={`course_${item.id}`}
                          course={item}
                          viewMode={viewMode}
                          searchQuery={searchInput}
                        />
                      );
                    }
                    return (
                      <SearchPostCard
                        key={`post_${item.id}`}
                        post={item}
                        viewMode={viewMode}
                        searchQuery={searchInput}
                      />
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10 pt-6 border-t border-border">
                    <button
                      type="button"
                      onClick={() => {
                        const newPage = page - 1;
                        setPage(newPage);
                        updateUrlParams({ page: newPage > 1 ? String(newPage) : null });
                      }}
                      disabled={!pagination.hasPrevPage}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                      <span>Trang trước</span>
                    </button>

                    <span className="px-4 py-2 text-xs font-bold text-muted-foreground">
                      Trang {pagination.currentPage} / {pagination.totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const newPage = page + 1;
                        setPage(newPage);
                        updateUrlParams({ page: String(newPage) });
                      }}
                      disabled={!pagination.hasNextPage}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span>Trang sau</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-xs text-muted-foreground">Đang tải trang tìm kiếm…</p>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
