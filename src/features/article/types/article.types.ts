// =============================================================================
//  ARTICLE BLOCK TYPES
//  src/features/article/types/article.types.ts
//
//  Defines the discriminated union of all v1 ArticleBlock types.
//
//  Design Decisions:
//  - Every block extends BaseBlock with a stable `id` and a `type` literal.
//  - The discriminated union allows the renderer to narrow block types safely.
//  - Schema is v1 only — do not add block types without a Sprint approval.
//  - Mirror fields exist on the backend Post schema (blocks: Mixed[]) for storage.
// =============================================================================

// ─── Base ─────────────────────────────────────────────────────────────────────

export interface BaseBlock {
  /** Stable UUID assigned at block creation time. Never mutated. */
  id: string;
  /** The discriminant field used for type narrowing. */
  type: string;
}

// ─── Paragraph ────────────────────────────────────────────────────────────────

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  /** HTML-escaped paragraph text. May contain inline bold/italic markup. */
  content: string;
}

// ─── Heading ──────────────────────────────────────────────────────────────────

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  /** H2 or H3 only in v1. H1 is reserved for the article title. */
  level: 2 | 3;
  content: string;
}

// ─── Image ────────────────────────────────────────────────────────────────────

export interface ImageBlock extends BaseBlock {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

// ─── Code ─────────────────────────────────────────────────────────────────────

export interface CodeBlock extends BaseBlock {
  type: "code";
  /** Programming language identifier for syntax highlighting (e.g. "typescript") */
  language?: string;
  code: string;
  /** Optional filename displayed above the code block */
  filename?: string;
}

// ─── Callout ──────────────────────────────────────────────────────────────────

export type CalloutVariant = "info" | "tip" | "warning" | "caution";

export interface CalloutBlock extends BaseBlock {
  type: "callout";
  variant: CalloutVariant;
  title?: string;
  content: string;
}

// ─── Comparison ───────────────────────────────────────────────────────────────

export interface ComparisonRow {
  cells: string[];
}

export interface ComparisonBlock extends BaseBlock {
  type: "comparison";
  title?: string;
  columns: string[];
  rows: ComparisonRow[];
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQBlock extends BaseBlock {
  type: "faq";
  title?: string;
  items: FAQItem[];
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

export interface CTAButton {
  label: string;
  href: string;
}

export type CTAVariant = "primary" | "secondary";

export interface CTABlock extends BaseBlock {
  type: "cta";
  title: string;
  description?: string;
  button: CTAButton;
  variant?: CTAVariant;
}

// ─── Quote ────────────────────────────────────────────────────────────────────

export interface QuoteBlock extends BaseBlock {
  type: "quote";
  content: string;
  author?: string;
  source?: string;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export type ListStyle = "unordered" | "ordered";

export interface ListBlock extends BaseBlock {
  type: "list";
  style: ListStyle;
  items: string[];
}

// ─── Discriminated Union ──────────────────────────────────────────────────────

/**
 * The complete v1 ArticleBlock discriminated union.
 * Add new block types here only via approved Sprint changes.
 */
export type ArticleBlock =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | CodeBlock
  | CalloutBlock
  | ComparisonBlock
  | FAQBlock
  | CTABlock
  | QuoteBlock
  | ListBlock;

/** All valid block type string literals. Derived from the union for runtime checks. */
export type ArticleBlockType = ArticleBlock["type"];

// ─── Content Version ──────────────────────────────────────────────────────────

/**
 * Identifies the content format of a post.
 * - "html-v1"    : legacy — content stored as HTML string in post.content
 * - "blocks-v1"  : structured — content stored as ArticleBlock[] in post.blocks
 */
export type ContentVersion = "html-v1" | "blocks-v1";

// ─── Extended Post Types ──────────────────────────────────────────────────────

/** Hero section metadata for structured articles. */
export interface ArticleHero {
  title: string;
  subtitle?: string;
  image?: {
    src: string;
    alt: string;
  };
  category?: string;
  readingTime?: number;
}

/** Persisted AI context alongside the post. */
export interface ArticleAIContext {
  plannerOutput?: unknown;
  writerOutput?: {
    wordCount?: number;
    estimatedReadingTime?: number;
  };
  growthResults?: unknown;
  generation?: {
    model?: string;
    generatedAt?: string;
  };
}

/** SEO metadata for structured articles. */
export interface ArticleSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  schemaOrg?: {
    article?: Record<string, unknown>;
    faqPage?: Record<string, unknown>;
  };
}
