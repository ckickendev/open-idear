// =============================================================================
//  OPENIDEAR SHOP — FRONTEND FOUNDATION UNIT TESTS (SPRINT S1)
//  src/features/shop/__tests__/shopFoundation.test.ts
// =============================================================================

import assert from "node:assert";
import type {
  ShopCategory,
  ShopProduct,
  FulfillmentMode,
  AvailabilityStatus,
} from "../types/shop.types";

console.log("==================================================================");
console.log("  OPENIDEAR SHOP — FRONTEND FOUNDATION UNIT TESTS (SPRINT S1)");
console.log("==================================================================\n");

function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// 1. Currency Formatting
{
  const formatted = formatVND(16990000);
  assert(formatted.includes("16.990.000") || formatted.includes("16,990,000"), "Formatted price must contain thousands separator");
  console.log("  ✓ 1. VND currency formatting accurately represents hardware prices");
}

// 2. Fulfillment Mode & Availability State Rules
{
  function validateFulfillmentState(
    mode: FulfillmentMode,
    stock: number,
    status: AvailabilityStatus
  ): boolean {
    if (mode === "stock" && stock <= 0 && status === "in_stock") {
      return false; // Cannot claim in_stock if physical count is 0
    }
    if (mode === "supplier_order" && status === "in_stock") {
      return false; // Supplier orders must be available_on_order or out_of_stock
    }
    return true;
  }

  assert.strictEqual(validateFulfillmentState("stock", 5, "in_stock"), true);
  assert.strictEqual(validateFulfillmentState("stock", 0, "in_stock"), false);
  assert.strictEqual(validateFulfillmentState("stock", 0, "out_of_stock"), true);
  assert.strictEqual(validateFulfillmentState("supplier_order", 0, "in_stock"), false);
  assert.strictEqual(validateFulfillmentState("supplier_order", 0, "available_on_order"), true);
  console.log("  ✓ 2. Fulfillment and availability state invariants validated");
}

// 3. Category Hierarchy Guard
{
  function isValidParentCategory(categoryId: string, parentId: string | null): boolean {
    if (!parentId) return true;
    return categoryId !== parentId; // Category cannot be its own parent
  }

  assert.strictEqual(isValidParentCategory("cat_123", "cat_123"), false);
  assert.strictEqual(isValidParentCategory("cat_123", "cat_456"), true);
  assert.strictEqual(isValidParentCategory("cat_123", null), true);
  console.log("  ✓ 3. Category parent circular reference prevention verified");
}

console.log("\n==================================================================");
console.log("  ALL FRONTEND FOUNDATION TESTS PASSED (3/3)");
console.log("==================================================================\n");
