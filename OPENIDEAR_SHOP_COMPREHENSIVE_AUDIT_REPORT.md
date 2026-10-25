# OpenIdear Shop — Comprehensive Technical Code Audit Report
**Repository:** Frontend (`open-trash-tech`)  
**Cross-Reference Backend:** [`open-trash-tech-be`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/OPENIDEAR_SHOP_COMPREHENSIVE_AUDIT_REPORT.md)  
**Audit Date:** October 25, 2026  
**Auditor:** Senior / Staff Independent Software Architect  
**Audit Status:** Complete (Strict Read-Only Mode Maintained)  
**Pilot Recommendation:** **CONDITIONAL GO (P0 / P1 Remediation Required Prior to Traffic)**

---

## 1. Executive Summary

This independent technical audit evaluates the complete codebase of **OpenIdear Shop** across Sprints S1 through S6.1. The system consists of:
- A Next.js 15 App Router frontend ([`open-trash-tech`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech)) with Tailwind CSS, React 19, and TipTap block editor integration.
- An Express.js and MongoDB backend ([`open-trash-tech-be`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be)) supporting catalog CRUD, manual order inquiry workflows, inventory reservation, content embedding, and telemetry aggregation.

### Key Audit Highlights:
- **12 Canonical Findings** were identified across 8 audit dimensions (3 High, 6 Medium, 3 Low, 0 Critical).
- **The Core Architecture is Sound:** The manual inquiry workflow, server-side authoritative pricing, role-based admin middleware, and PII-shielded telemetry demonstrate clear domain boundaries and adhere to the initial lightweight ecommerce requirements.
- **Three Material Blockers Were Discovered:**
  1. [`AUDIT-ROUTE-01`](#audit-route-01): `ShopAnalyticsController` omitted its base route prefix, causing `GET /shop/analytics/overview` to return **404 Not Found** in the admin dashboard and inadvertently mounting `/overview` and `/event` on the root domain.
  2. [`AUDIT-CONC-01`](#audit-conc-01): Automated reservation expiration (`releaseExpiredReservations`) lacks an atomic check-and-set claim in MongoDB. Concurrent invocations can double-release reserved stock and deduct inventory from other active confirmed orders.
  3. [`AUDIT-SEC-01`](#audit-sec-01): Idempotency key lookup returns the previous order's formatted confirmation without verifying whether the requesting client or payload matches, leaking prior customer names, contact info, and delivery details upon key collision.
- **Testing Blindspots:** All 49 backend shop tests passed because existing suites test service methods against in-memory JavaScript mocks (`ShopProduct.findOne = ...`), completely bypassing Express router mounting, real MongoDB write locks, and multi-document transactions.

---

## 2. Audited Scope & Code Modules Inspected

### Frontend Modules Inspected:
- **Storefront & Catalog:**
  - [`src/app/(marketing)/shop/page.tsx`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/app/(marketing)/shop/page.tsx): SSR catalog entrypoint and query parameter binding.
  - [`src/app/(marketing)/shop/[slug]/page.tsx`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/app/(marketing)/shop/[slug]/page.tsx): Product detail page, JSON-LD Schema.org generation, breadcrumbs.
  - [`src/features/shop/components/catalog/StorefrontCatalog.tsx`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/shop/components/catalog/StorefrontCatalog.tsx): Client-side catalog container and URL state sync.
  - [`src/features/shop/components/catalog/FilterSidebar.tsx`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/shop/components/catalog/FilterSidebar.tsx) & [`ProductGrid.tsx`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/shop/components/catalog/ProductGrid.tsx): UI controls.
- **Customer Inquiry Flow:**
  - [`src/features/shop/components/detail/ProductInquiryCard.tsx`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/shop/components/detail/ProductInquiryCard.tsx): Inquiry submission form, quantity clamping, idempotency UUID generation.
- **Content Commerce & Embeds:**
  - [`src/features/shop/components/embed/ArticleProductEmbed.tsx`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/shop/components/embed/ArticleProductEmbed.tsx): Dynamic article embed renderer, IntersectionObserver impression tracking.
  - [`src/features/editor/components/ProductEmbedNodeView.tsx`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/editor/components/ProductEmbedNodeView.tsx): TipTap custom node view for authoring.
  - [`src/features/editor/extensions/productEmbed.ts`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/editor/extensions/productEmbed.ts): TipTap v3 extension definition.
- **Admin Management & Analytics:**
  - [`src/features/shop/components/admin/ProductManagement.tsx`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/shop/components/admin/ProductManagement.tsx): Catalog CRUD and inventory adjustment.
  - [`src/features/shop/components/admin/OrderManagement.tsx`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/shop/components/admin/OrderManagement.tsx): Order lifecycle transitions, supplier verification drawer.
  - [`src/features/shop/components/admin/CommerceAnalytics.tsx`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/shop/components/admin/CommerceAnalytics.tsx): Funnel metrics, financial breakdowns, content attribution.
- **API Clients & Type System:**
  - [`src/features/shop/api/shopPublic.api.ts`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/shop/api/shopPublic.api.ts) & [`shopAdmin.api.ts`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/shop/api/shopAdmin.api.ts)
  - [`src/features/shop/types/shop.types.ts`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/shop/types/shop.types.ts)

### Backend Modules Inspected:
- Controllers: `shopProduct.controller.js`, `shopOrder.controller.js`, `shopAnalytics.controller.js`, `shopCategory.controller.js`.
- Services: `shopProduct.services.js`, `shopOrder.services.js`, `shopAnalytics.services.js`, `shopCategory.services.js`.
- Models: `shopProduct.schema.js`, `shopOrder.schema.js`, `shopAnalyticsEvent.schema.js`, `shopCategory.schema.js`.
- Middlewares: `auth.middleware.js`, `shopRateLimit.middleware.js`, `appServer.js`.

---

## 3. Actual Architecture Map

```mermaid
flowchart TD
    subgraph Frontend [Next.js 15 Frontend - open-trash-tech]
        A["Storefront (/shop)"] --> B["Product Detail (/shop/:slug)"]
        B --> C["Inquiry Modal (ProductInquiryCard)"]
        D["Article Reader (ArticleRenderer)"] --> E["Product Embed (ArticleProductEmbed)"]
        E -->|Click Attribution: ?from_article=...| B
        F["Admin Dashboard (/dashboard/management)"] --> G["ProductManagement"]
        F --> H["OrderManagement"]
        F --> I["CommerceAnalytics"]
    end

    subgraph API [HTTP API Layer]
        C -->|POST /shop/orders/inquiries| J["shopOrder.controller.js"]
        E -->|POST /shop/products/analytics/event| K["shopProduct.controller.js"]
        G -->|CRUD /shop/products/*| K
        H -->|PATCH /shop/orders/admin/*| J
        I -.->|GET /shop/analytics/overview (404 BUG!)| L["shopAnalytics.controller.js"]
    end

    subgraph Backend [Node.js Express Services - open-trash-tech-be]
        K --> M["shopProduct.services.js"]
        J --> N["shopOrder.services.js"]
        L --> O["shopAnalytics.services.js"]
        M --> P[("MongoDB Atlas: shop_product")]
        N --> Q[("MongoDB Atlas: ShopOrder")]
        O --> R[("MongoDB Atlas: ShopAnalyticsEvent (90d TTL)")]
    end
```

### Architectural Observations:
1. **Separation of Concerns:** Business logic is concentrated in backend services (`shopOrder.services.js`, `shopProduct.services.js`), while frontend components maintain presentation and URL synchronization.
2. **Attribution Pipeline:** Attribution parameters (`articleSlug`, `embedId`) pass cleanly from article embeds through URL query parameters into the inquiry submission and database snapshots.
3. **Redundant Logic:** `formatVND` is reimplemented in multiple frontend components instead of using a unified utility.

---

## 4. Findings Matrix

| Finding ID | Severity | Category | File & Location | Summary | Confidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AUDIT-ROUTE-01** | **High** | API / Routing | `controllers/shopAnalytics.controller.js:63` | Controller routes mount at `/overview` and `/event` instead of `/shop/analytics/*`, causing 404 on admin dashboard. | Confirmed |
| **AUDIT-CONC-01** | **High** | Concurrency | `services/shopOrder.services.js:675-716` | `releaseExpiredReservations` lacks atomic claim; concurrent cron calls double-release stock. | Confirmed |
| **AUDIT-SEC-01** | **High** | Security / Privacy | `services/shopOrder.services.js:82-91` | Reused idempotency key returns prior customer PII without payload verification or conflict check. | Confirmed |
| **AUDIT-SEC-02** | **Medium** | Security | `services/shopProduct.services.js:520` | Unescaped user query in `new RegExp(query.search)` causes 500 errors and ReDoS risk. | Confirmed |
| **AUDIT-DATA-01** | **Medium** | Data Integrity | `models/shopProduct.schema.js:59,66` | Soft-deleted products permanently lock SKUs and slugs due to lack of partial unique indexes. | Confirmed |
| **AUDIT-PERF-01** | **Medium** | Performance | `StorefrontCatalog.tsx:105-109` | Redundant client-side fetch on initial page mount duplicates SSR data loading. | Confirmed |
| **AUDIT-PERF-02** | **Medium** | Performance | `ArticleProductEmbed.tsx:70` | N+1 individual HTTP requests fired for multiple product embeds in a single article. | Confirmed |
| **AUDIT-DATA-02** | **Medium** | Analytics | `models/shopAnalyticsEvent.schema.js:62` | 90-day TTL index on events causes funnel ratios to distort for queries older than 90 days. | Confirmed |
| **AUDIT-TEST-01** | **Medium** | Testing | `open-trash-tech-be/tests/*.test.js` | Test suites rely exclusively on in-memory query mocks, concealing routing and concurrency defects. | Confirmed |
| **AUDIT-SEC-03** | **Low** | Security | `controllers/shopOrder.controller.js:29` | Non-constant time string comparison on `x-cron-secret`. | Confirmed |
| **AUDIT-MAINT-01** | **Low** | Maintainability | `services/index.js:6` | Circular dependency warnings emitted during module resolution on startup. | Confirmed |
| **AUDIT-MAINT-02** | **Low** | Maintainability | `ProductManagement.tsx:34` | Re-declared `formatVND` instead of importing canonical utility from `formatters.ts`. | Confirmed |

---

## 5. Detailed Findings & Remediation

<a id="audit-route-01"></a>
### [AUDIT-ROUTE-01] High: `ShopAnalyticsController` Route Prefix Omission (404 on Dashboard & Root Namespace Pollution)
- **Repository & File:** `open-trash-tech-be` — [`controllers/shopAnalytics.controller.js:63-71`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/controllers/shopAnalytics.controller.js#L61-L71)
- **Code Evidence:**
  ```javascript
  class ShopAnalyticsController extends Controller {
    _rootPath = "/shop/analytics";
    ...
    initController = () => {
      // Missing this._rootPath!
      this._router.post("/event", analyticsEventRateLimiter, this.recordEvent);
      this._router.get("/overview", AdminMiddleware, this.getCommerceOverview);
    };
  }
  ```
- **Execution Path:** The frontend [`shopAdmin.api.ts:219`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/shop/api/shopAdmin.api.ts#L219) requests `GET /shop/analytics/overview`. Because `appServer.js` mounts `controller._router` at root `"/"`, Express registers `GET /overview` and `POST /event`.
- **Actual Impact:** When an admin visits `/dashboard/management` and selects **Shop Analytics**, the request fails with `HTTP 404 Not Found`. Furthermore, the application root namespace is polluted with generic `/overview` and `/event` endpoints.
- **Remediation:** Prefix route definitions with `${this._rootPath}`:
  ```javascript
  this._router.post(`${this._rootPath}/event`, analyticsEventRateLimiter, this.recordEvent);
  this._router.get(`${this._rootPath}/overview`, AdminMiddleware, this.getCommerceOverview);
  ```
- **Suggested Regression Test:** Add an HTTP integration test checking `GET /shop/analytics/overview` returns HTTP 200 for admins and HTTP 401/403 for unauthorized users.

---

<a id="audit-conc-01"></a>
### [AUDIT-CONC-01] High: Missing Atomic Claim in `releaseExpiredReservations` (Race Condition & Reserved Inventory Depletion)
- **Repository & File:** `open-trash-tech-be` — [`services/shopOrder.services.js:675-716`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/services/shopOrder.services.js#L675-L716)
- **Code Evidence:**
  ```javascript
  const expiredOrders = await ShopOrder.find({
    status: "confirmed",
    inventoryReserved: true,
    reservationExpiresAt: { $lt: now },
  });
  for (const order of expiredOrders) {
    if (order.status !== "confirmed" || !order.inventoryReserved) continue; // In-memory check only!
    await this._releaseOrderInventory(order);
    order.status = "cancelled";
    await order.save();
  }
  ```
- **Failure Scenario:** If an automated cron job and an admin manual trigger invoke `releaseExpiredReservations` at the same second:
  1. Both instances fetch the same expired order.
  2. Both evaluate `order.status !== "confirmed"` to false against in-memory state.
  3. Both execute `_releaseOrderInventory(order)`, issuing `$inc: { reservedQuantity: -qty }` twice.
  4. If other active orders for the same SKU exist, `reservedQuantity` is decremented below the actual reserved commitments, corrupting inventory accounting.
- **Remediation:** Atomically claim the order using a conditional update or transaction lock:
  ```javascript
  const claimedOrder = await ShopOrder.findOneAndUpdate(
    { _id: order._id, status: "confirmed", inventoryReserved: true },
    { $set: { status: "cancelled", inventoryReserved: false } },
    { new: false }
  );
  if (!claimedOrder) continue; // Already claimed by another worker
  await this._releaseOrderInventory(claimedOrder);
  ```

---

<a id="audit-sec-01"></a>
### [AUDIT-SEC-01] High: Idempotency Key Reuse Returns Prior Customer PII Without Payload Verification
- **Repository & File:** `open-trash-tech-be` — [`services/shopOrder.services.js:82-91`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/services/shopOrder.services.js#L82-L91)
- **Code Evidence:**
  ```javascript
  if (idempotencyKey && typeof idempotencyKey === "string") {
    const existing = await ShopOrder.findOne({
      idempotencyKey: idempotencyKey.trim(),
      del_flag: 0,
    }).lean();

    if (existing) {
      return this._formatCustomerConfirmation(existing);
    }
  }
  ```
- **Actual Impact:**
  1. **Data Leakage:** An attacker submitting a predictable or collided key receives the full `_formatCustomerConfirmation(existing)` containing the prior customer's full name, phone number, email, delivery area, and notes.
  2. **Protocol Violation:** If a client reuses an idempotency key with different items or quantities, the server returns the cached response instead of rejecting the mismatched payload with `409 Conflict`.
- **Remediation:** Store a SHA-256 hash of the canonical request payload along with the idempotency key:
  ```javascript
  if (existing.requestHash !== currentPayloadHash) {
    throw new ConflictException("Idempotency key already exists with a different request payload");
  }
  ```

---

<a id="audit-sec-02"></a>
### [AUDIT-SEC-02] Medium: Unescaped User Input in RegExp Constructors (ReDoS & 500 Error Disclosure)
- **Repository & File:** `open-trash-tech-be` — [`services/shopProduct.services.js:520`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/services/shopProduct.services.js#L520), [`shopOrder.services.js:271`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/services/shopOrder.services.js#L271)
- **Code Evidence:**
  ```javascript
  if (query.search && typeof query.search === "string" && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), "i");
    filter.$or = [{ name: searchRegex }, { summary: searchRegex }];
  }
  ```
- **Actual Impact:** Querying `GET /shop/products?search=(?a+)+$` throws an unhandled `SyntaxError: Invalid regular expression`, causing an HTTP 500 response. Passing complex nested quantifier patterns can block the Node.js event loop during regex execution in MongoDB.
- **Remediation:** Escape special regex characters:
  ```javascript
  const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const searchRegex = new RegExp(escaped, "i");
  ```

---

<a id="audit-data-01"></a>
### [AUDIT-DATA-01] Medium: Soft-Deleted Products Permanently Lock SKUs and Slugs
- **Repository & File:** `open-trash-tech-be` — [`models/shopProduct.schema.js:59, 66`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/models/shopProduct.schema.js#L59)
- **Code Evidence:**
  ```javascript
  slug: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true }
  ```
- **Actual Impact:** The service checks uniqueness using `{ sku, del_flag: 0 }`. If an item is deleted (`del_flag = 1`), the application check passes, but MongoDB's global unique index rejects the subsequent save with `E11000 duplicate key error`.
- **Remediation:** Use partial filter expressions:
  ```javascript
  shopProductSchema.index({ sku: 1 }, { unique: true, partialFilterExpression: { del_flag: 0 } });
  shopProductSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { del_flag: 0 } });
  ```

---

<a id="audit-perf-01"></a>
### [AUDIT-PERF-01] Medium: Redundant Client-Side Fetch on Initial Page Mount (SSR Duplication)
- **Repository & File:** `open-trash-tech` — [`src/features/shop/components/catalog/StorefrontCatalog.tsx:105-109`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/shop/components/catalog/StorefrontCatalog.tsx#L105-L109)
- **Code Evidence:**
  ```typescript
  useEffect(() => {
    const urlFilters = getFiltersFromUrl();
    setFilters(urlFilters);
    fetchProducts(urlFilters); // Triggers on initial mount unconditionally!
  }, [searchParams, getFiltersFromUrl, fetchProducts]);
  ```
- **Actual Impact:** Every initial visit to `/shop` fetches products twice: once on the server in `ShopPage` (`fetchPublicProductsServer`), and a second time immediately over client HTTP upon hydration, causing layout flicker and wasted database throughput.
- **Remediation:** Track initial mount with a `useRef(true)` guard to skip `fetchProducts` on first render.

---

<a id="audit-perf-02"></a>
### [AUDIT-PERF-02] Medium: N+1 Individual HTTP Requests for Article Product Embeds
- **Repository & File:** `open-trash-tech` — [`src/features/shop/components/embed/ArticleProductEmbed.tsx:70`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/shop/components/embed/ArticleProductEmbed.tsx#L70)
- **Code Evidence:**
  ```typescript
  shopPublicApi.getProductBySlug(productId).then(...)
  ```
- **Actual Impact:** If an article embeds 10 products, 10 separate HTTP requests are fired.
- **Remediation:** Implement a client-side micro-batching queue or dataloader that debounces embed IDs across a 20ms window and invokes `shopPublicApi.getBatchProducts(ids)`.

---

<a id="audit-data-02"></a>
### [AUDIT-DATA-02] Medium: 90-Day Event TTL Distorts Conversion Ratios & Product Table Ignores Time Filters
- **Repository & File:** `open-trash-tech-be` — [`models/shopAnalyticsEvent.schema.js:62-65`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/models/shopAnalyticsEvent.schema.js#L62), [`services/shopAnalytics.services.js:454-458`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/services/shopAnalytics.services.js#L454)
- **Code Evidence:**
  - Events expire after 90 days (`expireAfterSeconds: 7776000`), while orders persist indefinitely.
  - `productPerformance` query reads lifetime document counters without filtering by the requested `range`.
- **Actual Impact:** Custom queries for historical periods older than 90 days report 0 views/impressions but non-zero orders, producing invalid conversion rates. Operators filtering for "7 Days" see lifetime product views.
- **Remediation:** Clearly label product performance metrics as lifetime counters in the UI, and constrain event-based conversion rates to time ranges within the 90-day retention window.

---

<a id="audit-test-01"></a>
### [AUDIT-TEST-01] Medium: Test Suites Conceal Routing and Concurrency Defects via In-Memory Mocks
- **Repository & File:** `open-trash-tech-be` — [`tests/shopLaunchReadinessAnalytics.test.js`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/tests/shopLaunchReadinessAnalytics.test.js), [`tests/shopOrderWorkflow.test.js`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/tests/shopOrderWorkflow.test.js)
- **Actual Impact:** All backend tests mock `ShopProduct.findOne` and invoke service methods directly. HTTP routes and Express middleware are never exercised through Supertest, allowing `AUDIT-ROUTE-01` and `AUDIT-CONC-01` to pass unnoticed.
- **Remediation:** Add Supertest HTTP integration tests against the live Express `AppServer`.

---

<a id="audit-sec-03"></a>
### [AUDIT-SEC-03] Low: Non-Constant Time String Comparison for Cron Shared Secret
- **Repository & File:** `open-trash-tech-be` — [`controllers/shopOrder.controller.js:29`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/controllers/shopOrder.controller.js#L29)
- **Code Evidence:** `if (cronSecret && providedSecret && cronSecret === providedSecret)`
- **Remediation:** Use `crypto.timingSafeEqual`.

---

<a id="audit-maint-01"></a>
### [AUDIT-MAINT-01] Low: Circular Dependency Warnings Emitted on Backend Startup
- **Repository & File:** `open-trash-tech-be` — [`services/index.js:6, 17, 24`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/services/index.js#L6)
- **Remediation:** Refactor `post.services.js`, `unifiedSearch.services.js`, and `upload.services.js` to avoid importing from `services/index.js` while it is evaluating.

---

<a id="audit-maint-02"></a>
### [AUDIT-MAINT-02] Low: Duplicate Currency Formatter Implementation in Frontend
- **Repository & File:** `open-trash-tech` — [`src/features/shop/components/admin/ProductManagement.tsx:34-39`](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/shop/components/admin/ProductManagement.tsx#L34)
- **Remediation:** Replace local `formatVND` with import from `@/features/shop/utils/formatters`.

---

## 6. Safe Verification Commands & Execution Results

All verification commands were executed in read-only mode without mutating application code:

### 1. Frontend Test Suite
- **Command:** `npm run test:shop` (in `open-trash-tech`)
- **Result:** **30 passed, 0 failed** (100% pass across S2, S3, S4, S5, S6).

### 2. Frontend TypeScript Check
- **Command:** `npx tsc --noEmit` (in `open-trash-tech`)
- **Result:** **0 errors**. Type definitions are clean.

### 3. Frontend ESLint Check
- **Command:** `npx eslint src/features/shop src/app/(marketing)/shop`
- **Result:** **0 errors**, 4 non-blocking image element warnings (`@next/next/no-img-element`).

### 4. Backend Test Suite
- **Command:** `npm run test:shop` (in `open-trash-tech-be`)
- **Result:** **49 passed, 0 failed** (S1 through S6.1).
- **Audit Observation:** Pass rate is artificially high due to in-memory mocking (see `AUDIT-TEST-01`).

### 5. Git Status Check
- **Result:** Verified zero uncommitted application source file mutations. Only this audit document was added.

---

## 7. Prioritized Remediation Roadmap

### Phase 1: P0 — Pre-Pilot Mandatory Blockers (Estimated Effort: 0.5 Day)
1. **Fix `ShopAnalyticsController` Routing (`AUDIT-ROUTE-01`):** Prefix routes with `${this._rootPath}` so `GET /shop/analytics/overview` functions.
2. **Implement Atomic Claim in Reservation Expiration (`AUDIT-CONC-01`):** Replace in-memory check with `findOneAndUpdate` atomic status claim.
3. **Idempotency Key Payload Hash Verification (`AUDIT-SEC-01`):** Prevent cross-customer PII leakage on key reuse.

### Phase 2: P1 — Reliability & Security Hardening (Estimated Effort: 1 Day)
4. **Escape RegExp Search Inputs (`AUDIT-SEC-02`):** Prevent ReDoS and 500 error disclosure on public catalog search.
5. **Partial Filter Expressions on Unique Indexes (`AUDIT-DATA-01`):** Permit SKU/slug re-use after soft deletion.
6. **Eliminate SSR Duplicate Fetch (`AUDIT-PERF-01`):** Add hydration guard in `StorefrontCatalog`.

### Phase 3: P2 — Scalability & Architecture (Post-Pilot)
7. **Embed Batching Queue (`AUDIT-PERF-02`):** Consolidate article embeds into single batch requests.
8. **Add HTTP Supertest Integration Suite (`AUDIT-TEST-01`):** Test live Express routing and middleware.
9. **Time-Range Awareness on Product Performance (`AUDIT-DATA-02`):** Align leaderboard metrics with selected date ranges.

---

## 8. Final Pilot Recommendation

### Verdict: **CONDITIONAL GO (REMEDIATION REQUIRED BEFORE PILOT TRAFFIC)**

**Conditions for Pilot Approval:**
1. Fix **AUDIT-ROUTE-01** so administrators can view the Commerce Analytics Dashboard.
2. Fix **AUDIT-CONC-01** so automated expiration crons do not risk corrupting active reservations.
3. Fix **AUDIT-SEC-01** to prevent customer PII exposure via idempotency key collisions.

Once these 3 P0 fixes are deployed, OpenIdear Shop is fully qualified to begin its controlled 10–20 product pilot.
