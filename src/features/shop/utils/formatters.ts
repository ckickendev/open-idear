// =============================================================================
//  OPENIDEAR SHOP — FORMATTERS & UTILITIES
//  src/features/shop/utils/formatters.ts
// =============================================================================

import type { FulfillmentMode, AvailabilityStatus } from "../types/shop.types";

/**
 * Format currency amount in Vietnamese đồng (VND).
 */
export function formatVND(amount: number): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return "0 ₫";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Returns human-readable label and visual variant for product availability.
 */
export function getAvailabilityInfo(
  status: AvailabilityStatus,
  fulfillmentMode: FulfillmentMode,
  stockQuantity: number = 0
): {
  label: string;
  subLabel?: string;
  badgeClass: string;
  dotClass: string;
  isAvailable: boolean;
  isSupplierOrder: boolean;
} {
  if (fulfillmentMode === "supplier_order") {
    return {
      label: "Available on Order",
      subLabel: "Supplier fulfillment",
      badgeClass:
        "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
      dotClass: "bg-sky-500",
      isAvailable: true,
      isSupplierOrder: true,
    };
  }

  if (status === "in_stock" && stockQuantity > 0) {
    return {
      label: "In Stock",
      subLabel: `${stockQuantity} units ready`,
      badgeClass:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
      dotClass: "bg-emerald-500",
      isAvailable: true,
      isSupplierOrder: false,
    };
  }

  if (status === "in_stock" && stockQuantity <= 0) {
    // Normalization edge case fallback
    return {
      label: "Out of Stock",
      subLabel: "Restocking soon",
      badgeClass:
        "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
      dotClass: "bg-amber-500",
      isAvailable: false,
      isSupplierOrder: false,
    };
  }

  if (status === "out_of_stock") {
    return {
      label: "Out of Stock",
      subLabel: "Currently unavailable",
      badgeClass:
        "bg-muted text-muted-foreground border-border",
      dotClass: "bg-muted-foreground/60",
      isAvailable: false,
      isSupplierOrder: false,
    };
  }

  if (status === "discontinued") {
    return {
      label: "Discontinued",
      badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
      dotClass: "bg-rose-500",
      isAvailable: false,
      isSupplierOrder: false,
    };
  }

  return {
    label: "Contact for Availability",
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
    isAvailable: false,
    isSupplierOrder: false,
  };
}
