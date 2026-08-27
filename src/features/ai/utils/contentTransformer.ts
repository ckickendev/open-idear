// =============================================================================
//  CONTENT TRANSFORMER
//  src/features/ai/utils/contentTransformer.ts
//
//  Thin abstraction over the Markdown → editor HTML conversion.
//
//  Design Decisions:
//  - Extracts the parser responsibility from EditorShell.tsx so the parser
//    implementation can be swapped without modifying the editor.
//  - Deliberately kept small — this is not a plugin framework.
//  - EditorShell should use `toEditorHtml()` instead of calling
//    `parseMarkdownToHtml()` directly.
//  - `parseMarkdownToHtml` remains the single implementation; this module
//    is just the indirection layer.
// =============================================================================

import { parseMarkdownToHtml } from "./markdownParser";

/**
 * Converts raw Markdown text to HTML suitable for Tiptap's `setContent()`.
 *
 * This is the public surface that EditorShell and other editor consumers
 * should call. Changing the underlying parser is a one-line change here,
 * rather than a change across every consumer.
 *
 * @param markdown - Raw Markdown string (partial during SSE streaming is fine)
 * @returns HTML string ready for `editor.commands.setContent(html)`
 */
export function toEditorHtml(markdown: string): string {
  return parseMarkdownToHtml(markdown);
}
