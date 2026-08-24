"use client";

// =============================================================================
//  ARTICLE CODE BLOCK COMPONENT
//  src/features/article/components/ArticleCodeBlock.tsx
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
      // Clipboard API may not be available in all environments
    }
  };

  return (
    <div
      id={`block-${block.id}`}
      className="my-6 rounded-xl overflow-hidden border border-[var(--color-editor-border,#2a2d3a)] bg-[#0d1117]"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          {block.filename && (
            <span className="text-xs text-zinc-400 font-mono">{block.filename}</span>
          )}
          {block.language && (
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
              {block.language}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          aria-label="Copy code"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {/* Code */}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className={block.language ? `language-${block.language}` : ""}>
          {block.code}
        </code>
      </pre>
    </div>
  );
}
