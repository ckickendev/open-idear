// =============================================================================
//  BUILD ARTICLE SCHEMA
//  src/features/seo/schemas/buildArticleSchema.ts
//
//  Pure server-side function generating Schema.org Article JSON-LD object.
//  Reuses getSiteUrl() helper from metadata layer.
//  Never emits null, undefined, or empty arrays.
// =============================================================================

import { getSiteUrl, cleanSlug } from "../metadata";
import type { ArticleSchemaObject, PostSchemaInput, SchemaOrgPerson } from "./types";

/**
 * Builds a valid Schema.org Article JSON-LD object for an article post.
 *
 * @param post - Canonical post data.
 * @returns Serializable ArticleSchemaObject without null/undefined fields or empty arrays.
 */
export function buildArticleSchema(post: PostSchemaInput): ArticleSchemaObject {
  const siteUrl = getSiteUrl();

  const canonicalUrl =
    post.seo?.canonicalUrl?.trim() || `${siteUrl}/post/${cleanSlug(post.slug)}`;

  const headline = post.seo?.metaTitle?.trim() || post.title.trim();

  const description =
    post.seo?.metaDescription?.trim() ||
    post.description?.trim() ||
    `Read "${post.title}" on OpenIdear — technology knowledge-sharing platform.`;

  // Author details
  let authorObj: SchemaOrgPerson | undefined;
  if (post.author) {
    if (typeof post.author === "string" && post.author.trim()) {
      authorObj = {
        "@type": "Person",
        name: post.author.trim(),
      };
    } else if (typeof post.author === "object" && post.author.name?.trim()) {
      const avatar = post.author.avatarUrl || post.author.avatar;
      authorObj = {
        "@type": "Person",
        name: post.author.name.trim(),
        ...(post.author.url?.trim() ? { url: post.author.url.trim() } : {}),
        ...(avatar?.trim() ? { image: avatar.trim() } : {}),
      };
    }
  }

  // Category / section
  const section =
    typeof post.category === "string"
      ? post.category.trim()
      : post.category?.name?.trim();

  // Tags / keywords as string array
  const rawKeywords =
    Array.isArray(post.tags) && post.tags.length > 0
      ? post.tags
      : post.seo?.keywords && post.seo.keywords.length > 0
      ? post.seo.keywords
      : null;

  const validKeywords = rawKeywords
    ? rawKeywords.filter((k): k is string => Boolean(k && k.trim()))
    : [];

  // Image URLs as array
  const imageUrl = post.image?.url?.trim();
  const validImages = imageUrl ? [imageUrl] : [];

  // Base Schema Object
  const schema: ArticleSchemaObject = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "OpenIdear",
      url: siteUrl,
    },
  };

  // Attach datePublished if available
  if (post.createdAt?.trim()) {
    schema.datePublished = post.createdAt.trim();
  }

  // Attach dateModified ONLY when available and different from datePublished
  if (
    post.updatedAt?.trim() &&
    post.updatedAt.trim() !== post.createdAt?.trim()
  ) {
    schema.dateModified = post.updatedAt.trim();
  }

  // Attach author if available
  if (authorObj) {
    schema.author = authorObj;
  }

  // Attach image array ONLY when non-empty
  if (validImages.length > 0) {
    schema.image = validImages;
  }

  // Attach keywords array ONLY when non-empty
  if (validKeywords.length > 0) {
    schema.keywords = validKeywords;
  }

  // Attach articleSection ONLY when non-empty
  if (section && section.length > 0) {
    schema.articleSection = section;
  }

  return schema;
}
