// =============================================================================
//  BUILD TECH ARTICLE SCHEMA
//  src/features/seo/schemas/buildTechArticleSchema.ts
//
//  Pure server-side function generating Schema.org TechArticle JSON-LD object.
//  Includes technical metadata (programmingLanguage, dependencies, proficiencyLevel,
//  runtimePlatform) ONLY when real post data supports it — never fabricates fake data.
// =============================================================================

import { buildArticleSchema } from "./buildArticleSchema";
import type { PostSchemaInput, TechArticleSchemaObject } from "./types";

/**
 * Normalization helper for technical article metadata.
 * Extracts programming languages from CodeBlock elements or explicit props,
 * plus optional technical metadata fields.
 */
export interface TechMetadata {
  programmingLanguage?: string;
  dependencies?: string;
  proficiencyLevel?: string;
  runtimePlatform?: string;
}

export function extractTechMetadata(post: PostSchemaInput): TechMetadata {
  const result: TechMetadata = {};

  // 1. Extract programming languages from code blocks if available
  if (Array.isArray(post.blocks)) {
    const languages = new Set<string>();
    for (const block of post.blocks) {
      if (block.type === "code" && block.language?.trim()) {
        languages.add(block.language.trim());
      }
    }
    if (languages.size > 0) {
      result.programmingLanguage = Array.from(languages).join(", ");
    }
  } else if (post.programmingLanguage?.trim()) {
    result.programmingLanguage = post.programmingLanguage.trim();
  }

  // 2. Dependencies
  if (Array.isArray(post.dependencies) && post.dependencies.length > 0) {
    const validDeps = post.dependencies.filter(
      (d): d is string => Boolean(d && d.trim())
    );
    if (validDeps.length > 0) {
      result.dependencies = validDeps.join(", ");
    }
  } else if (typeof post.dependencies === "string" && post.dependencies.trim()) {
    result.dependencies = post.dependencies.trim();
  }

  // 3. Proficiency Level
  if (post.proficiencyLevel?.trim()) {
    result.proficiencyLevel = post.proficiencyLevel.trim();
  }

  // 4. Runtime Platform
  if (post.runtimePlatform?.trim()) {
    result.runtimePlatform = post.runtimePlatform.trim();
  }

  return result;
}

/**
 * Builds a Schema.org TechArticle JSON-LD object for technical content.
 * Extends Article with TechArticle type and technical metadata fields.
 *
 * @param post - Canonical post data.
 * @returns Serializable TechArticleSchemaObject without null/undefined/empty fields.
 */
export function buildTechArticleSchema(post: PostSchemaInput): TechArticleSchemaObject {
  const baseArticle = buildArticleSchema(post);
  const techMeta = extractTechMetadata(post);

  const schema: TechArticleSchemaObject = {
    ...baseArticle,
    "@type": "TechArticle",
  };

  if (techMeta.programmingLanguage) {
    schema.programmingLanguage = techMeta.programmingLanguage;
  }

  if (techMeta.dependencies) {
    schema.dependencies = techMeta.dependencies;
  }

  if (techMeta.proficiencyLevel) {
    schema.proficiencyLevel = techMeta.proficiencyLevel;
  }

  if (techMeta.runtimePlatform) {
    schema.runtimePlatform = techMeta.runtimePlatform;
  }

  return schema;
}
