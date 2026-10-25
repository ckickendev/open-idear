# OpenIdear Shop — Architecture Audit (Sprint S0)

**Document Version:** 1.0.0  
**Date:** October 2026  
**Auditor:** Senior Software Architect & Technical Product Lead  
**Scope:** Architecture, Security, Data Model, Media Pipeline, SEO, and Testing Audit of Frontend (`open-trash-tech`) and Backend (`open-trash-tech-be`) codebases for OpenIdear Shop.

---

## 1. Executive Summary

OpenIdear is expanding its technology knowledge-sharing platform with **OpenIdear Shop**, an integrated commerce experience focused on PC hardware, enthusiast components, and tech accessories. The business model is a hybrid between **stocked inventory** (curated, immediate dispatch) and **supplier-ordered fulfillment** (on-demand dispatch from established distributor partners), starting with a high-touch, **manual order confirmation and fulfillment workflow**.

This audit evaluated the existing OpenIdear production repositories (`open-trash-tech` and `open-trash-tech-be`) to establish an evidence-based architectural baseline. 

### Key Findings & Verdict
1. **Strong Reusable Foundation:** The platform has a modern frontend stack (Next.js 15.2.8, React 19, Tailwind CSS v4, Radix UI, TanStack Query v5) and a robust media pipeline (`MediaAsset` service with Cloudinary, Sharp thumbnailing, and perceptual hashing).
2. **Critical Security Vulnerability Identified (`SEC-01`):** In `open-trash-tech-be/middlewares/auth.middleware.js` (lines 37–45), `AdminMiddleware` verifies the JWT signature and extracts the user, but **completely omits checking `user.role === 1`**. Any authenticated user currently has access to all admin endpoints. This must be patched immediately before exposing shop administration.
3. **Cart & Payment Domain Conflict (`DATA-01`):** The existing `cart` feature (`user.schema.js:36-39`, `CartController.js`, `CartStore.ts`) is hardcoded for **digital course enrollment** (`ref: "course"`, single item purchase, zero quantity concept). PC hardware requires physical attributes (quantities, variants, specifications, fulfillment modes, delivery addresses, immutable item pricing snapshots). The Shop domain must be modeled as a distinct, dedicated bounded context (`ShopProduct`, `ShopCategory`, `ShopOrder`).
4. **MongoDB Transaction Feasibility (`DATA-02`):** Live database topology probing confirmed an active **MongoDB Atlas Replica Set** (`atlas-8q6zvi-shard-0`, topology `ReplicaSetWithPrimary`), proving that multi-document ACID transactions via `session.startTransaction()` are supported. However, for resiliency in standalone test environments, single-document atomic operations (`$inc` with `$gte` guards) should be preferred for inventory reservations.
5. **Readiness Verdict:** **`CONDITIONALLY READY FOR SPRINT S1`** upon addressing authorization vulnerability `SEC-01` in the initial S1 sprint tasks.

---

## 2. Verified Current Architecture

### 2.1 Repository Map & State

| Repository | Role | Technology Stack | Deployment State |
| :--- | :--- | :--- | :--- |
| **`open-trash-tech`** | Frontend Web App & Admin UI | Next.js 15.2.8 (App Router, Turbopack), React 19, Tailwind CSS v4 (`@tailwindcss/postcss`), Radix UI, Zustand v5, TanStack Query v5, Axios | Hosted on Vercel (`NEXT_PUBLIC_APP_URL`), Node 20/22 runtime |
| **`open-trash-tech-be`** | REST API & Background Workers | Node.js 22, Express 4.21.2, Mongoose 8.12.0, Cloudinary SDK 2.7.0, Bunny Stream Client, PayOS SDK 2.0.5 | Containerized (`dockerfile` Alpine Node 22) / Netlify Functions fallback, port 5001 |
| **Database** | Primary Data Persistence | MongoDB Atlas (`atlas-8q6zvi-shard-0`), Mongoose ORM | 3-node Replica Set with Primary, `transactionsSupported: true` |
| **CDN / Media** | Images & Static Assets | Cloudinary (`CLOUDINARY_CLOUD_NAME`), Sharp v0.35.2 processing | Active for post images, avatars, and media library |

---

## 3. Detailed Audit Findings

