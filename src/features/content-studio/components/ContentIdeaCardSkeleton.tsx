"use client";

// =============================================================================
//  AI CONTENT STUDIO — IDEA CARD SKELETON
//  src/features/content-studio/components/ContentIdeaCardSkeleton.tsx
// =============================================================================

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function ContentIdeaCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-4">
      {/* Header Badges Skeleton */}
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="w-5 h-5 rounded-md" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
      </div>

      {/* Title Lines Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-11/12 rounded-md" />
        <Skeleton className="h-5 w-3/4 rounded-md" />
      </div>

      {/* Hook Description Skeleton */}
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3.5 w-5/6 rounded" />
      </div>

      {/* Footer Strip Skeleton */}
      <div className="pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-14 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ContentStudioGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-5 animate-in fade-in-50 duration-300">
      {/* Top Bar Skeleton */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <ContentIdeaCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    </div>
  );
}
