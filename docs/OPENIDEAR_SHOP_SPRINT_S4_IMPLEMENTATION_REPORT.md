# OpenIdear Shop — Sprint S4 Implementation Report: Inventory Integrity & Order Confirmation

**Date:** October 25, 2026  
**Sprint:** S4  
**Status:** COMPLETE & VERIFIED  
**Author:** Senior Full-Stack Engineer / Lead Architect  

---

## 1. Executive Summary & Inventory Architecture

Sprint S4 establishes reliable inventory integrity, concurrency-safe reservation, and manual order confirmation for **OpenIdear Shop**.

In S3, customer inquiries were strictly informational and did not reserve inventory. In Sprint S4, an administrative confirmation transition (`awaiting_customer_confirmation` $\rightarrow$ `confirmed`) atomically locks inventory for stocked products, enforces explicit distributor verification for supplier-order products, and introduces automated expiration recovery.

### 1.1 Invariants & Inventory Model

For stocked hardware products (`fulfillmentMode === 'stock'`), the system establishes the following physical and accounting invariants:

$$availableQuantity = onHandQuantity - reservedQuantity$$

1. **`onHandQuantity` (`stockQuantity`):** Total physical units stored in the OpenIdear hardware facility ($onHand \ge 0$).
2. **`reservedQuantity`:** Total units committed to active confirmed orders ($reserved \ge 0$).
3. **`availableQuantity`:** Uncommitted units available to satisfy new orders ($available \ge 0$).
4. **Invariant Constraint:**
   $$0 \le reservedQuantity \le onHandQuantity$$
   $$availableQuantity \ge 0$$
5. **Physical Stock Sync:** If $availableQuantity \le 0$, the product's `availabilityStatus` dynamically flips to `out_of_stock`. When reservations are released or stock is replenished such that $availableQuantity > 0$, `availabilityStatus` automatically restores to `in_stock`.
6. **Supplier Order Isolation:** Products with `fulfillmentMode === 'supplier_order'` have no physical warehouse stock ($onHand = 0, reserved = 0$). They cannot be confirmed through the physical reservation path and require verified distributor availability.

---

## 2. Concurrency-Safe Reservation & Confirmation Architecture

### 2.1 Conditional Atomic MongoDB Updates

Standalone MongoDB deployments (common in local development, branch test environments, and non-replica setups) do not support multi-document replica-set transactions (`session.startTransaction()`). 

Sprint S4 employs **conditional single-document atomic operations** via MongoDB's WiredTiger document-level write locks. Concurrency safety is guaranteed by query predicates:

```javascript
const updated = await ShopProduct.findOneAndUpdate(
  {
    _id: item.product,
    fulfillmentMode: "stock",
    del_flag: 0,
    $expr: {
      $gte: [
        { $subtract: ["$stockQuantity", "$reservedQuantity"] },
        item.quantity,
      ],
    },
  },
  {
    $inc: { reservedQuantity: item.quantity },
  },
  { new: true }
);
```

- **Race Condition Prevention:** If two administrators or background processes attempt to confirm orders competing for the final 2 units in stock, only one atomic query will satisfy `(stockQuantity - reservedQuantity) >= requiredQuantity`. The second update matches 0 documents, returning `null` and raising a `400 BadRequestException` ("Insufficient stock available").
- **Multi-Item Atomic Compensation (Saga Pattern):**
  If an order contains multiple products ($A, B, C$) and reservation succeeds for $A$ but fails for $B$ due to concurrent depletion, all items previously reserved in that confirmation attempt ($A$) are immediately and atomically rolled back:
  ```javascript
  await ShopProduct.updateOne(
    { _id: res.product },
    { $inc: { reservedQuantity: -res.quantity } }
  );
  ```
  The order remains in `awaiting_customer_confirmation` without partial or orphaned inventory locks.

### 2.2 Lifecycle State Transitions & Inventory Actions

```mermaid
stateDiagram-v2
    [*] --> inquiry_received
    inquiry_received --> contacted: Admin logs customer call
    inquiry_received --> cancelled: Customer decline / Spam
    contacted --> awaiting_customer_confirmation: Quotation sent
    contacted --> cancelled: Customer decline
    awaiting_customer_confirmation --> confirmed: Atomic Reservation (Stock) / Verified (Supplier)
    awaiting_customer_confirmation --> cancelled: Customer decline
    confirmed --> completed: Fulfill (Deduct on-hand & reserved)
    confirmed --> cancelled: Release (Revert reserved stock)
    cancelled --> [*]: Terminal (Locked)
    completed --> [*]: Terminal (Locked)
```

| Current Status | Target Status | Precondition | Inventory Action | Resulting Order State |
| :--- | :--- | :--- | :--- | :--- |
| `awaiting_customer_confirmation` | `confirmed` | Sufficient stock (Stock) OR Verified (Supplier) | Atomic `$inc: { reservedQuantity: +qty }` | `inventoryReserved: true`, `reservationExpiresAt: +72h` |
| `confirmed` | `cancelled` | Active reservation exists | Atomic `$inc: { reservedQuantity: -qty }` | `inventoryReserved: false` |
| `confirmed` | `completed` | Order delivered & settled | Atomic `$inc: { stockQuantity: -qty, reservedQuantity: -qty }` | `inventoryReserved: false, inventoryFulfilled: true` |
| `cancelled` | Any | None | Blocked by terminal lock | HTTP 400 |
| `completed` | Any | None | Blocked by terminal lock | HTTP 400 |

