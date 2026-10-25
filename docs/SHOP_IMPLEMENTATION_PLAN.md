# OpenIdear Shop — Implementation Plan (Sprints S1–S5 & S6+)

**Document Version:** 1.0.0  
**Date:** October 2026  
**Auditor / Lead:** Senior Software Architect & Technical Product Lead  
**Scope:** Step-by-Step Engineering Execution Roadmap for OpenIdear Shop

---

## Roadmap Overview

```
Sprint S1: Product & Category Foundation
  ├── Patch AdminMiddleware security vulnerability (SEC-01)
  ├── Models: ShopCategory, ShopProduct (schemas & indexes)
  ├── Backend Admin & Catalog REST APIs
  └── Frontend Admin UI in /management (Products & Categories)
       │
Sprint S2: Public Storefront
  ├── Route /shop (catalog, search, faceted filters, pagination)
  ├── Route /shop/[slug] (gallery, specs, availability badges)
  ├── Server-side SEO metadata & JSON-LD Product Schema
  └── Header navigation & internal search integration
       │
Sprint S3: Order & Inventory Workflow
  ├── Client Shop Cart Store (localStorage / Zustand)
  ├── Order Submission API with idempotencyKey & atomic stock decrement
  ├── Order Confirmation Modal & Inquiry form
  ├── Admin Order Management UI (status transitions, audit logs)
  └── Email notification service for new orders (Nodemailer)
       │
Sprint S4: Content Integration & Analytics
  ├── TipTap ProductCard extension & ArticleRenderer embed block
  ├── Telemetry events (product_view, cart_add, order_submit, margin)
  └── Admin Shop Performance Dashboard (revenue, order funnel)
       │
Sprint S5: Hardening & Launch
  ├── Concurrency stress test (stock race condition verification)
  ├── Security re-audit & role boundary enforcement test suite
  ├── Rollback procedures & seed catalog data load
  └── Soft-launch with selected initial PC hardware products
       │
Sprint S6+: Automated Checkout & Growth (Post-MVP)
  ├── PayOS VietQR automated payment webhook reconciliation
  ├── Shipping carrier API integrations (GHN / ViettelPost)
  └── PC Builder component compatibility tool
```

---

## Sprint S1: Product & Category Foundation

### 1. Goals & Non-Goals
* **Goals:**
  * Resolve security vulnerability `SEC-01` in `auth.middleware.js` by strictly checking `user.role === 1`.
  * Establish database schemas and Mongoose models for `ShopCategory` and `ShopProduct`.
  * Build backend REST CRUD endpoints for product and category administration.
  * Integrate product and category management views into the existing admin dashboard at `/management`.
* **Non-Goals:**
  * Public-facing catalog pages (deferred to S2).
  * Cart and customer order submission (deferred to S3).

### 2. Dependencies
* Existing Cloudinary media upload infrastructure (`POST /media/v2/upload`).
* Existing admin dashboard layout in `src/app/(dashboard)/layout.tsx`.

### 3. Files & Modules to Create / Modify
* **Backend (`open-trash-tech-be`):**
  * **Modify:** [middlewares/auth.middleware.js](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/middlewares/auth.middleware.js) — Add `user.role === 1` check to `AdminMiddleware`.
  * **Create:** `models/shopCategory.schema.js` — Category schema with hierarchy, slug, icon, and display order.
  * **Create:** `models/shopProduct.schema.js` — Product schema with SKU, selling price, specifications, stock quantity, and fulfillment mode.
  * **Modify:** [models/index.js](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/models/index.js) — Export `ShopCategory` and `ShopProduct`.
  * **Create:** `services/shopCategory.services.js` & `services/shopProduct.services.js` — Domain business logic and validation.
  * **Create:** `controllers/shopCategory.controller.js` & `controllers/shopProduct.controller.js` — REST controller endpoints.
  * **Modify:** [controllers/index.js](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/controllers/index.js) & [index.js](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/index.js) — Mount controllers onto `AppServer`.
* **Frontend (`open-trash-tech`):**
  * **Create:** `src/features/shop/types/shop.types.ts` — TypeScript definitions for `ShopProduct` and `ShopCategory`.
  * **Create:** `src/features/shop/api/shopAdmin.api.ts` — Axios admin API functions.
  * **Create:** `src/features/shop/components/admin/ProductManagement.tsx` — Admin table, filter, and creation dialog.
  * **Create:** `src/features/shop/components/admin/CategoryManagement.tsx` — Category hierarchy manager.
  * **Modify:** [src/app/(dashboard)/management/page.tsx](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/app/(dashboard)/management/page.tsx) — Add "Shop Products" and "Shop Categories" tabs to the admin sidebar.

### 4. Data Changes & Migrations
* Purely additive schemas. No existing collections are modified or migrated.
* Indexes created automatically on app startup:
  * `shop_products`: `{ slug: 1 }` (unique), `{ sku: 1 }` (unique), `{ category: 1, status: 1 }`, `{ sellingPrice: 1 }`.
  * `shop_categories`: `{ slug: 1 }` (unique), `{ parentCategory: 1, displayOrder: 1 }`.

