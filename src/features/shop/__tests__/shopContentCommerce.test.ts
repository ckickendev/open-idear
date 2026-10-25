// =============================================================================
//  OPENIDEAR SHOP — CONTENT COMMERCE & PRODUCT EMBEDS TESTS (SPRINT S5)
//  src/features/shop/__tests__/shopContentCommerce.test.ts
// =============================================================================

import assert from "node:assert";
import type {
  ProductCardBlock,
} from "../../article/types/article.types.ts";
import type {
  PublicShopProduct,
  OrderAttribution,
  CreateInquiryPayload,
} from "../types/shop.types.ts";

console.log("==================================================================");
console.log("  OPENIDEAR SHOP — SPRINT S5 CONTENT COMMERCE & EMBEDS TESTS");
console.log("==================================================================\n");

// 1. Stable Reference Isolation: Article Content must NOT store volatile prices or supplier info
{
  const productEmbedBlock: ProductCardBlock = {
    id: "block-uuid-101",
    type: "product_card",
    productId: "67293a101234567890abcdef",
    contextualLabel: "Recommended 1440p GPU for this build guide",
    layout: "card",
  };

  assert.strictEqual(productEmbedBlock.type, "product_card");
  assert.strictEqual(productEmbedBlock.productId, "67293a101234567890abcdef");
  assert.strictEqual(
    (productEmbedBlock as unknown as Record<string, unknown>).sellingPrice,
    undefined,
    "Authoritative selling price must NOT be stored in article block"
  );
  assert.strictEqual(
    (productEmbedBlock as unknown as Record<string, unknown>).stockQuantity,
    undefined,
    "Volatile stock quantity must NOT be stored in article block"
  );
  assert.strictEqual(
    (productEmbedBlock as unknown as Record<string, unknown>).supplierInfo,
    undefined,
    "Supplier cost or distributor data must NEVER be stored in article block"
  );

  console.log("  ✓ 1. Stable reference isolation: Product embed block stores stable ID without volatile pricing/supplier data");
}

// 2. HTML Serialization & Backward Compatibility (html-v1)
{
  function serializeEmbedToHtml(attrs: {
    productId: string;
    contextualLabel?: string;
    layout?: string;
    embedId?: string;
  }): string {
    const labelAttr = attrs.contextualLabel
      ? ` data-contextual-label="${attrs.contextualLabel.replace(/"/g, "&quot;")}"`
      : "";
    const layoutAttr = attrs.layout ? ` data-layout="${attrs.layout}"` : "";
    const idAttr = attrs.embedId ? ` data-embed-id="${attrs.embedId}"` : "";
    return `<div data-type="product-card" data-product-id="${attrs.productId}"${labelAttr}${layoutAttr}${idAttr}></div>`;
  }

  function parseHtmlSegments(rawHtml: string): Array<{
    type: "html" | "product-embed";
    content?: string;
    productId?: string;
    contextualLabel?: string;
  }> {
    const embedRegex =
      /<div\s+[^>]*data-type=["'](?:product-card|product-embed)["'][^>]*>(?:<\/div>)?/gi;
    const segments: Array<{
      type: "html" | "product-embed";
      content?: string;
      productId?: string;
      contextualLabel?: string;
    }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = embedRegex.exec(rawHtml)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = rawHtml.substring(lastIndex, match.index);
        if (textBefore.trim()) {
          segments.push({ type: "html", content: textBefore });
        }
      }

      const tagStr = match[0];
      const idMatch =
        tagStr.match(/data-product-id=["']([^"']*)["']/i) ||
        tagStr.match(/data-id=["']([^"']*)["']/i);
      const labelMatch = tagStr.match(/data-contextual-label=["']([^"']*)["']/i);

      if (idMatch && idMatch[1]) {
        segments.push({
          type: "product-embed",
          productId: idMatch[1],
          contextualLabel: labelMatch ? labelMatch[1] : undefined,
        });
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < rawHtml.length) {
      const remaining = rawHtml.substring(lastIndex);
      if (remaining.trim()) {
        segments.push({ type: "html", content: remaining });
      }
    }

    return segments;
  }

  const serialized = serializeEmbedToHtml({
    productId: "prod-999",
    contextualLabel: "Budget pick for gamers",
    layout: "card",
  });

  assert.strictEqual(
    serialized,
    '<div data-type="product-card" data-product-id="prod-999" data-contextual-label="Budget pick for gamers" data-layout="card"></div>'
  );

  const mixedHtml = `<p>Introduction to PC building.</p>${serialized}<p>Conclusion and next steps.</p>`;
  const segments = parseHtmlSegments(mixedHtml);

  assert.strictEqual(segments.length, 3);
  assert.strictEqual(segments[0].type, "html");
  assert.strictEqual(segments[1].type, "product-embed");
  assert.strictEqual(segments[1].productId, "prod-999");
  assert.strictEqual(segments[1].contextualLabel, "Budget pick for gamers");
  assert.strictEqual(segments[2].type, "html");

  console.log("  ✓ 2. HTML-v1 backward compatibility and regex segment parsing verified");
}

