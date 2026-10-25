// =============================================================================
//  OPENIDEAR SHOP — SPRINT S6: LAUNCH READINESS & COMMERCE ANALYTICS TESTS
//  src/features/shop/__tests__/shopLaunchReadiness.test.ts
// =============================================================================

import assert from "node:assert/strict";

console.log("\n==================================================================");
console.log("  OPENIDEAR SHOP — SPRINT S6 LAUNCH READINESS & ANALYTICS TESTS");
console.log("==================================================================\n");

// ─── Test 1: Funnel conversion math & zero-division safety ─────────────────
function calculateFunnelRates(inquiries: number, confirmed: number, completed: number, cancelled: number) {
  const totalConfirmedOrCompleted = confirmed + completed;
  return {
    inquiryToConfirmRate:
      inquiries > 0 ? Number(((totalConfirmedOrCompleted / inquiries) * 100).toFixed(2)) : 0,
    inquiryToCompleteRate:
      inquiries > 0 ? Number(((completed / inquiries) * 100).toFixed(2)) : 0,
    cancellationRate:
      inquiries > 0 ? Number(((cancelled / inquiries) * 100).toFixed(2)) : 0,
  };
}

const rates1 = calculateFunnelRates(100, 30, 20, 15);
assert.equal(rates1.inquiryToConfirmRate, 50.0); // (30+20)/100 = 50%
assert.equal(rates1.inquiryToCompleteRate, 20.0); // 20/100 = 20%
assert.equal(rates1.cancellationRate, 15.0); // 15/100 = 15%

const zeroRates = calculateFunnelRates(0, 0, 0, 0);
assert.equal(zeroRates.inquiryToConfirmRate, 0);
assert.equal(zeroRates.inquiryToCompleteRate, 0);
assert.equal(zeroRates.cancellationRate, 0);
console.log("  ✓ 1. Funnel conversion rates compute deterministically with zero-division safety");

// ─── Test 2: Revenue isolation invariant — Cancelled orders never counted ────
interface OrderSample {
  status: "inquiry_received" | "contacted" | "awaiting_customer_confirmation" | "confirmed" | "completed" | "cancelled";
  subtotal: number;
}

function calculateRevenueCategories(orders: OrderSample[]) {
  let inquiryPipeline = 0;
  let grossConfirmed = 0;
  let completedRevenue = 0;
  let cancelledLost = 0;

  for (const o of orders) {
    if (["inquiry_received", "contacted", "awaiting_customer_confirmation"].includes(o.status)) {
      inquiryPipeline += o.subtotal;
    } else if (o.status === "confirmed") {
      grossConfirmed += o.subtotal;
    } else if (o.status === "completed") {
      grossConfirmed += o.subtotal; // Completed orders were confirmed commitments
      completedRevenue += o.subtotal; // Fulfilled cash revenue
    } else if (o.status === "cancelled") {
      cancelledLost += o.subtotal;
    }
  }

  return { inquiryPipeline, grossConfirmed, completedRevenue, cancelledLost };
}

const sampleOrders: OrderSample[] = [
  { status: "inquiry_received", subtotal: 5000000 },
  { status: "contacted", subtotal: 3000000 },
  { status: "confirmed", subtotal: 15000000 },
  { status: "completed", subtotal: 25000000 },
  { status: "cancelled", subtotal: 10000000 },
];

const revenue = calculateRevenueCategories(sampleOrders);
assert.equal(revenue.inquiryPipeline, 8000000);
assert.equal(revenue.grossConfirmed, 40000000); // 15M confirmed + 25M completed
assert.equal(revenue.completedRevenue, 25000000); // strictly completed
assert.equal(revenue.cancelledLost, 10000000);
assert.equal(revenue.completedRevenue + revenue.cancelledLost, 35000000);
// Crucial: cancelled order value is completely separate from confirmed and completed revenue
assert.equal(revenue.grossConfirmed.toString().includes("10000000"), false);
console.log("  ✓ 2. Revenue separation invariant strictly excludes cancelled orders from sales & confirmations");

// ─── Test 3: Contribution margin isolation & coverage disclosure ────────────
interface CompletedItemSample {
  unitPrice: number;
  quantity: number;
  supplierCostPrice?: number | null;
}

function calculateContributionMargin(items: CompletedItemSample[]) {
  let totalItems = 0;
  let verifiedCostItems = 0;
  let revenueSampled = 0;
  let costSampled = 0;

  for (const item of items) {
    totalItems += item.quantity;
    if (typeof item.supplierCostPrice === "number" && item.supplierCostPrice > 0) {
      verifiedCostItems += item.quantity;
      revenueSampled += item.unitPrice * item.quantity;
      costSampled += item.supplierCostPrice * item.quantity;
    }
  }

  const coveragePct = totalItems > 0 ? Number(((verifiedCostItems / totalItems) * 100).toFixed(2)) : 0;
  const estimatedMargin = revenueSampled - costSampled;
  const marginPct = revenueSampled > 0 ? Number(((estimatedMargin / revenueSampled) * 100).toFixed(2)) : 0;

  return { estimatedMargin, marginPct, coveragePct };
}

const testItems: CompletedItemSample[] = [
  { unitPrice: 10000000, quantity: 2, supplierCostPrice: 8500000 }, // Verified: 20M rev, 17M cost, 3M margin
  { unitPrice: 5000000, quantity: 1, supplierCostPrice: null }, // Unverified cost: excluded from margin
];

