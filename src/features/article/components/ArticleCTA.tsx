"use client";

// =============================================================================
//  ARTICLE CTA BLOCK COMPONENT
//  src/features/article/components/ArticleCTA.tsx
// =============================================================================

import React from "react";
import type { CTABlock } from "../types/article.types";
import { ArrowRight } from "lucide-react";

interface ArticleCTAProps {
  block: CTABlock;
}

export default function ArticleCTA({ block }: ArticleCTAProps) {
  const isPrimary = !block.variant || block.variant === "primary";

  return (
    <div
      id={`block-${block.id}`}
      className={`my-8 rounded-2xl p-8 text-center ${
        isPrimary
          ? "bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20"
          : "bg-muted border border-border"
      }`}
    >
      <h3 className="text-xl font-bold text-foreground mb-2">{block.title}</h3>
      {block.description && (
        <p className="text-sm text-foreground/70 mb-6 max-w-md mx-auto">{block.description}</p>
      )}
      <a
        href={block.button.href}
        className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
          isPrimary
            ? "bg-accent text-white hover:bg-accent/90 shadow-md hover:shadow-lg"
            : "bg-foreground text-background hover:opacity-90"
        }`}
      >
        {block.button.label}
        <ArrowRight size={14} />
      </a>
    </div>
  );
}
