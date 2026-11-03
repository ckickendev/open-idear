"use client";

import React, { useMemo } from "react";
import {
  extractSnippet,
  splitTextByHighlight,
} from "../utils/searchHighlight.utils";

export interface HighlightedTextProps {
  /** The text to display and highlight */
  text: string;
  /** The search query string */
  query?: string;
  /** Whether to extract a surrounding context snippet */
  asSnippet?: boolean;
  /** Max snippet length in characters if asSnippet is true */
  maxLength?: number;
  /** Custom CSS classes for the outer wrapper */
  className?: string;
  /** Custom CSS classes for the <mark> highlight element */
  highlightClassName?: string;
}

/**
 * Renders text with search keyword matches highlighted in a styled <mark> tag.
 * Supports Vietnamese accent-folding, multi-word matching, and snippet extraction.
 */
export const HighlightedText: React.FC<HighlightedTextProps> = React.memo(
  ({
    text,
    query,
    asSnippet = false,
    maxLength = 140,
    className,
    highlightClassName = "bg-primary/20 text-primary font-semibold px-0.5 py-0.2 rounded-[3px] border-b border-primary/40",
  }) => {
    const segments = useMemo(() => {
      if (!text) return [];
      const content = asSnippet ? extractSnippet(text, query, maxLength) : text;
      return splitTextByHighlight(content, query);
    }, [text, query, asSnippet, maxLength]);

    if (!text) return null;

    if (!query || !query.trim()) {
      return (
        <span className={className}>
          {asSnippet && text.length > maxLength
            ? `${text.slice(0, maxLength).trim()}...`
            : text}
        </span>
      );
    }

    return (
      <span className={className}>
        {segments.map((seg, idx) =>
          seg.isMatch ? (
            <mark key={idx} className={highlightClassName}>
              {seg.text}
            </mark>
          ) : (
            <React.Fragment key={idx}>{seg.text}</React.Fragment>
          )
        )}
      </span>
    );
  }
);

HighlightedText.displayName = "HighlightedText";
