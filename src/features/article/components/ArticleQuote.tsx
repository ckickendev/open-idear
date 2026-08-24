"use client";

// =============================================================================
//  ARTICLE QUOTE BLOCK COMPONENT
//  src/features/article/components/ArticleQuote.tsx
// =============================================================================

import React from "react";
import type { QuoteBlock } from "../types/article.types";
import { Quote } from "lucide-react";

interface ArticleQuoteProps {
  block: QuoteBlock;
}

export default function ArticleQuote({ block }: ArticleQuoteProps) {
  return (
    <blockquote
      id={`block-${block.id}`}
      className="my-8 relative pl-6 border-l-4 border-accent"
    >
      <Quote
        size={20}
        className="absolute -top-2 -left-2 text-accent/40"
        aria-hidden="true"
      />
      <p className="text-lg italic text-foreground/80 leading-relaxed">{block.content}</p>
      {(block.author || block.source) && (
        <footer className="mt-3 text-sm text-foreground/50 not-italic">
          {block.author && <cite className="font-medium not-italic">— {block.author}</cite>}
          {block.source && (
            <span className="ml-1 opacity-70">
              {block.author ? ", " : ""}
              {block.source}
            </span>
          )}
        </footer>
      )}
    </blockquote>
  );
}
