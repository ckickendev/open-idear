"use client";

// =============================================================================
//  AI CONTENT STUDIO — ERROR STATE
//  src/features/content-studio/components/ContentStudioErrorState.tsx
// =============================================================================

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentStudioErrorStateProps {
  errorMessage?: string | null;
  onRetry: () => void;
}

export function ContentStudioErrorState({
  errorMessage,
  onRetry,
}: ContentStudioErrorStateProps) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 sm:p-10 text-center animate-in fade-in-50">
      <div className="max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle size={24} />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            We couldn&apos;t generate ideas right now.
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {errorMessage ||
              "The AI model encountered a temporary timeout or network interruption. Please verify your connection or try again."}
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs cursor-pointer"
          >
            <RefreshCw size={15} />
            <span>Try again</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
