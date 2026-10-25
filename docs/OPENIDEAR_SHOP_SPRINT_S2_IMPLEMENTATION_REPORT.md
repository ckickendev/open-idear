# Sprint S2 Implementation Report — OpenIdear Shop Public Storefront & Product Catalog

**Platform:** OpenIdear (Tech Community & Knowledge Platform)  
**Sprint:** S2 — Public Storefront & Product Catalog  
**Status:** COMPLETE & VERIFIED  
**Date:** October 24, 2026  
**Auditor / Engineer:** Senior Full-Stack Engineer  

---

## 1. Executive Summary & Audit Findings

Sprint S2 builds directly on the foundational data models and admin controls delivered in Sprint S1 (`ShopProduct`, `ShopCategory`, and strict `AdminMiddleware` RBAC).

### Key Audit Findings Prior to Implementation:
1. **Internal Supplier Leakage Vulnerability:**
   - In Sprint S1, `getPublishedProductsPublic` and `getProductBySlugPublic` projected `-supplierInfo.costPrice -del_flag`. While the raw cost price was hidden, the supplier's company name, supplier SKU, and internal lead time remained accessible in the returned documents.
   - **Remediation:** Both public queries were hardened to project `-supplierInfo -del_flag`, completely redacting all supplier metadata from public consumers.
2. **Deterministic Catalog Queries & Pagination Limits:**
   - The public catalog previously accepted arbitrarily large `limit` parameters up to 100 and sorted by single fields without tie-breakers.
   - **Remediation:** Enforced a safe maximum limit of 50 items (`Math.min(50, Math.max(1, limit))`) and deterministic secondary tie-breaking on `_id` (`{ createdAt: -1, _id: -1 }`).
3. **Non-Blocking View Counter:**
   - `getProductBySlugPublic` previously used `findOneAndUpdate` with `$inc: { views: 1 }` synchronously within the read path, which risked read latency spikes or unhandled rejections during transient database locks.
   - **Remediation:** Refactored to perform a fast lean `findOne` on `{ slug, status: "published", del_flag: 0 }`, dispatching the view count increment asynchronously with a silent error handler (`.catch(() => {})`).
4. **App Router & Storefront Integration:**
   - Public marketing routes reside under `src/app/(marketing)/` inheriting the site's shared `Header` and `Footer`.
   - Storefront routes `/shop` and `/shop/[slug]` were integrated into `(marketing)` with zero regression to existing layout tokens, light/dark themes, and navigation.

---

## 2. Files Changed and Technical Rationale

### A. Backend (`open-trash-tech-be`)
| File | Action | Technical Rationale |
| :--- | :--- | :--- |
| `services/shopProduct.services.js` | Modified | Redacted entire `supplierInfo` object from public catalog and detail endpoints; bounded pagination limit to 50; decoupled view count increment to asynchronous non-blocking execution; added deterministic sorting tie-breakers. |
| `tests/shopProductLifecycle.test.js` | Modified | Updated test assertions to verify complete removal of `supplierInfo` and mock alignment for `ShopProduct.findOne`. |
| `tests/shopPublicApi.test.js` | Created | Added 8 dedicated unit/integration tests verifying category active filtering, supplier redaction, bounded pagination, deterministic sorting, price filter bounds, draft/archived access blocking, and non-blocking view counter. |
| `package.json` | Modified | Wired `tests/shopPublicApi.test.js` into standard `npm test` script. |

