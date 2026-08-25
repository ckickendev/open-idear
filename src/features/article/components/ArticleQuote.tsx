"use client";

// =============================================================================
//  ARTICLE QUOTE BLOCK COMPONENT
//  src/features/article/components/ArticleQuote.tsx
//
//  Sprint 3.1 — migrated to editorial.css .ed-quote classes.
//  Large quotation mark is rendered as a CSS-styled text character
//  rather than an icon for better typographic authenticity.
// =============================================================================

import React from "react";
import type { QuoteBlock } from "../types/article.types";

interface ArticleQuoteProps {
  block: QuoteBlock;
}

export default function ArticleQuote({ block }: ArticleQuoteProps) {
  return (
    <blockquote id={`block-${block.id}`} className="ed-quote">
      {/* Decorative opening quotation mark */}
      <span className="ed-quote__mark" aria-hidden="true">
        &#8220;
      </span>

      {/* Quote text */}
      <p className="ed-quote__text">{block.content}</p>

      {/* Attribution */}
      {(block.author || block.source) && (
        <footer className="ed-quote__attribution">
          {block.author && (
            <cite className="not-italic">— {block.author}</cite>
          )}
          {block.source && (
            <span className="opacity-70">
              {block.author ? ", " : ""}
              {block.source}
            </span>
          )}
        </footer>
      )}
    </blockquote>
  );
}
