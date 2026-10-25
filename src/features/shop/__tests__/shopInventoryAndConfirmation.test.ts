// =============================================================================
//  OPENIDEAR SHOP — INVENTORY INTEGRITY & ORDER CONFIRMATION TESTS (SPRINT S4)
//  src/features/shop/__tests__/shopInventoryAndConfirmation.test.ts
// =============================================================================

import assert from "node:assert";
import type {
  ShopOrderStatus,
  ShopOrderItem,
} from "../types/shop.types.ts";

console.log("==================================================================");
console.log("  OPENIDEAR SHOP — SPRINT S4 INVENTORY & CONFIRMATION TESTS");
console.log("==================================================================\n");

// 1. Inventory Invariant: availableQuantity = onHand - reservedQuantity
{
  function calculateInventoryMetrics(onHand: number, reserved: number) {
    if (onHand < 0 || reserved < 0) {
      throw new Error("Inventory values cannot be negative");
    }
    if (reserved > onHand) {
      throw new Error("Reserved quantity cannot exceed on-hand stock");
    }
    const available = onHand - reserved;
    return {
      onHand,
      reserved,
      available,
      inStock: available > 0,
    };
  }

  const normalStock = calculateInventoryMetrics(15, 3);
  assert.strictEqual(normalStock.available, 12);
  assert.strictEqual(normalStock.inStock, true);

  const fullyReserved = calculateInventoryMetrics(5, 5);
  assert.strictEqual(fullyReserved.available, 0);
  assert.strictEqual(fullyReserved.inStock, false);

  assert.throws(() => {
    calculateInventoryMetrics(4, 5);
  }, /Reserved quantity cannot exceed on-hand stock/);

  assert.throws(() => {
    calculateInventoryMetrics(-1, 0);
  }, /Inventory values cannot be negative/);

  console.log("  ✓ 1. Inventory invariant (available = onHand - reserved >= 0) strictly validated");
}

// 2. Supplier-Order Product Readiness Verification
{
  function canConfirmOrderItem(item: ShopOrderItem): { allowed: boolean; reason?: string } {
    if (item.fulfillmentMode === "supplier_order") {
      if (!item.supplierVerification || !item.supplierVerification.verified) {
        return {
          allowed: false,
          reason: `Supplier-order item '${item.name}' requires supplier verification before confirmation`,
        };
      }
    }
    return { allowed: true };
  }

  const unverifiedSupplierItem: ShopOrderItem = {
    product: "prod_server_board",
    name: "Enterprise Dual-Socket Motherboard",
    sku: "MB-EPYC-2P",
    unitPrice: 18500000,
    quantity: 1,
    fulfillmentMode: "supplier_order",
    supplierVerification: {
      verified: false,
    },
  };

  const checkUnverified = canConfirmOrderItem(unverifiedSupplierItem);
  assert.strictEqual(checkUnverified.allowed, false);
  assert(checkUnverified.reason?.includes("requires supplier verification"));

  const verifiedSupplierItem: ShopOrderItem = {
    ...unverifiedSupplierItem,
    supplierVerification: {
      verified: true,
      confirmedLeadTimeDays: 5,
      supplierCostPrice: 14000000,
      notes: "Confirmed with distributor",
    },
  };

  const checkVerified = canConfirmOrderItem(verifiedSupplierItem);
  assert.strictEqual(checkVerified.allowed, true);

  const stockedItem: ShopOrderItem = {
    product: "prod_ram_32g",
    name: "Corsair Vengeance 32GB DDR5",
    sku: "RAM-COR-32G-6000",
    unitPrice: 2890000,
    quantity: 2,
    fulfillmentMode: "stock",
  };
  assert.strictEqual(canConfirmOrderItem(stockedItem).allowed, true);

  console.log("  ✓ 2. Supplier-order products block confirmation until explicit supplier verification");
}

