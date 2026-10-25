// =============================================================================
//  OPENIDEAR SHOP — PRODUCT DETAIL PAGE (SPRINT S2)
//  src/app/(marketing)/shop/[slug]/page.tsx
// =============================================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchPublicProductBySlugServer } from "@/features/shop/api/shopPublic.api";
import {
  buildProductDetailMetadata,
  getProductStructuredData,
} from "@/features/shop/seo/buildShopMetadata";
import { ProductGallery } from "@/features/shop/components/detail/ProductGallery";
import { ProductSpecTable } from "@/features/shop/components/detail/ProductSpecTable";
import { ProductInquiryCard } from "@/features/shop/components/detail/ProductInquiryCard";
import { RelatedProducts } from "@/features/shop/components/detail/RelatedProducts";
import { ChevronRight, Home, Tag, Info } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchPublicProductBySlugServer(slug);

  if (!product || product.status !== "published") {
    return {
      title: "Product Not Found — OpenIdear Shop",
      robots: { index: false, follow: false },
    };
  }

  return buildProductDetailMetadata(product);
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchPublicProductBySlugServer(slug);

  if (!product || product.status !== "published") {
    notFound();
  }

  const structuredData = getProductStructuredData(product);

  return (
    <>
      {/* ─── Schema.org Product JSON-LD ──────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl space-y-10">
        {/* ─── Breadcrumb Navigation ─────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center text-xs text-muted-foreground gap-1.5 overflow-x-auto pb-1"
        >
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>

          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />

          <Link
            href="/shop"
            className="hover:text-foreground transition-colors font-medium"
          >
            Shop
          </Link>

          {product.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hover:text-foreground transition-colors max-w-[140px] truncate"
              >
                {product.category.name}
              </Link>
            </>
          )}

          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-[300px]">
            {product.name}
          </span>
        </nav>

        {/* ─── Top Section: Gallery + Product Info / Inquiry Card ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-5">
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Right Column: Title, Metadata, Price, Inquiry CTA (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {product.category && (
                  <Link
                    href={`/shop?category=${product.category.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                  >
                    <Tag className="h-3 w-3" />
                    <span>{product.category.name}</span>
                  </Link>
                )}

                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                  SKU: {product.sku}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                {product.name}
              </h1>

              {product.summary && (
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {product.summary}
                </p>
              )}
            </div>

            {/* Inquiry & Price Card */}
            <ProductInquiryCard product={product} />
          </div>
        </div>

        {/* ─── Bottom Section: Description & Technical Specifications ────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 border-t border-border/80">
          {/* Detailed Description */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Info className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Product Overview & Description
              </h2>
            </div>

            {product.description ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line space-y-4">
                {product.description}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No extended description has been published for this item. Please refer to the verified technical specifications below.
              </p>
            )}
          </div>

          {/* Technical Specifications */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Technical Specifications
              </h2>
            </div>

            <ProductSpecTable specifications={product.specifications} />
          </div>
        </div>

        {/* ─── Related Products ──────────────────────────────────────────── */}
        {product.category?.slug && (
          <RelatedProducts
            currentProductId={product._id}
            categorySlug={product.category.slug}
          />
        )}
      </div>
    </>
  );
}
