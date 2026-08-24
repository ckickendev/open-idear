"use client";

// =============================================================================
//  ARTICLE FAQ BLOCK COMPONENT
//  src/features/article/components/ArticleFAQ.tsx
//
//  Design Decisions:
//  - Uses <details>/<summary> for native browser accordion behaviour.
//  - Native HTML elements are preferred for AEO (Answer Engine Optimization).
//    FAQPage schema.org JSON-LD will be added in Sprint 4.
// =============================================================================

import React from "react";
import type { FAQBlock } from "../types/article.types";
import { ChevronDown } from "lucide-react";

interface ArticleFAQProps {
  block: FAQBlock;
}

export default function ArticleFAQ({ block }: ArticleFAQProps) {
  return (
    <section id={`block-${block.id}`} className="my-8" aria-label="Frequently Asked Questions">
      {block.title && (
        <h2 className="text-xl font-bold mb-4 text-foreground">{block.title}</h2>
      )}
      <div className="space-y-2">
        {block.items.map((item, idx) => (
          <details
            key={idx}
            className="group border border-border rounded-xl overflow-hidden"
          >
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none font-medium text-foreground hover:bg-muted/50 transition-colors list-none">
              <span>{item.question}</span>
              <ChevronDown
                size={16}
                className="shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <div className="px-5 pb-4 pt-1 text-sm text-foreground/80 leading-relaxed border-t border-border bg-muted/20">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
