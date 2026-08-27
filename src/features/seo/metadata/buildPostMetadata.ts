// =============================================================================
//  BUILD POST METADATA
//  src/features/seo/metadata/buildPostMetadata.ts
//
//  Server-side metadata generator for Next.js App Router.
//  Generates canonical SEO, OpenGraph, Twitter/X cards, and robots config
//  from canonical post data. Pure utility with zero browser API dependencies.
// =============================================================================

import type { Metadata } from "next";

// ─── Site URL Helper ─────────────────────────────────────────────────────────

/**
 * Returns the canonical base URL of the site.
 * Reads NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_SITE_URL environment variables,
 * trimming trailing slashes, and falls back to "https://openidear.com".
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
 * Sanitizes a URL path or slug to prevent double slashes when joining with siteUrl.
 */
export function cleanSlug(slug: string): string {
  return slug.trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

// ─── Post SEO Input Interface ────────────────────────────────────────────────

export interface PostSEOInput {
  title: string;
  slug: string;
  description?: string | null;
  author?:
    | string
    | {
        username?: string;
        name?: string;
      }
    | null;
  category?:
    | string
    | {
        name?: string;
        slug?: string;
      }
    | null;
  image?: {
    url?: string;
    description?: string;
  } | null;
  tags?: string[] | null;
  published?: boolean;
  status?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    keywords?: string[] | null;
    canonicalUrl?: string | null;
  } | null;
}

// ─── Helper Utilities ────────────────────────────────────────────────────────

function extractAuthorName(author: PostSEOInput["author"]): string | undefined {
  if (!author) return undefined;
  if (typeof author === "string") return author;
  return author.name || author.username || undefined;
}

function extractCategoryName(category: PostSEOInput["category"]): string | undefined {
  if (!category) return undefined;
  if (typeof category === "string") return category;
  return category.name || undefined;
}

// ─── Main Metadata Builder ───────────────────────────────────────────────────

/**
 * Builds Next.js Metadata for an article page.
 *
 * @param post - Canonical post data from backend.
 * @returns Complete Next.js Metadata object.
 */
export function buildPostMetadata(post: PostSEOInput): Metadata {
  const siteUrl = getSiteUrl();

  // Title fallback
  const metaTitle = post.seo?.metaTitle?.trim() || post.title.trim();

  // Description fallback — guaranteed string, never undefined or empty
  const metaDescription =
    post.seo?.metaDescription?.trim() ||
    post.description?.trim() ||
    `Read "${post.title}" on OpenIdear — technology knowledge-sharing platform.`;

  // Canonical URL construction
  const canonicalUrl =
    post.seo?.canonicalUrl?.trim() || `${siteUrl}/post/${cleanSlug(post.slug)}`;

  // Robots indexing rules: published must be explicitly true or not draft/private
  const isDraft =
    post.published === false ||
    post.status === "draft" ||
    post.status === "private" ||
    post.status === "unpublished";

  const robots = isDraft
    ? { index: false, follow: false }
    : { index: true, follow: true };

  // Metadata details
  const authorName = extractAuthorName(post.author);
  const categoryName = extractCategoryName(post.category);
  const validTags = Array.isArray(post.tags)
    ? post.tags.filter((t): t is string => Boolean(t && t.trim()))
    : undefined;

  const imageUrl = post.image?.url?.trim() || undefined;

  // Published & modified dates (ISO format for OpenGraph)
  const publishedTime = post.createdAt ? post.createdAt : undefined;
  const modifiedTime =
    post.updatedAt && post.updatedAt !== post.createdAt
      ? post.updatedAt
      : undefined;

  // Build OpenGraph image array
  const ogImages = imageUrl
    ? [
        {
          url: imageUrl,
          alt: post.image?.description?.trim() || metaTitle,
        },
      ]
    : undefined;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    robots,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: "OpenIdear",
      type: "article",
      publishedTime,
      modifiedTime,
      authors: authorName ? [authorName] : undefined,
      section: categoryName,
      tags: validTags && validTags.length > 0 ? validTags : undefined,
      images: ogImages,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: metaTitle,
      description: metaDescription,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}
