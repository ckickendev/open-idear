"use client";

import React from "react";
import { SearchCategoryFacet, SearchItemType } from "../types/search.types";
import { Filter, RotateCcw, Check, Sparkles } from "lucide-react";

interface SearchSidebarProps {
  type: SearchItemType;
  selectedCategory: string;
  selectedPriceRange: string; // "all" | "free" | "under500" | "above500"
  availableCategories: SearchCategoryFacet[];
  onTypeChange: (type: SearchItemType) => void;
  onCategoryChange: (categorySlug: string) => void;
  onPriceRangeChange: (range: string) => void;
  onResetFilters: () => void;
  counts: { all: number; courses: number; posts: number };
}

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
  type,
  selectedCategory,
  selectedPriceRange,
  availableCategories,
  onTypeChange,
  onCategoryChange,
  onPriceRangeChange,
  onResetFilters,
  counts,
}) => {
  const hasActiveFilters =
    selectedCategory !== "" ||
    selectedPriceRange !== "all" ||
    type !== "all";

  return (
    <aside className="w-full flex flex-col gap-6 p-5 rounded-2xl bg-card border border-border">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
          <Filter size={16} className="text-primary" />
          <span>Bộ lọc tìm kiếm</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {/* 1. Content Type Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Loại nội dung
        </h4>
        <div className="flex flex-col gap-1.5">
          {[
            { id: "all", label: "Tất cả kết quả", count: counts.all },
            { id: "courses", label: "Khóa học", count: counts.courses },
            { id: "posts", label: "Bài viết", count: counts.posts },
          ].map((item) => {
            const isSelected = type === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTypeChange(item.id as SearchItemType)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Price Filter (Applicable when viewing courses or all) */}
      {type !== "posts" && (
        <div className="pt-2 border-t border-border/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Mức học phí
          </h4>
          <div className="flex flex-col gap-1.5">
            {[
              { id: "all", label: "Tất cả mức giá" },
              { id: "free", label: "Miễn phí (Free)" },
              { id: "under500", label: "Dưới 500.000 ₫" },
              { id: "above500", label: "Từ 500.000 ₫ trở lên" },
            ].map((option) => {
              const isSelected = selectedPriceRange === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onPriceRangeChange(option.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-secondary text-secondary-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {isSelected && <Check size={10} className="stroke-[3]" />}
                  </div>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Category Facet Filter */}
      {availableCategories.length > 0 && (
        <div className="pt-2 border-t border-border/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Danh mục chủ đề
          </h4>
          <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => onCategoryChange("")}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                selectedCategory === ""
                  ? "bg-secondary text-secondary-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium"
              }`}
            >
              <span>Tất cả danh mục</span>
            </button>

            {availableCategories.map((cat) => {
              const isSelected =
                selectedCategory === cat.slug || selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.slug)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-secondary text-secondary-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium"
                  }`}
                >
                  <span className="truncate pr-2">{cat.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
