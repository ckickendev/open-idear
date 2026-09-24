"use client";

// =============================================================================
//  RESUME READING TOAST
//  src/features/reading/components/ResumeReadingToast.tsx
//
//  Design Decisions:
//  - Displays a clean floating pill when reader has prior reading progress (>5%).
//  - Shows section title (e.g. Continue from "Redis Persistence").
//  - Clicking "Resume" smoothly scrolls directly to the bookmark heading anchor.
//  - Auto-dismisses after 12 seconds or when reader manually closes it.
// =============================================================================

import React, { useEffect, useState } from "react";
import { Bookmark, ArrowRight, X } from "lucide-react";
import type { ReadingProgressData } from "../types/reading.types";

interface ResumeReadingToastProps {
  savedProgress: ReadingProgressData | null;
  className?: string;
}

export default function ResumeReadingToast({
  savedProgress,
  className = "",
}: ResumeReadingToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [targetHeadingTitle, setTargetHeadingTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!savedProgress) return;

    // Only show toast if user has meaningful unfinished progress (> 5% and < 98%)
    const hasMeaningfulProgress =
      savedProgress.progress >= 5 &&
      savedProgress.progress < 98 &&
      !savedProgress.completedAt;

    if (!hasMeaningfulProgress) return;

    // Try to resolve the heading title from DOM or fallback
    let headingText: string | null = null;
    if (savedProgress.lastHeadingId) {
      const headingEl =
        document.getElementById(`block-${savedProgress.lastHeadingId}`) ||
        document.getElementById(savedProgress.lastHeadingId);

      if (headingEl) {
        headingText =
          headingEl.textContent?.replace(/^#\s*/, "").trim() ||
          savedProgress.lastHeadingId;
      }
    }

    setTargetHeadingTitle(headingText);

    // Show toast with subtle delay to prevent layout pop
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 600);

    // Auto dismiss after 12 seconds
    const autoDismissTimer = setTimeout(() => {
      setIsVisible(false);
    }, 12000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(autoDismissTimer);
    };
  }, [savedProgress]);

  const handleResume = () => {
    if (!savedProgress) return;

    // 1. Try to scroll to heading
    if (savedProgress.lastHeadingId) {
      const target =
        document.getElementById(`block-${savedProgress.lastHeadingId}`) ||
        document.getElementById(savedProgress.lastHeadingId);

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setIsVisible(false);
        return;
      }
    }

    // 2. Fallback: scroll by percentage of article-body
    const articleEl = document.getElementById("article-body");
    if (articleEl && savedProgress.progress > 0) {
      const { top, height } = articleEl.getBoundingClientRect();
      const articleTop = top + window.scrollY;
      const targetScroll = articleTop + (height * savedProgress.progress) / 100 - 100;
      window.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
    }

    setIsVisible(false);
  };

  if (!isVisible || !savedProgress) return null;

  return (
    <aside
      role="status"
      aria-label="Resume reading banner"
      className={`fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] sm:w-auto
        bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md
        border border-zinc-200 dark:border-zinc-800
        shadow-xl shadow-zinc-950/10 dark:shadow-black/40
        rounded-2xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
          <Bookmark size={18} />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Resume Reading
            </span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              • {savedProgress.progress}% read
            </span>
          </div>

          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
            {targetHeadingTitle ? (
              <>
                Continue from &ldquo;<span className="text-indigo-600 dark:text-indigo-400">{targetHeadingTitle}</span>&rdquo;
              </>
            ) : (
              "Jump back to where you left off"
            )}
          </p>

          <div className="flex items-center gap-2.5 mt-3">
            <button
              type="button"
              onClick={handleResume}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <span>Resume</span>
              <ArrowRight size={13} />
            </button>
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 p-1 rounded-md transition-colors"
          aria-label="Close resume notification"
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  );
}
