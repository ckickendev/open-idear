import React from "react";

// Shimmer wave scanning effect for fluid, active loading visual
const shimmerEffect =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-foreground/5 dark:before:via-white/5 before:to-transparent";

// ─── Post Card Skeleton ───────────────────────────────────────────────────────────
export const PostCardSkeleton: React.FC = () => {
  return (
    <div className={`col-span-1 h-full flex flex-col bg-card border border-border/50 rounded-xl p-3 ${shimmerEffect}`}>
      <div className="flex-1">
        {/* Thumbnail Placeholder */}
        <div className="w-full aspect-[16/10] bg-muted/70 rounded-lg animate-pulse" />

        {/* Title Placeholder */}
        <div className="h-3.5 bg-muted/80 rounded w-11/12 mt-3 mb-2 animate-pulse" />
        <div className="h-3.5 bg-muted/80 rounded w-8/12 mb-3 animate-pulse" />

        {/* Excerpt Placeholder */}
        <div className="h-2.5 bg-muted/50 rounded w-full mb-1.5 animate-pulse" />
        <div className="h-2.5 bg-muted/50 rounded w-10/12 mb-4 animate-pulse" />
      </div>

      {/* Author and Readtime Metadata */}
      <div className="flex items-center gap-2 pt-2.5 border-t border-border/40 mt-auto">
        <div className="w-4 h-4 rounded-full bg-muted/70 animate-pulse" />
        <div className="h-2.5 bg-muted/60 rounded w-16 animate-pulse" />
        <div className="w-1 h-1 rounded-full bg-muted/40 mx-1" />
        <div className="h-2.5 bg-muted/60 rounded w-12 animate-pulse" />
      </div>
    </div>
  );
};

// ─── Course Card Skeleton ─────────────────────────────────────────────────────────
interface CourseCardSkeletonProps {
  className?: string;
}

export const CourseCardSkeleton: React.FC<CourseCardSkeletonProps> = ({ className }) => {
  return (
    <div className={`bg-card border border-border/50 rounded-xl p-3 ${shimmerEffect} ${className || "w-[300px] flex-shrink-0"}`}>
      {/* Thumbnail Placeholder */}
      <div className="w-full aspect-video bg-muted/70 rounded-lg mb-3 animate-pulse" />

      {/* Title Placeholder */}
      <div className="h-3.5 bg-muted/80 rounded w-11/12 mb-2 animate-pulse" />
      <div className="h-3.5 bg-muted/80 rounded w-2/3 mb-3.5 animate-pulse" />

      {/* Instructor name */}
      <div className="h-2.5 bg-muted/60 rounded w-1/3 mb-2.5 animate-pulse" />

      {/* Rating & reviews */}
      <div className="h-3 bg-muted/50 rounded w-1/2 mb-2.5 animate-pulse" />

      {/* Metas: duration & lectures */}
      <div className="h-2.5 bg-muted/50 rounded w-2/3 mb-3.5 animate-pulse" />

      {/* Price tag */}
      <div className="flex items-center justify-between pt-2.5 border-t border-border/40">
        <div className="h-3.5 bg-muted/80 rounded w-1/3 animate-pulse" />
      </div>
    </div>
  );
};

// ─── Series Card Skeleton ─────────────────────────────────────────────────────────
export const SeriesCardSkeleton: React.FC = () => {
  return (
    <div className={`flex-shrink-0 w-64 bg-card border border-border/50 rounded-xl p-3 ${shimmerEffect}`}>
      {/* Cover Image Placeholder */}
      <div className="w-full h-36 bg-muted/70 rounded-lg mb-3 animate-pulse" />

      {/* Title Placeholder */}
      <div className="h-3.5 bg-muted/80 rounded w-11/12 mb-2 animate-pulse" />
      
      {/* Author Name */}
      <div className="h-2.5 bg-muted/60 rounded w-1/3 animate-pulse" />
    </div>
  );
};

