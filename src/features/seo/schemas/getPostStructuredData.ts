// =============================================================================
//  GET POST STRUCTURED DATA
//  src/features/seo/schemas/getPostStructuredData.ts
//
//  Pure server-side orchestrator that generates structured data schemas
//  (Article/TechArticle, BreadcrumbList, FAQPage) for an article page.
// =============================================================================

import { buildArticleSchema } from "./buildArticleSchema";
import { buildTechArticleSchema, extractTechMetadata } from "./buildTechArticleSchema";
import { buildBreadcrumbSchema } from "./buildBreadcrumbSchema";
import { buildFAQSchema } from "./buildFAQSchema";
import type {
  ArticleSchemaObject,
  BreadcrumbListSchemaObject,
  FAQPageSchemaObject,
  PostSchemaInput,
  TechArticleSchemaObject,
} from "./types";

export interface PostStructuredDataResult {
  /** Article or TechArticle schema object */
  article: ArticleSchemaObject | TechArticleSchemaObject;
  /** BreadcrumbList schema object */
  breadcrumb: BreadcrumbListSchemaObject;
  /** FAQPage schema object or null if no FAQ blocks exist */
  faq: FAQPageSchemaObject | null;
}

/**
 * Orchestrates server-side Schema.org generation for a post.
 * Determines whether to emit TechArticle or standard Article schema,
 * and attaches Breadcrumbs and FAQ schemas.
 *
 * @param post - Canonical post data.
 * @returns PostStructuredDataResult containing serializable schema objects.
 */
export function getPostStructuredData(post: PostSchemaInput): PostStructuredDataResult {
  const techMeta = extractTechMetadata(post);

  // Check if article is clearly technical (e.g. contains code blocks or technical metadata)
  const isTechnical = Boolean(
    techMeta.programmingLanguage ||
      techMeta.dependencies ||
      techMeta.proficiencyLevel ||
      techMeta.runtimePlatform
  );

  const articleSchema = isTechnical
    ? buildTechArticleSchema(post)
    : buildArticleSchema(post);

  const breadcrumbSchema = buildBreadcrumbSchema(post);
  const faqSchema = buildFAQSchema(post);

  return {
    article: articleSchema,
    breadcrumb: breadcrumbSchema,
    faq: faqSchema,
  };
}
