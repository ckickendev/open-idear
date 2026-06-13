import React from "react";

export default function PostDetailLoading() {
  return (
    <div className="w-full bg-background animate-pulse">
      {/* Cover Image Placeholder */}
      <div className="relative mb-6">
        <div className="w-full h-80 bg-muted/60 rounded-lg" />
        <div className="max-w-4xl mx-auto px-4 py-2 mt-2">
          <div className="h-3 bg-muted/40 rounded w-1/3" />
        </div>
      </div>

      {/* Article Container */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <article className="max-w-4xl space-y-6">
          {/* Category Tag */}
          <div className="h-5 bg-muted/50 rounded w-20" />

          {/* Headline (Title) */}
          <div className="space-y-3">
            <div className="h-10 md:h-12 bg-muted/80 rounded w-11/12" />
            <div className="h-10 md:h-12 bg-muted/80 rounded w-8/12" />
          </div>

          {/* Subheadline (Description) */}
          <div className="space-y-2 pt-2">
            <div className="h-4 bg-muted/50 rounded w-full" />
            <div className="h-4 bg-muted/50 rounded w-10/12" />
          </div>

          {/* Author and Date metadata */}
          <div className="flex items-center justify-between py-6 border-b border-border/40">
            <div className="space-y-2">
              <div className="h-4 bg-muted/60 rounded w-32" />
              <div className="h-3 bg-muted/40 rounded w-24" />
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-muted/60" />
              <div className="w-8 h-8 rounded-full bg-muted/60" />
            </div>
          </div>

          {/* Article Body Content Skeletons */}
          <div className="space-y-4 pt-4">
            <div className="h-4 bg-muted/50 rounded w-full" />
            <div className="h-4 bg-muted/50 rounded w-11/12" />
            <div className="h-4 bg-muted/50 rounded w-10/12" />
            <div className="h-4 bg-muted/50 rounded w-full" />
            <div className="h-4 bg-muted/50 rounded w-4/5" />
          </div>

          <div className="space-y-4 pt-6">
            <div className="h-5 bg-muted/60 rounded w-1/4" />
            <div className="h-4 bg-muted/50 rounded w-full" />
            <div className="h-4 bg-muted/50 rounded w-11/12" />
            <div className="h-4 bg-muted/50 rounded w-3/4" />
          </div>

          {/* Related topics */}
          <div className="pt-8 space-y-3">
            <div className="h-6 bg-muted/60 rounded w-32" />
            <div className="flex gap-2.5">
              <div className="h-6 bg-muted/50 rounded-md w-20" />
              <div className="h-6 bg-muted/50 rounded-md w-24" />
              <div className="h-6 bg-muted/50 rounded-md w-16" />
            </div>
          </div>
        </article>
      </div>

      {/* Bottom suggestions container (HotPosts) */}
      <div className="max-w-full mx-auto px-4 py-12 border-t border-border/40 mt-12 bg-muted/10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-7 bg-muted/70 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border/50 rounded-xl p-3 h-64 bg-muted/20" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
