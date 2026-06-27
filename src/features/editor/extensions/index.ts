import type { Extensions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import LinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import UnderlineExtension from "@tiptap/extension-underline";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Paragraph from "@tiptap/extension-paragraph";
import Color from "@tiptap/extension-color";
import CodeBlock from "@tiptap/extension-code-block";
import FileHandler from "@tiptap/extension-file-handler";
import type { Editor } from "@tiptap/react";

import { HardBreakExtension } from "./hardBreak";
import { SelectionExtension } from "./selection";
import { RawHtmlExtension } from "./rawHtml";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ImageDropCallbacks {
  /** Called when images are dropped/pasted. Should upload to CDN and return URL. */
  onImageFile?: (file: File, pos: number, editor: Editor) => void;
}

interface ExtensionBundleOptions {
  placeholder?: string;
  imageCallbacks?: ImageDropCallbacks;
}

// ─── Extension Bundle Factory ───────────────────────────────────────────────

/**
 * Creates the standard set of Tiptap extensions for the OpenIdear editor.
 *
 * Centralizes all extension configuration in one place so the editor hook
 * doesn't need to know about individual extension setup.
 */
export function createEditorExtensions(
  options: ExtensionBundleOptions = {},
): Extensions {
  const { placeholder = "Start writing your ideas...", imageCallbacks } =
    options;

  return [
    StarterKit,
    TextStyleKit,
    CodeBlock.configure({
      exitOnArrowDown: true,
      exitOnTripleEnter: true,
      defaultLanguage: "plaintext",
      HTMLAttributes: {
        class: "my-code-block",
      },
    }),
    Color.configure({
      types: ["textStyle"],
    }),
    Paragraph.configure({
      HTMLAttributes: {
        class: "",
      },
    }),
    HardBreakExtension,
    SelectionExtension,
    ImageExtension.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          "data-media-id": {
            default: null,
            parseHTML: (element) => element.getAttribute("data-media-id"),
            renderHTML: (attributes) => {
              if (!attributes["data-media-id"]) return {};
              return { "data-media-id": attributes["data-media-id"] };
            },
          },
        };
      },
    }).configure({
      inline: false,
      allowBase64: false, // ← Never store base64 in editor state
      HTMLAttributes: {
        class: "max-w-full rounded-xl",
      },
    }),
    Placeholder.configure({
      placeholder,
    }),
    LinkExtension.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "editor-link",
      },
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    UnderlineExtension.configure({
      HTMLAttributes: {
        class: "underline",
      },
    }),
    RawHtmlExtension,
    FileHandler.configure({
      allowedMimeTypes: [
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
      ],
      onDrop: (currentEditor, files, pos) => {
        if (imageCallbacks?.onImageFile) {
          files.forEach((file) => {
            imageCallbacks.onImageFile!(file, pos, currentEditor);
          });
        }
      },
      onPaste: (currentEditor, files, htmlContent) => {
        if (htmlContent) return false;
        if (imageCallbacks?.onImageFile) {
          const pos = currentEditor.state.selection.anchor;
          files.forEach((file) => {
            imageCallbacks.onImageFile!(file, pos, currentEditor);
          });
        }
      },
    }),
  ];
}

// Re-export individual extensions for direct use
export { HardBreakExtension } from "./hardBreak";
export { SelectionExtension } from "./selection";
export { RawHtmlExtension } from "./rawHtml";