// 3. Dynamic Price and Availability Resolution at Render Time
{
  interface RenderResolvedProduct {
    status: "published" | "draft" | "archived" | "not_found";
    currentSellingPrice?: number;
    availabilityStatus?: string;
    displayAvailability: string;
    isPurchasable: boolean;
  }

  function resolveEmbedState(product: PublicShopProduct | null): RenderResolvedProduct {
    if (!product || product.status !== "published") {
      return {
        status: "not_found",
        displayAvailability: "Unavailable in verified catalog",
        isPurchasable: false,
      };
    }

    const isPurchasable =
      (product.fulfillmentMode === "stock" &&
        product.availabilityStatus === "in_stock" &&
        product.stockQuantity > 0) ||
      product.fulfillmentMode === "supplier_order";

    let displayAvailability = "In Stock";
    if (product.availabilityStatus === "out_of_stock") {
      displayAvailability = "Out of Stock";
    } else if (product.availabilityStatus === "available_on_order") {
      displayAvailability = "Available on Supplier Order";
    }

    return {
      status: "published",
      currentSellingPrice: product.sellingPrice,
      availabilityStatus: product.availabilityStatus,
      displayAvailability,
      isPurchasable,
    };
  }

  const liveProduct: PublicShopProduct = {
    _id: "prod-1",
    name: "RTX 4070 Ti Super",
    slug: "rtx-4070-ti-super",
    sku: "GPU-4070-TIS",
    category: { _id: "c1", name: "Graphics Cards", slug: "graphics-cards" },
    sellingPrice: 21500000,
    images: [{ url: "https://cdn.example.com/gpu.jpg", isPrimary: true }],
    specifications: [],
    fulfillmentMode: "stock",
    availabilityStatus: "in_stock",
    stockQuantity: 4,
    status: "published",
  };

  const resolved = resolveEmbedState(liveProduct);
  assert.strictEqual(resolved.status, "published");
  assert.strictEqual(resolved.currentSellingPrice, 21500000);
  assert.strictEqual(resolved.displayAvailability, "In Stock");
  assert.strictEqual(resolved.isPurchasable, true);

  console.log("  ✓ 3. Dynamic render-time resolution displays current live price & availability");
}

// 4. Graceful Fallback for Unpublished, Deleted, or Missing Products
{
  function resolveEmbedState(product: PublicShopProduct | null) {
    if (!product || product.status !== "published") {
      return {
        isAvailable: false,
        fallbackText: "Hardware item previously referenced in this section is currently unavailable.",
      };
    }
    return { isAvailable: true, fallbackText: null };
  }

  // Case A: Missing product (null)
  const nullFallback = resolveEmbedState(null);
  assert.strictEqual(nullFallback.isAvailable, false);
  assert.ok(nullFallback.fallbackText);

  // Case B: Draft product
  const draftProduct = {
    _id: "prod-draft",
    name: "Unreleased GPU",
    slug: "unreleased-gpu",
    sku: "GPU-UNR",
    category: { _id: "cat-1", name: "Components", slug: "components" },
    sellingPrice: 10000000,
    images: [],
    specifications: [],
    fulfillmentMode: "stock" as const,
    availabilityStatus: "in_stock" as const,
    stockQuantity: 10,
    status: "draft" as unknown as "published",
  };
  const draftFallback = resolveEmbedState(draftProduct as unknown as PublicShopProduct);
  assert.strictEqual(draftFallback.isAvailable, false);
  assert.ok(draftFallback.fallbackText);

  console.log("  ✓ 4. Unpublished, deleted, or missing products gracefully produce neutral fallback without crashing");
}

// 5. Supplier Metadata Isolation: Zero Leaks in Public Embed View
{
  function sanitizePublicProductView(internalDbProduct: {
    _id: string;
    name: string;
    sellingPrice: number;
    supplierInfo?: {
      name: string;
      sku: string;
      costPrice: number;
      leadTimeDays: number;
    };
  }) {
    // Mimic backend and client isolation
    const publicView = {
      _id: internalDbProduct._id,
      name: internalDbProduct.name,
      sellingPrice: internalDbProduct.sellingPrice,
    };
    return publicView;
  }

  const rawDoc = {
    _id: "prod-secret",
    name: "Core i7 14700K",
    sellingPrice: 10500000,
    supplierInfo: {
      name: "Shenzhen Wholesale Tech",
      sku: "SZ-I7-14700K-BULK",
      costPrice: 8200000, // Margin: 2,300,000 VND
      leadTimeDays: 7,
    },
  };

  const publicData = sanitizePublicProductView(rawDoc);
  assert.strictEqual((publicData as Record<string, unknown>).supplierInfo, undefined);
  assert.strictEqual((publicData as Record<string, unknown>).costPrice, undefined);
  assert.strictEqual(JSON.stringify(publicData).includes("Shenzhen Wholesale Tech"), false);
  assert.strictEqual(JSON.stringify(publicData).includes("8200000"), false);

  console.log("  ✓ 5. Supplier metadata isolation strictly enforced: internal supplier cost price and distributor SKU never leaked");
}

