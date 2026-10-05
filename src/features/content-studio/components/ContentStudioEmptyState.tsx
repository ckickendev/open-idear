"use client";

// =============================================================================
//  AI CONTENT STUDIO — EMPTY STATE
//  src/features/content-studio/components/ContentStudioEmptyState.tsx
// =============================================================================

import React from "react";
import { Sparkles, Compass, CheckCircle2, Layers, LineChart } from "lucide-react";

export function ContentStudioEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 sm:p-12 text-center">
      <div className="max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-xs">
          <Compass size={24} className="animate-spin-slow" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            No ideas generated yet
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Enter a topic and content goal above to synthesize structured,
            high-value editorial angles tailored for OpenIdear creators.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left">
          <div className="p-3 rounded-xl bg-card border border-border/60 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Layers size={13} className="text-primary" />
              <span>Multi-Angle</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Mix guides, teardowns, comparisons, and listicles.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/60 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <LineChart size={13} className="text-primary" />
              <span>SEO Intent</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Categorized by real search behavior and target difficulty.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/60 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <CheckCircle2 size={13} className="text-primary" />
              <span>Batch Select</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Select multiple ideas to queue into your editorial pipeline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
