"use client";

// =============================================================================
//  AI CONTENT STUDIO — ARTICLE WRITING PROGRESS COMPONENT
//  src/features/content-studio/components/ArticleWritingProgress.tsx
//
//  Design Decisions:
//  - Displays real, verified pipeline progress stages for article compilation:
//    1. Understanding content brief & editorial directives
//    2. Building article structure & heading hierarchy
//    3. Drafting comprehensive long-form content (WriterAgent execution)
//    4. Structuring into blocks-v1 format (ContentStructureService)
//    5. Initializing editor draft & autosave
//  - Uses distinct status glyphs:
//    ✓ completed, ● active/running, ○ pending, ✕ error
//  - Displays live streaming preview or token activity when available.
//  - On completion: Offers new tab opening mechanism and keeps topic and ideas
//    fully preserved in the studio so users can immediately write more articles.
// =============================================================================

import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  Check,
} from "lucide-react";
import type {
  WritingStageStatus,
  ContentIdea,
  CompletedArticleInfo,
} from "../types/contentStudio.types";

interface ArticleWritingProgressProps {
  idea: ContentIdea;
  stages: WritingStageStatus[];
  streamChunkText?: string;
  completedArticle?: CompletedArticleInfo | null;
  openInNewTab?: boolean;
  onToggleOpenInNewTab?: (val: boolean) => void;
  onCancel?: () => void;
  onRetry?: () => void;
  onBackToOutline?: () => void;
  onBackToBrief?: () => void;
  onBackToIdeas?: () => void;
}

export function ArticleWritingProgress({
  idea,
  stages,
  streamChunkText,
  completedArticle,
  openInNewTab = true,
  onToggleOpenInNewTab,
  onCancel,
  onRetry,
  onBackToOutline,
  onBackToBrief,
  onBackToIdeas,
}: ArticleWritingProgressProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const hasError = stages.some((s) => s.status === "error");
  const isAllCompleted =
    stages.length > 0 && stages.every((s) => s.status === "completed");

  useEffect(() => {
    if (isAllCompleted || hasError) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isAllCompleted, hasError]);

  const editorUrl = completedArticle?.url || "/create";

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <div className="bg-card rounded-2xl border border-border/70 shadow-lg overflow-hidden transition-all">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-border/60 bg-muted/20 text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-1 border border-primary/20 shadow-xs">
            {hasError ? (
              <AlertCircle className="w-6 h-6 text-destructive" />
            ) : isAllCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-in zoom-in-75 duration-300" />
            ) : (
              <Sparkles className="w-6 h-6 animate-pulse" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {hasError
              ? "Article Generation Paused"
              : isAllCompleted
              ? "Article Ready for Review!"
              : "Writing your article..."}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto line-clamp-2">
            Targeting <span className="font-semibold text-foreground">{idea.title}</span>
          </p>
          <div className="flex items-center justify-center gap-3 pt-1 text-xs text-muted-foreground">
            <span>
              {isAllCompleted ? "Completed in" : "Elapsed"}: {elapsedSeconds}s
            </span>
            <span>•</span>
            <span className="capitalize">{idea.category || "Technology"}</span>
            {isAllCompleted && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" /> Draft Saved
                </span>
              </>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-6">
          {/* Completion Action Callout Banner */}
          {isAllCompleted && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-primary/5 to-muted/20 border border-emerald-500/30 shadow-xs space-y-4 animate-in fade-in-50 duration-300">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/25">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span>Draft Successfully Generated!</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Topic Preserved
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    OpenIdear keeps your topic and generated ideas active right here. Review and refine your new draft in the Editor in a new tab without losing your place.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a
                  href={editorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:brightness-105 active:scale-[0.98] transition-all shadow-md shadow-primary/25 cursor-pointer"
                >
                  <span>Open in Editor (New Tab)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {onBackToIdeas && (
                  <button
                    type="button"
                    onClick={onBackToIdeas}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border bg-background hover:bg-muted text-foreground transition-all shadow-xs cursor-pointer"
                    title="Return to Step 1: Ideas"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Pick Another Idea</span>
                  </button>
                )}

                {onBackToOutline && (
                  <button
                    type="button"
                    onClick={onBackToOutline}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all cursor-pointer"
                    title="Return to Step 3: Outline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Review Outline</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Stages Checklist */}
          <div className="space-y-4 font-mono text-sm">
            {stages.map((stage) => {
              const isCompleted = stage.status === "completed";
              const isRunning = stage.status === "running";
              const isError = stage.status === "error";

              return (
                <div
                  key={stage.id}
                  className={`flex items-start gap-3.5 transition-all ${
                    isRunning
                      ? "text-primary font-semibold"
                      : isCompleted
                      ? "text-foreground font-medium"
                      : isError
                      ? "text-destructive font-semibold"
                      : "text-muted-foreground/60"
                  }`}
                >
                  <span className="shrink-0 mt-0.5 font-bold">
                    {isCompleted && (
                      <span className="text-emerald-500 font-sans text-base">✓</span>
                    )}
                    {isRunning && (
                      <Loader2 className="w-4 h-4 text-primary animate-spin inline-block" />
                    )}
                    {isError && (
                      <span className="text-destructive font-sans text-base">✕</span>
                    )}
                    {stage.status === "idle" && (
                      <span className="text-muted-foreground/40 font-sans text-base">○</span>
                    )}
                  </span>

                  <div className="flex-1">
                    <p className="leading-snug">{stage.label}</p>
                    {isError && stage.error && (
                      <p className="text-xs text-destructive/90 font-sans mt-1 font-normal">
                        Error: {stage.error}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Excerpt (during streaming) */}
          {streamChunkText && !isAllCompleted && (
            <div className="p-4 rounded-xl border border-border/60 bg-muted/30 font-mono text-xs text-muted-foreground max-h-36 overflow-y-auto space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary block">
                Live Writing Stream
              </span>
              <p className="whitespace-pre-wrap leading-relaxed line-clamp-4">
                {streamChunkText}
              </p>
            </div>
          )}
        </div>

        {/* User Preference Bar */}
        <div className="px-8 py-3 bg-muted/10 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => onToggleOpenInNewTab?.(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer accent-primary"
            />
            <span className="font-medium text-foreground">
              Open editor in a new tab when ready
            </span>
            <span className="hidden sm:inline text-muted-foreground/70">
              (preserves topic & ideas here)
            </span>
          </label>

          {isAllCompleted && (
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Ready in new tab
            </span>
          )}
        </div>

        {/* Navigation & Controls */}
        <div className="p-4 px-8 border-t border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onBackToOutline || onCancel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-background hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs"
              title="Return to Step 3: Outline"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Outline</span>
            </button>

            {onBackToBrief && (
              <button
                type="button"
                onClick={onBackToBrief}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all cursor-pointer"
                title="Return to Step 2: Content Brief"
              >
                <span>Brief</span>
              </button>
            )}

            {onBackToIdeas && (
              <button
                type="button"
                onClick={onBackToIdeas}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all cursor-pointer"
                title="Return to Step 1: Ideas"
              >
                <Lightbulb className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Ideas</span>
              </button>
            )}
          </div>

          {hasError && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:brightness-105 transition-all shadow-xs cursor-pointer"
            >
              Retry Stage
            </button>
          )}

          {isAllCompleted && (
            <a
              href={editorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:brightness-105 transition-all shadow-xs cursor-pointer"
            >
              <span>Open Editor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
