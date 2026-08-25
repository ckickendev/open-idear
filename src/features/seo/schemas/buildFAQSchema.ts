// =============================================================================
//  BUILD FAQ SCHEMA
//  src/features/seo/schemas/buildFAQSchema.ts
//
//  Pure server-side function generating Schema.org FAQPage JSON-LD object.
//  Extracts FAQ items from post.faqItems or FAQ block types in post.blocks.
//  Returns null if no FAQ items exist.
// =============================================================================

import type { FAQBlock } from "@/features/article/types/article.types";
import type { FAQPageSchemaObject, FAQQuestionSchemaObject, PostSchemaInput, SchemaFAQItem } from "./types";

/**
 * Builds a Schema.org FAQPage JSON-LD object for an article.
 * Extracts questions and answers from post.faqItems or structured blocks.
 *
 * @param post - Canonical post data.
 * @returns FAQPageSchemaObject or null if no FAQ items exist.
 */
export function buildFAQSchema(post: PostSchemaInput): FAQPageSchemaObject | null {
  const faqItems: SchemaFAQItem[] = [];

  // 1. Check explicit faqItems input array
  if (Array.isArray(post.faqItems) && post.faqItems.length > 0) {
    for (const item of post.faqItems) {
      if (item.question?.trim() && item.answer?.trim()) {
        faqItems.push({
          question: item.question.trim(),
          answer: item.answer.trim(),
        });
      }
    }
  }

  // 2. Check structured blocks for type "faq"
  if (faqItems.length === 0 && Array.isArray(post.blocks)) {
    for (const block of post.blocks) {
      if (block.type === "faq" && Array.isArray((block as FAQBlock).items)) {
        const faqBlock = block as FAQBlock;
        for (const item of faqBlock.items) {
          if (item.question?.trim() && item.answer?.trim()) {
            faqItems.push({
              question: item.question.trim(),
              answer: item.answer.trim(),
            });
          }
        }
      }
    }
  }

  if (faqItems.length === 0) {
    return null;
  }

  const mainEntity: FAQQuestionSchemaObject[] = faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}
