// =============================================================================
//  BUILD TABLE OF CONTENTS
//  src/features/article/utils/buildTableOfContents.ts
//
//  Extracts H2/H3 heading blocks from ArticleBlock[] and produces a normalized
//  list of TOC items whose IDs exactly match the rendered DOM ids produced by
//  ArticleRenderer's ArticleHeading component.
//
//  ID CONTRACT (critical — must stay in sync with ArticleRenderer):
//  ─────────────────────────────────────────────────────────────────
//  ArticleRenderer renders heading DOM elements with:
//    id="block-{block.id}"
//
//  This utility produces TOC item ids that are the SAME string:
//    id = "block-" + block.id        (e.g. "block-a3f2…")
//
//  The `text` field is used only for display; slugification is NOT used
//  for id generation because the heading's DOM id is already stable (UUID).
//
//  Duplicate label handling:
//  ─────────────────────────
//  Because ids come from UUIDs they are inherently unique.
//  The displayText is deduplicated only for the `text` field (no impact on ids).
//
//  Usage:
//    import { buildTableOfContents } from "@/features/article/utils/buildTableOfContents";
//    const tocItems = buildTableOfContents(blocks);
// =============================================================================

import type { ArticleBlock } from "../types/article.types";

// ─── Public Types ─────────────────────────────────────────────────────────────

/**
 * A single item in the Table of Contents.
 *
 * `id` matches the DOM element id rendered by ArticleRenderer for heading blocks:
 *   DOM element: <h2 id="block-{block.id}">
 *   This field:  id = "block-{block.id}"
 */
export interface TableOfContentsItem {
  /** DOM id of the target heading element. Format: "block-{uuid}" */
  id: string;
  /** Human-readable heading text. */
  text: string;
  /** 2 = H2 (major section), 3 = H3 (sub-section). H1 is never included. */
  level: 2 | 3;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Extracts H2 and H3 heading blocks from an ArticleBlock array and returns
 * an ordered array of TableOfContentsItems.
 *
 * Returns an empty array if:
 * - blocks is null/undefined/empty
 * - blocks contains no heading blocks
 * - all heading blocks are level 1 (H1 is excluded by design)
 *
 * @param blocks - The ArticleBlock array from a blocks-v1 post.
 */
export function buildTableOfContents(
  blocks: ArticleBlock[] | null | undefined
): TableOfContentsItem[] {
  if (!blocks || blocks.length === 0) return [];

  const items: TableOfContentsItem[] = [];

  for (const block of blocks) {
    if (block.type !== "heading") continue;
    // Only H2 and H3; H1 is reserved for the article title
    if (block.level !== 2 && block.level !== 3) continue;

    items.push({
      // ID must match the rendered DOM id: ArticleRenderer uses `id="block-${block.id}"`
      id: `block-${block.id}`,
      text: block.content,
      level: block.level,
    });
  }

  return items;
}
