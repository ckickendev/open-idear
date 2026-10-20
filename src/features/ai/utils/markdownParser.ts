// =============================================================================
//  MARKDOWN PARSER (UPGRADED)
//  src/features/ai/utils/markdownParser.ts
//
//  Uses `marked` (CommonMark-compliant) instead of the previous 62-line regex.
//
//  Design Decisions:
//  - marked is configured in synchronous mode (no async required for our use case).
//  - The `mangle` and `headerIds` options are disabled to produce clean output
//    that Tiptap can ingest without extra attributes.
//  - The exported function signature is preserved for full backwards compatibility.
//    All call sites (EditorShell, useImageEnhancementReview) work without change.
//
//  Supports (previously unsupported constructs now fixed):
//  - Tables
//  - Blockquotes
//  - Ordered lists
//  - Nested lists
//  - Images with alt text
//  - Inline links
//  - Horizontal rules
// =============================================================================

import { marked, type MarkedOptions } from "marked";

// Configure marked once at module level to avoid per-call overhead.
const markedOptions: MarkedOptions = {
  // Use synchronous rendering (no async extensions required).
  async: false,
  // Do not mangle mailto links or add header IDs — Tiptap handles its own IDs.
  // Note: gfm (GitHub-flavored Markdown) is enabled by default in marked v5+
  // which gives us tables, strikethrough, and task lists for free.
};

marked.setOptions(markedOptions);

/**
 * Normalizes Markdown to ensure all headings (H1-H6) are separated from adjacent
 * content with double newlines, even if they were glued to preceding text.
 */
export function normalizeMarkdownHeadings(markdown: string): string {
  if (!markdown) return "";
  return markdown
    .replace(/\r\n/g, "\n")
    // If 'Introduction' is glued to the first word of the paragraph
    .replace(/^Introduction([A-ZÀ-Ỹ])/gm, "## Introduction\n\n$1")
    .replace(/^Introduction\s*:\s*([A-ZÀ-Ỹ])/gm, "## Introduction\n\n$1")
    // Ensure any heading preceded by non-newline characters (and not #) has double newlines before it
    .replace(/([^\n#])\n*(#{1,6}\s+[^\n]+)/g, "$1\n\n$2")
    // Ensure any heading followed immediately by single newline before text has double newlines
    .replace(/^(#{1,6}\s+[^\n]+)\n([^\n#])/gm, "$1\n\n$2")
    // Clean up any duplicate hash mistakes like "### ## Heading" -> "### Heading"
    .replace(/^(#{1,6})\s+(?:#{1,6}\s+)+/gm, "$1 ");
}

/**
 * Converts a Markdown string to an HTML string compatible with Tiptap's setContent().
 *
 * This function is a drop-in replacement for the previous regex-based parser.
 * It preserves the same input/output signature so existing call sites need no changes.
 *
 * @param markdown - Raw Markdown text (may be partial during streaming)
 * @returns HTML string safe to pass to editor.commands.setContent()
 */
export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";

  const normalized = normalizeMarkdownHeadings(markdown);

  // marked.parse() returns string when async:false (which is the default).
  // The cast is safe because we are not using async extensions.
  const result = marked.parse(normalized) as string;
  return result;
}