// ─── Comment Skeleton ─────────────────────────────────────────────────────────────
export const CommentSkeleton: React.FC = () => {
  return (
    <div className={`flex gap-3 py-4 border-b border-border/40 ${shimmerEffect}`}>
      {/* Avatar placeholder */}
      <div className="w-8 h-8 rounded-full bg-muted/70 flex-shrink-0 animate-pulse" />
      
      {/* Content lines */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-2.5 bg-muted/80 rounded w-20 animate-pulse" />
          <div className="h-2 bg-muted/50 rounded w-12 animate-pulse" />
        </div>
        <div className="h-3 bg-muted/50 rounded w-full animate-pulse" />
        <div className="h-3 bg-muted/50 rounded w-10/12 animate-pulse" />
      </div>
    </div>
  );
};

// ─── Profile Skeleton ─────────────────────────────────────────────────────────────
export const ProfileSkeleton: React.FC = () => {
  return (
    <div className={`max-w-4xl mx-auto bg-card border border-border/60 rounded-2xl overflow-hidden ${shimmerEffect}`}>
      {/* Banner */}
      <div className="h-40 bg-muted/50 animate-pulse" />

      {/* Avatar details */}
      <div className="px-6 pb-6 relative">
        <div className="w-24 h-24 rounded-full border-4 border-card bg-muted/70 -mt-12 relative z-10 animate-pulse" />
        
        {/* Info */}
        <div className="mt-4 space-y-2.5">
          <div className="h-5 bg-muted/80 rounded w-48 animate-pulse" />
          <div className="h-3.5 bg-muted/50 rounded w-32 animate-pulse" />
          <div className="h-3 bg-muted/40 rounded w-2/3 mt-2 animate-pulse" />
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-6 pt-4 border-t border-border/40">
          <div className="w-20 h-10 bg-muted/40 rounded-lg animate-pulse" />
          <div className="w-20 h-10 bg-muted/40 rounded-lg animate-pulse" />
          <div className="w-20 h-10 bg-muted/40 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// ─── Search Result Skeleton ───────────────────────────────────────────────────────
interface SearchResultSkeletonProps {
  className?: string;
}

export const SearchResultSkeleton: React.FC<SearchResultSkeletonProps> = ({ className }) => {
  return (
    <div className={`grid md:grid-cols-5 gap-4 bg-card border border-border/50 rounded-xl p-4 ${shimmerEffect} ${className || ""}`}>
      {/* Left thumbnail column */}
      <div className="md:col-span-2 aspect-[16/10] bg-muted/70 rounded-lg animate-pulse" />

      {/* Right details column */}
      <div className="md:col-span-3 flex flex-col justify-between py-1 space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-muted/80 rounded w-11/12 animate-pulse" />
          <div className="h-4 bg-muted/80 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-muted/50 rounded w-full pt-2 animate-pulse" />
          <div className="h-3 bg-muted/50 rounded w-10/12 animate-pulse" />
        </div>

        {/* Footer info */}
        <div className="h-3 bg-muted/40 rounded w-1/3 pt-2.5 border-t border-border/40 animate-pulse" />
      </div>
    </div>
  );
};

// ─── Sidebar Skeleton ────────────────────────────────────────────────────────────
export const SidebarSkeleton: React.FC = () => {
  return (
    <div className={`bg-card border border-border/50 rounded-xl p-4 space-y-4 ${shimmerEffect}`}>
      {/* Header */}
      <div className="h-3.5 bg-muted/80 rounded w-1/3 pb-2 border-b border-border/40 animate-pulse" />
      
      {/* Items */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-2.5 items-start">
            <div className="w-10 h-10 rounded-lg bg-muted/70 flex-shrink-0 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 bg-muted/80 rounded w-11/12 animate-pulse" />
              <div className="h-2 bg-muted/50 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Feature Skeleton ───────────────────────────────────────────────────────
export const MainFeatureSkeleton: React.FC = () => {
  return (
    <div className={`flex flex-col md:flex-row w-full lg:w-4/5 border border-border bg-card p-4 h-auto md:h-[400px] rounded-2xl ${shimmerEffect}`}>
      {/* Left Thumbnail */}
      <div className="h-48 md:h-full w-full md:w-3/5 bg-muted/70 rounded-xl animate-pulse" />
      {/* Right Content */}
      <div className="p-4 md:py-6 md:px-8 w-full md:w-2/5 flex flex-col justify-center space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-muted/70 rounded-full animate-pulse" />
          <div className="h-3 bg-muted/80 rounded w-16 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-5 bg-muted/80 rounded w-11/12 animate-pulse" />
          <div className="h-5 bg-muted/80 rounded w-3/4 animate-pulse" />
        </div>
        <div className="space-y-1.5 pt-2">
          <div className="h-3 bg-muted/50 rounded w-full animate-pulse" />
          <div className="h-3 bg-muted/50 rounded w-5/6 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 pt-4 border-t border-border/40 mt-auto">
          <div className="h-3 bg-muted/60 rounded w-24 animate-pulse" />
          <div className="w-1 h-1 rounded-full bg-muted/30" />
          <div className="h-3 bg-muted/60 rounded w-16 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// ─── Feed Loading Cue ────────────────────────────────────────────────────────────
export const FeedLoadingCue: React.FC<{ activeLocale?: string; className?: string }> = ({
  activeLocale = "en",
  className = "",
}) => {
  const isVi = activeLocale === "vi";
  return (
    <div className={`flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground transition-all duration-300 ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
      </span>
      <span>{isVi ? "Đang đồng bộ bài viết mới từ máy chủ..." : "Connecting & syncing latest ideas from server..."}</span>
    </div>
  );
};
