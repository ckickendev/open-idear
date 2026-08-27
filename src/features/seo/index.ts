// =============================================================================
//  SEO FEATURE — PUBLIC API
//  src/features/seo/index.ts
// =============================================================================

export { buildPostMetadata, getSiteUrl, cleanSlug } from "./metadata";
export type { PostSEOInput } from "./metadata";

export {
  JsonLd,
  buildArticleSchema,
  buildTechArticleSchema,
  extractTechMetadata,
  buildBreadcrumbSchema,
  buildFAQSchema,
  getPostStructuredData,
} from "./schemas";

export type {
  JsonLdProps,
  TechMetadata,
  SchemaAuthor,
  SchemaImage,
  SchemaBreadcrumbItem,
  SchemaFAQItem,
  PostSchemaInput,
  ArticleSchemaObject,
  TechArticleSchemaObject,
  BreadcrumbListSchemaObject,
  FAQPageSchemaObject,
  PostStructuredDataResult,
} from "./schemas";