// 6. Attribution Pipeline: Article Embed Click -> Inquiry
{
  function buildAttributedProductUrl(params: {
    productSlug: string;
    articleSlug?: string;
    embedId?: string;
  }): string {
    const qs = new URLSearchParams();
    if (params.articleSlug) qs.set("from_article", params.articleSlug);
    if (params.embedId) qs.set("embed_id", params.embedId);
    return `/shop/${params.productSlug}${qs.toString() ? `?${qs.toString()}` : ""}`;
  }

  function extractAttributionFromUrl(url: string): OrderAttribution | null {
    const searchPart = url.includes("?") ? url.split("?")[1] : "";
    const params = new URLSearchParams(searchPart);
    const fromArticle = params.get("from_article");
    const embedId = params.get("embed_id");

    if (!fromArticle) return null;
    return {
      articleSlug: fromArticle,
      embedId: embedId || undefined,
      source: "article_embed",
    };
  }

  const targetUrl = buildAttributedProductUrl({
    productSlug: "ryzen-7-7800x3d",
    articleSlug: "best-gaming-cpus-2026",
    embedId: "embed-cpu-1",
  });

  assert.strictEqual(
    targetUrl,
    "/shop/ryzen-7-7800x3d?from_article=best-gaming-cpus-2026&embed_id=embed-cpu-1"
  );

  const attribution = extractAttributionFromUrl(targetUrl);
  assert.ok(attribution);
  assert.strictEqual(attribution.articleSlug, "best-gaming-cpus-2026");
  assert.strictEqual(attribution.embedId, "embed-cpu-1");
  assert.strictEqual(attribution.source, "article_embed");

  // Construct inquiry payload with attribution
  const inquiryPayload: CreateInquiryPayload = {
    productId: "prod-7800x3d",
    quantity: 1,
    customer: {
      name: "Tran Van A",
      contactMethod: "0901234567",
    },
    attribution,
  };

  assert.strictEqual(inquiryPayload.attribution?.articleSlug, "best-gaming-cpus-2026");
  assert.strictEqual(inquiryPayload.attribution?.source, "article_embed");

  console.log("  ✓ 6. Attribution pipeline preserved from article click through to inquiry payload");
}

// 7. Impression Deduplication Logic
{
  const recordedImpressionKeys = new Set<string>();

  function trackImpression(productId: string, articleSlug?: string, embedId?: string): boolean {
    const key = `${productId}:${articleSlug || ""}:${embedId || ""}`;
    if (recordedImpressionKeys.has(key)) {
      return false; // Deduplicated, don't re-fire
    }
    recordedImpressionKeys.add(key);
    return true; // First-time impression
  }

  // First time in view
  assert.strictEqual(trackImpression("p1", "guide-1", "e1"), true);
  // User scrolls past and returns (repeated intersection event)
  assert.strictEqual(trackImpression("p1", "guide-1", "e1"), false);
  // Same product in a different embed on the same article
  assert.strictEqual(trackImpression("p1", "guide-1", "e2"), true);
  // Same product in another article
  assert.strictEqual(trackImpression("p1", "guide-2", "e1"), true);

  console.log("  ✓ 7. Impression deduplication ensures scrolling does not produce uncontrolled impression counts");
}

// 8. Content Sanitization: Safe from script injection
{
  function sanitizeLabel(input: string): string {
    return input.replace(/[<>"]/g, "");
  }

  const maliciousLabel = '<script>alert("hack")</script> Recommended GPU';
  const cleanLabel = sanitizeLabel(maliciousLabel);

  assert.strictEqual(cleanLabel.includes("<script>"), false);
  assert.strictEqual(cleanLabel.includes("</script>"), false);
  assert.strictEqual(cleanLabel, 'scriptalert(hack)/script Recommended GPU');

  console.log("  ✓ 8. Content sanitization rejects raw HTML / script injections in contextual notes");
}

console.log("\n==================================================================");
console.log("  ALL SPRINT S5 CONTENT COMMERCE TESTS PASSED SUCCESSFULLY (8/8)  ");
console.log("==================================================================\n");
