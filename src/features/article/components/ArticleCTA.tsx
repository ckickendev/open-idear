"use client";

// =============================================================================
//  ARTICLE CTA BLOCK COMPONENT
//  src/features/article/components/ArticleCTA.tsx
//
//  Sprint 3.1 — migrated to editorial.css .ed-cta classes.
//  Button hover animation is CSS-driven via .ed-cta__btn-primary.
//  No inline styles or hardcoded colors.
// =============================================================================

import React from "react";
import type { CTABlock } from "../types/article.types";
import { ArrowRight } from "lucide-react";

interface ArticleCTAProps {
  block: CTABlock;
}

export default function ArticleCTA({ block }: ArticleCTAProps) {
  return (
    <div
      id={`block-${block.id}`}
      className="ed-cta"
      role="complementary"
      aria-label={block.title}
    >
      {/* Optional brand icon / emoji */}
      <div className="ed-cta__icon" aria-hidden="true">
        🔮
      </div>

      {/* Heading */}
      <h3 className="ed-cta__title">{block.title}</h3>

      {/* Description */}
      {block.description && (
        <p className="ed-cta__description">{block.description}</p>
      )}

      {/* Actions */}
      <div className="ed-cta__actions">
        <a
          href={block.button.href}
          className="ed-cta__btn-primary"
          aria-label={block.button.label}
        >
          {block.button.label}
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
