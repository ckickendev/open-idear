// =============================================================================
//  OPENIDEAR SHOP — SEO & STRUCTURED DATA (SPRINT S2)
//  src/features/shop/seo/buildShopMetadata.ts
// =============================================================================

import type { Metadata } from "next";
import type { PublicShopProduct } from "../types/shop.types";

/**
 * Returns the canonical base URL of the site.
 */
export function getSiteUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && typeof envUrl === "string") {
    return envUrl.trim().replace(/\/+$/, "");
  }
  return "https://openidear.com";
}

/**
 * Sanitizes a URL path or slug to prevent double slashes.
 */
export function cleanSlug(slug: string): string {
  return slug.trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

/**
 * Builds metadata for the public shop storefront (/shop).
 */
export function buildStorefrontMetadata(categoryName?: string): Metadata {
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/shop`;

  const title = categoryName
    ? `${categoryName} — OpenIdear Shop | PC Hardware & Tech Catalog`
    : "OpenIdear Shop — Verified PC Hardware & Tech Catalog";

  const description =
    "Explore verified PC hardware, components, and workstations curated for creators and developers by the OpenIdear community.";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "OpenIdear",
      locale: "vi_VN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Builds metadata for a public product detail page (/shop/[slug]).
 */
export function buildProductDetailMetadata(product: PublicShopProduct): Metadata {
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/shop/${cleanSlug(product.slug)}`;

  const title = `${product.name} — OpenIdear Shop`;
  const description =
    product.summary ||
    `Specifications, pricing, and availability for ${product.name} (${product.sku}) on OpenIdear Shop.`;

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    undefined;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "OpenIdear",
      locale: "vi_VN",
      type: "website",
      images: primaryImage
        ? [
            {
              url: primaryImage,
              alt: product.name,
              width: 800,
              height: 600,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: primaryImage ? [primaryImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Maps OpenIdear availabilityStatus to Schema.org ItemAvailability URL.
 */
export function getSchemaAvailability(
  status: PublicShopProduct["availabilityStatus"],
  fulfillmentMode: PublicShopProduct["fulfillmentMode"]
): string {
  if (status === "in_stock" && fulfillmentMode === "stock") {
    return "https://schema.org/InStock";
  }
  if (status === "available_on_order" || fulfillmentMode === "supplier_order") {
    return "https://schema.org/PreOrder";
  }
  if (status === "out_of_stock") {
    return "https://schema.org/OutOfStock";
  }
  if (status === "discontinued") {
    return "https://schema.org/Discontinued";
  }
  return "https://schema.org/InStock";
}

/**
 * Generates Schema.org Product JSON-LD structured data with truthful offer claims.
 * Does NOT include fake ratings, review counts, or unverified shipping promises.
 */
export function getProductStructuredData(product: PublicShopProduct) {
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/shop/${cleanSlug(product.slug)}`;
  const images = product.images.map((img) => img.url).filter(Boolean);

  const availability = getSchemaAvailability(
    product.availabilityStatus,
    product.fulfillmentMode
  );

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.summary || product.name,
    image: images.length > 0 ? images : undefined,
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "VND",
      price: product.sellingPrice,
      availability,
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}
