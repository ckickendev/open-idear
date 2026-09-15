// =============================================================================
//  ARTICLE FEATURE — PUBLIC API
//  src/features/article/index.ts
// =============================================================================

export { default as ArticleRenderer } from "./components/ArticleRenderer";
export { default as HTMLRenderer } from "./components/HTMLRenderer";
export { default as ArticleCallout } from "./components/ArticleCallout";
export { default as ArticleCodeBlock } from "./components/ArticleCodeBlock";
export { default as ArticleComparisonTable } from "./components/ArticleComparisonTable";
export { default as ArticleFAQ } from "./components/ArticleFAQ";
export { default as ArticleCTA } from "./components/ArticleCTA";
export { default as ArticleQuote } from "./components/ArticleQuote";
export { default as EditorialLayout } from "./layout/EditorialLayout";
export { default as TableOfContents } from "./components/TableOfContents";
export { default as ReadingProgress } from "./components/ReadingProgress";
export { default as ArticleMeta } from "./components/ArticleMeta";
export type { ArticleMetaProps, ArticleMetaAuthor } from "./components/ArticleMeta";
export { buildTableOfContents } from "./utils/buildTableOfContents";
export type { TableOfContentsItem } from "./utils/buildTableOfContents";
export { calculateReadingTime } from "./utils/calculateReadingTime";
export type { ReadingTimeResult } from "./utils/calculateReadingTime";

export type {
  ArticleBlock,
  ArticleBlockType,
  ContentVersion,
  ArticleHero,
  ArticleAIContext,
  ArticleSEO,
  ParagraphBlock,
  HeadingBlock,
  ImageBlock,
  CodeBlock,
  CalloutBlock,
  CalloutVariant,
  ComparisonBlock,
  ComparisonRow,
  FAQBlock,
  FAQItem,
  CTABlock,
  CTAButton,
  CTAVariant,
  QuoteBlock,
  ListBlock,
  ListStyle,
} from "./types/article.types";
