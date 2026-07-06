"use client";

import React from "react";

interface PublishingScoreProps {
  readonly score: number;
}

export function PublishingScore({ score }: PublishingScoreProps) {
  const strokeDashoffset = 251.2 - (251.2 * score) / 100;

  // Determine score color classes
  let strokeColor = "stroke-destructive";
  let textColor = "text-destructive";
  let label = "Needs Work";

  if (score >= 80) {
    strokeColor = "stroke-emerald-500";
    textColor = "text-emerald-500";
    label = "Ready to Go!";
  } else if (score >= 50) {
    strokeColor = "stroke-amber-500";
    textColor = "text-amber-500";
    label = "Acceptable";
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-accent/5 rounded-xl border border-border/50">
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* SVG Concentric Ring */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            className="stroke-muted fill-transparent"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            className={`fill-transparent transition-all duration-1000 ease-out ${strokeColor}`}
            strokeWidth="8"
            strokeDasharray="251.2"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-2xl font-bold tracking-tight ${textColor}`}>
            {score}%
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            Score
          </span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <h4 className="text-sm font-semibold text-foreground">Content Quality Score</h4>
        <p className="text-xs text-muted-foreground mt-1">
          Your article is <span className="font-semibold">{label}</span> based on readability audits.
        </p>
      </div>
    </div>
  );
}
