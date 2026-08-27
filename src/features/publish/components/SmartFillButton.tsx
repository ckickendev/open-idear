// =============================================================================
//  SMART FILL BUTTON
//  src/features/publish/components/SmartFillButton.tsx
//
//  Design Decisions:
//  - Animated sparkle icon with gradient accent border for premium feel.
//  - Loading spinner replaces icon during execution.
//  - Disabled state when already running or content is unavailable.
//  - Matches existing editor design system (var(--color-editor-*)).
// =============================================================================

import React from "react";
import { Sparkles, Loader2, RotateCcw, AlertCircle } from "lucide-react";
import type { SmartPublishStatus } from "../hooks/useSmartPublish";

interface SmartFillButtonProps {
  readonly status: SmartPublishStatus;
  readonly onClick: () => void;
  readonly onRetry?: () => void;
  readonly disabled?: boolean;
  readonly error?: string | null;
}

export default function SmartFillButton({
  status,
  onClick,
  onRetry,
  disabled = false,
  error,
}: SmartFillButtonProps) {
  const isLoading = status === "loading";
  const isError = status === "error";
  const isSuccess = status === "success" || status === "partial";
  const isDisabled = disabled || isLoading;

  return (
    <div className="flex flex-col items-stretch gap-2">
      {/* Main Button */}
      <button
        type="button"
        onClick={isError && onRetry ? onRetry : onClick}
        disabled={isDisabled}
        className={`
          group relative flex items-center justify-center gap-2 px-5 py-2.5
          rounded-xl font-bold text-xs transition-all duration-300 cursor-pointer
          ${isLoading
            ? "bg-[var(--color-editor-elevated)] text-[var(--color-editor-muted)] border border-[var(--color-editor-border)] cursor-wait"
            : isError
            ? "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/15"
            : isSuccess
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/15"
            : "bg-gradient-to-r from-violet-600/15 to-indigo-600/15 text-indigo-400 border border-indigo-500/30 hover:from-violet-600/25 hover:to-indigo-600/25 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.97]"
          }
          ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        title={
          isLoading
            ? "Smart Fill is analyzing your article..."
            : isError
            ? "Retry Smart Fill"
            : isSuccess
            ? "Smart Fill completed — click to re-run"
            : "Auto-fill description, tags, category, slug, and more"
        }
      >
        {/* Icon */}
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isError ? (
          <RotateCcw size={14} />
        ) : (
          <Sparkles
            size={14}
            className={`transition-transform duration-300 ${
              !isDisabled ? "group-hover:rotate-12 group-hover:scale-110" : ""
            }`}
          />
        )}

        {/* Label */}
        <span>
          {isLoading
            ? "Analyzing..."
            : isError
            ? "Retry Smart Fill"
            : isSuccess
            ? "✨ Re-run Smart Fill"
            : "✨ Smart Fill"}
        </span>

        {/* Shimmer overlay on hover (idle state only) */}
        {!isLoading && !isError && !isSuccess && (
          <span
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background:
                "linear-gradient(105deg, transparent 35%, rgba(139,92,246,0.06) 45%, rgba(99,102,241,0.08) 55%, transparent 65%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s ease-in-out infinite",
            }}
          />
        )}
      </button>

      {/* Error Message */}
      {isError && error && (
        <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-red-500/5 border border-red-500/10 text-[10px] text-red-400/80 animate-[fade-in_0.2s_ease-out]">
          <AlertCircle size={11} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Inline CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
