// =============================================================================
//  OPENIDEAR SHOP — SPRINT S2: CATALOG, SEO & AVAILABILITY TESTS
//  src/features/shop/__tests__/shopCatalogAndSeo.test.ts
// =============================================================================

import assert from "node:assert";
import { formatVND, getAvailabilityInfo } from "../utils/formatters.ts";
import {
  buildStorefrontMetadata,
  buildProductDetailMetadata,
  getProductStructuredData,
  getSchemaAvailability,
} from "../seo/buildShopMetadata.ts";
import type { PublicShopProduct } from "../types/shop.types.ts";

console.log("==================================================================");
console.log("  OPENIDEAR SHOP — SPRINT S2: CATALOG & SEO UNIT TESTS");
console.log("==================================================================\n");

// 1. VND Currency Formatting
{
  const formattedStandard = formatVND(16990000);
  assert(
    formattedStandard.includes("16.990.000") || formattedStandard.includes("16,990,000"),
    "Formatted VND price must include thousands separators"
  );
  assert(formattedStandard.includes("₫") || formattedStandard.includes("VND"), "Must include currency symbol");

  const formattedZero = formatVND(0);
  assert(
    formattedZero.includes("0") &&
      (formattedZero.includes("₫") || formattedZero.includes("VND")),
    "Zero price must format properly"
  );

  console.log("  ✓ 1. VND currency formatting accurately reflects price amounts");
}

// 2. Availability Information & Distinction Rules
{
  // Physical Stock
  const inStock = getAvailabilityInfo("in_stock", "stock", 5);
  assert.strictEqual(inStock.label, "In Stock");
  assert.strictEqual(inStock.isAvailable, true);
  assert.strictEqual(inStock.isSupplierOrder, false);

  // Supplier Order (must NOT claim physical in_stock)
  const supplierOrder = getAvailabilityInfo("available_on_order", "supplier_order", 0);
  assert.strictEqual(supplierOrder.label, "Available on Order");
  assert.strictEqual(supplierOrder.subLabel, "Supplier fulfillment");
  assert.strictEqual(supplierOrder.isAvailable, true);
  assert.strictEqual(supplierOrder.isSupplierOrder, true);

  // Out of Stock
  const outOfStock = getAvailabilityInfo("out_of_stock", "stock", 0);
  assert.strictEqual(outOfStock.label, "Out of Stock");
  assert.strictEqual(outOfStock.isAvailable, false);
  assert.strictEqual(outOfStock.isSupplierOrder, false);

  // Normalization Fallback (stock mode with 0 quantity but in_stock status)
  const zeroStockItem = getAvailabilityInfo("in_stock", "stock", 0);
  assert.strictEqual(zeroStockItem.isAvailable, false);
  assert.strictEqual(zeroStockItem.label, "Out of Stock");

  console.log("  ✓ 2. Availability states clearly distinguish stocked items from supplier orders");
}

// 3. Schema.org Availability URLs
{
  assert.strictEqual(
    getSchemaAvailability("in_stock", "stock"),
    "https://schema.org/InStock"
  );
  assert.strictEqual(
    getSchemaAvailability("available_on_order", "supplier_order"),
    "https://schema.org/PreOrder"
  );
  assert.strictEqual(
    getSchemaAvailability("out_of_stock", "stock"),
    "https://schema.org/OutOfStock"
  );
  assert.strictEqual(
    getSchemaAvailability("discontinued", "stock"),
    "https://schema.org/Discontinued"
  );

  console.log("  ✓ 3. Schema.org ItemAvailability maps truthfully to physical & supplier states");
}

// 4. Schema.org Structured Data Generation
{
  const mockProduct: PublicShopProduct = {
    _id: "prod_14700k",
    name: "Intel Core i7-14700K Desktop Processor",
    slug: "intel-core-i7-14700k",
    sku: "CPU-INTEL-14700K",
    category: {
      _id: "cat_cpu",
      name: "Processors (CPUs)",
      slug: "processors",
    },
    summary: "20 cores (8 P-cores + 12 E-cores) LGA1700 processor.",
    images: [
      {
        url: "https://res.cloudinary.com/demo/image/upload/sample_cpu.webp",
        isPrimary: true,
      },
    ],
    sellingPrice: 10490000,
    specifications: [
      { group: "General", name: "Socket", value: "LGA1700" },
      { group: "Performance", name: "Cores", value: "20" },
    ],
    fulfillmentMode: "stock",
    availabilityStatus: "in_stock",
    stockQuantity: 4,
    status: "published",
  };

  const schema = getProductStructuredData(mockProduct);
  assert.strictEqual(schema["@type"], "Product");
  assert.strictEqual(schema.name, mockProduct.name);
  assert.strictEqual(schema.sku, mockProduct.sku);
  assert.strictEqual(schema.offers.priceCurrency, "VND");
  assert.strictEqual(schema.offers.price, 10490000);
  assert.strictEqual(schema.offers.availability, "https://schema.org/InStock");
  assert(schema.offers.url.includes("/shop/intel-core-i7-14700k"));
  // Verify no fabricated fields
  assert.strictEqual((schema as Record<string, unknown>).aggregateRating, undefined);
  assert.strictEqual((schema as Record<string, unknown>).review, undefined);

  console.log("  ✓ 4. Schema.org Product structured data generates valid, truthful offers without fabricated ratings");
}

// 5. Storefront & Product Detail Metadata
{
  const storefrontMeta = buildStorefrontMetadata();
  assert(storefrontMeta.title?.toString().includes("OpenIdear Shop"));
  assert(
    typeof storefrontMeta.robots === "object" && storefrontMeta.robots?.index === true,
    "Storefront robots must allow indexing"
  );

  const mockProductDetail: PublicShopProduct = {
    _id: "prod_rtx4080",
    name: "ASUS TUF Gaming GeForce RTX 4080 Super",
    slug: "asus-tuf-rtx-4080-super",
    sku: "GPU-ASUS-4080S",
    category: {
      _id: "cat_gpu",
      name: "Graphics Cards",
      slug: "graphics-cards",
    },
    images: [
      {
        url: "https://res.cloudinary.com/demo/image/upload/sample_gpu.webp",
        isPrimary: true,
      },
    ],
    sellingPrice: 28990000,
    specifications: [],
    fulfillmentMode: "supplier_order",
    availabilityStatus: "available_on_order",
    stockQuantity: 0,
    status: "published",
  };

  const detailMeta = buildProductDetailMetadata(mockProductDetail);
  assert(detailMeta.title?.toString().includes("ASUS TUF Gaming GeForce RTX 4080 Super"));
  assert(detailMeta.alternates?.canonical?.toString().includes("/shop/asus-tuf-rtx-4080-super"));
  assert(
    typeof detailMeta.robots === "object" && detailMeta.robots?.index === true,
    "Product detail robots must allow indexing"
  );

  console.log("  ✓ 5. Dynamic canonical metadata generated for storefront and product detail");
}

console.log("\n==================================================================");
console.log("  ALL SPRINT S2 FRONTEND TESTS PASSED (5/5)");
console.log("==================================================================\n");
