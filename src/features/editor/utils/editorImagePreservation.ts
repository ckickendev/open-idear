// =============================================================================
//  EDITOR IMAGE PRESERVATION UTILITIES
//  src/features/editor/utils/editorImagePreservation.ts
//
//  Design Decisions:
//  - Prevents AI generation pipelines ("One Click AI Draft", "Generate in Editor",
//    Content Studio pipelines) from wiping out existing user-placed images in TipTap.
//  - Extracts all existing image nodes along with section heading context and
//    attribution/caption paragraphs before content replacement.
//  - Re-anchors extracted images back into the AI-generated markdown using multi-tier
//    heading matching and section index fallbacks.
//  - Filters out redundant AI image suggestion placeholders for sections that
//    already contain a preserved user image.
// =============================================================================

import type { Editor } from "@tiptap/core";
import { insertImageAtSectionAnchor } from "./editorAnchorUtils.ts";
import { toEditorHtml } from "../../ai/utils/contentTransformer.ts";

export interface ExtractedEditorImage {
  src: string;
  alt: string;
  title?: string;
  mediaId?: string;
  dataAttributionUrl?: string;
  dataProvider?: string;
  caption?: string;
  attributionLine?: string; // e.g. "*Photo by Đào Hiếu on unsplash*"
  sectionHeading?: string;  // text of preceding heading if any
  sectionLevel?: number;    // e.g. 1, 2, 3
  sectionIndex: number;     // 0 = intro / before any heading, 1 = first section, etc.
}

/**
 * Normalizes heading strings for resilient matching across varying AI phrasing.
 */
