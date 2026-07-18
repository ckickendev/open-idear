// =============================================================================
//  AI FEATURE — PROGRESS INDICATOR
//  src/features/ai/components/AIProgressIndicator.tsx
//
//  Design Decisions:
//  - Displays loading steps, streaming metrics, and shimmer state cues.
//  - Completely styled to integrate seamlessly within sidebars or modals.
// =============================================================================

import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface AIProgressIndicatorProps {
  readonly statusText: string;
  readonly charactersGenerated?: number;
  readonly maxDurationEstimateSeconds?: number;
  readonly secondsElapsed?: number;
}

export default function AIProgressIndicator({
  statusText,
  charactersGenerated = 0,
  maxDurationEstimateSeconds = 30,
  secondsElapsed = 0,
}: AIProgressIndicatorProps) {
  // Estimate percentage for UI feedback
  const pct = Math.min(
    100,
    Math.round((secondsElapsed / maxDurationEstimateSeconds) * 100)
  );

  return (
    <div className="p-4 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-xl space-y-3 text-xs text-[var(--color-editor-text)] animate-[fade-in_0.15s_ease-out]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-bold text-[var(--color-editor-accent)]">
          <Loader2 size={13} className="animate-spin text-[var(--color-editor-accent)]" />
          <span>{statusText}</span>
        </div>
        {charactersGenerated > 0 && (
          <span className="text-[10px] text-[var(--color-editor-secondary)] font-mono">
            {charactersGenerated} chars streamed
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="w-full bg-[var(--color-editor-bg)] rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-[var(--color-editor-accent)] h-full transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-[var(--color-editor-secondary)] tracking-wider">
          <span>RUNNING GENERATION</span>
          <span>{secondsElapsed}s elapsed / est. {maxDurationEstimateSeconds}s</span>
        </div>
      </div>
    </div>
  );
}
