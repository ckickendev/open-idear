"use client";

// =============================================================================
//  READING PROGRESS TRACKER HOOK
//  src/features/reading/hooks/useReadingTracker.ts
//
//  Design Decisions:
//  - High-performance reading position tracking with ZERO expensive scroll listeners.
//  - Primary tracking via IntersectionObserver on headings, paragraphs, and bottom sentinel.
//  - Uses passive throttled scroll checks via requestAnimationFrame solely for smooth
//    progress bar synchronization without re-rendering React.
//  - Automatically marks completion when progress >= 90% and bottom sentinel intersects.
//  - Monotonic Progress: Guarantees progress never rolls backward accidentally.
//  - Network Debouncing & Throttling: Synced at most once every 4 seconds or when reading pauses.
//  - Dispatches network updates during browser idle time via requestIdleCallback.
// =============================================================================

import { useEffect, useRef, useState, useCallback } from "react";
import authenticationStore from "@/store/AuthenticationStore";
import { readingApi } from "../api/reading.api";
import type { ReadingProgressData } from "../types/reading.types";

interface UseReadingTrackerOptions {
  articleId: string;
  slug?: string;
  initialProgress?: ReadingProgressData | null;
  onProgressChange?: (progress: number) => void;
  onComplete?: () => void;
}