### B. Frontend (`open-trash-tech`)
| File | Action | Technical Rationale |
| :--- | :--- | :--- |
| `src/features/shop/types/shop.types.ts` | Modified | Added TypeScript interfaces: `PublicShopProduct`, `PublicProductFilterParams`, `PublicProductListResponse`, and `PublicShopProductCategory` ensuring strict type separation from internal admin structures. |
| `src/features/shop/utils/formatters.ts` | Created | Centralized VND currency formatting (`16.990.000 ₫`) and truthful availability computation (`getAvailabilityInfo`), cleanly distinguishing physical stock from supplier-order fulfillment. |
| `src/features/shop/api/shopPublic.api.ts` | Created | Dual-purpose public API client supporting client-side requests (`shopPublicApi`) and Next.js App Router Server Component fetchers (`fetchPublicProductsServer`, `fetchPublicProductBySlugServer`, `fetchPublicCategoriesServer`). |
| `src/features/shop/seo/buildShopMetadata.ts` | Created | Pure server-side metadata generator producing canonical URLs, OpenGraph tags, and truthful Schema.org `Product` & `Offer` JSON-LD structured data (no fake ratings or review counts). |
| `src/features/shop/components/catalog/ProductCard.tsx` | Created | Responsive product card showing primary image, VND price, category, honest availability badge (Stock vs Supplier Order), and link to detail page. |
| `src/features/shop/components/catalog/ProductGrid.tsx` | Created | Responsive catalog grid with 1-2-3-4 column layout, animated loading skeletons, empty state with filter reset, and error retry state. |
| `src/features/shop/components/catalog/SearchBar.tsx` | Created | Debounced search input with clear button and accessible focus styling. |
| `src/features/shop/components/catalog/FilterSidebar.tsx` | Created | Desktop sidebar and mobile filter drawer covering category pills, fulfillment mode toggles, preset price ranges, and custom VND numeric inputs. |
| `src/features/shop/components/catalog/StorefrontHeader.tsx` | Created | Trustworthy hero banner introducing OpenIdear Shop, hardware focus, and verification guarantee. |
| `src/features/shop/components/catalog/StorefrontCatalog.tsx` | Created | State container coordinating URL search params, debounced search, sorting, filtering, and page navigation with Next.js App Router. |
| `src/features/shop/components/detail/ProductGallery.tsx` | Created | Responsive image gallery with main viewport, thumbnail strip, and hardware placeholder fallback. |
| `src/features/shop/components/detail/ProductSpecTable.tsx` | Created | Grouped technical specifications table displaying specs organized by category (General, Performance, Connectivity, etc.). |
| `src/features/shop/components/detail/ProductInquiryCard.tsx` | Created | Transparent consultation and inquiry card allowing visitors to request orders or compatibility advice without misleading immediate-checkout claims. |
| `src/features/shop/components/detail/RelatedProducts.tsx` | Created | Server component displaying up to 4 complementary hardware items from the same category. |
| `src/app/(marketing)/shop/page.tsx` | Created | Server Component storefront page with server-side metadata generation and Suspense boundary. |
| `src/app/(marketing)/shop/[slug]/page.tsx` | Created | Server Component detail page with dynamic Schema.org JSON-LD structured data, breadcrumbs, and 404 `notFound()` handling for drafts/archived products. |
| `src/app/sitemap.ts` | Modified | Added `/shop` static route and dynamic `/shop/[slug]` URLs for all published products with daily change frequency. |
| `src/components/Header.tsx` | Modified | Added "Shop" navigation link in global header alongside "Courses". |
| `src/features/shop/__tests__/shopCatalogAndSeo.test.ts` | Created | Automated unit test suite verifying VND formatting, availability rules, Schema.org mappings, and SEO metadata. |
| `package.json` | Modified | Wired `shopCatalogAndSeo.test.ts` into `npm run test:shop`. |

---

## 3. Public Routes & API Contracts

### Public API Endpoints
1. `GET /shop/categories`:
   - Returns array of active (`isActive: true, del_flag: 0`) categories sorted by `displayOrder` and `name`.
   - Projection: `_id, name, slug, description, image, parentCategory, displayOrder`.
2. `GET /shop/products`:
   - Query Parameters: `page` (int >= 1), `limit` (int 1..50, default 20), `category` (slug or ObjectId), `fulfillmentMode` (`stock` \| `supplier_order`), `availabilityStatus` (`in_stock` \| `available_on_order` \| `out_of_stock` \| `pre_order`), `minPrice` (number >= 0), `maxPrice` (number >= 0), `search` (string), `sort` (`newest` \| `price_asc` \| `price_desc` \| `popular`).
   - Projection: `-supplierInfo -del_flag` (strict redaction).
   - Filter Guarantee: Only products with `status === "published"` and `del_flag === 0`.
3. `GET /shop/products/:slug`:
   - Returns single published product document or throws `404 NotFoundException`.
   - Populates `category` (`name, slug, description`).
   - Strips `-supplierInfo -del_flag`.
   - View count increment executed asynchronously via `updateOne({ _id }, { $inc: { views: 1 } })`.

### Frontend Routes
1. `/shop`:
   - Public hardware catalog with responsive grid, category filter pills, fulfillment filter, price presets, debounced search, and pagination.
2. `/shop/[slug]`:
   - Public product detail page with image gallery, VND price, fulfillment notice, grouped specifications table, inquiry consultation CTA, related category products, and breadcrumbs.

---

## 4. Security & Data Exposure Review

| Security Vector | Implementation / Guard | Verified |
| :--- | :--- | :---: |
| **Supplier Cost Redaction** | `-supplierInfo` excluded from both public product list and detail queries. | YES |
| **Supplier Identity Redaction** | Supplier name, SKU, and internal lead-time completely omitted from public API. | YES |
| **Draft / Archived Product Isolation** | Public endpoints enforce `status: "published"` and `del_flag: 0`. Requesting draft or archived slug returns 404. | YES |
| **Inactive Category Isolation** | Inactive (`isActive: false`) or deleted categories excluded from navigation and produce empty product results. | YES |
| **Input Clamping & Validation** | `limit` clamped between 1 and 50; `page` >= 1; numeric price bounds sanitized; invalid query params handled gracefully. | YES |
| **Denial of Service (DoS) Prevention** | Non-blocking view increments prevent DB lock contention on read paths. Deterministic sorting uses `_id` secondary key. | YES |
| **Admin Route Isolation** | Admin CRUD endpoints (`/shop/products/admin*`, `/shop/categories/admin*`) remain guarded by `AdminMiddleware`. | YES |

---

## 5. SEO & Performance Review

1. **Dynamic Metadata:**
   - Unique title and meta description generated for each product (`${product.name} — OpenIdear Shop`).
   - Storefront metadata customizes dynamically if filtered by category.
