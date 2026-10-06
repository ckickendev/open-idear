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
// =============================================================================

import React, { useEffect, useState } from "react";
import { Sparkles, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import type {
  WritingStageStatus,
  ContentIdea,
} from "../types/contentStudio.types";

interface ArticleWritingProgressProps {
  idea: ContentIdea;
  stages: WritingStageStatus[];
  streamChunkText?: string;
  onCancel?: () => void;
  onRetry?: () => void;
}

export function ArticleWritingProgress({
  idea,
  stages,
  streamChunkText,
  onCancel,
  onRetry,
}: ArticleWritingProgressProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hasError = stages.some((s) => s.status === "error");
  const errorStage = stages.find((s) => s.status === "error");

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <div className="bg-card rounded-2xl border border-border/70 shadow-lg overflow-hidden transition-all">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-border/60 bg-muted/20 text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-1 border border-primary/20 shadow-xs">
            {hasError ? (
              <AlertCircle className="w-6 h-6 text-destructive" />
            ) : (
              <Sparkles className="w-6 h-6 animate-pulse" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {hasError ? "Article Generation Paused" : "Writing your article..."}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto line-clamp-2">
            Targeting <span className="font-semibold text-foreground">{idea.title}</span>
          </p>
          <div className="flex items-center justify-center gap-3 pt-1 text-xs text-muted-foreground">
            <span>Elapsed: {elapsedSeconds}s</span>
            <span>•</span>
            <span className="capitalize">{idea.category || "Technology"}</span>
          </div>
        </div>

        {/* Stages Checklist */}
        <div className="p-8 space-y-5">
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
          {streamChunkText && (
            <div className="p-4 rounded-xl border border-border/60 bg-muted/30 font-mono text-xs text-muted-foreground max-h-36 overflow-y-auto space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary block">
                Live Writing Stream
              </span>
              <p className="whitespace-pre-wrap leading-relaxed line-clamp-4">
                {streamChunkText}
              </p>
            </div>
          )}

          {/* Error Actions */}
          {hasError && (
            <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-4">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-border bg-background hover:bg-muted text-foreground transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Return to Outline
                </button>
              )}
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:brightness-105 transition-all shadow-xs"
                >
                  Retry Stage
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
