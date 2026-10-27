"use client";

// =============================================================================
//  TABLE OF CONTENTS
//  src/features/article/components/TableOfContents.tsx
//
//  Renders a navigable list of article headings. Client-only because it
//  requires browser APIs (IntersectionObserver, history, scrollTo).
//
//  Props:
//    items   — Array of TableOfContentsItem produced by buildTableOfContents().
//    variant — "desktop" (sidebar) | "mobile" (accordion). Defaults to "desktop".
//
//  Active heading tracking:
//    IntersectionObserver watches each heading element.
//    The topmost heading that has passed the reading threshold becomes active.
//    rootMargin "-80px 0px -60% 0px" excludes content below the reading midpoint
//    and accounts for a ~80px sticky site header.
//
//  ID contract:
//    Each item.id is "block-{uuid}" — matches ArticleRenderer DOM ids exactly.
//    TOC anchor hrefs are "#block-{uuid}".
//
//  Click behavior:
//    1. preventDefault() — no browser jump
//    2. scrollToHeading() — smooth scroll with header offset
//    3. history.replaceState() — update URL hash without reload
//    4. setActiveId() — update active state immediately
//
//  Hash on load:
//    useEffect reads window.location.hash on mount and scrolls to the target
//    after a short delay to let the layout stabilize.
//
//  Reduced motion:
//    Respects prefers-reduced-motion. When true, scroll behavior is "instant".
//
//  Mobile variant:
//    Wraps items in a <details> element.
//    Clicking a TOC item closes the accordion via ref.current.removeAttribute("open").
// =============================================================================

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlignLeft } from "lucide-react";
import type { TableOfContentsItem } from "../utils/buildTableOfContents";
import { useTranslation } from "@/app/hook/useTranslation";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Height of the sticky site header in pixels. Used for scroll offset. */
const HEADER_OFFSET = 88;

/**
 * IntersectionObserver rootMargin:
 * - Top: -HEADER_OFFSET so we don't activate headings hidden behind the header.
 * - Bottom: -55% so only headings in the upper half of the viewport activate.
 */
const IO_ROOT_MARGIN = `-${HEADER_OFFSET}px 0px -55% 0px`;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TableOfContentsProps {
  /** Ordered heading items from buildTableOfContents(). */
  items: TableOfContentsItem[];
  /**
   * "desktop" → plain nav list (used in the sticky sidebar).
   * "mobile"  → wrapped in a <details> accordion.
   */
  variant?: "desktop" | "mobile";
}

// ─── Scroll Helper ────────────────────────────────────────────────────────────

function getReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToHeading(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;

  const behavior: ScrollBehavior = getReducedMotion() ? "instant" : "smooth";
  const top =
    el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET - 8;

  window.scrollTo({ top, behavior });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TableOfContents({
  items,
  variant = "desktop",
}: TableOfContentsProps) {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string>("");
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // Memoize the set of ids for fast lookup in the observer callback
  const idSet = useMemo(() => new Set(items.map((i) => i.id)), [items]);

  // ── IntersectionObserver — active heading tracking ────────────────────────

  useEffect(() => {
    if (items.length === 0) return;

    // Collect all heading elements matching our TOC ids
    const headingElements: Element[] = [];
    for (const id of idSet) {
      const el = document.getElementById(id);
      if (el) headingElements.push(el);
    }
    if (headingElements.length === 0) return;

    // Track which headings are currently "intersecting"
    // We want the topmost intersecting heading to be active.
    const intersectingIds = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (!idSet.has(id)) continue;
          if (entry.isIntersecting) {
            intersectingIds.add(id);
          } else {
            intersectingIds.delete(id);
          }
        }

        if (intersectingIds.size === 0) return;

        // Pick the topmost intersecting heading (earliest in the items list)
        for (const item of items) {
          if (intersectingIds.has(item.id)) {
            setActiveId(item.id);
            break;
          }
        }
      },
      {
        rootMargin: IO_ROOT_MARGIN,
        threshold: 0,
      }
    );

    for (const el of headingElements) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, [items, idSet]);

  // ── Hash on mount — scroll to anchor if URL contains a hash ──────────────

  useEffect(() => {
    const hash = window.location.hash.slice(1); // strip leading "#"
    if (hash && idSet.has(hash)) {
      // Short delay so the layout has painted before we measure positions
      const timer = setTimeout(() => {
        scrollToHeading(hash);
        setActiveId(hash);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [idSet]);

  // ── popstate — browser back/forward hash navigation ───────────────────────

  useEffect(() => {
    function handlePopState() {
      const hash = window.location.hash.slice(1);
      if (hash && idSet.has(hash)) {
        scrollToHeading(hash);
        setActiveId(hash);
      }
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [idSet]);

  // ── Click handler ─────────────────────────────────────────────────────────

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      scrollToHeading(id);
      // Update URL hash without triggering a page reload
      history.replaceState(null, "", `#${id}`);
      setActiveId(id);
      // Close the mobile accordion after navigation
      if (detailsRef.current) {
        detailsRef.current.removeAttribute("open");
      }
    },
    []
  );

  // ── Empty state ───────────────────────────────────────────────────────────

  if (items.length === 0) return null;

  // ── TOC item list (shared by both variants) ───────────────────────────────

  const tocList = (
    <ol className="ed-toc__list space-y-1" aria-label="Sections in this article">
      {items.map((item) => {
        const isActive = item.id === activeId;
        const isH3 = item.level === 3;

        return (
          <li key={item.id} className="ed-toc__item">
            <a
              href={`#${item.id}`}
              className={`group flex items-start text-xs py-1.5 px-2.5 rounded-lg transition-all duration-200 leading-snug ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-2 shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              } ${isH3 ? "ml-3 text-[11px] opacity-90" : ""}`}
              onClick={(e) => handleClick(e, item.id)}
              aria-current={isActive ? "true" : undefined}
            >
              <span className="line-clamp-2">{item.text}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  // ── Desktop variant ───────────────────────────────────────────────────────

  if (variant === "desktop") {
    return (
      <nav
        className="ed-toc bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 p-4 shadow-xs"
        aria-label="Table of contents"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <AlignLeft className="w-3.5 h-3.5 text-primary" />
            {t("component.article.toc", "Table of Contents")}
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {items.length}
          </span>
        </div>
        {tocList}
      </nav>
    );
  }

  // ── Mobile variant — <details> accordion ─────────────────────────────────

  return (
    <details
      ref={detailsRef}
      className="ed-toc-accordion bg-card/60 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden shadow-xs mb-6"
    >
      <summary className="ed-toc-accordion__trigger flex items-center justify-between p-3.5 cursor-pointer select-none">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
          <AlignLeft className="w-3.5 h-3.5 text-primary" />
          {t("component.article.toc", "Table of Contents")}
          <span className="text-[11px] font-normal text-muted-foreground">
            ({items.length})
          </span>
        </span>
        {/* Chevron icon — CSS handles rotation via details[open] */}
        <svg
          className="ed-toc-accordion__chevron text-muted-foreground"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className="ed-toc-accordion__body p-3 border-t border-border/40 bg-muted/20">
        <nav aria-label="Table of contents">{tocList}</nav>
      </div>
    </details>
  );
}
