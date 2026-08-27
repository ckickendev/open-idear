// =============================================================================
//  SCHEMA.ORG MODULE — PUBLIC API
//  src/features/seo/schemas/index.ts
// =============================================================================

export { default as JsonLd } from "./JsonLd";
export type { JsonLdProps } from "./JsonLd";

export { buildArticleSchema } from "./buildArticleSchema";
export { buildTechArticleSchema, extractTechMetadata } from "./buildTechArticleSchema";
export type { TechMetadata } from "./buildTechArticleSchema";
export { buildBreadcrumbSchema } from "./buildBreadcrumbSchema";
export { buildFAQSchema } from "./buildFAQSchema";
export { getPostStructuredData } from "./getPostStructuredData";
export type { PostStructuredDataResult } from "./getPostStructuredData";

export type {
  SchemaAuthor,
  SchemaImage,
  SchemaBreadcrumbItem,
  SchemaFAQItem,
  PostSchemaInput,
  ArticleSchemaObject,
  TechArticleSchemaObject,
  BreadcrumbListSchemaObject,
  FAQPageSchemaObject,
} from "./types";
