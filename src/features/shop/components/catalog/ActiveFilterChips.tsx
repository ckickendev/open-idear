"use client";

// =============================================================================
//  OPENIDEAR SHOP — ACTIVE FILTER CHIPS BAR
//  src/features/shop/components/catalog/ActiveFilterChips.tsx
// =============================================================================

import React from "react";
import type { PublicProductFilterParams, ShopCategory } from "../../types/shop.types";
import { formatVND } from "../../utils/formatters";
import { X, RotateCcw } from "lucide-react";

interface ActiveFilterChipsProps {
  filters: PublicProductFilterParams;
  categories: ShopCategory[];
  onRemoveFilter: (key: keyof PublicProductFilterParams) => void;
  onResetAll: () => void;
}

export function ActiveFilterChips({
  filters,
  categories,
  onRemoveFilter,
  onResetAll,
}: ActiveFilterChipsProps) {
  const chips: Array<{
    id: string;
    label: string;
    onRemove: () => void;
  }> = [];

  // Search chip
  if (filters.search) {
    chips.push({
      id: "search",
      label: `Search: "${filters.search}"`,
      onRemove: () => onRemoveFilter("search"),
    });
  }

  // Category chip
  if (filters.category) {
    const categoryName =
      categories.find((c) => c.slug === filters.category)?.name ||
      filters.category;
    chips.push({
      id: "category",
      label: `Category: ${categoryName}`,
      onRemove: () => onRemoveFilter("category"),
    });
  }

  // Fulfillment chip
  if (filters.fulfillmentMode) {
    chips.push({
      id: "fulfillmentMode",
      label:
        filters.fulfillmentMode === "stock"
          ? "Stock: Physical Inventory"
          : "Fulfillment: Supplier Order",
      onRemove: () => onRemoveFilter("fulfillmentMode"),
    });
  }

  // Availability chip
  if (filters.availabilityStatus) {
    const labels: Record<string, string> = {
      in_stock: "In Stock",
      available_on_order: "Available on Order",
      out_of_stock: "Out of Stock",
      pre_order: "Pre-order",
    };
    chips.push({
      id: "availabilityStatus",
      label: `Status: ${labels[filters.availabilityStatus] || filters.availabilityStatus}`,
      onRemove: () => onRemoveFilter("availabilityStatus"),
    });
  }

  // Price range chip
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    let priceLabel = "Price: ";
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      priceLabel += `${formatVND(filters.minPrice)} – ${formatVND(filters.maxPrice)}`;
    } else if (filters.minPrice !== undefined) {
      priceLabel += `≥ ${formatVND(filters.minPrice)}`;
    } else if (filters.maxPrice !== undefined) {
      priceLabel += `≤ ${formatVND(filters.maxPrice)}`;
    }
    chips.push({
      id: "price",
      label: priceLabel,
      onRemove: () => {
        onRemoveFilter("minPrice");
        onRemoveFilter("maxPrice");
      },
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 pb-3">
      <span className="text-xs font-medium text-muted-foreground">
        Active Filters:
      </span>

      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 transition-colors"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-sm p-0.5 text-blue-700 dark:text-blue-300 transition-colors cursor-pointer"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onResetAll}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium underline underline-offset-2 ml-1 cursor-pointer transition-colors"
      >
        <RotateCcw className="h-3 w-3" />
        <span>Clear all</span>
      </button>
    </div>
  );
}
