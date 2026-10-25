"use client";

// =============================================================================
//  OPENIDEAR SHOP — FILTER SIDEBAR (SPRINT S2)
//  src/features/shop/components/catalog/FilterSidebar.tsx
// =============================================================================

import { useState } from "react";
import type {
  ShopCategory,
  FulfillmentMode,
  PublicProductFilterParams,
} from "../../types/shop.types";
import {
  Layers,
  SlidersHorizontal,
  PackageCheck,
  RotateCcw,
  CircleDollarSign,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterSidebarProps {
  categories: ShopCategory[];
  filters: PublicProductFilterParams;
  onFilterChange: (newFilters: Partial<PublicProductFilterParams>) => void;
  onResetFilters: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const PRESET_PRICE_RANGES = [
  { label: "Under 5,000,000 ₫", min: undefined, max: 5000000 },
  { label: "5,000,000 ₫ – 15,000,000 ₫", min: 5000000, max: 15000000 },
  { label: "15,000,000 ₫ – 30,000,000 ₫", min: 15000000, max: 30000000 },
  { label: "Above 30,000,000 ₫", min: 30000000, max: undefined },
];

export function FilterSidebar({
  categories,
  filters,
  onFilterChange,
  onResetFilters,
  isMobileOpen = false,
  onMobileClose,
}: FilterSidebarProps) {
  const [minPriceInput, setMinPriceInput] = useState(
    filters.minPrice !== undefined ? String(filters.minPrice) : ""
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    filters.maxPrice !== undefined ? String(filters.maxPrice) : ""
  );

  const handleApplyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const min = minPriceInput ? Math.max(0, parseInt(minPriceInput, 10)) : undefined;
    const max = maxPriceInput ? Math.max(0, parseInt(maxPriceInput, 10)) : undefined;

    onFilterChange({
      minPrice: Number.isFinite(min) ? min : undefined,
      maxPrice: Number.isFinite(max) ? max : undefined,
      page: 1,
    });
  };

  const handleSelectPricePreset = (min?: number, max?: number) => {
    setMinPriceInput(min !== undefined ? String(min) : "");
    setMaxPriceInput(max !== undefined ? String(max) : "");
    onFilterChange({ minPrice: min, maxPrice: max, page: 1 });
  };

  const hasActiveFilters = Boolean(
    filters.category ||
      filters.fulfillmentMode ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.search
  );

  const content = (
    <div className="space-y-6">
      {/* ─── Header / Reset ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Reset all
          </button>
        )}
      </div>

      {/* ─── Categories ─────────────────────────────────────────────────── */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground tracking-wide uppercase">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Categories</span>
        </label>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onFilterChange({ category: undefined, page: 1 })}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer ${
              !filters.category
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => {
            const isSelected = filters.category === cat.slug;
            return (
              <button
                key={cat._id}
                type="button"
                onClick={() =>
                  onFilterChange({
                    category: isSelected ? undefined : cat.slug,
                    page: 1,
                  })
                }
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                }`}
              >
                <span className="truncate pr-2">{cat.name}</span>
                {cat.productCount !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {cat.productCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Fulfillment Type ─────────────────────────────────────────────── */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground tracking-wide uppercase">
          <PackageCheck className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Fulfillment & Stock</span>
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {[
            { value: undefined, label: "All Items" },
            { value: "stock" as FulfillmentMode, label: "In Stock (Physical)" },
            {
              value: "supplier_order" as FulfillmentMode,
              label: "Supplier Order",
            },
          ].map((mode) => {
            const isSelected = filters.fulfillmentMode === mode.value;
            return (
              <button
                key={mode.label}
                type="button"
                onClick={() =>
                  onFilterChange({
                    fulfillmentMode: mode.value,
                    page: 1,
                  })
                }
                className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-accent text-accent-foreground font-semibold border border-primary/30"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground border border-transparent"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full mr-2.5 ${
                    mode.value === "stock"
                      ? "bg-emerald-500"
                      : mode.value === "supplier_order"
                      ? "bg-sky-500"
                      : "bg-muted-foreground"
                  }`}
                />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Price Range ──────────────────────────────────────────────────── */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground tracking-wide uppercase">
          <CircleDollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Price (VND)</span>
        </label>

        {/* Preset ranges */}
        <div className="flex flex-col gap-1">
          {PRESET_PRICE_RANGES.map((preset) => {
            const isSelected =
              filters.minPrice === preset.min && filters.maxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSelectPricePreset(preset.min, preset.max)}
                className={`text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-accent text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Price Form */}
        <form onSubmit={handleApplyCustomPrice} className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min VND"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              min={0}
              className="w-full px-2.5 py-1.5 text-xs bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
            <span className="text-muted-foreground text-xs">–</span>
            <input
              type="number"
              placeholder="Max VND"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              min={0}
              className="w-full px-2.5 py-1.5 text-xs bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="w-full text-xs h-8 cursor-pointer"
          >
            Apply Price
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Container */}
      <aside className="hidden lg:block w-64 shrink-0 pr-4">
        <div className="sticky top-20 p-4 rounded-xl border border-border bg-card/60 backdrop-blur-xs">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          {/* Drawer content */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-background p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                <h3 className="font-semibold text-foreground text-base">
                  Filter Products
                </h3>
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {content}
            </div>

            <div className="pt-6 border-t border-border mt-6">
              <Button
                variant="default"
                className="w-full cursor-pointer"
                onClick={onMobileClose}
              >
                View Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
