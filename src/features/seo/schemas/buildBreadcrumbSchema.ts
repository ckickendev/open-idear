// =============================================================================
//  BUILD BREADCRUMB SCHEMA
//  src/features/seo/schemas/buildBreadcrumbSchema.ts
//
//  Pure server-side function generating Schema.org BreadcrumbList JSON-LD object.
// =============================================================================

import { getSiteUrl, cleanSlug } from "../metadata";
import type { BreadcrumbListSchemaObject, ListItemSchemaObject, PostSchemaInput } from "./types";

/**
 * Builds a Schema.org BreadcrumbList JSON-LD object for an article page.
 * Includes Home → [Category] → Article navigation hierarchy.
 *
 * @param post - Canonical post data.
 * @returns Serializable BreadcrumbListSchemaObject.
 */
export function buildBreadcrumbSchema(post: PostSchemaInput): BreadcrumbListSchemaObject {
  const siteUrl = getSiteUrl();
  const canonicalUrl =
    post.seo?.canonicalUrl?.trim() || `${siteUrl}/post/${cleanSlug(post.slug)}`;

  const items: ListItemSchemaObject[] = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl,
    },
  ];

  let currentPosition = 2;

  // Add Category breadcrumb item if available
  if (post.category) {
    let catName: string | undefined;
    let catSlug: string | undefined;

    if (typeof post.category === "string" && post.category.trim()) {
      catName = post.category.trim();
      catSlug = cleanSlug(post.category.trim().toLowerCase().replace(/\s+/g, "-"));
    } else if (typeof post.category === "object" && post.category.name?.trim()) {
      catName = post.category.name.trim();
      const rawSlug = post.category.slug?.trim() || catName.toLowerCase().replace(/\s+/g, "-");
      catSlug = cleanSlug(rawSlug);
    }

    if (catName && catSlug) {
      items.push({
        "@type": "ListItem",
        position: currentPosition,
        name: catName,
        item: `${siteUrl}/category/${catSlug}`,
      });
      currentPosition += 1;
    }
  }

  // Article breadcrumb item
  items.push({
    "@type": "ListItem",
    position: currentPosition,
    name: post.seo?.metaTitle?.trim() || post.title.trim(),
    item: canonicalUrl,
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}