2. **Canonical URLs:**
   - Canonical URLs built from configured production domain (`NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL`) with fallback to `https://openidear.com`.
3. **Schema.org Structured Data:**
   - Injected on `/shop/[slug]` as `<script type="application/ld+json">`.
   - Accurate `Offer` mapping: `priceCurrency: "VND"`, `price: product.sellingPrice`, truthful `availability` (`https://schema.org/InStock`, `https://schema.org/PreOrder`, `https://schema.org/OutOfStock`).
   - **Zero fabricated claims:** No synthetic star ratings, fake review counts, or unverified delivery estimates.
4. **Sitemap Integration:**
   - Added `/shop` to static routes in `src/app/sitemap.ts`.
   - Dynamically fetches published products (`/shop/products?limit=50`) to generate individual product URLs with `daily` change frequency.
   - Drafts and archived products strictly excluded.
5. **Image Optimization:**
   - Next.js `<Image />` component utilized with responsive `sizes` attribute and aspect ratio containers.
   - Primary image fallback provided for items without uploaded photos.

---

## 6. Automated Verification & Test Results

### A. Backend Test Suite (`open-trash-tech-be`)
Executed Command: `npm test`
- **Existing Bunny & Sprint 4/5 Tests:** 28 passed, 0 failed.
- **Sprint S1 Admin RBAC Tests (`tests/adminAuthorization.test.js`):** 9 passed, 0 failed.
- **Sprint S1 Lifecycle Tests (`tests/shopProductLifecycle.test.js`):** 12 passed, 0 failed.
- **Sprint S2 Public API Tests (`tests/shopPublicApi.test.js`):** 8 passed, 0 failed.
  - Test 1: Public category listing strictly filters for active, non-deleted categories (`✓ PASSED`)
  - Test 2: Public product catalog completely redacts `supplierInfo` (`✓ PASSED`)
  - Test 3: Pagination limits strictly bounded to max 50 items (`✓ PASSED`)
  - Test 4: Sorting is deterministic with secondary `_id` tie-breaker (`✓ PASSED`)
  - Test 5: Price filter bounds are validated and non-numeric inputs ignored safely (`✓ PASSED`)
  - Test 6: Inactive or nonexistent category slug gracefully returns empty results (`✓ PASSED`)
  - Test 7: Slug lookup strictly prevents access to draft, archived, or soft-deleted products (`✓ PASSED`)
  - Test 8: View count increment is non-blocking and handles update errors silently (`✓ PASSED`)
- **Total Backend Tests:** **57 passed, 0 failed.**

### B. Frontend Verification (`open-trash-tech`)
1. **TypeScript Compilation:**
   - Command: `npx tsc --noEmit --skipLibCheck`
   - Result: **0 errors, exited with code 0.**
2. **ESLint Static Analysis:**
   - Command: `npx eslint src/features/shop/ src/app/\(marketing\)/shop/`
   - Result: **0 errors, 4 warnings (legacy admin `<img>` tags), exited with code 0.**
3. **Frontend Unit Tests:**
   - Command: `npm run test:shop`
   - Result:
     - `shopFoundation.test.ts`: 3 passed, 0 failed.
     - `shopCatalogAndSeo.test.ts`: 5 passed, 0 failed.
     - Total: **8 passed, 0 failed.**
4. **Live Browser Verification:**
   - URL: `http://localhost:3000/shop`
   - Verified: Header, category filters, price inputs, product cards, responsiveness, and dark mode palette.

---

## 7. Known Risks & Mitigations

| Risk | Impact | Mitigation Implemented |
| :--- | :--- | :--- |
| **Supplier Lead Time Uncertainty** | Customer expects immediate delivery for supplier-order products. | Product cards and detail pages prominently badge supplier orders with "Available on Order — Supplier fulfillment" and explain lead time. |
| **High Traffic on Product Slugs** | Synchronous DB writes causing view count lock contention. | Decoupled view increments into asynchronous, fire-and-forget background updates with silent error trapping. |
| **Deep-link to Draft Items** | Search engines or crawlers discovering unfinished products. | Public slug lookup strictly queries `status === "published"` and triggers Next.js `notFound()` (404 status). Sitemap filters out non-published items. |
| **Premature Checkout Complexity** | Users confused by lack of payment gateway. | Clean inquiry/consultation modal explicitly communicates catalog preview mode and manual order confirmation. |

---

## 8. Recommended Next Sprint: Sprint S3

With the public catalog and product detail foundation in place, the recommended scope for **Sprint S3** is:
1. **Manual Order Inquiry & Quote Workflow:**
   - Formalize the product inquiry submission into a persistent `ShopInquiry` or `ShopQuote` model.
   - Admin inbox in `/management` to inspect incoming hardware inquiries, assign staff, and generate quotes.
2. **Customer Order Confirmation Email:**
   - Automated notification email upon inquiry receipt with itemized hardware details.
3. **Content-to-Product Integration:**
   - Allow article authors in OpenIdear Editor to embed verified hardware cards into technical reviews and PC build guides.
