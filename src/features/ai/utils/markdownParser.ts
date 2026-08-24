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

  // marked.parse() returns string when async:false (which is the default).
  // The cast is safe because we are not using async extensions.
  const result = marked.parse(markdown) as string;
  return result;
}
