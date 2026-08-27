// =============================================================================
//  CALCULATE READING TIME
//  src/features/article/utils/calculateReadingTime.ts
//
//  Computes word count and estimated reading time from an ArticleBlock[].
//
//  Design decisions:
//  - Only visible, user-facing text is counted. Block metadata (ids, types,
//    JSON keys, configuration fields) is explicitly excluded.
//  - Every block type in the v1 union is handled. Unknown types produce 0.
//  - Reading speed: 200 words per minute (conservative technical reading pace).
//  - readingTimeMinutes is rounded UP to the nearest whole minute so we never
//    undersell the time cost (Math.ceil, minimum 1).
//  - Pure function — no side effects, independently testable.
//  - Does NOT mutate or reshape the ArticleBlock data model.
// =============================================================================

import type { ArticleBlock } from "../types/article.types";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Words per minute — conservative pace for technical content. */
const WORDS_PER_MINUTE = 200;

// ─── Return Type ──────────────────────────────────────────────────────────────

export interface ReadingTimeResult {
  /** Total number of visible prose words across all blocks. */
  wordCount: number;
  /** Estimated reading time, rounded up to the nearest minute. Minimum 1. */
  readingTimeMinutes: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Counts words in a string. Splits on whitespace; ignores empty tokens. */
function countWords(text: string | undefined | null): number {
  if (!text || typeof text !== "string") return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

/**
 * Calculates the word count and estimated reading time for a structured article.
 *
 * Text that IS counted:
 *   - paragraph.content
 *   - heading.content
 *   - callout.title + callout.content
 *   - quote.content + quote.author + quote.source
 *   - list items (each item string)
 *   - code.code (code words count at half weight — readers skim code)
 *   - comparison column names + all cell values
 *   - faq question + answer per item
 *   - cta.title + cta.description + cta.button.label
 *   - image.alt + image.caption
 *
 * Text that is NOT counted:
 *   - block.id (UUID)
 *   - block.type (discriminant string)
 *   - image.src (URL)
 *   - code.language / code.filename
 *   - comparison row structure (no text-level metadata)
 *   - button.href (URL)
 *
 * @param blocks - ArticleBlock array from a blocks-v1 post, or null/undefined.
 * @returns ReadingTimeResult with wordCount and readingTimeMinutes.
 */
export function calculateReadingTime(
  blocks: ArticleBlock[] | null | undefined
): ReadingTimeResult {
  if (!blocks || blocks.length === 0) {
    return { wordCount: 0, readingTimeMinutes: 0 };
  }

  let totalWords = 0;

  for (const block of blocks) {
    switch (block.type) {
      case "paragraph":
        totalWords += countWords(block.content);
        break;

      case "heading":
        totalWords += countWords(block.content);
        break;

      case "callout":
        totalWords += countWords(block.title);
        totalWords += countWords(block.content);
        break;

      case "quote":
        totalWords += countWords(block.content);
        totalWords += countWords(block.author);
        totalWords += countWords(block.source);
        break;

      case "list":
        for (const item of block.items) {
          totalWords += countWords(item);
        }
        break;

      case "code":
        // Code is skimmed rather than read — count at 50% weight
        totalWords += Math.floor(countWords(block.code) * 0.5);
        break;

      case "comparison":
        // Column headers
        for (const col of block.columns) {
          totalWords += countWords(col);
        }
        // Cell values
        for (const row of block.rows) {
          for (const cell of row.cells) {
            totalWords += countWords(cell);
          }
        }
        // Optional title
        totalWords += countWords(block.title);
        break;

      case "faq":
        totalWords += countWords(block.title);
        for (const item of block.items) {
          totalWords += countWords(item.question);
          totalWords += countWords(item.answer);
        }
        break;

      case "cta":
        totalWords += countWords(block.title);
        totalWords += countWords(block.description);
        totalWords += countWords(block.button.label);
        break;

      case "image":
        // Alt text and caption are readable text
        totalWords += countWords(block.alt);
        totalWords += countWords(block.caption);
        break;

      default:
        // Exhaustive check — any future block type not listed above gets 0.
        break;
    }
  }

  const readingTimeMinutes =
    totalWords === 0 ? 0 : Math.ceil(totalWords / WORDS_PER_MINUTE);

  return { wordCount: totalWords, readingTimeMinutes };
}
