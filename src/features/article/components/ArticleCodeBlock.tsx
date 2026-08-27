"use client";

// =============================================================================
//  ARTICLE CODE BLOCK COMPONENT
//  src/features/article/components/ArticleCodeBlock.tsx
//
//  Sprint 3.4 — Enhanced Code Block UX & Accessibility.
//  - Displays filename and language badge cleanly.
//  - Copy button with feedback and aria-live.
//  - Keyboard scrollable <pre> via tabIndex={0} and aria-label.
//  - Edge-bleed on mobile via editorial.css.
//  - Reduced-motion compliant.
// =============================================================================

import React, { useState } from "react";
import type { CodeBlock } from "../types/article.types";
import { Copy, Check } from "lucide-react";

interface ArticleCodeBlockProps {
  block: CodeBlock;
}

export default function ArticleCodeBlock({ block }: ArticleCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API fallback if restricted
    }
  };

  const hasFilename = Boolean(block.filename);
  const hasLanguage = Boolean(block.language);
  const showLangBadge =
    hasLanguage &&
    (!hasFilename ||
      block.language?.toLowerCase() !== block.filename?.toLowerCase());

  return (
    <div
      id={`block-${block.id}`}
      className="ed-code"
      role="region"
      aria-label={`Code block${block.filename ? `: ${block.filename}` : block.language ? `: ${block.language}` : ""}`}
    >
      {/* Header bar — filename + language badge + copy button */}
      <div className="ed-code__header">
        <div className="flex items-center gap-2 overflow-hidden">
          {hasFilename && (
            <span className="ed-code__filename" title={block.filename}>
              {block.filename}
            </span>
          )}
          {showLangBadge && (
            <span className="ed-code__lang">{block.language}</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={`ed-code__copy-btn${copied ? " ed-code__copy-btn--success" : ""}`}
          aria-label={copied ? "Copied code to clipboard" : "Copy code to clipboard"}
          aria-live="polite"
        >
          {copied ? (
            <>
              <Check size={12} aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code surface — keyboard accessible horizontal scroll */}
      <pre
        className="ed-code__pre"
        tabIndex={0}
        aria-label={`Code snippet${block.language ? ` (${block.language})` : ""}`}
      >
        <code className={block.language ? `language-${block.language}` : ""}>
          {block.code}
        </code>
      </pre>
    </div>
  );
}