```
┌────────────────────────────────────────────────────────────────────────┐
│                              SEVERITY MATRIX                           │
├──────────────┬─────────────────────────────────────────────────────────┤
│ CRITICAL (1) │ SEC-01: AdminMiddleware fails to enforce role check    │
│ HIGH (3)     │ SEC-02: Role type mismatch (Number vs String)           │
│              │ DATA-01: Cart coupled to digital course schema          │
│              │ TEST-01: Lack of automated E2E & commerce test runner   │
│ MEDIUM (3)   │ AUTH-01: Development client auth bypass in layout       │
│              │ SEO-01: Static sitemap queries only blog posts          │
│              │ UI-01: External search form redirect in Header          │
│ LOW / INFO   │ MEDIA-01: Cloudinary thumbnail pipeline reusable as-is  │
└──────────────┴─────────────────────────────────────────────────────────┘
```

### 3.1 Security & Authorization Findings

#### Finding `SEC-01` (CRITICAL): `AdminMiddleware` Does Not Verify Administrator Role
* **File:** [auth.middleware.js](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/middlewares/auth.middleware.js#L37-L45)
* **Code:**
  ```javascript
  async function AdminMiddleware(req, res, next) {
    try {
      const user = await _verifyToken(req);
      req.userInfo = user;
      next(); // <--- CRITICAL GAP: Does NOT verify user.role === 1
    } catch (error) {
      res.status(401).json({ success: false, message: error.message || "Invalid Token" });
    }
  }
  ```
* **Impact:** Every endpoint protected by `AdminMiddleware` across the application (including [user.controller.js:107-120](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/controllers/user.controller.js#L107-L120) `updateRole`, `lockUser`, `deleteUser`, [category.controller.js:155-158](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/controllers/category.controller.js#L155-L158), and [topic.controller.js:41-43](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/controllers/topic.controller.js#L41-L43)) accepts **any valid token from any registered regular user**.
* **Remediation:** Enforce `if (Number(user.role) !== 1) return res.status(403).json({ success: false, message: "Forbidden: Admin role required" });` immediately in `AdminMiddleware`.

#### Finding `SEC-02` (HIGH): Role Type Inconsistency Across Modules
* **Evidence:**
  * In [user.schema.js:16-19](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/models/user.schema.js#L16-L19): `role: { type: Number, default: 0 }`.
  * In [post.controller.js:40, 228, 260](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/controllers/post.controller.js#L40): Checks `req.userInfo.role !== 1`.
  * In [course.controller.js:174](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/controllers/course.controller.js#L174): Checks `role === 1 ? null : _id`.
  * In [aiUsage.controller.js:62-63](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/controllers/aiUsage.controller.js#L62-L63): Checks `if (req.userInfo && req.userInfo.role && req.userInfo.role !== "admin")`.
* **Impact:** In `aiUsage.controller.js`, `1 !== "admin"` evaluates to `true`, causing actual administrators with numeric role `1` to be blocked from viewing admin analytics.
* **Remediation:** Standardize on numeric constant `ROLES = { USER: 0, ADMIN: 1 }` or normalize via helper `isAdmin(user)`.

#### Finding `AUTH-01` (MEDIUM): Frontend Development Auth Bypass
* **File:** [layout.tsx](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/app/(dashboard)/layout.tsx#L32-L38)
* **Code:**
  ```typescript
  const isDev = process.env.NODE_ENV === "development";
  if (!token) {
    if (isDev) {
      setAuthorized(true);
      return;
    }
    router.replace("/");
    return;
  }
  ```
* **Impact:** In local development, the admin dashboard renders without requiring a token. While convenient for UI design, if backend routes are not secured independently, developers can accidentally deploy admin endpoints without realizing permissions are unverified on the backend.
* **Remediation:** In production, rely on Next.js server-side token verification or strict layout guards, and maintain backend defense-in-depth.

---

### 3.2 Data Model & Persistence Findings

#### Finding `DATA-01` (HIGH): Existing Cart Domain Bound Strictly to Courses
* **Evidence:**
  * [user.schema.js:36-39](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/models/user.schema.js#L36-L39):
    ```javascript
    cart: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "course" }],
      default: [],
    }
    ```
  * [CartStore.ts:4-12](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/store/CartStore.ts#L4-L12): Cart items contain `instructor`, `title`, and route to `/courses/${item.slug}`.
  * [checkout/page.tsx:20-50](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/app/(marketing)/checkout/page.tsx#L20-L50): Implements PayOS integration for digital course enrollment.
* **Impact:** Attempting to reuse `user.cart` for PC hardware products would corrupt the existing course checkout and student enrollment pipeline.
* **Remediation:** Create dedicated Shop models: `ShopProduct`, `ShopCategory`, `ShopOrder`. Maintain a dedicated client-side `ShopCartStore` (in `localStorage`) for guest/user hardware shopping without mutating the `User` schema directly for ephemeral cart states.

#### Finding `DATA-02` (MEDIUM): MongoDB Replica Set Verified, But Atomic Deductions Needed
* **Evidence:** Running live connection verification against the production MongoDB Atlas cluster:
  * Connection Status: `connected: true`
  * Topology: `ReplicaSetWithPrimary`
  * Replica Set Name: `atlas-8q6zvi-shard-0`
  * Transactions Supported: `true`
* **Analysis:** While MongoDB transactions are supported in production, running automated unit/integration tests in offline Docker environments or lightweight test runners often uses standalone MongoDB (where `session.startTransaction()` fails with `Transaction numbers are only allowed on a replica set member`).
* **Remediation:** 
  1. For stock decrement in `stock` fulfillment mode, use atomic conditional Mongoose queries:
     ```javascript
     const updated = await ShopProduct.findOneAndUpdate(
       { _id: productId, stockQuantity: { $gte: quantity }, status: "published" },
       { $inc: { stockQuantity: -quantity } },
       { new: true }
     );
     if (!updated) throw new ConflictException("Insufficient stock or product unavailable");
     ```
  2. Reserve `session.startTransaction()` for multi-item order finalization where replica set availability is asserted.

---

### 3.3 Media & Product Catalog Findings

#### Finding `MEDIA-01` (POSITIVE / REUSABLE): Advanced Image Processing Pipeline
* **File:** [mediaAsset.services.js](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/services/mediaAsset.services.js#L40-L120) & [mediaAsset.controller.js](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/controllers/mediaAsset.controller.js#L62-L79)
* **Verified Capabilities:**
  * Multipart image upload via Multer memory storage (`limit: 10MB`, JPEG, PNG, GIF, WebP, SVG).
  * Concurrency-controlled image transformation using `PQueue` (max 4 concurrent Sharp operations) to prevent Node.js Out-Of-Memory crashes.
  * Automated generation of 4 optimized variants:
    * `urls.original`
    * `urls.webp`
    * `urls.thumbnail_sm` (150×150 crop)
    * `urls.thumbnail_md` (400px wide)
    * `urls.thumbnail_lg` (800px wide)
  * SHA-256 buffer hash and Perceptual Hash (pHash) for automatic deduplication.
  * Uploads directly to Cloudinary and persists metadata in `MediaAsset` collection.
* **Recommendation:** Product images in OpenIdear Shop can directly reuse `POST /media/v2/upload`. Product documents will store references to `MediaAsset` IDs or store an array of snapshot URLs with thumbnails.

---

### 3.4 SEO, Performance & Frontend Integration Findings

#### Finding `SEO-01` (MEDIUM): Sitemap Generation Strictly Hardcoded to Blog Posts
* **File:** [sitemap.ts](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/app/sitemap.ts#L48-L65)
* **Code:**
  ```typescript
  const res = await fetch(`${ENV.ROOT_API}/post/getAllPosts?limit=100&page=1`, {
    next: { revalidate: 3600 },
  });
  ```
* **Impact:** The sitemap generator does not index courses or future shop products, missing critical search engine discoverability.
* **Remediation:** Extend `sitemap.ts` with parallel promises fetching published products (`${ENV.ROOT_API}/shop/products?status=published&limit=1000`) and shop categories.

#### Finding `UI-01` (LOW): External Search Form in Header
* **File:** [Header.tsx](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/components/Header.tsx#L117-L124)
* **Code:**
  ```tsx
  <form action="https://tailwindflex.com/search" className="flex flex-row relative w-[240px] sm:w-[300px]">
  ```
* **Impact:** The search bar in the global header points to an external site (`tailwindflex.com`) rather than an internal search router.
* **Remediation:** Update `Header.tsx` to handle an internal search redirect (e.g. `/search?q=...` or `/shop?q=...`).

---

### 3.5 Testing & Operational Infrastructure Findings

#### Finding `TEST-01` (HIGH): Bespoke Node Test Scripts Without Unified CI
* **Evidence:**
  * In [open-trash-tech-be/package.json:17](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/package.json#L17): Tests are executed via concatenated node commands:
    `node tests/bunnyStream.test.js && node tests/bunnyStreamUploadPipeline.test.js && ...`
  * Tests use native Node.js `assert` module.
  * In [open-trash-tech/package.json:10-14](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/package.json#L10-L14): Frontend tests use Node 22 native type stripping (`--experimental-strip-types`).
* **Impact:** There is no Jest or Vitest test runner, mock reset utilities, or CI workflow running automatically on pull requests.
* **Remediation:** Create dedicated integration test suites for Shop (e.g. `tests/shopProductLifecycle.test.js`, `tests/shopOrderAtomicInventory.test.js`) following the existing Node `assert` + `ts-node` pattern so they integrate seamlessly into `npm test`.

---

## 4. Reusable OpenIdear Assets

| Asset / Module | File Path | Capability / Reusability for Shop |
| :--- | :--- | :--- |
| **Admin Layout & Navigation** | [src/app/(dashboard)/layout.tsx](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/app/(dashboard)/layout.tsx) & [management/page.tsx](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/app/(dashboard)/management/page.tsx) | Clean tabbed admin sidebar with Lucide icons. Add `products`, `orders`, and `shop-categories` tabs. |
| **UI Primitive Library** | [src/components/ui/](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/components/ui/) | Radix UI dialogs, sheets, dropdowns, tables, badges, tabs, buttons, skeleton loaders, and Sonner toasts. |
| **Media Upload & Optimization** | [open-trash-tech-be/services/mediaAsset.services.js](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech-be/services/mediaAsset.services.js) | Cloudinary multi-resolution WebP upload pipeline with Sharp concurrency queue and SHA-256 deduplication. |
| **Axios API Client** | [src/lib/api/axios.ts](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/lib/api/axios.ts) | Centralized token injection (`Authorization: Bearer <token>`), 429 rate-limit backoff, unified `ApiResponse<T>` envelope. |
| **Editorial Block Renderer** | [src/features/article/components/ArticleRenderer.tsx](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/article/components/ArticleRenderer.tsx) | Supports typed blocks. Add a `ProductCardBlock` for embedding live hardware product cards directly inside articles. |
| **SEO Metadata Generator** | [src/features/seo/metadata/buildPostMetadata.ts](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/features/seo/metadata/buildPostMetadata.ts) | Server-side canonical URL, OpenGraph, and JSON-LD schema builder. Extendable for `Product` schema. |
| **Design System Tokens** | [src/app/globals.css](file:///Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src/app/globals.css) | OKLCH semantic color tokens, light/dark mode support, `--color-admin-primary` `#4f46e5`. |

---

## 5. Unknowns, Limitations & Assumptions

1. **Supplier Integration Level:** Assumed to be completely **manual / telephone / portal** for the MVP. The backend will store supplier metadata (`supplierName`, `supplierSku`, `supplierLeadTimeDays`, `supplierCostPrice`), but will not perform automated EDI or external API stock scraping.
2. **Payment Processing:** Manual bank transfer / cash on delivery (COD) or manual QR verification will be used for MVP order confirmation. PayOS integration exists in the backend (`@payos/node: ^2.0.5`), but will be introduced in Phase S6+ for automated shop checkout to preserve MVP focus.
3. **Shipping Automation:** No dynamic carrier API (e.g., GHN, GHTK, ViettelPost) is currently integrated in OpenIdear. Orders will use a flat or manual shipping quotation handled by admin during the confirmation call/message.

---

## 6. Recommended Action Plan for Sprint S1

1. **Patch `AdminMiddleware`:** Add explicit check for `user.role === 1` with 403 Forbidden response.
2. **Introduce Domain Models:** Create `ShopCategory`, `ShopProduct`, and `ShopOrder` in `open-trash-tech-be/models/`.
3. **Implement Admin Product APIs:** Build `ShopProductController` and `ShopProductService` with full validation, pagination, filtering, and role enforcement.
4. **Wire Admin Dashboard:** Add "Hardware Products" tab into `management/page.tsx` utilizing Radix tables and forms.