### 5. Test Suite
* **Create:** `open-trash-tech-be/tests/shopProductLifecycle.test.js`:
  1. Verify non-admin JWT is rejected with `403 Forbidden` on `POST /shop/admin/products`.
  2. Verify admin JWT successfully creates a product with valid SKU and specs.
  3. Verify duplicate SKU insertion is rejected with `409 Conflict`.
  4. Verify pagination and category filtering.

### 6. Acceptance Criteria
* [ ] Attempting to call any `/shop/admin/*` endpoint with a regular user token returns `403 Forbidden`.
* [ ] Administrator can create, view, edit, and archive products with images, specifications, and prices.
* [ ] Images are selected or uploaded via the existing `MediaAsset` / Cloudinary flow.
* [ ] TypeScript compilation (`npx tsc --noEmit`) passes with zero errors.

---

## Sprint S2: Public Storefront

### 1. Goals & Non-Goals
* **Goals:**
  * Implement public `/shop` catalog page with category sidebar, brand/fulfillment filtering, price sorting, and pagination.
  * Implement public `/shop/[slug]` product detail page with image gallery, specification table, and fulfillment mode indicators.
  * Implement server-side SEO metadata, dynamic breadcrumbs, and JSON-LD `Product` schema.
  * Add "Shop" navigation link in the global [Header.tsx](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/components/Header.tsx).
* **Non-Goals:**
  * Checkout or payment gateway (deferred to S3).

### 2. Dependencies
* Completed Sprint S1 product models and public retrieval APIs.
* Radix UI components ([src/components/ui/](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/components/ui/)): `badge.tsx`, `card.tsx`, `pagination.tsx`, `table.tsx`, `skeleton.tsx`.

### 3. Files & Modules to Create / Modify
* **Backend (`open-trash-tech-be`):**
  * **Modify:** `controllers/shopProduct.controller.js` — Expose public `GET /shop/products` and `GET /shop/products/:slug` (increments `views` asynchronously).
* **Frontend (`open-trash-tech`):**
  * **Create:** `src/app/(marketing)/shop/page.tsx` — Server component for catalog listing with search params.
  * **Create:** `src/app/(marketing)/shop/[slug]/page.tsx` — Server component for product details with `generateMetadata`.
  * **Create:** `src/features/shop/components/catalog/ProductCard.tsx` — Card with thumbnail, price, availability badge.
  * **Create:** `src/features/shop/components/catalog/ProductFilters.tsx` — Category accordion, price slider/inputs, fulfillment filters.
  * **Create:** `src/features/shop/components/detail/ProductGallery.tsx` — Gallery with main view and thumbnails.
  * **Create:** `src/features/shop/components/detail/ProductSpecTable.tsx` — Responsive specifications display.
  * **Modify:** [src/components/Header.tsx](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/components/Header.tsx) — Add Shop link next to Courses.
  * **Modify:** [src/app/sitemap.ts](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/app/sitemap.ts) — Fetch and include published shop products in sitemap generation.

### 4. Test Suite
* **Frontend Test:** `src/features/shop/__tests__/productSeo.test.ts`:
  1. Verify canonical URL and OpenGraph tags for product detail page.
  2. Verify JSON-LD `Product` and `Offer` structured data formatting.

### 5. Acceptance Criteria
* [ ] `/shop` renders responsive catalog grid with fast server-side initial load.
* [ ] Filtering by category, fulfillment mode, and sorting by price works dynamically.
* [ ] `/shop/[slug]` displays high-resolution Cloudinary images, accurate availability tags (*"In Stock"* vs *"Available on Order (2–4 Days)"*), and specs.
* [ ] Google Rich Results test confirms valid `Product` and `Offer` schema.

---

## Sprint S3: Order & Inventory Workflow

### 1. Goals & Non-Goals
* **Goals:**
  * Implement client-side `useShopCartStore` (stored in `localStorage`) with drawer UI.
  * Implement order submission endpoint `POST /shop/orders` with `idempotencyKey` and atomic stock reservation.
  * Build order inquiry / submission modal (customer name, phone, email, delivery address, order notes).
  * Implement Admin Order Management view in `/management` (filter orders, update status, view audit history).
  * Trigger email confirmation to customer and notification to store admin via existing `nodemailer`.
* **Non-Goals:**
  * Automated payment gateway integration (deferred to S6+; manual confirmation is MVP).

