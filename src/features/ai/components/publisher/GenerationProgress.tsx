"use client";

import React from "react";
import { CheckCircle2, Circle, AlertCircle, Loader2 } from "lucide-react";

export type StepStatus = "idle" | "running" | "completed" | "error";

export interface PipelineStep {
  id: "planner" | "writer" | "seo" | "cover_image" | "validator" | "saving";
  name: string;
  label: string;
  status: StepStatus;
  detail?: string;
}

export interface GenerationProgressProps {
  steps: PipelineStep[];
  isGenerating: boolean;
  progressiveMsg?: string;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  steps,
  isGenerating,
  progressiveMsg,
  errorMessage,
  onRetry,
}) => {
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);
  const activeStep = steps.find((s) => s.status === "running");

  return (
    <div className="space-y-3 pt-2">
      {/* Top status bar with progress percentage */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin" />
          <span className="font-semibold text-foreground">
            {progressiveMsg || activeStep?.label || "Processing..."}
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground font-medium">
          {progressPercent}%
        </span>
      </div>

      {/* Thin elegant progress track */}
      <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-violet-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.max(5, progressPercent)}%` }}
        />
      </div>

      {/* Error Notice if any */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start justify-between gap-2 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-[11px] font-bold underline hover:no-underline shrink-0 cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Agent steps list */}
      <div className="space-y-1.5 pt-1">
        {steps.map((step) => {
          const isRunning = step.status === "running";
          const isCompleted = step.status === "completed";
          const isError = step.status === "error";

          return (
            <div
              key={step.id}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition-all duration-200 ${
                isRunning
                  ? "bg-violet-500/10 border-violet-500/30 text-foreground shadow-xs"
                  : isCompleted
                  ? "bg-muted/30 border-border/40 text-muted-foreground"
                  : isError
                  ? "bg-destructive/10 border-destructive/30 text-destructive"
                  : "bg-transparent border-transparent text-muted-foreground/60"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : isRunning ? (
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
                  </span>
                ) : isError ? (
                  <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                ) : (
                  <Circle className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                )}

                <span
                  className={`font-medium truncate ${
                    isRunning ? "text-violet-600 dark:text-violet-300 font-semibold" : ""
                  }`}
                >
                  {step.name}
                </span>
              </div>

              <span className="text-[11px] text-muted-foreground/80 truncate max-w-[170px] text-right">
                {step.detail || step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
