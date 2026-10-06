"use client";

// =============================================================================
//  VERSION DIFF VIEWER COMPONENT
//  src/features/article/versioning/components/VersionDiffViewer.tsx
//
//  Design Decisions:
//  - Lightweight line diff viewer with zero heavy dependencies.
//  - Green = additions (+), Red = removals (-).
//  - Supports Unified Diff, Side-by-Side, and Raw Preview modes.
//  - Owner-only "Restore Version" action with confirmation prompt.
//  - Linear + Notion aesthetic: subtle borders, mono numbers, smooth transitions.
// =============================================================================

import React, { useState, useMemo } from "react";
import {
  RotateCcw,
  Plus,
  Minus,
  Check,
  Columns,
  List,
  Eye,
  FileCode,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { computeLineDiff } from "../utils/lineDiff";

interface VersionDiffViewerProps {
  readonly oldText: string;
  readonly newText: string;
  readonly oldVersion: string;
  readonly newVersion: string;
  readonly changelog?: string;
  readonly isOwner?: boolean;
  readonly onRestore?: () => Promise<void> | void;
  readonly isRestoring?: boolean;
  readonly onClose?: () => void;
}

export const VersionDiffViewer: React.FC<VersionDiffViewerProps> = ({
  oldText,
  newText,
  oldVersion,
  newVersion,
  changelog,
  isOwner = false,
  onRestore,
  isRestoring = false,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<"unified" | "split" | "preview">("unified");
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);

  // Compute diff memoized
  const diffResult = useMemo(() => {
    return computeLineDiff(oldText, newText);
  }, [oldText, newText]);

  const handleConfirmRestore = async () => {
    if (onRestore) {
      await onRestore();
      setShowConfirmRestore(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground border border-border/80 rounded-2xl shadow-2xl overflow-hidden animate-[fade-in_0.2s_ease-out]">
      {/* ─── Top Control Bar ─────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-border/80 bg-muted/20 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <FileCode size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight">Version Comparison</h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-muted text-muted-foreground border border-border">
                v{oldVersion} → v{newVersion}
              </span>
            </div>
            {changelog && (
              <p className="text-xs text-muted-foreground mt-0.5 max-w-md truncate">
                {changelog}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Diff Metrics */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-background border border-border/70">
            <span className="text-emerald-500 flex items-center gap-0.5 font-semibold">
              +{diffResult.additions}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-rose-500 flex items-center gap-0.5 font-semibold">
              -{diffResult.deletions}
            </span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/60 text-xs">
            <button
              onClick={() => setViewMode("unified")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === "unified"
                  ? "bg-background shadow-xs text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Unified diff list"
            >
              <List size={13} />
              <span className="hidden md:inline">Unified</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === "split"
                  ? "bg-background shadow-xs text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Side-by-side comparison"
            >
              <Columns size={13} />
              <span className="hidden md:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === "preview"
                  ? "bg-background shadow-xs text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Rendered view"
            >
              <Eye size={13} />
              <span className="hidden md:inline">Preview</span>
            </button>
          </div>

          {/* Restore Button (Owner only) */}
          {isOwner && onRestore && oldVersion !== newVersion && (
            <button
              onClick={() => setShowConfirmRestore(true)}
              disabled={isRestoring}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isRestoring ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <RotateCcw size={13} />
              )}
              <span>Restore v{oldVersion}</span>
            </button>
          )}

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Close diff viewer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ─── Confirmation Modal for Rollback ─────────────────────────────── */}
      {showConfirmRestore && (
        <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-between gap-4 animate-[fade-in_0.15s_ease-out]">
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
            <span>
              Roll back to <strong>v{oldVersion}</strong>? This will create a new version with content from v{oldVersion}. Your history remains intact.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowConfirmRestore(false)}
              className="px-2.5 py-1 text-xs rounded-md bg-background text-foreground border border-border hover:bg-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRestore}
              disabled={isRestoring}
              className="px-3 py-1 text-xs font-semibold rounded-md bg-amber-600 hover:bg-amber-700 text-white cursor-pointer flex items-center gap-1"
            >
              {isRestoring && <Loader2 size={12} className="animate-spin" />}
              Confirm Restore
            </button>
          </div>
        </div>
      )}

      {/* ─── Diff Content Canvas ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed select-text">
        {viewMode === "preview" ? (
          <div className="space-y-6 max-w-3xl mx-auto p-4 font-sans">
            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-[11px] font-mono text-muted-foreground uppercase font-bold tracking-wider">
                Snapshot Content (v{oldVersion})
              </span>
              <div
                className="mt-3 prose dark:prose-invert max-w-none text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: oldText }}
              />
            </div>
          </div>
        ) : viewMode === "split" ? (
          /* Split View */
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Left: Old Version */}
            <div className="border border-border/60 rounded-xl overflow-hidden bg-card flex flex-col">
              <div className="px-3 py-2 bg-muted/40 border-b border-border/60 text-[11px] font-semibold text-muted-foreground flex justify-between">
                <span>Original (v{oldVersion})</span>
              </div>
              <div className="p-2 overflow-auto flex-1 space-y-0.5">
                {oldText.split("\n").map((line, idx) => (
                  <div key={idx} className="flex gap-3 hover:bg-muted/30 px-2 py-0.5 rounded">
                    <span className="text-muted-foreground/50 w-8 text-right select-none">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre-wrap break-all">{line || " "}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: New Version */}
            <div className="border border-border/60 rounded-xl overflow-hidden bg-card flex flex-col">
              <div className="px-3 py-2 bg-muted/40 border-b border-border/60 text-[11px] font-semibold text-muted-foreground flex justify-between">
                <span>Compared (v{newVersion})</span>
              </div>
              <div className="p-2 overflow-auto flex-1 space-y-0.5">
                {newText.split("\n").map((line, idx) => (
                  <div key={idx} className="flex gap-3 hover:bg-muted/30 px-2 py-0.5 rounded">
                    <span className="text-muted-foreground/50 w-8 text-right select-none">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre-wrap break-all">{line || " "}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Unified Diff View */
          <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
            {diffResult.lines.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground italic">
                No differences detected between selected versions.
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {diffResult.lines.map((line, index) => {
                  const isAdded = line.type === "added";
                  const isRemoved = line.type === "removed";

                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3 px-3 py-1 transition-colors ${
                        isAdded
                          ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-l-2 border-emerald-500"
                          : isRemoved
                          ? "bg-rose-500/10 text-rose-800 dark:text-rose-300 border-l-2 border-rose-500"
                          : "text-foreground/80 hover:bg-muted/30"
                      }`}
                    >
                      {/* Line Indicators */}
                      <span className="w-4 select-none font-bold text-center">
                        {isAdded ? (
                          <Plus size={11} className="text-emerald-600 dark:text-emerald-400 mt-1 inline" />
                        ) : isRemoved ? (
                          <Minus size={11} className="text-rose-600 dark:text-rose-400 mt-1 inline" />
                        ) : (
                          " "
                        )}
                      </span>

                      {/* Line Numbers */}
                      <span className="text-muted-foreground/40 w-8 text-right select-none text-[10px] mt-0.5">
                        {line.oldLineNumber || ""}
                      </span>
                      <span className="text-muted-foreground/40 w-8 text-right select-none text-[10px] mt-0.5">
                        {line.newLineNumber || ""}
                      </span>

                      {/* Line Text */}
                      <span className="flex-1 whitespace-pre-wrap break-all">
                        {line.content || " "}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
