// =============================================================================
//  EDITOR ANCHOR UTILITIES — SPRINT 2
//  src/features/editor/utils/editorAnchorUtils.ts
//
//  Design Decisions:
//  - Accurately positions and anchors images to target article headings.
//  - Supports both Markdown string transformation and direct Tiptap editor insertion.
//  - Prevents duplicate insertion on repeated clicks (replaces existing image under heading).
//  - Preserves surrounding article text, formatting, and undo/redo history.
//  - Gracefully handles altered/missing headings without corrupting article content.
// =============================================================================

import type { Editor } from "@tiptap/core";
import { sanitizeHeadingSubject } from "./aiAssistContext";

/**
 * Escapes regex special characters.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/**
 * Inserts or replaces an image directly beneath a section heading in a Markdown document.
 * Preserves attribution metadata and prevents duplicate stacking.
 */
export function insertImageAtSectionAnchor(
  markdown: string,
  heading: string,
  imageUrl: string,
  altText: string,
  attribution?: {
    author?: string;
    attributionUrl?: string;
    provider?: string;
  }
): { success: boolean; updatedMarkdown: string; reason?: string } {
  if (!markdown || !heading || !imageUrl) {
    return { success: false, updatedMarkdown: markdown, reason: "Missing required arguments" };
  }

  const cleanHeading = heading.trim();
  const sanitized = sanitizeHeadingSubject(cleanHeading);

  let attributionLine = "";
  if (attribution?.author || attribution?.attributionUrl) {
    const authorText = attribution.author || "Photographer";
    const providerText = attribution.provider ? ` on ${attribution.provider}` : "";
    if (attribution.attributionUrl) {
      attributionLine = `\n*Photo by [${authorText}](${attribution.attributionUrl})${providerText}*`;
    } else {
      attributionLine = `\n*Photo by ${authorText}${providerText}*`;
    }
  }

  const imageMarkdown = `![${altText.trim() || sanitized || "Section Visual"}](${imageUrl.trim()})${attributionLine}`;

  // Try exact heading match first (e.g. "## Heading" or "### Heading")
  const exactPattern = new RegExp(
    `(^|\\n)(#{1,6}\\s+${escapeRegex(cleanHeading)}\\s*)(?:\\r?\\n)+`,
    "i"
  );

  let match = markdown.match(exactPattern);
  let matchedHeading = cleanHeading;

  // If not found, try sanitized heading match (without numbers/prefixes)
  if (!match && sanitized && sanitized !== cleanHeading) {
    const fuzzyPattern = new RegExp(
      `(^|\\n)(#{1,6}\\s+.*?${escapeRegex(sanitized)}.*?\\s*)(?:\\r?\\n)+`,
      "i"
    );
    match = markdown.match(fuzzyPattern);
    if (match) matchedHeading = sanitized;
  }

  if (!match || match.index === undefined) {
    return {
      success: false,
      updatedMarkdown: markdown,
      reason: `Section anchor "${cleanHeading}" not found in current article document.`,
    };
  }

  const headingIndex = match.index + match[1].length;
  const headingFullMatch = match[0];
  const afterHeadingIndex = match.index + headingFullMatch.length;

  const textAfterHeading = markdown.slice(afterHeadingIndex);

  // Check if an existing image (+ optional attribution line) is already immediately beneath this heading
  const existingImageMatch = textAfterHeading.match(/^\s*!\[([^\]]*)\]\(([^)]+)\)(?:\s*\n\*[^*]+\*)?\s*(?:\r?\n)*/);

  let updatedTextAfter: string;
  if (existingImageMatch) {
    // Replace the existing image to prevent duplicate stacking on repeated clicks
    updatedTextAfter = `${imageMarkdown}\n\n${textAfterHeading.slice(existingImageMatch[0].length)}`;
  } else {
    // Insert new image
    updatedTextAfter = `${imageMarkdown}\n\n${textAfterHeading.trimStart()}`;
  }

  const finalMarkdown = `${markdown.slice(0, match.index + match[1].length)}${match[2].trim()}\n\n${updatedTextAfter}`;

  return {
    success: true,
    updatedMarkdown: finalMarkdown,
  };
}

/**
 * Inserts or updates an image node at a heading anchor directly within Tiptap editor.
 */
export function insertImageIntoTiptapAtAnchor(
  editor: Editor,
  heading: string,
  imageUrl: string,
  altText: string,
  assetId?: string,
  attribution?: {
    author?: string;
    attributionUrl?: string;
    provider?: string;
  }
): boolean {
  if (!editor || !heading || !imageUrl) return false;

  const targetHeading = heading.trim().toLowerCase();
  const sanitizedTarget = sanitizeHeadingSubject(heading).toLowerCase();

  let targetPos: number | null = null;
  let replaceExistingPos: number | null = null;
  let existingNodeSize = 0;

  editor.state.doc.descendants((node, pos) => {
    if (targetPos !== null) return false;

    if (node.type.name === "heading") {
      const headingText = (node.textContent || "").trim().toLowerCase();
      const sanitizedNodeText = sanitizeHeadingSubject(node.textContent || "").toLowerCase();

      const isMatch =
        headingText === targetHeading ||
        (sanitizedTarget.length > 3 && sanitizedNodeText.includes(sanitizedTarget)) ||
        (headingText.length > 3 && targetHeading.includes(headingText));

      if (isMatch) {
        // Position right after the heading node
        targetPos = pos + node.nodeSize;

        // Check the subsequent node
        const nextNode = editor.state.doc.nodeAt(targetPos);
        if (nextNode) {
          if (nextNode.type.name === "image" || nextNode.type.name === "imagePlaceholder") {
            replaceExistingPos = targetPos;
            existingNodeSize = nextNode.nodeSize;
          }
        }
        return false;
      }
    }
    return true;
  });

  if (targetPos === null) {
    return false;
  }

  const imageAttrs: Record<string, any> = {
    src: imageUrl,
    alt: altText || sanitizeHeadingSubject(heading) || "Section visual",
  };
  if (attribution?.author) {
    imageAttrs.title = `Photo by ${attribution.author}${attribution.provider ? ` on ${attribution.provider}` : ""}`;
  }
  if (attribution?.attributionUrl) {
    imageAttrs["data-attribution-url"] = attribution.attributionUrl;
  }
  if (attribution?.provider) {
    imageAttrs["data-provider"] = attribution.provider;
  }
  if (assetId) {
    imageAttrs["data-media-id"] = assetId;
  }

  try {
    if (replaceExistingPos !== null) {
      // Replace existing placeholder or duplicate image
      editor
        .chain()
        .focus()
        .setNodeSelection(replaceExistingPos)
        .deleteSelection()
        .insertContentAt(replaceExistingPos, {
          type: "image",
          attrs: imageAttrs,
        })
        .run();
    } else {
      // Insert new image node
      editor
        .chain()
        .focus()
        .insertContentAt(targetPos, [
          {
            type: "image",
            attrs: imageAttrs,
          },
        ])
        .run();
    }
    return true;
  } catch (err) {
    console.error("[editorAnchorUtils] Failed to insert image at anchor:", err);
    return false;
  }
}
