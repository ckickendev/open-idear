"use client";
import React from "react";

interface SkeletonCardProps {
  variant?: "course" | "stat" | "post";
}

const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-gray-600/30 before:to-transparent";

const SkeletonCard: React.FC<SkeletonCardProps> = ({ variant = "course" }) => {
  if (variant === "stat") {
    return (
      <div
        className={`bg-background dark:bg-card rounded-2xl border border-border dark:border-border p-6 ${shimmer}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 w-24 bg-muted dark:bg-accent rounded mb-3" />
            <div className="h-8 w-16 bg-muted dark:bg-accent rounded" />
          </div>
          <div className="w-12 h-12 bg-muted dark:bg-accent rounded-xl" />
        </div>
      </div>
    );
  }

  if (variant === "post") {
    return (
      <div
        className={`bg-background dark:bg-card rounded-2xl border border-border dark:border-border overflow-hidden flex ${shimmer}`}
      >
        <div className="w-1/3 h-40 bg-muted dark:bg-accent" />
        <div className="w-2/3 p-5 flex flex-col justify-between">
          <div>
            <div className="h-3 w-20 bg-muted dark:bg-accent rounded mb-3" />
            <div className="h-5 w-full bg-muted dark:bg-accent rounded mb-2" />
            <div className="h-4 w-3/4 bg-muted dark:bg-accent rounded" />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-8 h-8 bg-muted dark:bg-accent rounded-full" />
            <div className="h-3 w-24 bg-muted dark:bg-accent rounded" />
          </div>
        </div>
      </div>
    );
  }

  // variant === 'course'
  return (
    <div
      className={`bg-background dark:bg-card rounded-2xl border border-border dark:border-border overflow-hidden ${shimmer}`}
    >
      <div className="aspect-video bg-muted dark:bg-accent" />
      <div className="p-5">
        <div className="h-5 w-3/4 bg-muted dark:bg-accent rounded mb-3" />
        <div className="h-4 w-full bg-muted dark:bg-accent rounded mb-2" />
        <div className="h-4 w-2/3 bg-muted dark:bg-accent rounded mb-4" />
        <div className="h-2 w-full bg-muted dark:bg-accent rounded-full mb-2" />
        <div className="flex justify-between">
          <div className="h-3 w-16 bg-muted dark:bg-accent rounded" />
          <div className="h-3 w-12 bg-muted dark:bg-accent rounded" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
