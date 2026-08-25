"use client";

// =============================================================================
//  READING PROGRESS
//  src/features/article/components/ReadingProgress.tsx
//
//  A fixed 2px progress bar at the top of the viewport that tracks reading
//  position through the article body.
//
//  Implementation strategy:
//  - Subscribes to scroll via a passive event listener.
//  - Uses requestAnimationFrame to batch DOM writes and avoid forced reflows
//    on every tick. A rAF handle is stored so duplicate frames are skipped.
//  - Progress width is driven by direct DOM mutation of an inline style on the
//    bar element — NOT through React state — so there are zero React re-renders
//    during scrolling. The component mounts once and never re-renders for
//    scroll events.
//  - Reads article boundaries via #article-body (the id already on the <main>
//    in EditorialLayout). Falls back to full document height if not found.
//  - Respects prefers-reduced-motion: when true the bar updates instantly
//    (no CSS transition) and the width snapshots to final position.
//  - Accessibility: role="progressbar" with aria-valuenow kept in sync via
//    rAF update. aria-label describes the bar's purpose.
//  - Styled entirely via existing .ed-progress class from editorial.css.
//    No inline color or shadow declarations.
//  - No layout shift: position:fixed, height:2px, z-index:9999, pointer-events:none.
//  - Cleanup: scroll listener and pending rAF are cancelled on unmount.
// =============================================================================

import { useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

/** ID of the article body element set by EditorialLayout. */
const ARTICLE_BODY_ID = "article-body";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    // ── Reduced motion check ─────────────────────────────────────────────────
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersReduced = mediaQuery.matches;

    // Remove CSS transition entirely when reduced-motion is preferred so the
    // bar doesn't animate between positions.
    if (prefersReduced) {
      bar.style.transition = "none";
    }

    // ── Progress calculation ──────────────────────────────────────────────────
    function getProgress(): number {
      const articleEl = document.getElementById(ARTICLE_BODY_ID);
      if (!articleEl) {
        // Fallback: full document height
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return 100;
        return Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100));
      }

      const { top, height } = articleEl.getBoundingClientRect();
      const articleTop = top + window.scrollY;
      const articleBottom = articleTop + height;
      const viewportBottom = window.scrollY + window.innerHeight;

      if (viewportBottom <= articleTop) return 0;
      if (viewportBottom >= articleBottom) return 100;

      const readSoFar = viewportBottom - articleTop;
      return Math.min(100, Math.max(0, (readSoFar / height) * 100));
    }

    // ── rAF-batched DOM update ────────────────────────────────────────────────
    function applyProgress() {
      rafRef.current = null;
      if (!barRef.current) return;

      const pct = getProgress();
      const width = `${pct.toFixed(2)}%`;

      barRef.current.style.width = width;
      // Keep ARIA in sync (throttled to rAF, not every pixel)
      barRef.current.setAttribute("aria-valuenow", String(Math.round(pct)));

      // Hide the bar when fully read (opacity handled by editorial.css transition)
      barRef.current.style.opacity = pct >= 100 ? "0" : "1";
    }

    // ── Scroll handler ────────────────────────────────────────────────────────
    function onScroll() {
      // Skip if a frame is already queued
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(applyProgress);
    }

    // Set initial position synchronously on mount (covers hash-loaded pages)
    applyProgress();

    window.addEventListener("scroll", onScroll, { passive: true });

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []); // Run once on mount — bar element never changes

  return (
    <div
      ref={barRef}
      className="ed-progress"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      // Initial width — will be updated immediately by the useEffect above
      style={{ width: "0%" }}
    />
  );
}
