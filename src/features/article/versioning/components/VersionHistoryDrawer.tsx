"use client";

// =============================================================================
//  ARTICLE VERSION HISTORY DRAWER COMPONENT
//  src/features/article/versioning/components/VersionHistoryDrawer.tsx
//
//  Design Decisions:
//  - Responsive slide-over history drawer with Linear/Notion aesthetics.
//  - Displays timeline of versions, version badges, changelog, AI badge, and current badge.
//  - Allows one-click comparison against current head version via line diff.
//  - Owner-only restore button with immutable rollback execution.
// =============================================================================

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  History,
  Sparkles,
  User,
  Clock,
  RotateCcw,
  GitCommit,
  ArrowRight,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  GitCompare,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { versioningApi } from "../api/versioning.api";
import { VersionDiffViewer } from "./VersionDiffViewer";
import type {
  VersionHistoryItem,
  ArticleVersionDetail,
} from "../types/versioning.types";

interface VersionHistoryDrawerProps {
  readonly slug: string;
  readonly postId: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly currentContent?: string;
  readonly currentVersion?: string;
  readonly isOwner?: boolean;
  readonly onVersionRestored?: (newVersion: any) => void;
}

export const VersionHistoryDrawer: React.FC<VersionHistoryDrawerProps> = ({
  slug,
  postId,
  isOpen,
  onClose,
  currentContent = "",
  currentVersion = "1.0",
  isOwner = false,
  onVersionRestored,
}) => {
  const [history, setHistory] = useState<readonly VersionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Comparing state
  const [activeDiffVersion, setActiveDiffVersion] = useState<ArticleVersionDetail | null>(null);
  const [isDiffLoading, setIsDiffLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Load history from API
  const fetchHistory = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await versioningApi.getArticleHistory(slug);
      setHistory(data.history || []);
    } catch (err: any) {
      console.error("Error loading version history:", err);
      setError(err.message || "Failed to load version history.");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      setActiveDiffVersion(null);
    }
  }, [isOpen, fetchHistory]);

  // Load version detail to open diff viewer
  const handleOpenDiff = async (versionNumber: string) => {
    setIsDiffLoading(true);
    try {
      const data = await versioningApi.getArticleVersion(slug, versionNumber);
      setActiveDiffVersion(data.version);
    } catch (err: any) {
      toast.error(err.message || `Failed to load version ${versionNumber}`);
    } finally {
      setIsDiffLoading(false);
    }
  };

  // Rollback / restore version
  const handleRestore = async (versionNumber: string) => {
    setIsRestoring(true);
    try {
      const res = await versioningApi.rollbackArticleVersion(postId, versionNumber);
      toast.success(res.message || `Restored version ${versionNumber}!`);
      await fetchHistory();
      setActiveDiffVersion(null);
      if (onVersionRestored) {
        onVersionRestored(res.version);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to restore version.");
    } finally {
      setIsRestoring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-[fade-in_0.15s_ease-out]">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className={`relative z-10 w-full ${
          activeDiffVersion ? "max-w-5xl" : "max-w-md sm:max-w-lg"
        } bg-background border-l border-border h-full shadow-2xl flex flex-col transition-all duration-300 ease-in-out`}
        role="dialog"
        aria-modal="true"
        aria-label="Article version history"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-border/80 flex items-center justify-between bg-muted/20 select-none">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <History size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight">Version History</h2>
              <p className="text-xs text-muted-foreground">
                Immutable snapshots & revisions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeDiffVersion && (
              <button
                onClick={() => setActiveDiffVersion(null)}
                className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground hover:text-foreground border border-border cursor-pointer transition-colors"
              >
                ← Back to timeline
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Body: Diff Viewer or History Timeline */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeDiffVersion ? (
            /* Diff Viewer Mode */
            <div className="h-full">
              <VersionDiffViewer
                oldText={activeDiffVersion.html || activeDiffVersion.markdown || ""}
                newText={currentContent}
                oldVersion={activeDiffVersion.version}
                newVersion={currentVersion}
                changelog={activeDiffVersion.changelog}
                isOwner={isOwner}
                isRestoring={isRestoring}
                onRestore={() => handleRestore(activeDiffVersion.version)}
                onClose={() => setActiveDiffVersion(null)}
              />
            </div>
          ) : (
            /* Timeline List Mode */
            <div className="space-y-6">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 size={24} className="animate-spin text-primary" />
                  <span className="text-xs">Loading version timeline...</span>
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              ) : history.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground space-y-2">
                  <GitCommit size={28} className="mx-auto text-muted-foreground/40" />
                  <p className="text-xs italic">No version history records found.</p>
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-border/80 space-y-6">
                  {history.map((item) => {
                    const isCurrent = item.isCurrent || item.version === currentVersion;
                    const isAI = item.source === "ai";
                    const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div key={item.id} className="relative group">
                        {/* Timeline Node Dot */}
                        <div
                          className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-background transition-transform group-hover:scale-125 ${
                            isCurrent
                              ? "border-primary bg-primary ring-4 ring-primary/20"
                              : isAI
                              ? "border-amber-500 bg-amber-500"
                              : "border-border bg-muted"
                          }`}
                        />

                        {/* Snapshot Card */}
                        <div className="p-4 rounded-xl border border-border/80 bg-card hover:border-border transition-all shadow-xs space-y-3">
                          {/* Card Header: Badges & Version */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm tracking-tight text-foreground">
                                v{item.version}
                              </span>

                              {/* Current Badge */}
                              {isCurrent && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                  Current Head
                                </span>
                              )}

                              {/* Source Badge */}
                              {isAI ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  <Sparkles size={10} className="text-amber-500" />
                                  AI Generated
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border/60">
                                  <User size={10} />
                                  Manual
                                </span>
                              )}
                            </div>

                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                              <Clock size={11} />
                              {formattedDate}
                            </span>
                          </div>

                          {/* Changelog narrative */}
                          <p className="text-xs text-foreground/85 leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/40">
                            {item.changelog || "No changelog summary provided."}
                          </p>

                          {/* Author & Action buttons */}
                          <div className="flex items-center justify-between pt-1 text-xs">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              {item.author?.avatar ? (
                                <img
                                  src={item.author.avatar}
                                  alt={item.author.username}
                                  className="w-4 h-4 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold">
                                  {item.author?.username?.charAt(0).toUpperCase() || "A"}
                                </div>
                              )}
                              <span className="text-[11px] font-medium text-muted-foreground">
                                {item.author?.username || "Anonymous"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Compare Diff Button */}
                              <button
                                onClick={() => handleOpenDiff(item.version)}
                                disabled={isDiffLoading}
                                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors cursor-pointer disabled:opacity-50"
                                title="Compare this version with current"
                              >
                                <GitCompare size={12} />
                                <span>Compare</span>
                              </button>

                              {/* Permalinks to historical snapshot */}
                              <Link
                                href={`/post/${slug}/version/${item.version}`}
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                title="Open historical permalink"
                              >
                                <ExternalLink size={13} />
                              </Link>

                              {/* Restore Button (Owner only, for historical versions) */}
                              {isOwner && !isCurrent && (
                                <button
                                  onClick={() => handleRestore(item.version)}
                                  disabled={isRestoring}
                                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors cursor-pointer disabled:opacity-50"
                                  title={`Restore v${item.version}`}
                                >
                                  <RotateCcw size={11} />
                                  <span>Restore</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
