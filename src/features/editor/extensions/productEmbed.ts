// =============================================================================
//  PRODUCT EMBED TIPTAP EXTENSION — SPRINT S5 CONTENT COMMERCE
//  src/features/editor/extensions/productEmbed.ts
//
//  Design Decisions:
//  - Registered as an atomic block node (`atom: true`, `group: 'block'`).
//  - Stores ONLY stable references: productId, contextualLabel, layout.
//  - Never stores volatile prices, stock, supplier details, or availability.
//  - Parses both `<div data-type="product-card" ...>` and `<div data-type="product-embed" ...>`.
//  - Serializes to `<div data-type="product-card" data-product-id="..." data-contextual-label="..." data-layout="..."></div>`.
// =============================================================================

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ProductEmbedNodeView } from "../components/ProductEmbedNodeView";

export interface ProductEmbedOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    productEmbed: {
      insertProductEmbed: (attributes: {
        productId: string;
        contextualLabel?: string;
        layout?: "card" | "compact";
      }) => ReturnType;
    };
  }
}

export const ProductEmbedExtension = Node.create<ProductEmbedOptions>({
  name: "productEmbed",
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
      productId: {
        default: "",
        parseHTML: (element) =>
          element.getAttribute("data-product-id") ||
          element.getAttribute("data-id") ||
          "",
        renderHTML: (attributes) => ({
          "data-product-id": attributes.productId || "",
        }),
      },
      contextualLabel: {
        default: "",
        parseHTML: (element) =>
          element.getAttribute("data-contextual-label") || "",
        renderHTML: (attributes) =>
          attributes.contextualLabel
            ? { "data-contextual-label": attributes.contextualLabel }
            : {},
      },
      layout: {
        default: "card",
        parseHTML: (element) =>
          element.getAttribute("data-layout") || "card",
        renderHTML: (attributes) => ({
          "data-layout": attributes.layout || "card",
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="product-card"]',
      },
      {
        tag: 'div[data-type="product-embed"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "product-card",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ProductEmbedNodeView);
  },

  addCommands() {
    return {
      insertProductEmbed:
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
