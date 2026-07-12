// =============================================================================
//  AI AUTOSAVE FEATURE — DRAFT RECOVERY PROMPT BANNER
//  src/features/autosave/components/DraftRecoveryBanner.tsx
//
//  Design Decisions:
//  - Renders a notice banner when a newer local backup is detected.
//  - Displays backup timestamp and actions to Restore or Discard.
//  - Modern layout styled with amber warnings and interactive action buttons.
// =============================================================================

import React from "react";
import { AlertCircle, RotateCcw, Trash2 } from "lucide-react";

interface DraftRecoveryBannerProps {
  readonly timestamp: number;
  readonly onRestore: () => void;
  readonly onDiscard: () => void;
}

export default function DraftRecoveryBanner({
  timestamp,
  onRestore,
  onDiscard,
}: DraftRecoveryBannerProps) {
  const formattedTime = new Date(timestamp).toLocaleString();

  return (
    <div className="draft-recovery-banner w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-editor-text)] animate-[slide-down_0.2s_ease-out] select-none">
      <div className="flex items-center gap-3 text-left">
        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 shrink-0">
          <AlertCircle size={16} />
        </div>
        <div>
          <h4 className="font-extrabold text-[var(--color-editor-text)] text-sm">
            Unsaved Local Backup Found
          </h4>
          <p className="text-[var(--color-editor-muted)] leading-relaxed mt-0.5">
            We recovered a newer backup version saved locally on your device from{" "}
            <span className="font-semibold text-[var(--color-editor-text)] font-mono">{formattedTime}</span>.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
        {/* Discard button */}
        <button
          type="button"
          onClick={onDiscard}
          className="px-3.5 py-2 border border-[var(--color-editor-border)] hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 text-[var(--color-editor-secondary)] rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <Trash2 size={13} />
          <span>Discard</span>
        </button>

        {/* Restore button */}
        <button
          type="button"
          onClick={onRestore}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
        >
          <RotateCcw size={13} />
          <span>Restore Backup</span>
        </button>
      </div>
    </div>
  );
}
