// =============================================================================
//  SCHEMA.ORG TYPES
//  src/features/seo/schemas/types.ts
//
//  Shared Schema.org TypeScript interfaces and input types for OpenIdear.
//  Strictly typed without `any`. Uses pure server-side data representation.
// =============================================================================

import type { ArticleBlock } from "@/features/article/types/article.types";

// ─── Input Types ─────────────────────────────────────────────────────────────

export interface SchemaAuthor {
  name: string;
  url?: string;
  avatarUrl?: string;
  avatar?: string;
  role?: string;
}

export interface SchemaImage {
  url: string;
  description?: string;
  width?: number;
  height?: number;
}

export interface SchemaBreadcrumbItem {
  position: number;
  name: string;
  item: string;
}

export interface SchemaFAQItem {
  question: string;
  answer: string;
}

/**
 * Universal input interface for Schema.org builders.
 * Compatible with post data from API endpoints and PostSEOInput.
 */
export interface PostSchemaInput {
  title: string;
  slug: string;
  description?: string | null;
  author?:
    | string
    | SchemaAuthor
    | {
        username?: string;
        name?: string;
        avatar?: string;
        avatarUrl?: string;
        url?: string;
      }
    | null;
  category?:
    | string
    | {
        name?: string;
        slug?: string;
      }
    | null;
  image?:
    | SchemaImage
    | {
        url?: string;
        description?: string;
        width?: number;
        height?: number;
      }
    | null;
  tags?: string[] | null;
  published?: boolean;
  status?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  blocks?: ArticleBlock[] | null;
  faqItems?: SchemaFAQItem[] | null;

  /** Optional technical metadata for TechArticle */
  dependencies?: string[] | string | null;
  proficiencyLevel?: string | null;
  programmingLanguage?: string | null;
  runtimePlatform?: string | null;

  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    keywords?: string[] | null;
    canonicalUrl?: string | null;
  } | null;
}

// ─── Schema.org Output Objects ───────────────────────────────────────────────

export interface SchemaOrgPublisher {
  "@type": "Organization";
  name: string;
  url: string;
  logo?: {
    "@type": "ImageObject";
    url: string;
  };
}

export interface SchemaOrgPerson {
  "@type": "Person";
  name: string;
  url?: string;
  image?: string;
}

export interface SchemaOrgImageObject {
  "@type": "ImageObject";
  url: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface SchemaOrgWebPage {
  "@type": "WebPage";
  "@id": string;
}

export interface ArticleSchemaObject {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  description: string;
  url: string;
  mainEntityOfPage: SchemaOrgWebPage;
  publisher: SchemaOrgPublisher;
  datePublished?: string;
  dateModified?: string;
  author?: SchemaOrgPerson;
  image?: string[];
  keywords?: string[];
  articleSection?: string;
}

export interface TechArticleSchemaObject {
  "@context": "https://schema.org";
  "@type": "TechArticle";
  headline: string;
  description: string;
  url: string;
  mainEntityOfPage: SchemaOrgWebPage;
  publisher: SchemaOrgPublisher;
  datePublished?: string;
  dateModified?: string;
  author?: SchemaOrgPerson;
  image?: string[];
  keywords?: string[];
  articleSection?: string;
  dependencies?: string;
  proficiencyLevel?: string;
  programmingLanguage?: string;
  runtimePlatform?: string;
}

export interface ListItemSchemaObject {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
}

export interface BreadcrumbListSchemaObject {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: ListItemSchemaObject[];
}

export interface FAQQuestionSchemaObject {
  "@type": "Question";
  name: string;
  acceptedAnswer: {
    "@type": "Answer";
    text: string;
  };
}

export interface FAQPageSchemaObject {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: FAQQuestionSchemaObject[];
}
