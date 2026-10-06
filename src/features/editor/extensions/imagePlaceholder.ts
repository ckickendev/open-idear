// =============================================================================
//  IMAGE PLACEHOLDER TIPTAP EXTENSION
//  src/features/editor/extensions/imagePlaceholder.ts
//
//  Design Decisions:
//  - Registered as an atomic block node (`atom: true`, `group: 'block'`).
//  - Parses `<div data-type="image-placeholder" ...>` from injected HTML.
//  - Renders the interactive ImagePlaceholderView React component.
//  - Replaces itself cleanly with a standard Tiptap `image` node upon selection.
// =============================================================================

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImagePlaceholderView } from "../components/ImagePlaceholderView";

export interface ImagePlaceholderOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imagePlaceholder: {
      insertImagePlaceholder: (attributes: {
        heading?: string;
        searchQuery?: string;
        imagePrompt?: string;
        alt?: string;
        position?: number | string;
      }) => ReturnType;
    };
  }
}

export const ImagePlaceholderExtension = Node.create<ImagePlaceholderOptions>({
  name: "imagePlaceholder",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      heading: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-heading") || "",
        renderHTML: (attributes) => ({ "data-heading": attributes.heading || "" }),
      },
      searchQuery: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-search-query") || "",
        renderHTML: (attributes) => ({ "data-search-query": attributes.searchQuery || "" }),
      },
      imagePrompt: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-image-prompt") || "",
        renderHTML: (attributes) => ({ "data-image-prompt": attributes.imagePrompt || "" }),
      },
      alt: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-alt") || "",
        renderHTML: (attributes) => ({ "data-alt": attributes.alt || "" }),
      },
      position: {
        default: 0,
        parseHTML: (element) => element.getAttribute("data-position") || 0,
        renderHTML: (attributes) => ({ "data-position": attributes.position || 0 }),
      },
      visualType: {
        default: "diagram",
        parseHTML: (element) => element.getAttribute("data-visual-type") || "diagram",
        renderHTML: (attributes) => ({ "data-visual-type": attributes.visualType || "diagram" }),
      },
      confidence: {
        default: 0.95,
        parseHTML: (element) => parseFloat(element.getAttribute("data-confidence") || "0.95"),
        renderHTML: (attributes) => ({ "data-confidence": String(attributes.confidence || 0.95) }),
      },
      reason: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-reason") || "",
        renderHTML: (attributes) => ({ "data-reason": attributes.reason || "" }),
      },
      recommendedAction: {
        default: "generate",
        parseHTML: (element) => element.getAttribute("data-recommended-action") || "generate",
        renderHTML: (attributes) => ({ "data-recommended-action": attributes.recommendedAction || "generate" }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-placeholder"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "image-placeholder",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImagePlaceholderView);
  },

  addCommands() {
    return {
      insertImagePlaceholder:
        (attributes) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: attributes,
            })
            .run();
        },
    };
  },
});