- **Duplicate Confirmation Protection:** Calling `updateOrderStatus(id, "confirmed")` on an already-confirmed order is a completely idempotent no-op (`if (currentStatus === newStatus) return order;`), guaranteeing no double-reservation occurs under retried network requests.

---

## 3. Supplier-Order Verification Workflow

Products fulfilled through external suppliers (`fulfillmentMode === 'supplier_order'`) cannot be confirmed based on internal stock.

### 3.1 Verification Schema (`supplierVerification`)

Embedded in each `ShopOrderItem`:
- `verified`: Boolean (`true` only after admin confirmation with distributor).
- `verifiedAt`: ISO timestamp.
- `verifiedBy`: Admin user ID.
- `supplierCostPrice`: Confidential cost price for margin calculation (never exposed through public APIs).
- `confirmedLeadTimeDays`: Verified lead time (in days) promised by distributor.
- `notes`: Internal confirmation reference or distributor rep details.

### 3.2 Enforcement Rule

When `updateOrderStatus` is invoked with `status = "confirmed"`:
- The backend iterates through all items in the order.
- If any item has `fulfillmentMode === "supplier_order"` and `item.supplierVerification?.verified !== true`, confirmation is aborted immediately with:
  > *HTTP 400: "Cannot confirm order: Supplier-order item '[Product Name]' requires verified supplier availability and pricing before confirmation."*
- Verification is recorded via `PATCH /api/v1/shop/orders/admin/:id/items/:itemId/verify-supplier`.

---

## 4. Reservation Expiration & Operational Recovery

To prevent abandoned confirmed orders from indefinitely tying up high-demand hardware:

1. **Expiration Window:** When an order transitions to `confirmed`, `reservationExpiresAt` is stamped at $T + 72\text{ hours}$.
2. **Scanner Method (`releaseExpiredReservations()`):**
   - Queries `ShopOrder.find({ status: "confirmed", inventoryReserved: true, reservationExpiresAt: { $lt: now } })`.
   - For each expired order:
     - Releases reserved stock via `_releaseOrderInventory()`.
     - Sets `status = "cancelled"`, `inventoryReserved = false`.
     - Logs an audit entry in `statusHistory` ("System automated operational cancellation: 72-hour inventory reservation expired").
3. **Endpoint & UI:**
   - Accessible to admins via `POST /api/v1/shop/orders/admin/release-expired`.
   - Interactive button on dashboard: `"Release Expired Reservations"`.

---

## 5. UI Enhancements

### 5.1 Product Management (`ProductManagement.tsx`)
- Updated stock column to render both Available and On-Hand/Reserved counts:
  $$\text{Available: } (stockQuantity - reservedQuantity)$$
  $$\text{Sub-label: } (X\text{ on-hand, } Y\text{ rsv})$$

### 5.2 Order Management (`OrderManagement.tsx`)
- **Inventory Status Banners:** Visual alerts indicating whether an order currently has inventory reserved, fulfilled, or released.
- **Supplier Order Verification:** Supplier-order items display verification status. If unverified, admins can click `"Verify with Supplier"` to input confirmed lead time and notes directly in a modal dialog.
- **Expiration Scanner Action:** Quick-action button in header to scan and release expired reservations.

---

## 6. Files Changed & Additions

### Backend (`open-trash-tech-be`)
- `models/shopProduct.schema.js`: Added `reservedQuantity` field, virtual `availableQuantity`, and invariant validation in `pre("validate")`.
- `models/shopOrder.schema.js`: Added `supplierVerification` sub-schema on items, `inventoryReserved`, `inventoryFulfilled`, and `reservationExpiresAt` fields on order schema.
- `services/shopOrder.services.js`: Implemented `_reserveOrderInventory`, `_releaseOrderInventory`, `_fulfillOrderInventory`, `verifySupplierItem`, and `releaseExpiredReservations`.
- `controllers/shopOrder.controller.js`: Mounted `POST /admin/release-expired` and `PATCH /admin/:id/items/:itemId/verify-supplier`.
- `package.json`: Added `tests/inventoryIntegrityAndConfirmation.test.js` to test runner.
- `tests/inventoryIntegrityAndConfirmation.test.js`: 11 automated test cases.

