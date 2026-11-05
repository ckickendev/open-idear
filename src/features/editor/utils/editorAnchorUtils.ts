// =============================================================================
//  EDITOR ANCHOR UTILITIES — SPRINT 2 & 3
//  src/features/editor/utils/editorAnchorUtils.ts
//
//  Design Decisions:
//  - Accurately positions and anchors images to target article headings.
//  - Supports both Markdown string transformation and direct Tiptap editor insertion.
//  - Resilient multi-tier heading matcher (exact, prefixes, markdown bold/italic,
//    HTML entities, and EOF-tolerant trailing newlines).
//  - Gracefully falls back to H1 or document start for overview/intro sections.
//  - Prevents duplicate insertion on repeated clicks (replaces existing image or placeholder).
//  - Preserves surrounding article text, formatting, and undo/redo history.
// =============================================================================

import type { Editor } from "@tiptap/core";
import { sanitizeHeadingSubject } from "./headingSanitizer.ts";

/**
 * Escapes regex special characters.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalizes text for lenient comparison:
 * strips markdown formatting, HTML tags/entities, and punctuation.
 */
function normalizeAnchorText(str: string): string {
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
    customAttributionLine?: string;
  }
): { success: boolean; updatedMarkdown: string; reason?: string } {
  if (!markdown || !heading || !imageUrl) {
    return { success: false, updatedMarkdown: markdown, reason: "Missing required arguments" };
  }

  const cleanHeading = heading.trim();
  const sanitized = sanitizeHeadingSubject(cleanHeading);

  let attributionLine = "";
  if (attribution?.customAttributionLine) {
    const raw = attribution.customAttributionLine.trim();
    attributionLine = raw ? `\n${raw}` : "";
  } else if (attribution?.author || attribution?.attributionUrl) {
    const authorText = attribution.author || "Photographer";
    const providerText = attribution.provider ? ` on ${attribution.provider}` : "";
    if (attribution.attributionUrl) {
      attributionLine = `\n*Photo by [${authorText}](${attribution.attributionUrl})${providerText}*`;
    } else {
      attributionLine = `\n*Photo by ${authorText}${providerText}*`;
    }
  }

  const imageMarkdown = `![${altText.trim() || sanitized || "Section Visual"}](${imageUrl.trim()})${attributionLine}`;

  // ── Strategy 1: Exact heading match with optional markdown formatting & trailing punctuation
  const exactPattern = new RegExp(
    `(^|\\n)(#{1,6}\\s+[*_~\`]*${escapeRegex(cleanHeading)}[*_~\`]*[:;.\\-–—\\s]*)(?:\\r?\\n|$)`,
    "i"
  );
  let match = markdown.match(exactPattern);
  let insertMatchIndex: number | null = null;
  let insertMatchPrefixLen = 0;
  let insertMatchHeadingText = "";
  let afterHeadingOffset = 0;

  if (match && match.index !== undefined) {
    insertMatchIndex = match.index;
    insertMatchPrefixLen = match[1].length;
    insertMatchHeadingText = match[2].trim();
    afterHeadingOffset = match.index + match[0].length;
  }

  // ── Strategy 2: Numbering & prefix-tolerant regex match with sanitized subject
  if (!insertMatchHeadingText && sanitized) {
    const prefixPattern = new RegExp(
      `(^|\\n)(#{1,6}\\s+(?:(?:công\\s+cụ|tiện\\s+ích|phần\\s+mềm|bước|phần|mục|chương|bài|tool|step|section|part|chapter)\\s*(?:[0-9ivx]+|[a-z])?[:\\s\\-–—.]+|[0-9]+(?:\\.[0-9]+)*[.):\\s\\-–—]+)?[*_~\`]*${escapeRegex(sanitized)}[*_~\`]*[:;.\\-–—\\s]*)(?:\\r?\\n|$)`,
      "i"
    );
    match = markdown.match(prefixPattern);
    if (match && match.index !== undefined) {
      insertMatchIndex = match.index;
      insertMatchPrefixLen = match[1].length;
      insertMatchHeadingText = match[2].trim();
      afterHeadingOffset = match.index + match[0].length;
    }
  }

  // ── Strategy 3: Line-by-line lenient heading scanner
  if (!insertMatchHeadingText) {
    const targetNorm = normalizeAnchorText(cleanHeading);
    const sanitizedNorm = normalizeAnchorText(sanitized);

    const lines = markdown.split(/\r?\n/);
    let charOffset = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headingMatch) {
        const lineHeadingText = headingMatch[2];
        const lineNorm = normalizeAnchorText(lineHeadingText);
        const lineSanitizedNorm = normalizeAnchorText(sanitizeHeadingSubject(lineHeadingText));

        const isMatch =
          lineNorm === targetNorm ||
          lineSanitizedNorm === sanitizedNorm ||
          (sanitizedNorm.length >= 3 && lineNorm.includes(sanitizedNorm)) ||
          (targetNorm.length >= 3 && lineNorm.includes(targetNorm)) ||
          (lineSanitizedNorm.length >= 3 && sanitizedNorm.includes(lineSanitizedNorm));

        if (isMatch) {
          const leadingNewlineLen = charOffset === 0 ? 0 : 1;
          insertMatchIndex = charOffset === 0 ? 0 : charOffset - 1;
          insertMatchPrefixLen = leadingNewlineLen;
          insertMatchHeadingText = line.trim();
          afterHeadingOffset = charOffset + line.length;
          break;
        }
      }
      charOffset += line.length + 1; // +1 for the newline
    }
  }

  // ── Strategy 4: Fallback for Overview / Introduction on documents with only H1 or no ##
  if (!insertMatchHeadingText && /^(overview|tổng quan|giới thiệu|introduction)$/i.test(sanitized)) {
    const h1Match = markdown.match(/(^|\n)(#\s+[^\n]+)(?:\r?\n|$)/);
    if (h1Match && h1Match.index !== undefined) {
      insertMatchIndex = h1Match.index;
      insertMatchPrefixLen = h1Match[1].length;
      insertMatchHeadingText = h1Match[2].trim();
      afterHeadingOffset = h1Match.index + h1Match[0].length;
    } else {
      // Prepend at the very top of document
      const existingTopImage = markdown.match(/^\s*!\[([^\]]*)\]\(([^)]+)\)(?:\s*\n\*[^*]+\*)?\s*(?:\r?\n)*/);
      if (existingTopImage) {
        return {
          success: true,
          updatedMarkdown: `${imageMarkdown}\n\n${markdown.slice(existingTopImage[0].length).trimStart()}`,
        };
      }
      return {
        success: true,
        updatedMarkdown: `${imageMarkdown}\n\n${markdown.trimStart()}`,
      };
    }
  }

  if (insertMatchIndex === null || !insertMatchHeadingText) {
    return {
      success: false,
      updatedMarkdown: markdown,
      reason: `Section anchor "${cleanHeading}" not found in current article document.`,
    };
  }

  const textAfterHeading = markdown.slice(afterHeadingOffset);

  // Check if an existing image (+ optional attribution) or placeholder is already beneath this heading
  const existingImageMatch = textAfterHeading.match(
    /^\s*(?:!\[([^\]]*)\]\(([^)]+)\)(?:\s*\n\*[^*]+\*)?|<div\s+data-type="image-placeholder"[^>]*>.*?<\/div>|<img[^>]+>)\s*(?:\r?\n)*/i
  );

  let updatedTextAfter: string;
  if (existingImageMatch) {
    // Replace the existing image to prevent duplicate stacking on repeated clicks
    updatedTextAfter = `${imageMarkdown}\n\n${textAfterHeading.slice(existingImageMatch[0].length)}`;
  } else {
    // Insert new image
    updatedTextAfter = `${imageMarkdown}\n\n${textAfterHeading.trimStart()}`;
  }

  const beforeHeading = markdown.slice(0, insertMatchIndex + insertMatchPrefixLen);
  const finalMarkdown = `${beforeHeading}${insertMatchHeadingText}\n\n${updatedTextAfter}`;

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
  const targetNorm = normalizeAnchorText(heading);
  const sanitizedNorm = normalizeAnchorText(sanitizedTarget);

  let targetPos: number | null = null;
  let replaceExistingPos: number | null = null;
  let fallbackH1Pos: number | null = null;

  editor.state.doc.descendants((node, pos) => {
    if (targetPos !== null) return false;

    if (node.type.name === "heading") {
      const headingText = (node.textContent || "").trim().toLowerCase();
      const nodeNorm = normalizeAnchorText(node.textContent || "");
      const nodeSanitizedNorm = normalizeAnchorText(sanitizeHeadingSubject(node.textContent || ""));

      if (fallbackH1Pos === null && node.attrs?.level === 1) {
        fallbackH1Pos = pos + node.nodeSize;
      }

      const isMatch =
        headingText === targetHeading ||
        nodeNorm === targetNorm ||
        nodeSanitizedNorm === sanitizedNorm ||
        (sanitizedNorm.length >= 3 && nodeNorm.includes(sanitizedNorm)) ||
        (targetNorm.length >= 3 && nodeNorm.includes(targetNorm)) ||
        (nodeSanitizedNorm.length >= 3 && sanitizedNorm.includes(nodeSanitizedNorm));

      if (isMatch) {
        // Position right after the heading node
        targetPos = pos + node.nodeSize;

        // Check if subsequent node is an image or imagePlaceholder to replace
        const nextNode = editor.state.doc.nodeAt(targetPos);
        if (nextNode) {
          if (nextNode.type.name === "image" || nextNode.type.name === "imagePlaceholder") {
            replaceExistingPos = targetPos;
          }
        }
        return false;
      }
    }
    return true;
  });

  // Fallback to post-H1 or doc start for overview/intro
  if (targetPos === null && /^(overview|tổng quan|giới thiệu|introduction)$/i.test(sanitizedTarget)) {
    if (fallbackH1Pos !== null) {
      targetPos = fallbackH1Pos;
      const nextNode = editor.state.doc.nodeAt(targetPos);
      if (nextNode && (nextNode.type.name === "image" || nextNode.type.name === "imagePlaceholder")) {
        replaceExistingPos = targetPos;
      }
    } else {
      targetPos = 0;
    }
  }

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