function normalizeText(str: string): string {
  return (str || "")
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[*_~`]/g, "")
    .replace(/[:;.\-–—\s]+/g, " ")
    .trim();
}

/**
 * Inspects the current TipTap document state and extracts all image nodes
 * along with their attributes, preceding section headings, and caption paragraphs.
 */
export function extractImagesFromEditor(editor: Editor | null | undefined): ExtractedEditorImage[] {
  if (!editor || !editor.state || !editor.state.doc) {
    return [];
  }

  const images: ExtractedEditorImage[] = [];
  let currentHeading = "";
  let currentLevel = 0;
  let sectionIndex = 0;

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "heading") {
      currentHeading = (node.textContent || "").trim();
      currentLevel = node.attrs?.level || 2;
      sectionIndex++;
      return;
    }

    if (node.type.name === "image") {
      const src = node.attrs?.src;
      if (!src) return;

      const alt = node.attrs?.alt || "";
      const title = node.attrs?.title || "";
      const mediaId = node.attrs?.["data-media-id"] || undefined;
      const dataAttributionUrl = node.attrs?.["data-attribution-url"] || undefined;
      const dataProvider = node.attrs?.["data-provider"] || undefined;
      let caption = node.attrs?.caption || undefined;
      let attributionLine = "";

      // Check next sibling node in document for an attribution paragraph
      try {
        const nextPos = pos + node.nodeSize;
        if (nextPos < editor.state.doc.content.size) {
          const nextNode = editor.state.doc.nodeAt(nextPos);
          if (nextNode && nextNode.type.name === "paragraph") {
            const text = (nextNode.textContent || "").trim();
            if (/^(?:[*_])?(?:photo by|image by|taken by|source:|nguồn:)/i.test(text)) {
              let linkUrl = "";
              let linkAnchor = "";
              nextNode.descendants?.((child) => {
                if (child.isText && child.marks) {
                  const linkMark = child.marks.find((m) => m.type.name === "link");
                  if (linkMark) {
                    linkUrl = linkMark.attrs?.href || "";
                    linkAnchor = child.text || "";
                  }
                }
              });

              if (linkUrl && linkAnchor) {
                const formatted = text.replace(linkAnchor, `[${linkAnchor}](${linkUrl})`);
                attributionLine = `*${formatted.replace(/^[*_]+|[*_]+$/g, "")}*`;
              } else {
                attributionLine = `*${text.replace(/^[*_]+|[*_]+$/g, "")}*`;
              }
              if (!caption) {
                caption = text.replace(/[*_]/g, "");
              }
            }
          }
        }
      } catch {
        // Non-fatal if next node cannot be resolved
      }

      // Fallback: check if title attribute contains "Photo by"
      if (!attributionLine && title && /photo by/i.test(title)) {
        attributionLine = `*${title.trim().replace(/^[*_]+|[*_]+$/g, "")}*`;
      }

      images.push({
        src,
        alt,
        title,
        mediaId,
        dataAttributionUrl,
        dataProvider,
        caption,
        attributionLine,
        sectionHeading: currentHeading,
        sectionLevel: currentLevel,
        sectionIndex,
      });
    }
  });

  return images;
}

/**
 * Re-injects extracted images into the newly generated AI Markdown text.
 * Matches sections using heading text, section index, or overview fallback.
 */
export function preserveImagesInMarkdown(
  markdown: string,
  images: ExtractedEditorImage[]
): string {
  if (!images || images.length === 0) {
    return markdown || "";
  }
  if (!markdown || !markdown.trim()) {
    // If no markdown exists, assemble image blocks directly
    return images
      .map((img) => `![${img.alt || "Image"}](${img.src})${img.attributionLine ? `\n${img.attributionLine}` : ""}`)
      .join("\n\n");
  }

  let updatedMarkdown = markdown;

  for (const img of images) {
    // Avoid duplicate re-insertion if image URL is already present in markdown
    if (updatedMarkdown.includes(img.src)) {
      continue;
    }

    const customAttr = img.attributionLine || (img.title && /photo by/i.test(img.title) ? `*${img.title}*` : undefined);
    const attributionPayload = {
      customAttributionLine: customAttr,
      attributionUrl: img.dataAttributionUrl,
      provider: img.dataProvider,
    };

    let inserted = false;

    // ── 1. Match by Section Heading if available
    if (img.sectionHeading) {
      const res = insertImageAtSectionAnchor(
        updatedMarkdown,
        img.sectionHeading,
        img.src,
        img.alt,
        attributionPayload
      );
      if (res.success) {
        updatedMarkdown = res.updatedMarkdown;
        inserted = true;
      }
    }

    // ── 2. Fallback: Match by Section Index among H2/H3 headings
    if (!inserted) {
      const headingMatches = Array.from(updatedMarkdown.matchAll(/(?:^|\n)(#{2,3}\s+[^\n]+)/g));

      if (headingMatches.length > 0) {
        // If the user had it in section N (1-based), try target heading at N-1
        const targetIndex = img.sectionIndex > 0
          ? Math.min(img.sectionIndex - 1, headingMatches.length - 1)
          : 0;
        const targetHeadingText = headingMatches[targetIndex][1].replace(/^#{2,3}\s+/, "").trim();

        const res = insertImageAtSectionAnchor(
          updatedMarkdown,
          targetHeadingText,
          img.src,
          img.alt,
          attributionPayload
        );
        if (res.success) {
          updatedMarkdown = res.updatedMarkdown;
          inserted = true;
        }
      }
    }

    // ── 3. Ultimate Fallback: Place beneath Title (H1) or at top of article
    if (!inserted) {
      const imgMarkdown = `![${img.alt || "Section Visual"}](${img.src})${img.attributionLine ? `\n${img.attributionLine}` : ""}`;
      const h1Match = updatedMarkdown.match(/(^|\n)(#\s+[^\n]+)(?:\r?\n|$)/);

      if (h1Match && h1Match.index !== undefined) {
        const insertOffset = h1Match.index + h1Match[0].length;
        updatedMarkdown = `${updatedMarkdown.slice(0, insertOffset)}\n\n${imgMarkdown}\n\n${updatedMarkdown.slice(insertOffset).trimStart()}`;
      } else {
        updatedMarkdown = `${imgMarkdown}\n\n${updatedMarkdown.trimStart()}`;
      }
    }
  }

  return updatedMarkdown;
}

/**
 * Filters out AI visual suggestion placeholders for headings where an existing
 * user-placed image is already preserved, preventing duplicate blank placeholder blocks.
 */
export function filterSuggestionsForPreservedImages<T extends { heading?: string; target?: string }>(
  suggestions: T[] | undefined,
  images: ExtractedEditorImage[]
): T[] {
  if (!suggestions || suggestions.length === 0) return [];
  if (!images || images.length === 0) return suggestions;

  const preservedHeadings = images
    .map((img) => normalizeText(img.sectionHeading || ""))
    .filter(Boolean);

  if (preservedHeadings.length === 0) {
    return suggestions;
  }

  return suggestions.filter((sug) => {
    const rawHeading = sug.target || sug.heading || "";
    if (!rawHeading) return true;
    const norm = normalizeText(rawHeading);

    for (const pHead of preservedHeadings) {
      if (norm === pHead || norm.includes(pHead) || pHead.includes(norm)) {
        return false; // Skip suggestion since user image is already anchored here
      }
    }
    return true;
  });
}

/**
 * High-level coordinator: Extracts existing editor images, preserves them inside the
 * new AI Markdown, removes redundant visual placeholders, and returns both editor HTML
 * and updated Markdown.
 */
export function mergeAiDraftWithExistingEditorImages(
  newMarkdown: string,
  editor: Editor | null | undefined,
  suggestions?: any[]
): { html: string; markdown: string; preservedCount: number } {
  const existingImages = extractImagesFromEditor(editor);

  if (existingImages.length === 0) {
    const html = toEditorHtml(newMarkdown, suggestions);
    return { html, markdown: newMarkdown, preservedCount: 0 };
  }

  const mergedMarkdown = preserveImagesInMarkdown(newMarkdown, existingImages);
  const filteredSuggestions = filterSuggestionsForPreservedImages(suggestions, existingImages);
  const html = toEditorHtml(mergedMarkdown, filteredSuggestions);

  return {
    html,
    markdown: mergedMarkdown,
    preservedCount: existingImages.length,
  };
}
