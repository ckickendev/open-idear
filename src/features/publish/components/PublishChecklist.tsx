// =============================================================================
//  AI PUBLISHING FEATURE — REUSABLE PUBLISH CHECKLIST COMPONENT
//  src/features/publish/components/PublishChecklist.tsx
//
//  Design Decisions:
//  - Fully reusable, responsive UI list styled with glassmorphic cards.
//  - Displays Status, Warning/Message, and actionable Fix Actions.
//  - Renders an interactive Auto-Fix button when a rule supports corrections.
//  - Extensible and dynamic, mapping rule properties from checklists payloads.
// =============================================================================

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Settings, Loader2 } from "lucide-react";

export interface ChecklistItem {
  readonly id: string;
  readonly name: string;
  readonly status: "passed" | "warning" | "failed";
  readonly severity: "info" | "warning" | "error";
  readonly message?: string;
  readonly fixActionDescription?: string;
  readonly hasAutoFix: boolean;
}

interface PublishChecklistProps {
  readonly items: readonly ChecklistItem[];
  readonly onAutoFix?: (id: string) => Promise<void> | void;
  readonly isAutoFixing?: string | null; // rule ID currently autofixing
}

export default function PublishChecklist({
  items,
  onAutoFix,
  isAutoFixing = null,
}: PublishChecklistProps) {
  // Compute progress analytics
  const total = items.length;
  const passed = items.filter((i) => i.status === "passed").length;
  const warnings = items.filter((i) => i.status === "warning").length;
  const failed = items.filter((i) => i.status === "failed").length;

  const percent = total > 0 ? Math.round((passed / total) * 100) : 0;

  // Render Status Icon with custom tailwind color states
  const renderStatusIcon = (status: "passed" | "warning" | "failed") => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="text-emerald-500 shrink-0 w-5 h-5 animate-[scale-in_0.15s_ease-out]" />;
      case "warning":
        return <AlertTriangle className="text-amber-500 shrink-0 w-5 h-5 animate-[scale-in_0.15s_ease-out]" />;
      case "failed":
        return <XCircle className="text-rose-500 shrink-0 w-5 h-5 animate-[scale-in_0.15s_ease-out]" />;
    }
  };

  return (
    <div className="publish-checklist-root space-y-5 text-sm">
      {/* ─── Summary Progress Bar ────────────────────────────────────────────── */}
      <div className="p-4 bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] rounded-xl shadow-sm space-y-3">
        <div className="flex justify-between items-center text-xs font-semibold text-[var(--color-editor-text)]">
          <span className="flex items-center gap-1.5">
            📋 Checklist Progress
          </span>
          <span className="text-[var(--color-editor-muted)] font-mono">
            {passed}/{total} Passed ({percent}%)
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-[var(--color-editor-border)] h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-wider text-[var(--color-editor-secondary)] pt-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {passed} Passed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {warnings} Warnings
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {failed} Failed
          </span>
        </div>
      </div>

      {/* ─── Checklist Items ─────────────────────────────────────────────────── */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border transition-all duration-200 flex gap-3.5 bg-[var(--color-editor-surface)] ${
              item.status === "passed"
                ? "border-[var(--color-editor-border)] hover:border-emerald-500/20"
                : item.status === "warning"
                ? "border-amber-500/30 hover:border-amber-500/50 bg-amber-500/[0.01]"
                : "border-rose-500/30 hover:border-rose-500/50 bg-rose-500/[0.01]"
            }`}
          >
            {/* Status Icon Indicator */}
            {renderStatusIcon(item.status)}

            {/* Core Item Metadata Details */}
            <div className="flex-1 space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[var(--color-editor-text)] text-sm">
                  {item.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                      item.severity === "error"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : item.severity === "warning"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    }`}
                  >
                    {item.severity}
                  </span>
                  <span
                    className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      item.status === "passed"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : item.status === "warning"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Message text on Failures / Warnings */}
              {item.message && (
                <p className="text-[var(--color-editor-secondary)] font-medium leading-relaxed">
                  {item.message}
                </p>
              )}

              {/* Fix Action Prompt */}
              {item.fixActionDescription && item.status !== "passed" && (
                <div className="p-2 bg-[var(--color-editor-bg)] rounded-lg border border-[var(--color-editor-border)] flex items-start gap-1.5 text-[11px] text-[var(--color-editor-muted)] leading-relaxed">
                  <span className="font-bold text-indigo-400 shrink-0">Action:</span>
                  <span>{item.fixActionDescription}</span>
                </div>
              )}
            </div>

            {/* Action Buttons & Autofix Overlay */}
            {item.hasAutoFix && item.status !== "passed" && onAutoFix && (
              <div className="shrink-0 flex items-center self-center pl-2">
                <button
                  type="button"
                  disabled={isAutoFixing !== null}
                  onClick={() => onAutoFix(item.id)}
                  className={`px-3 py-1.5 text-[10px] font-bold tracking-wide rounded-lg flex items-center gap-1.5 border border-indigo-500/30 text-indigo-400 bg-indigo-500/[0.04] hover:bg-indigo-500/10 active:scale-95 transition-all cursor-pointer ${
                    isAutoFixing !== null ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isAutoFixing === item.id ? (
                    <>
                      <Loader2 size={11} className="animate-spin" />
                      <span>Fixing</span>
                    </>
                  ) : (
                    <>
                      <Settings size={11} className="animate-pulse" />
                      <span>Auto Fix</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
