// =============================================================================
//  OPENIDEAR SHOP — PUBLIC STOREFRONT PAGE (SPRINT S2)
//  src/app/(marketing)/shop/page.tsx
// =============================================================================

import { Suspense } from "react";
import type { Metadata } from "next";
import {
  fetchPublicCategoriesServer,
  fetchPublicProductsServer,
} from "@/features/shop/api/shopPublic.api";
import { buildStorefrontMetadata } from "@/features/shop/seo/buildShopMetadata";
import { StorefrontCatalog } from "@/features/shop/components/catalog/StorefrontCatalog";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const { category } = await searchParams;
  return buildStorefrontMetadata(category);
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    category?: string;
    fulfillmentMode?: "stock" | "supplier_order";
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    sort?: "newest" | "price_asc" | "price_desc" | "popular";
  }>;
}) {
  const params = await searchParams;

  const page = parseInt(params.page || "1", 10) || 1;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;

  const [categories, productData] = await Promise.all([
    fetchPublicCategoriesServer(),
    fetchPublicProductsServer({
      page,
      limit: 20,
      category: params.category,
      fulfillmentMode: params.fulfillmentMode,
      minPrice,
      maxPrice,
      search: params.search,
      sort: params.sort,
    }),
  ]);

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <StorefrontCatalog
        initialCategories={categories}
        initialProducts={productData.products}
        initialPagination={productData.pagination}
        initialError={productData.error || null}
      />
    </Suspense>
  );
}
