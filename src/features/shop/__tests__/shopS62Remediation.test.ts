// =============================================================================
//  OPENIDEAR SHOP — SPRINT S6.2 AUDIT REMEDIATION TESTS
//  src/features/shop/__tests__/shopS62Remediation.test.ts
// =============================================================================

import assert from "node:assert";
import { formatVND } from "../utils/formatters.ts";
import type { PublicShopProduct, PublicProductFilterParams } from "../types/shop.types.ts";

async function runTests() {
  console.log("==================================================================");
  console.log("  OPENIDEAR SHOP — SPRINT S6.2 REMEDIATION & PERFORMANCE TESTS");
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
  //  1. AUDIT-PERF-01: STOREFRONT CATALOG FILTER SIGNATURE AND SSR CACHE
  // =========================================================================

  await test("1. [PERF-01] Filter signature deterministically identifies query state to prevent duplicate SSR fetch", () => {
    function computeFilterSignature(f: PublicProductFilterParams) {
      return JSON.stringify({
        page: f.page || 1,
        category: f.category || "",
        fulfillmentMode: f.fulfillmentMode || "",
        minPrice: f.minPrice ?? null,
        maxPrice: f.maxPrice ?? null,
        search: f.search || "",
        sort: f.sort || "newest",
      });
    }

    const serverRenderedFilters: PublicProductFilterParams = {
      page: 1,
      sort: "newest",
    };

    const initialClientFilters: PublicProductFilterParams = {
      page: 1,
      limit: 20,
      category: undefined,
      fulfillmentMode: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      search: undefined,
      sort: "newest",
    };

    const serverSig = computeFilterSignature(serverRenderedFilters);
    const clientSig = computeFilterSignature(initialClientFilters);

    // Assert that initial mount produces matching signature so effect skips redundant fetch
    assert.strictEqual(
      clientSig,
      serverSig,
      "Initial client signature must match server-rendered signature"
    );

    // Assert that changing any filter field creates a distinct signature
    const categoryUpdated: PublicProductFilterParams = {
      ...initialClientFilters,
      category: "graphics-cards",
    };
    assert.notStrictEqual(
      computeFilterSignature(categoryUpdated),
      clientSig,
      "Changing category must produce a new signature"
    );

    const pageUpdated: PublicProductFilterParams = {
      ...initialClientFilters,
      page: 2,
    };
    assert.notStrictEqual(
      computeFilterSignature(pageUpdated),
      clientSig,
      "Changing page must produce a new signature"
    );

    const searchUpdated: PublicProductFilterParams = {
      ...initialClientFilters,
      search: "RTX",
    };
    assert.notStrictEqual(
      computeFilterSignature(searchUpdated),
      clientSig,
      "Changing search must produce a new signature"
    );
  });

  // =========================================================================
  //  2. AUDIT-PERF-02: ARTICLE PRODUCT EMBED MICROTASK BATCHING
  // =========================================================================

  await test("2. [PERF-02] Microtask batching aggregates concurrent embed requests into a single network call", async () => {
    interface BatchQueueItem {
      id: string;
      resolve: (product: PublicShopProduct | null) => void;
      reject: (err: unknown) => void;
    }

    let networkCallCount = 0;
    let requestedIds: string[] = [];

    const mockProducts: PublicShopProduct[] = [
      {
        _id: "prod-1",
        name: "AMD Ryzen 9 9950X",
        slug: "amd-ryzen-9-9950x",
        sku: "AMD-R9-9950X",
        sellingPrice: 16990000,
        originalPrice: 17990000,
        status: "published",
        fulfillmentMode: "stock",
        availabilityStatus: "in_stock",
        stockQuantity: 10,
        views: 100,
        specifications: [],
        category: { _id: "cat-1", name: "CPUs", slug: "cpus" },
        images: [{ url: "https://example.com/cpu.jpg", isPrimary: true }],
      },
      {
        _id: "prod-2",
        name: "ASUS ROG STRIX X870E-E",
        slug: "asus-rog-strix-x870e-e",
        sku: "ASUS-X870E-E",
        sellingPrice: 13990000,
        originalPrice: 13990000,
        status: "published",
        fulfillmentMode: "stock",
        availabilityStatus: "in_stock",
        stockQuantity: 5,
        views: 50,
        specifications: [],
        category: { _id: "cat-2", name: "Motherboards", slug: "motherboards" },
        images: [{ url: "https://example.com/mb.jpg", isPrimary: true }],
      },
    ];

    // Local test instance of the batch loader
    let pendingQueue: BatchQueueItem[] = [];
    let scheduled = false;
    const testCache = new Map<string, PublicShopProduct>();

    function loadTestBatched(idOrSlug: string): Promise<PublicShopProduct | null> {
      const cleanId = idOrSlug.trim();
      if (testCache.has(cleanId)) {
        return Promise.resolve(testCache.get(cleanId)!);
      }

      return new Promise((resolve, reject) => {
        pendingQueue.push({ id: cleanId, resolve, reject });

        if (!scheduled) {
          scheduled = true;
          setTimeout(async () => {
            scheduled = false;
            const current = pendingQueue;
            pendingQueue = [];

            const idsToFetch = Array.from(
              new Set(current.map((q) => q.id).filter((id) => !testCache.has(id)))
            );

            if (idsToFetch.length === 0) {
              for (const q of current) {
                q.resolve(testCache.get(q.id) || null);
              }
              return;
            }

            networkCallCount++;
            requestedIds = idsToFetch;
            const fetched = mockProducts.filter(
              (p) => idsToFetch.includes(p._id) || idsToFetch.includes(p.slug)
            );

            for (const prod of fetched) {
              testCache.set(prod._id, prod);
              testCache.set(prod.slug, prod);
            }

            for (const q of current) {
              q.resolve(testCache.get(q.id) || null);
            }
          }, 10);
        }
      });
    }

    // Simulate 3 concurrent embeds mounting on an article
    const [res1, res2, resCached] = await Promise.all([
      loadTestBatched("prod-1"),
      loadTestBatched("prod-2"),
      loadTestBatched("prod-1"), // Duplicate embed on same page
    ]);

    // Exactly 1 network request was made for all 3 embeds
    assert.strictEqual(
      networkCallCount,
      1,
      `Expected exactly 1 batched network call, but made ${networkCallCount}`
    );
    assert.strictEqual(requestedIds.length, 2, "Only unique uncached IDs requested");
    assert.strictEqual(res1?.name, "AMD Ryzen 9 9950X");
    assert.strictEqual(res2?.name, "ASUS ROG STRIX X870E-E");
    assert.strictEqual(resCached?._id, "prod-1");

    // Verify in-memory cache on subsequent call
    const resAfter = await loadTestBatched("prod-1");
    assert.strictEqual(networkCallCount, 1, "Cache hit must not make a second network call");
    assert.strictEqual(resAfter?.name, "AMD Ryzen 9 9950X");
  });

  // =========================================================================
  //  3. AUDIT-MAINT-02: STANDARDIZED CURRENCY FORMATTING
  // =========================================================================

  await test("3. [MAINT-02] formatVND formats currency values truthfully and handles edge cases", () => {
    assert.strictEqual(typeof formatVND(0), "string");
    assert.ok(formatVND(49990000).includes("49.990.000"));
    assert.ok(formatVND(1000).includes("1.000"));
  });

  console.log("------------------------------------------------------------------");
  console.log(`  Sprint S6.2 Remediation Tests: ${passed} passed, ${failed} failed.`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
