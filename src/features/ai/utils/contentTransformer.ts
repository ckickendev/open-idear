// =============================================================================
//  CONTENT TRANSFORMER
//  src/features/ai/utils/contentTransformer.ts
//
//  Thin abstraction over the Markdown → editor HTML conversion.
//  Injects AI Image Placeholder metadata into the DOM for Tiptap consumption.
// =============================================================================

import { parseMarkdownToHtml } from "./markdownParser";
import type { ImageSuggestion, VisualSuggestion } from "@/features/ai-visual/types/aiVisual.types";

function escapeHtmlAttr(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Injects `<div data-type="image-placeholder" ...></div>` nodes immediately following
 * matching H2/H3 headings in the generated HTML.
 * Skips suggestions where visualType is "none".
 */
export function injectImagePlaceholders(
  html: string,
  suggestions?: (ImageSuggestion | VisualSuggestion)[]
): string {
  if (!html || !suggestions || suggestions.length === 0) {
    return html;
  }

  let result = html;
  for (const suggestion of suggestions) {
    const anySugg = suggestion as any;
    // Skip if visualType is explicitly 'none'
    if (anySugg.visualType === "none") {
      continue;
    }

    const heading = anySugg.target || anySugg.heading;
    if (!heading) continue;

    const headingAttr = escapeHtmlAttr(heading);
    const queryAttr = escapeHtmlAttr(anySugg.searchQuery || heading);
    const promptAttr = escapeHtmlAttr(anySugg.imagePrompt || "");
    const altAttr = escapeHtmlAttr(anySugg.altText || anySugg.alt || heading);
    const idAttr = anySugg.id ? ` data-id="${escapeHtmlAttr(anySugg.id)}"` : "";
    const visualTypeAttr = anySugg.visualType ? ` data-visual-type="${escapeHtmlAttr(anySugg.visualType)}"` : "";
    const confidenceAttr = anySugg.confidence !== undefined ? ` data-confidence="${anySugg.confidence}"` : "";
    const reasonAttr = anySugg.reason ? ` data-reason="${escapeHtmlAttr(anySugg.reason)}"` : "";
    const actionAttr = anySugg.recommendedAction ? ` data-recommended-action="${escapeHtmlAttr(anySugg.recommendedAction)}"` : "";

    const placeholderHtml = `<div data-type="image-placeholder"${idAttr} data-heading="${headingAttr}" data-search-query="${queryAttr}" data-image-prompt="${promptAttr}" data-alt="${altAttr}"${visualTypeAttr}${confidenceAttr}${reasonAttr}${actionAttr}></div>`;

    // Match heading tags containing this heading (ignoring casing and markdown numbering)
    const cleanHeadingText = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const headingPattern = new RegExp(`(<h[1-3][^>]*>[\\s\\S]*?${cleanHeadingText}[\\s\\S]*?<\\/h[1-3]>)`, "i");

    if (headingPattern.test(result)) {
      result = result.replace(headingPattern, `$1\n${placeholderHtml}`);
    }
  }

  return result;
}

/**
 * Converts raw Markdown text to HTML suitable for Tiptap's `setContent()`.
 * Optionally injects Image Placeholder blocks if imageSuggestions/visualSuggestions are provided.
 *
 * @param markdown - Raw Markdown string (partial during SSE streaming is fine)
 * @param suggestions - Optional array of AI suggested section visuals / images
 * @returns HTML string ready for `editor.commands.setContent(html)`
 */
export function toEditorHtml(
  markdown: string,
  suggestions?: (ImageSuggestion | VisualSuggestion)[]
): string {
  const html = parseMarkdownToHtml(markdown);
  return injectImagePlaceholders(html, suggestions);
}
