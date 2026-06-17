import React from "react";
import { SearchResultSkeleton, SeriesCardSkeleton } from "@/components/ui/Skeletons";

export default function SeriesDetailLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Hero Section Placeholder */}
      <div className="relative h-100 bg-muted/40 flex flex-col justify-center">
        <div className="relative max-w-7xl mx-auto px-4 w-full space-y-4">
          <div className="h-12 bg-muted/70 rounded w-2/3 md:w-1/2" />
          <div className="h-4 bg-muted/60 rounded w-full md:w-2/3" />
          <div className="h-4 bg-muted/60 rounded w-3/4 md:w-1/2" />
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          <div className="h-8 bg-muted/50 rounded w-1/3 mx-auto mb-8" />
          <div className="w-full md:w-4/5 mx-auto space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <SearchResultSkeleton key={idx} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom AnotherSeries Placeholder */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-6">
          <div className="h-7 bg-muted/60 rounded w-48" />
          <div className="flex gap-6 overflow-x-auto pb-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <SeriesCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
