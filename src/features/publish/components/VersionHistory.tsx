// =============================================================================
//  AI PUBLISHING FEATURE — VERSION HISTORY COMPONENT
//  src/features/publish/components/VersionHistory.tsx
//
//  Design Decisions:
//  - Renders a historical list of committed article snapshots.
//  - Details Draft Saves, Published Milestones, and Restored Events.
//  - Displays relative timestamps, author metadata, and word metrics.
//  - Triggers version restoration without executing expensive visual code diffs.
//  - Fully responsive and styled for seamless sidebar nesting.
// =============================================================================

import React from "react";
import { History, ArrowLeftRight, CheckCircle2, FileText, Share2, CornerUpLeft, User, Calendar } from "lucide-react";

export interface VersionItem {
  readonly id: string;
  readonly versionNumber: number;
  readonly type: "draft" | "published" | "restored";
  readonly title: string;
  readonly wordCount: number;
  readonly createdAt: string; // ISO date string
  readonly createdBy: string;
}

interface VersionHistoryProps {
  readonly historyItems: readonly VersionItem[];
  readonly onRestore: (versionNumber: number) => Promise<void> | void;
  readonly isRestoring?: boolean;
}

export default function VersionHistory({
  historyItems,
  onRestore,
  isRestoring = false,
}: VersionHistoryProps) {
  // Format Date to localized reader output
  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  // Render indicators matching the snapshot classification
  const renderTypeBadge = (type: "draft" | "published" | "restored") => {
    switch (type) {
      case "published":
        return (
          <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
            Published
          </span>
        );
      case "restored":
        return (
          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
            Restored
          </span>
        );
      case "draft":
      default:
        return (
          <span className="bg-zinc-500/10 text-[var(--color-editor-secondary)] border border-[var(--color-editor-border)] px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
            Draft Save
          </span>
        );
    }
  };

  return (
    <div className="version-history-root space-y-4 text-xs text-[var(--color-editor-text)] animate-[fade-in_0.2s_ease-out]">
      {/* ─── Summary Header ─────────────────────────────────────────────────── */}
      <div className="p-3.5 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-xl flex items-center justify-between select-none">
        <span className="font-semibold text-xs flex items-center gap-1.5">
          <History size={14} className="text-violet-500 animate-pulse" />
          <span>Post History Logs</span>
        </span>
        <span className="text-[10px] text-[var(--color-editor-muted)] font-mono font-semibold">
          {historyItems.length} Milestones
        </span>
      </div>

      {/* ─── Snapshot History List ───────────────────────────────────────────── */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {historyItems.length === 0 ? (
          <div className="p-8 border border-[var(--color-editor-border)] rounded-xl text-center text-[var(--color-editor-muted)] italic">
            No historical versions recorded yet.
          </div>
        ) : (
          historyItems.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-xl hover:border-[var(--color-editor-accent)] transition-all flex flex-col gap-2.5 shadow-xs"
            >
              {/* Top Row: version labels */}
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono text-[var(--color-editor-accent)]">
                  Version v{item.versionNumber}
                </span>
                {renderTypeBadge(item.type)}
              </div>

              {/* Title & Word metrics */}
              <div className="space-y-1">
                <span className="font-bold text-sm block truncate max-w-full">
                  {item.title || "Untitled Draft"}
                </span>
                <span className="text-[10px] text-[var(--color-editor-muted)] font-mono">
                  {item.wordCount.toLocaleString()} words
                </span>
              </div>

              {/* Timestamp & User */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-editor-border)] pt-2 mt-0.5 text-[10px] text-[var(--color-editor-muted)] font-medium">
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {formatDateTime(item.createdAt)}
                </span>
                <span className="flex items-center gap-1 truncate max-w-[120px]">
                  <User size={10} />
                  {item.createdBy}
                </span>
              </div>

              {/* Restore action */}
              <button
                type="button"
                disabled={isRestoring}
                onClick={() => onRestore(item.versionNumber)}
                className="w-full mt-1.5 py-1.5 border border-indigo-500/20 hover:bg-indigo-500/[0.04] text-indigo-400 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <CornerUpLeft size={11} />
                <span>Restore Snapshot</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
