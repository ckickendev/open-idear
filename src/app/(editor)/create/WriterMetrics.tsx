"use client";

import React, { useMemo } from "react";
import { Clock } from "lucide-react";

interface WriterMetricsProps {
  /** Raw text content from the editor (editor.getText()) */
  text: string;
}

const WriterMetrics: React.FC<WriterMetricsProps> = ({ text }) => {
  const { wordCount, charCount, readingTime } = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = trimmed.length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { wordCount: words, charCount: chars, readingTime: minutes };
  }, [text]);

  if (!text.trim()) return null;

  return (
    <div className="flex items-center justify-center gap-4 py-4 animate-[fade-in_0.2s_ease-out]">
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] shadow-sm">
        <span className="text-[11px] text-[var(--color-editor-muted)] tabular-nums">
          {wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}
        </span>
        <span className="w-px h-3 bg-[var(--color-editor-border)]" />
        <span className="text-[11px] text-[var(--color-editor-muted)] tabular-nums">
          {charCount.toLocaleString()} chars
        </span>
        <span className="w-px h-3 bg-[var(--color-editor-border)]" />
        <span className="flex items-center gap-1 text-[11px] text-[var(--color-editor-muted)]">
          <Clock size={10} />
          {readingTime} min read
        </span>
      </div>
    </div>
  );
};

export default WriterMetrics;