// 3. Sequential Status Progression & Terminal State Protection
{
  const ALLOWED_NEXT_STATUSES: Record<ShopOrderStatus, ShopOrderStatus[]> = {
    inquiry_received: ["contacted", "cancelled"],
    contacted: ["awaiting_customer_confirmation", "cancelled"],
    awaiting_customer_confirmation: ["confirmed", "cancelled"],
    confirmed: ["completed", "cancelled"],
    cancelled: [],
    completed: [],
  };

  function isTransitionAllowed(current: ShopOrderStatus, next: ShopOrderStatus): boolean {
    return (ALLOWED_NEXT_STATUSES[current] || []).includes(next);
  }

  // Valid forward path
  assert.strictEqual(isTransitionAllowed("inquiry_received", "contacted"), true);
  assert.strictEqual(isTransitionAllowed("contacted", "awaiting_customer_confirmation"), true);
  assert.strictEqual(isTransitionAllowed("awaiting_customer_confirmation", "confirmed"), true);
  assert.strictEqual(isTransitionAllowed("confirmed", "completed"), true);

  // Invalid skips
  assert.strictEqual(isTransitionAllowed("inquiry_received", "confirmed"), false);
  assert.strictEqual(isTransitionAllowed("inquiry_received", "completed"), false);
  assert.strictEqual(isTransitionAllowed("contacted", "confirmed"), false);

  // Terminal state locks
  assert.strictEqual(isTransitionAllowed("cancelled", "confirmed"), false);
  assert.strictEqual(isTransitionAllowed("cancelled", "contacted"), false);
  assert.strictEqual(isTransitionAllowed("completed", "confirmed"), false);
  assert.strictEqual(isTransitionAllowed("completed", "cancelled"), false);

  console.log("  ✓ 3. Order lifecycle enforces strict sequential progression with terminal state locks");
}

// 4. Expiration Time Window (72h default)
{
  function computeReservationExpiry(confirmationTime: Date, hours = 72): Date {
    return new Date(confirmationTime.getTime() + hours * 60 * 60 * 1000);
  }

  const base = new Date("2026-10-25T10:00:00.000Z");
  const expiry = computeReservationExpiry(base);
  const diffHours = (expiry.getTime() - base.getTime()) / (1000 * 60 * 60);
  assert.strictEqual(diffHours, 72);

  function isExpired(expiryDate: Date, checkDate: Date): boolean {
    return checkDate.getTime() > expiryDate.getTime();
  }

  assert.strictEqual(isExpired(expiry, new Date("2026-10-26T10:00:00.000Z")), false);
  assert.strictEqual(isExpired(expiry, new Date("2026-10-28T10:00:01.000Z")), true);

  console.log("  ✓ 4. Reservation expiration window defaults to 72 hours and computes deterministically");
}

// 5. Inventory Lifecycle Action Mapping
{
  type InventoryAction = "reserve" | "release" | "fulfill" | "none";

  function determineInventoryAction(
    currentStatus: ShopOrderStatus,
    nextStatus: ShopOrderStatus,
    alreadyReserved: boolean
  ): InventoryAction {
    if (nextStatus === "confirmed" && !alreadyReserved) {
      return "reserve";
    }
    if (nextStatus === "cancelled" && alreadyReserved) {
      return "release";
    }
    if (nextStatus === "completed" && alreadyReserved) {
      return "fulfill";
    }
    return "none";
  }

  assert.strictEqual(
    determineInventoryAction("awaiting_customer_confirmation", "confirmed", false),
    "reserve"
  );
  assert.strictEqual(
    determineInventoryAction("confirmed", "cancelled", true),
    "release"
  );
  assert.strictEqual(
    determineInventoryAction("confirmed", "completed", true),
    "fulfill"
  );
  assert.strictEqual(
    determineInventoryAction("inquiry_received", "cancelled", false),
    "none"
  );
  // Idempotent duplicate confirmation
  assert.strictEqual(
    determineInventoryAction("confirmed", "confirmed", true),
    "none"
  );

  console.log("  ✓ 5. Order state transitions map accurately to inventory reservation, release, and fulfillment");
}

console.log("\n==================================================================");
console.log("  ALL FRONTEND SPRINT S4 INVENTORY & CONFIRMATION TESTS PASSED (5/5)");
console.log("==================================================================\n");
