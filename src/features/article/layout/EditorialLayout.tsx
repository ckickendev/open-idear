// =============================================================================
//  EDITORIAL LAYOUT
//  src/features/article/layout/EditorialLayout.tsx
//
//  Responsibilities:
//  - Provides the 760px reading column constraint.
//  - Desktop: two-column CSS Grid — TOC sidebar (220px) + body (760px).
//  - Tablet (≤1099px): single-column, TOC collapses to an accordion slot above body.
//  - Mobile (≤767px): 16px horizontal padding, hero goes full-bleed.
//
//  Slot API:
//    hero    — ArticleHero content. Rendered above the grid at full width.
//    toc     — TableOfContents. Hidden on mobile/tablet via CSS (use accordion instead).
//    tocMobile — Mobile/tablet TOC accordion slot. Hidden on desktop.
//    children — The article body content (ArticleRenderer output).
//
//  Design Decisions:
//  - CSS Grid is used instead of flexbox for precise track sizing.
//  - All widths/gaps are driven by editorial.css design tokens.
//  - No UI library dependencies — pure React + CSS custom classes.
//  - The layout does NOT import globals.css or editor.css — it relies solely
//    on editorial.css tokens already in the document head.
// =============================================================================

import React from "react";

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditorialLayoutProps {
  /**
   * Hero section — renders full-width above the TOC + body grid.
   * Typically an ArticleHero component.
   */
  hero?: React.ReactNode;

  /**
   * Table of Contents for the desktop sidebar slot.
   * Rendered in the sticky left column on desktop (≥ 1100px).
   * Hidden on tablet and mobile — provide tocMobile for those breakpoints.
   */
  toc?: React.ReactNode;

  /**
   * Mobile / tablet TOC slot — typically a collapsible accordion.
   * Shown above the article body on screens ≤ 1099px.
   * Hidden on desktop.
   */
  tocMobile?: React.ReactNode;

  /**
   * The main article content. Placed in the 760px reading column.
   * Receives the .ed-prose class for typography scoping.
   */
  children: React.ReactNode;

  /**
   * Optional class name for the outer page wrapper.
   */
  className?: string;

  /**
   * Whether the article has TOC headings.
   * When false, the two-column grid collapses to a single centered reading column.
   * Defaults to true so existing callers without the prop still get the grid layout.
   */
  hasToc?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditorialLayout({
  hero,
  toc,
  tocMobile,
  children,
  className = "",
  hasToc = true,
}: EditorialLayoutProps) {
  const contentZoneClass = `ed-content-zone${hasToc ? "" : " ed-content-zone--no-toc"}`;
  return (
    <div className={`ed-page${className ? ` ${className}` : ""}`}>
      {/* ── Reading Progress Bar placeholder ──
          The actual progress bar is a client component injected elsewhere.
          This div is a structural slot; the bar is fixed-positioned in the DOM. */}

      {/* ── Hero Zone — full width, centered, not part of the grid ── */}
      {hero && (
        <div className="ed-hero-zone" aria-label="Article hero">
          {hero}
        </div>
      )}

      {/* ── Content Zone — CSS Grid: [toc] [body] ── */}
      <div className={contentZoneClass}>

        {/* ── TOC Slot (desktop sidebar — sticky) ── */}
        <aside
          className="ed-toc-slot"
          aria-label="Table of contents"
          // Hide on tablet/mobile via CSS (.ed-toc-slot responsive rules)
        >
          {toc}
        </aside>

        {/* ── Body Slot (760px reading column) ── */}
        <main
          className="ed-body-slot"
          id="article-body"
          aria-label="Article body"
        >
          {/* Mobile / tablet TOC accordion — visible only on ≤ 1099px */}
          {tocMobile && (
            <div className="ed-toc-mobile-slot" aria-label="Table of contents">
              {tocMobile}
            </div>
          )}

          {/* Article prose content */}
          <div className="ed-prose">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