### 2. Dependencies
* Sprints S1 and S2 complete.
* Backend `nodemailer` utility ([open-trash-tech-be/package.json](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/package.json#L38)).

### 3. Files & Modules to Create / Modify
* **Backend (`open-trash-tech-be`):**
  * **Create:** `models/shopOrder.schema.js` — Order schema with immutable snapshots and event log.
  * **Create:** `services/shopOrder.services.js` — Order calculation, atomic stock decrement, idempotency guard.
  * **Create:** `controllers/shopOrder.controller.js` — Customer submission and admin order status management.
  * **Create:** `services/shopEmail.services.js` — Email templates for order confirmation and admin alert.
* **Frontend (`open-trash-tech`):**
  * **Create:** `src/features/shop/store/useShopCartStore.ts` — Zustand store for cart items and quantities.
  * **Create:** `src/features/shop/components/cart/ShopCartDrawer.tsx` — Slide-out sheet showing cart items.
  * **Create:** `src/features/shop/components/order/OrderModal.tsx` — Customer information and address modal.
  * **Create:** `src/features/shop/components/order/OrderSuccessView.tsx` — Confirmation view with order number and next steps.
  * **Create:** `src/features/shop/components/admin/OrderManagement.tsx` — Admin order table with status transition dropdowns.
  * **Modify:** [src/app/(dashboard)/management/page.tsx](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/app/(dashboard)/management/page.tsx) — Add "Shop Orders" tab.

### 4. Test Suite
* **Create:** `open-trash-tech-be/tests/shopOrderAtomicInventory.test.js`:
  1. Test concurrent order submissions on last item in stock; verify exactly one succeeds and second receives `409 Conflict`.
  2. Test duplicate `idempotencyKey` replay; verify no duplicate order or double stock decrement.
  3. Verify order total calculation rejects any client-supplied prices.
  4. Test status transitions: verify invalid transition (`pending` $\rightarrow$ `completed`) is rejected.

### 5. Acceptance Criteria
* [ ] Customer can add products to cart, specify quantities, and submit an order with contact details.
* [ ] Order total is calculated strictly from database product prices.
* [ ] In-stock quantity decrements atomically upon order placement.
* [ ] Admin can view submitted orders in `/management` and transition status to `confirmed`, `shipped`, or `cancelled`.
* [ ] Customer and admin receive email confirmations.

---

## Sprint S4: Content Integration & Analytics

### 1. Goals & Non-Goals
* **Goals:**
  * Create `ProductCardBlock` in [ArticleRenderer.tsx](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/article/components/ArticleRenderer.tsx) to embed live product cards directly inside articles.
  * Implement lightweight telemetry for commerce events (`product_view`, `product_click_from_article`, `cart_add`, `order_submit`).
  * Add basic Shop metrics widget to the admin dashboard (total revenue, order count, conversion rate).
* **Non-Goals:**
  * Introducing heavy external analytics SaaS (reusing internal telemetry / MongoDB aggregation).

### 2. Files & Modules to Create / Modify
* **Backend (`open-trash-tech-be`):**
  * **Create:** `controllers/shopAnalytics.controller.js` — Aggregate order revenue, average order value, top-selling products.
* **Frontend (`open-trash-tech`):**
  * **Create:** `src/features/article/components/ArticleProductCard.tsx` — Live product card rendered in editorial content.
  * **Modify:** [src/features/article/components/ArticleRenderer.tsx](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/article/components/ArticleRenderer.tsx) — Map `product_card` block type.
  * **Create:** `src/features/shop/components/admin/ShopAnalyticsOverview.tsx` — Recharts dashboard cards for sales and order volume.

### 3. Acceptance Criteria
* [ ] Authors can reference a product ID or slug in an article, rendering an interactive product card with current price.
* [ ] Clicks from an article to a product page track the referring article slug.
* [ ] Admin dashboard displays verified monthly revenue and order conversion metrics.

---

## Sprint S5: Hardening & Launch

### 1. Goals & Non-Goals
* **Goals:**
  * Execute end-to-end regression testing across editorial, course, and shop domains.
  * Perform security audit on all shop endpoints and verify rate limiters.
  * Populate initial catalog seed data for launch PC hardware products.
  * Finalize customer-facing return policy, warranty terms, and store FAQ.
  * Soft launch OpenIdear Shop to production.
* **Non-Goals:**
  * New feature development.

### 2. Operational & Deployment Checklist
* [ ] Verify MongoDB indexes are active in production cluster (`atlas-8q6zvi-shard-0`).
* [ ] Run full test suite: `npm test` in backend and frontend.
* [ ] Validate Cloudinary asset transformations and caching headers.
* [ ] Seed 15–25 initial hardware SKUs across selected categories (GPUs, CPUs, RAM, SSDs, Keyboards).
* [ ] Conduct mock order submission and phone confirmation test with store operations team.

---

## Sprint S6+: Automated Checkout & Growth (Post-MVP)

* **PayOS / VietQR Gateway Integration:** Reuse existing `@payos/node` to generate dynamic QR codes and automate webhook payment reconciliation (`POST /shop/payments/webhook`).
* **Automated Logistics Integration:** Connect to third-party shipping APIs (Giao Hàng Nhanh / ViettelPost) for automated tracking numbers and rate calculation.
* **Interactive PC Builder:** Component compatibility checker (CPU socket match, motherboard form factor, power supply wattage calculator).