export function useReadingTracker({
  articleId,
  slug,
  initialProgress,
  onProgressChange,
  onComplete,
}: UseReadingTrackerOptions) {
  const currentUser = authenticationStore((state) => state.currentUser);
  const isAuthenticated = Boolean(currentUser?._id);

  // Saved progress from DB
  const [savedProgress, setSavedProgress] = useState<ReadingProgressData | null>(
    initialProgress || null
  );

  // Live state
  const [currentHeading, setCurrentHeading] = useState<{ id: string; text: string } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // References for throttling and monotonic guarantees
  const maxProgressRef = useRef<number>(initialProgress?.progress || 0);
  const lastHeadingIdRef = useRef<string | null>(initialProgress?.lastHeadingId || null);
  const lastParagraphIndexRef = useRef<number | null>(initialProgress?.lastParagraphIndex || null);
  const isBottomReachedRef = useRef<boolean>(false);
  const isCompletedRef = useRef<boolean>(Boolean(initialProgress?.completedAt));

  // Network sync throttle refs
  const lastSyncTimeRef = useRef<number>(0);
  const pendingSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedProgressRef = useRef<number>(initialProgress?.progress || 0);
  const lastSyncedHeadingRef = useRef<string | null>(initialProgress?.lastHeadingId || null);

  // ── 1. Fetch initial progress if not provided ─────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !articleId) return;

    let isMounted = true;
    readingApi.getReadingProgress(articleId).then((data) => {
      if (!isMounted || !data) return;
      setSavedProgress(data);
      if (data.progress > maxProgressRef.current) {
        maxProgressRef.current = data.progress;
      }
      if (data.lastHeadingId) {
        lastHeadingIdRef.current = data.lastHeadingId;
      }
      if (data.completedAt) {
        setIsCompleted(true);
        isCompletedRef.current = true;
      }
    });

    return () => {
      isMounted = false;
    };
  }, [articleId, isAuthenticated]);

  // ── 2. Idle-scheduled Network Sync ────────────────────────────────────────
  const syncToBackend = useCallback(
    (force: boolean = false) => {
      if (!isAuthenticated || !articleId) return;

      const currentProgress = maxProgressRef.current;
      const currentHeadingId = lastHeadingIdRef.current;
      const currentParagraph = lastParagraphIndexRef.current;
      const isBottom = isBottomReachedRef.current;

      const progressDelta = Math.abs(currentProgress - lastSyncedProgressRef.current);
      const headingChanged = currentHeadingId !== lastSyncedHeadingRef.current;
      const newlyCompleted =
        ((currentProgress >= 90 && isBottom) || currentProgress >= 98) &&
        !isCompletedRef.current;

      // Skip sync if not meaningful and not forced
      if (!force && progressDelta < 2 && !headingChanged && !newlyCompleted) {
        return;
      }

      const now = Date.now();
      const timeSinceLastSync = now - lastSyncTimeRef.current;
      const MIN_SYNC_INTERVAL_MS = 4000;

      const executeSync = () => {
        const schedule =
          typeof window !== "undefined" && "requestIdleCallback" in window
            ? (window as any).requestIdleCallback
            : (cb: () => void) => setTimeout(cb, 100);

        schedule(() => {
          readingApi
            .updateReadingProgress(articleId, {
              progress: currentProgress,
              heading: currentHeadingId,
              lastHeadingId: currentHeadingId,
              paragraph: currentParagraph,
              lastParagraphIndex: currentParagraph,
              isBottomReached: isBottom,
            })
            .then((res) => {
              if (res) {
                lastSyncedProgressRef.current = res.progress;
                lastSyncedHeadingRef.current = res.lastHeadingId;
                if (res.completedAt && !isCompletedRef.current) {
                  isCompletedRef.current = true;
                  setIsCompleted(true);
                  onComplete?.();
                }
              }
            })
            .catch((err) => {
              // Non-blocking telemetry error
              console.warn("[ReadingTracker] Progress sync paused:", err?.message);
            });

          lastSyncTimeRef.current = Date.now();
        });
      };

      if (force || timeSinceLastSync >= MIN_SYNC_INTERVAL_MS) {
        if (pendingSyncTimeoutRef.current) {
          clearTimeout(pendingSyncTimeoutRef.current);
          pendingSyncTimeoutRef.current = null;
        }
        executeSync();
      } else if (!pendingSyncTimeoutRef.current) {
        // Debounce trailing edge update
        pendingSyncTimeoutRef.current = setTimeout(() => {
          pendingSyncTimeoutRef.current = null;
          executeSync();
        }, MIN_SYNC_INTERVAL_MS - timeSinceLastSync);
      }
    },
    [articleId, isAuthenticated, onComplete]
  );

  // ── 3. DOM Observers (IntersectionObserver) ──────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const articleEl = document.getElementById("article-body");
    if (!articleEl) return;

    // ── 3A. Heading & Paragraph Intersection Observer ──────────────────────
    const blockObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const targetId = target.id || "";
            const cleanId = targetId.startsWith("block-")
              ? targetId.replace("block-", "")
              : targetId;

            // If heading element
            if (/^H[1-6]$/i.test(target.tagName)) {
              const headingText = target.textContent?.replace(/^#\s*/, "").trim() || "";
              setCurrentHeading({ id: cleanId, text: headingText });
              lastHeadingIdRef.current = cleanId;
              syncToBackend(false);
            }

            // If paragraph element
            if (target.tagName.toLowerCase() === "p") {
              const pElements = Array.from(articleEl.querySelectorAll("p"));
              const pIndex = pElements.indexOf(target as HTMLParagraphElement);
              if (pIndex >= 0) {
                lastParagraphIndexRef.current = pIndex;
              }
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -40% 0px", // triggers when element enters top 60% of viewport
        threshold: [0.1],
      }
    );

    // Observe all headings and paragraphs
    const headingElements = articleEl.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headingElements.forEach((el) => blockObserver.observe(el));

    const paragraphElements = articleEl.querySelectorAll("p");
    paragraphElements.forEach((el) => blockObserver.observe(el));

    // ── 3B. Bottom Sentinel Observer ────────────────────────────────────────
    let sentinel = document.getElementById("article-bottom-sentinel");
    let createdSentinel = false;
    if (!sentinel) {
      sentinel = document.createElement("div");
      sentinel.id = "article-bottom-sentinel";
      sentinel.style.height = "2px";
      sentinel.style.width = "100%";
      sentinel.style.pointerEvents = "none";
      sentinel.style.visibility = "hidden";
      articleEl.appendChild(sentinel);
      createdSentinel = true;
    }

    const sentinelObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isBottomReachedRef.current = true;

            // When bottom is reached and progress is near completion, elevate progress
            if (maxProgressRef.current >= 85) {
              maxProgressRef.current = Math.max(maxProgressRef.current, 95);
            }

            if (maxProgressRef.current >= 90 && !isCompletedRef.current) {
              isCompletedRef.current = true;
              setIsCompleted(true);
              onComplete?.();
            }

            syncToBackend(true);
          } else {
            isBottomReachedRef.current = false;
          }
        });
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    sentinelObserver.observe(sentinel);

    // ── 3C. Passive Scroll Tracker for Progress Percentage ──────────────────
    let rafId: number | null = null;

    const computeProgress = () => {
      rafId = null;
      if (!articleEl) return;

      const { top, height } = articleEl.getBoundingClientRect();
      const articleTop = top + window.scrollY;
      const articleBottom = articleTop + height;
      const viewportBottom = window.scrollY + window.innerHeight;

      let pct = 0;
      if (viewportBottom <= articleTop) {
        pct = 0;
      } else if (viewportBottom >= articleBottom || isBottomReachedRef.current) {
        pct = 100;
      } else {
        const readSoFar = viewportBottom - articleTop;
        pct = Math.min(100, Math.max(0, Math.round((readSoFar / height) * 100)));
      }

      // Monotonic guarantee: never drop below max recorded progress
      if (pct > maxProgressRef.current) {
        maxProgressRef.current = pct;
        onProgressChange?.(pct);

        if (pct >= 90 && isBottomReachedRef.current && !isCompletedRef.current) {
          isCompletedRef.current = true;
          setIsCompleted(true);
          onComplete?.();
        }

        syncToBackend(false);
      }
    };

    const onScrollPassive = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(computeProgress);
    };

    window.addEventListener("scroll", onScrollPassive, { passive: true });
    // Initial snapshot
    computeProgress();

    // ── Cleanup ─────────────────────────────────────────────────────────────
    return () => {
      blockObserver.disconnect();
      sentinelObserver.disconnect();
      window.removeEventListener("scroll", onScrollPassive);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (createdSentinel && sentinel?.parentNode) {
        sentinel.parentNode.removeChild(sentinel);
      }
      if (pendingSyncTimeoutRef.current) {
        clearTimeout(pendingSyncTimeoutRef.current);
      }
      // Flush final position on unmount
      syncToBackend(true);
    };
  }, [syncToBackend, onProgressChange, onComplete]);

  return {
    savedProgress,
    currentHeading,
    isCompleted,
    maxProgress: maxProgressRef.current,
    resumeToHeading: (headingId: string) => {
      if (typeof window === "undefined" || !headingId) return;
      const target =
        document.getElementById(`block-${headingId}`) ||
        document.getElementById(headingId);

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
  };
}
