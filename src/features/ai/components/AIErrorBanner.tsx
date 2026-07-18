// =============================================================================
//  AI FEATURE — ERROR RECOVERY BANNER
//  src/features/ai/components/AIErrorBanner.tsx
//
//  Design Decisions:
//  - Displays structured error messages with classification (Rate limit vs. network).
//  - Provides one-click manual retry action triggers.
//  - Show countdown indicator when throttled.
// =============================================================================

import React, { useState, useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface AIErrorBannerProps {
  readonly errorMessage: string;
  readonly isRateLimit?: boolean;
  readonly retryDelaySeconds?: number;
  readonly onRetry: () => void | Promise<void>;
}

export default function AIErrorBanner({
  errorMessage,
  isRateLimit = false,
  retryDelaySeconds = 0,
  onRetry,
}: AIErrorBannerProps) {
  const [secondsLeft, setSecondsLeft] = useState(retryDelaySeconds);

  useEffect(() => {
    if (!isRateLimit || retryDelaySeconds <= 0) return;
    setSecondsLeft(retryDelaySeconds);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRateLimit, retryDelaySeconds]);

  const isDisabled = isRateLimit && secondsLeft > 0;

  return (
    <div className="p-4 bg-[var(--color-editor-danger)]/10 border border-[var(--color-editor-danger)]/20 rounded-xl flex items-start justify-between gap-3 text-xs text-[var(--color-editor-text)] animate-[fade-in_0.2s_ease-out]">
      <div className="flex gap-2">
        <AlertCircle className="text-[var(--color-editor-danger)] shrink-0 mt-0.5" size={15} />
        <div className="space-y-1">
          <p className="font-bold text-[var(--color-editor-danger)]">
            {isRateLimit ? "AI Rate Limit Exceeded" : "AI Execution Failure"}
          </p>
          <p className="text-[var(--color-editor-secondary)] leading-relaxed">
            {errorMessage}
          </p>
          {isRateLimit && secondsLeft > 0 && (
            <p className="text-[10px] text-orange-400 font-semibold">
              Retrying automatically in {secondsLeft} seconds...
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        disabled={isDisabled}
        onClick={onRetry}
        className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95 shrink-0 ${
          isDisabled
            ? "border-zinc-800 text-zinc-600 bg-transparent cursor-not-allowed"
            : "border-[var(--color-editor-danger)]/30 hover:bg-[var(--color-editor-danger)]/15 text-[var(--color-editor-danger)]"
        }`}
      >
        <RotateCcw size={13} className={isDisabled ? "" : "animate-spin-once"} />
        <span>{isDisabled ? `Wait (${secondsLeft}s)` : "Retry"}</span>
      </button>
    </div>
  );
}
