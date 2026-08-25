// =============================================================================
//  ARTICLE META
//  src/features/article/components/ArticleMeta.tsx
//
//  Presentation-only component. No API calls, no global state, no side effects.
//
//  Renders the editorial article header:
//    1. Category eyebrow  (optional)
//    2. Article title      <h1>
//    3. Description        (optional)
//    4. Author identity    (avatar + name + role)
//    5. Publication meta   (date · updated date · reading time)
//    6. Tags               (optional)
//
//  Design decisions:
//  - Server Component by default — no interactivity needed; no "use client".
//  - All visual styling uses existing .ed-* classes from editorial.css.
//    New classes added in this file's companion CSS block follow the same
//    ed-article-meta__* BEM convention.
//  - Avatar fallback: initials-based SVG — no external service, no new dep.
//  - Dates use <time datetime="..."> for semantics + machine readability.
//  - Color-independent active states (text + underline, not color alone).
//  - Tags omitted when array is absent or empty — no placeholder rendering.
// =============================================================================

import React from "react";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ArticleMetaAuthor {
  /** Display name shown beneath the avatar. */
  name: string;
  /** Absolute or relative URL to the author avatar image. */
  avatarUrl?: string;
  /** Job title / role shown below the name (e.g. "Software Engineer"). */
  role?: string;
}

export interface ArticleMetaProps {
  /**
   * Category label displayed as an eyebrow above the title.
   * Rendered as a presentational span — not a link (links belong in the page).
   */
  category?: string;

  /** The article title. Rendered as <h1>. Required. */
  title: string;

  /** Short description / excerpt shown below the title. */
  description?: string;

  /** Author identity block. Omitted entirely when absent. */
  author?: ArticleMetaAuthor;

  /**
   * ISO 8601 publication date string (e.g. "2026-08-24T15:00:00Z").
   * Formatted into a human-readable date at render time.
   */
  publishedAt?: string;

  /**
   * ISO 8601 date of last update.
   * Only shown when it differs from publishedAt by more than one day.
   */
  updatedAt?: string;

  /**
   * Final display reading time in minutes, already computed and resolved
   * by the page (combines AI estimate + calculateReadingTime fallback).
   */
  readingTimeMinutes?: number;

  /**
   * Optional tag strings shown below the metadata row.
   * Not rendered when empty or absent.
   */
  tags?: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format an ISO timestamp to a human-readable date string. */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Returns true if two ISO date strings represent different calendar days.
 * Used to suppress the "Updated" label when the post was published and updated
 * on the same day.
 */
function isDifferentDay(isoA: string, isoB: string): boolean {
  try {
    const a = new Date(isoA).toDateString();
    const b = new Date(isoB).toDateString();
    return a !== b;
  } catch {
    return false;
  }
}

/**
 * Generates a simple initials-based avatar as an inline SVG data URI.
 * Used when avatarUrl is absent — no external service needed.
 */
function getInitialsAvatar(name: string): string {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Simple deterministic hue from first char code
  const hue = ((name.charCodeAt(0) ?? 65) * 37) % 360;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <circle cx="20" cy="20" r="20" fill="hsl(${hue},55%,48%)"/>
  <text x="20" y="26" text-anchor="middle" font-size="15" font-family="system-ui,sans-serif" font-weight="600" fill="white">${initials}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ArticleMeta({
  category,
  title,
  description,
  author,
  publishedAt,
  updatedAt,
  readingTimeMinutes,
  tags,
}: ArticleMetaProps) {
  // Determine whether to show the "Updated" segment
  const showUpdated =
    !!updatedAt &&
    !!publishedAt &&
    isDifferentDay(publishedAt, updatedAt);

  return (
    <header className="ed-article-meta">
      {/* ── 1. Category eyebrow ────────────────────────────────────────────── */}
      {category && (
        <span className="ed-article-meta__category" aria-label={`Category: ${category}`}>
          {category}
        </span>
      )}

      {/* ── 2. Article title ────────────────────────────────────────────────── */}
      <h1 className="ed-article-meta__title">{title}</h1>

      {/* ── 3. Description ──────────────────────────────────────────────────── */}
      {description && (
        <p className="ed-article-meta__description">{description}</p>
      )}

      {/* ── 4. Author identity ──────────────────────────────────────────────── */}
      {author && (
        <div className="ed-article-meta__author">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={author.avatarUrl ?? getInitialsAvatar(author.name)}
            alt={author.avatarUrl ? `${author.name}'s avatar` : ""}
            aria-hidden={!author.avatarUrl}
            className="ed-article-meta__avatar"
            width={40}
            height={40}
            loading="eager"
          />
          <div className="ed-article-meta__author-info">
            <span className="ed-article-meta__author-name">{author.name}</span>
            {author.role && (
              <span className="ed-article-meta__author-role">{author.role}</span>
            )}
          </div>
        </div>
      )}

      {/* ── 5. Publication metadata ─────────────────────────────────────────── */}
      {(publishedAt || readingTimeMinutes !== undefined) && (
        <div className="ed-article-meta__pub-row" aria-label="Article metadata">
          {publishedAt && (
            <span className="ed-article-meta__pub-date">
              Published{" "}
              <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
            </span>
          )}

          {showUpdated && (
            <>
              <span className="ed-article-meta__dot" aria-hidden="true">·</span>
              <span className="ed-article-meta__pub-date">
                Updated{" "}
                <time dateTime={updatedAt!}>{formatDate(updatedAt!)}</time>
              </span>
            </>
          )}

          {readingTimeMinutes !== undefined && (
            <>
              <span className="ed-article-meta__dot" aria-hidden="true">·</span>
              <span
                className="ed-article-meta__reading-time"
                aria-label={`Estimated reading time: ${readingTimeMinutes} minutes`}
              >
                {readingTimeMinutes} min read
              </span>
            </>
          )}
        </div>
      )}

      {/* ── 6. Tags ─────────────────────────────────────────────────────────── */}
      {tags && tags.length > 0 && (
        <div className="ed-article-meta__tags" aria-label="Article tags">
          {tags.map((tag) => (
            <span key={tag} className="ed-article-meta__tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
