"use client";

import React from "react";
import { Sparkles, MessageSquare } from "lucide-react";
import type { PublishTaskResult } from "../api/publishing.api";

interface PublishingSuggestionsProps {
  readonly taskResults: Record<string, PublishTaskResult>;
}

export function PublishingSuggestions({ taskResults }: PublishingSuggestionsProps) {
  const review = taskResults.review;
  const suggestions: readonly string[] = review?.outputData?.suggestions || [];

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          AI Suggestions
        </h3>
        <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-border/60 bg-accent/5">
          <Sparkles className="w-6 h-6 text-muted-foreground/50 mb-2" />
          <p className="text-xs font-semibold text-foreground">All clear!</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 max-w-xs">
            No style suggestions reported by the preflight model.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        AI Quality Suggestions
      </h3>

      <div className="flex flex-col gap-2">
        {suggestions.map((suggestion, idx) => (
          <div
            key={idx}
            className="flex gap-3 p-3 rounded-lg border border-border/40 bg-background/50 shadow-sm animate-[fade-in_0.15s_ease-out]"
          >
            <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-normal">
              {suggestion}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