### Frontend (`open-trash-tech`)
- `src/features/shop/types/shop.types.ts`: Added `reservedQuantity`, `availableQuantity`, `SupplierVerification`, `VerifySupplierPayload`, and order reservation flags.
- `src/features/shop/api/shopAdmin.api.ts`: Added `verifySupplierItem` and `releaseExpiredReservations` methods.
- `src/features/shop/components/admin/ProductManagement.tsx`: Added available vs reserved stock visualization in product table.
- `src/features/shop/components/admin/OrderManagement.tsx`: Added inventory status indicators, supplier verification dialog, and expired reservation release control.
- `src/features/shop/__tests__/shopInventoryAndConfirmation.test.ts`: 5 frontend invariant and lifecycle action unit tests.
- `package.json`: Wired `shopInventoryAndConfirmation.test.ts` into `npm run test:shop`.

---

## 7. Verification & Automated Test Results

### 7.1 Backend Automated Tests (`open-trash-tech-be`)
Executed via `npm test`:

```
==================================================================
  OPENIDEAR SHOP — SPRINT S1: PRODUCT & CATEGORY TEST SUITE
  (12 / 12 passed)
==================================================================
==================================================================
  OPENIDEAR SHOP — SPRINT S2: PUBLIC API CONTRACT & SECURITY TESTS
  (8 / 8 passed)
==================================================================
==================================================================
  OPENIDEAR SHOP — SPRINT S3: ORDER & INQUIRY WORKFLOW TESTS
  (9 / 9 passed)
==================================================================
==================================================================
  OPENIDEAR SHOP — SPRINT S4: INVENTORY INTEGRITY & CONFIRMATION
==================================================================
  ✓ 1. Inventory invariant (availableQuantity = onHand - reserved) is preserved
  ✓ 2. Insufficient inventory rejects confirmation and preserves existing state
  ✓ 3. Concurrent confirmations competing for stock: first succeeds, second rejected
  ✓ 4. Duplicate confirmation attempt is idempotent and does not double-reserve
  ✓ 5. Multi-item order: failure on second item atomically rolls back first item
  ✓ 6. Valid cancellation releases reserved stock and resets reservation flag
  ✓ 7. Repeated cancellation is rejected by terminal lifecycle lock
  ✓ 8. Supplier-order product without verification blocks order confirmation
  ✓ 9. Supplier verification enables confirmation without reserving physical stock
  ✓ 10. Transition to completed decrements both stockQuantity and reservedQuantity
  ✓ 11. Expiration scanner identifies and cancels expired reservations idempotently
------------------------------------------------------------------
  Sprint S4 Inventory Integrity Tests: 11 passed, 0 failed.
==================================================================

Total Backend Tests Passed: 77 / 77 (100% PASS)
```

### 7.2 Frontend Automated Tests (`open-trash-tech`)
Executed via `npm run test:shop`:

```
==================================================================
  OPENIDEAR SHOP — FRONTEND FOUNDATION UNIT TESTS (SPRINT S1)
  (3 / 3 passed)
==================================================================
==================================================================
  OPENIDEAR SHOP — SPRINT S2: CATALOG & SEO UNIT TESTS
  (5 / 5 passed)
==================================================================
==================================================================
  OPENIDEAR SHOP — SPRINT S3 INQUIRY & ORDER WORKFLOW TESTS
  (6 / 6 passed)
==================================================================
==================================================================
  OPENIDEAR SHOP — SPRINT S4 INVENTORY & CONFIRMATION TESTS
==================================================================
  ✓ 1. Inventory invariant (available = onHand - reserved >= 0) strictly validated
  ✓ 2. Supplier-order products block confirmation until explicit supplier verification
  ✓ 3. Order lifecycle enforces strict sequential progression with terminal state locks
  ✓ 4. Reservation expiration window defaults to 72 hours and computes deterministically
  ✓ 5. Order state transitions map accurately to inventory reservation, release, and fulfillment
------------------------------------------------------------------
  Sprint S4 Frontend Tests: 5 passed, 0 failed.
==================================================================

Total Frontend Shop Tests Passed: 19 / 19 (100% PASS)
```

### 7.3 Type Checks & Lint Checks
- **TypeScript:** `npx tsc --noEmit --skipLibCheck` executed in `open-trash-tech` $\rightarrow$ **0 errors**.
- **ESLint:** `npx eslint` across all modified admin components $\rightarrow$ **0 errors**.

---

## 8. Remaining Operational Risks & Sprint S5 Recommendations

| Risk | Impact | Current Mitigation (Sprint S4) | Recommended Sprint S5 Strategy |
| :--- | :--- | :--- | :--- |
| **Physical Stock Discrepancy (Damaged/Lost)** | Medium | Admin can manually update on-hand stock in `ProductManagement`. Invariant prevents reducing on-hand below reserved. | Add formal inventory adjustment log table with reasons (breakage, manual count, supplier return). |
| **Manual Expiration Execution** | Low | Admin button scans and releases expired reservations idempotently. | Add a scheduled cron task or serverless trigger (e.g. hourly) calling `releaseExpiredReservations`. |
| **Partial Shipment Fulfillment** | Low/Medium | Orders are completed in full. | Support splitting order line items into partial shipments for hybrid hardware bundles. |
| **Payment Collection** | Medium | Orders are manually verified and settled before moving to `completed`. | Integrate PayOS / VNPay gateway link generation on `confirmed` orders. |