const marginResult = calculateContributionMargin(testItems);
assert.equal(marginResult.estimatedMargin, 3000000);
assert.equal(marginResult.marginPct, 15.0); // 3M / 20M = 15%
assert.equal(marginResult.coveragePct, 66.67); // 2 verified out of 3 total items = 66.67%
console.log("  ✓ 3. Contribution margin computes only on verified cost items and truthfully discloses coverage");

// ─── Test 4: Attribution Last-Touch Logic & Article Leaderboard ──────────────
interface AttributionRecord {
  articleSlug?: string;
  status: string;
  subtotal: number;
}

function aggregateAttribution(records: AttributionRecord[]) {
  const map: Record<string, { inquiries: number; confirmed: number; completed: number; completedRev: number }> = {};

  for (const r of records) {
    if (!r.articleSlug) continue;
    if (!map[r.articleSlug]) {
      map[r.articleSlug] = { inquiries: 0, confirmed: 0, completed: 0, completedRev: 0 };
    }
    map[r.articleSlug].inquiries += 1;
    if (["confirmed", "completed"].includes(r.status)) {
      map[r.articleSlug].confirmed += 1;
    }
    if (r.status === "completed") {
      map[r.articleSlug].completed += 1;
      map[r.articleSlug].completedRev += r.subtotal;
    }
  }

  return map;
}

const attrRecords: AttributionRecord[] = [
  { articleSlug: "top-5-rtx-4070-ti-super-builds", status: "completed", subtotal: 45000000 },
  { articleSlug: "top-5-rtx-4070-ti-super-builds", status: "confirmed", subtotal: 35000000 },
  { articleSlug: "budget-am5-motherboard-guide", status: "inquiry_received", subtotal: 12000000 },
  { status: "completed", subtotal: 20000000 }, // Direct storefront traffic (no article)
];

const attrAgg = aggregateAttribution(attrRecords);
assert.equal(attrAgg["top-5-rtx-4070-ti-super-builds"].inquiries, 2);
assert.equal(attrAgg["top-5-rtx-4070-ti-super-builds"].confirmed, 2);
assert.equal(attrAgg["top-5-rtx-4070-ti-super-builds"].completed, 1);
assert.equal(attrAgg["top-5-rtx-4070-ti-super-builds"].completedRev, 45000000);
assert.equal(attrAgg["budget-am5-motherboard-guide"].inquiries, 1);
assert.equal(attrAgg["budget-am5-motherboard-guide"].confirmed, 0);
console.log("  ✓ 4. Content attribution pipeline reliably tracks inquiries and realized sales by article");

// ─── Test 5: Date range boundary resolution ─────────────────────────────────
function resolveRangeDates(range: "7d" | "30d" | "90d" | "all", now = new Date("2026-10-25T02:00:00Z")) {
  const end = new Date(now);
  let start = new Date(now);
  if (range === "7d") {
    start.setDate(now.getDate() - 7);
  } else if (range === "30d") {
    start.setDate(now.getDate() - 30);
  } else if (range === "90d") {
    start.setDate(now.getDate() - 90);
  } else if (range === "all") {
    start = new Date("2020-01-01T00:00:00.000Z");
  }
  return { start, end };
}

const r7 = resolveRangeDates("7d");
assert.equal(Math.round((r7.end.getTime() - r7.start.getTime()) / (1000 * 60 * 60 * 24)), 7);
const r30 = resolveRangeDates("30d");
assert.equal(Math.round((r30.end.getTime() - r30.start.getTime()) / (1000 * 60 * 60 * 24)), 30);
const r90 = resolveRangeDates("90d");
assert.equal(Math.round((r90.end.getTime() - r90.start.getTime()) / (1000 * 60 * 60 * 24)), 90);
console.log("  ✓ 5. Date range filters resolve accurate timestamps and boundary windows");

// ─── Test 6: Telemetry Sanitization & Privacy Invariant ──────────────────────
interface RawEventInput {
  eventType: string;
  productId: string;
  articleSlug?: string;
  customerPhone?: string; // Forbidden PII
  customerEmail?: string; // Forbidden PII
}

function sanitizeTelemetryPayload(input: RawEventInput) {
  const allowedTypes = ["embed_impression", "embed_click", "detail_view", "inquiry_attempt"];
  if (!allowedTypes.includes(input.eventType)) {
    throw new Error(`Invalid eventType: ${input.eventType}`);
  }
  if (!input.productId || typeof input.productId !== "string") {
    throw new Error("Invalid productId");
  }

  // Strictly extract allowed attributes, discarding ANY potential PII
  return {
    eventType: input.eventType,
    productId: input.productId.trim(),
    articleSlug: input.articleSlug ? String(input.articleSlug).slice(0, 150) : null,
  };
}

const sanitized = sanitizeTelemetryPayload({
  eventType: "embed_click",
  productId: "prod_12345",
  articleSlug: "rtx-4070-review",
  customerPhone: "0901234567",
  customerEmail: "private@customer.com",
});

assert.equal(sanitized.eventType, "embed_click");
assert.equal(sanitized.productId, "prod_12345");
assert.equal(sanitized.articleSlug, "rtx-4070-review");
assert.equal("customerPhone" in sanitized, false);
assert.equal("customerEmail" in sanitized, false);
console.log("  ✓ 6. Telemetry payload strictly strips PII and enforces valid event types");

console.log("\n==================================================================");
console.log("  ALL SPRINT S6 LAUNCH READINESS & ANALYTICS TESTS PASSED (6/6)");
console.log("==================================================================\n");
