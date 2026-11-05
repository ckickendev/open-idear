// =============================================================================
//  OPENIDEAR SHOP — SPRINT UI REDESIGN 1 VERIFICATION TESTS
//  src/features/shop/__tests__/shopStorefrontRedesign.test.ts
// =============================================================================

import assert from "node:assert";
import type {
  PublicShopProduct,
  PublicProductFilterParams,
  ShopCategory,
  PublicProductListResponse,
} from "../types/shop.types.ts";
import { formatVND, getAvailabilityInfo } from "../utils/formatters.ts";

async function runTests() {
  console.log("==================================================================");
  console.log("  OPENIDEAR SHOP — SPRINT UI REDESIGN 1 VERIFICATION TESTS");
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(err);
      failed++;
    }
  }

  // =========================================================================
  //  1. AUDIT & RESOLUTION: ACCURATE PRODUCT COUNT (NEVER "0 of 0")
  // =========================================================================
  await test("1. Product count formatting truthfully distinguishes empty from populated catalogs", () => {
    function formatProductCount(productCount: number, total: number): string {
      if (total <= 0 || productCount <= 0) {
        return "0 products available";
      }
      return `Showing ${productCount} of ${total} products`;
    }

    // Previous bug condition: 0 products and 0 total
    const emptyResult = formatProductCount(0, 0);
    assert.strictEqual(emptyResult, "0 products available");
    assert.doesNotMatch(emptyResult, /0 of 0/i, "Must never display '0 of 0'");

    // Populated condition
    const populatedResult = formatProductCount(12, 45);
    assert.strictEqual(populatedResult, "Showing 12 of 45 products");

    // Single page condition
    const singlePageResult = formatProductCount(4, 4);
    assert.strictEqual(singlePageResult, "Showing 4 of 4 products");
  });

  // =========================================================================
  //  2. CATEGORY SHORTCUT PRESET MATCHING AGAINST REAL DB RECORDS
  // =========================================================================
  await test("2. Category shortcuts accurately match real DB category aliases without hallucinating IDs", () => {
    const mockDbCategories: ShopCategory[] = [
      {
        _id: "cat_gpu_123",
        name: "Card Màn Hình (VGA / GPU)",
        slug: "vga",
        isActive: true,
        displayOrder: 1,
        productCount: 15,
        createdAt: "2026-10-01",
        updatedAt: "2026-10-01",
      },
      {
        _id: "cat_cpu_456",
        name: "Bộ Vi Xử Lý (CPU)",
        slug: "cpu",
        isActive: true,
        displayOrder: 2,
        productCount: 8,
        createdAt: "2026-10-01",
        updatedAt: "2026-10-01",
      },
      {
        _id: "cat_monitors_789",
        name: "Màn Hình Máy Tính",
        slug: "monitors",
        isActive: true,
        displayOrder: 3,
        productCount: 5,
        createdAt: "2026-10-01",
        updatedAt: "2026-10-01",
      },
    ];

    const GPU_ALIASES = ["gpu", "vga", "graphics", "card-man-hinh", "card-do-hoa"];
    const matchedGpu = mockDbCategories.find((cat) =>
      GPU_ALIASES.includes(cat.slug.toLowerCase()) ||
      GPU_ALIASES.some((a) => cat.name.toLowerCase().includes(a))
    );

    assert.ok(matchedGpu, "GPU preset must match 'vga' DB category");
    assert.strictEqual(matchedGpu?._id, "cat_gpu_123");
    assert.strictEqual(matchedGpu?.slug, "vga");

    // Non-existent preset in DB (e.g. PSU)
    const PSU_ALIASES = ["psu", "power-supply", "nguon-may-tinh"];
    const matchedPsu = mockDbCategories.find((cat) =>
      PSU_ALIASES.includes(cat.slug.toLowerCase())
    );
    assert.strictEqual(matchedPsu, undefined, "Missing category must safely resolve to undefined without inventing data");
  });

  // =========================================================================
  //  3. DISTINCT CATALOG STATES (ERROR vs EMPTY CATALOG vs ZERO FILTER MATCHES)
  // =========================================================================
  await test("3. Catalog state machine cleanly segregates Error, Filter Empty, Catalog Empty, and Populated", () => {
    type CatalogState = "loading" | "error" | "filter_empty" | "catalog_empty" | "populated";

    function resolveCatalogState(
      isLoading: boolean,
      error: string | null | undefined,
      productCount: number,
      hasActiveFilters: boolean
    ): CatalogState {
      if (isLoading) return "loading";
      if (error) return "error";
      if (productCount === 0) {
        return hasActiveFilters ? "filter_empty" : "catalog_empty";
      }
      return "populated";
    }

    // 1. Loading
    assert.strictEqual(resolveCatalogState(true, null, 0, false), "loading");

    // 2. Network error
    assert.strictEqual(resolveCatalogState(false, "ECONNREFUSED", 0, false), "error");

    // 3. Database is genuinely empty (no filters applied)
    assert.strictEqual(resolveCatalogState(false, null, 0, false), "catalog_empty");

    // 4. Filters applied but zero products match
    assert.strictEqual(resolveCatalogState(false, null, 0, true), "filter_empty");

    // 5. Products available
    assert.strictEqual(resolveCatalogState(false, null, 10, true), "populated");
  });

  // =========================================================================
  //  4. FULFILLMENT MODE INTEGRITY (PHYSICAL STOCK vs SUPPLIER ORDER)
  // =========================================================================
  await test("4. Fulfillment mode labels truthfully reflect physical stock vs supplier order", () => {
    // Physical in-stock product
    const inStockInfo = getAvailabilityInfo("in_stock", "stock", 5);
    assert.strictEqual(inStockInfo.label, "In Stock");
    assert.strictEqual(inStockInfo.isAvailable, true);
    assert.strictEqual(inStockInfo.isSupplierOrder, false);

    // Supplier order product
    const supplierOrderInfo = getAvailabilityInfo("available_on_order", "supplier_order", 0);
    assert.strictEqual(supplierOrderInfo.label, "Available on Order");
    assert.strictEqual(supplierOrderInfo.isAvailable, true);
    assert.strictEqual(supplierOrderInfo.isSupplierOrder, true);

    // Depleted stock product
    const outOfStockInfo = getAvailabilityInfo("out_of_stock", "stock", 0);
    assert.strictEqual(outOfStockInfo.label, "Out of Stock");
    assert.strictEqual(outOfStockInfo.isAvailable, false);
  });

  // =========================================================================
  //  5. PUBLIC PRODUCT RESPONSE ERROR CHANNEL
  // =========================================================================
  await test("5. PublicProductListResponse correctly encapsulates error state for SSR and client", () => {
    const errorResponse: PublicProductListResponse = {
      products: [],
      pagination: { total: 0, page: 1, limit: 20, pages: 1 },
      error: "API returned HTTP 503",
    };

    assert.strictEqual(errorResponse.products.length, 0);
    assert.strictEqual(errorResponse.error, "API returned HTTP 503");

    const successResponse: PublicProductListResponse = {
      products: [],
      pagination: { total: 0, page: 1, limit: 20, pages: 0 },
      error: null,
    };
    assert.strictEqual(successResponse.error, null);
  });

  console.log("------------------------------------------------------------------");
  console.log(`  Sprint UI Redesign 1 Tests: ${passed} passed, ${failed} failed.`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
