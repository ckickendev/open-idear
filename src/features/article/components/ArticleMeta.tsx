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
import { Calendar, Clock } from "lucide-react";

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
   */
  publishedAt?: string;

  /**
   * ISO 8601 date of last update.
   */
  updatedAt?: string;

  /**
   * Final display reading time in minutes.
   */
  readingTimeMinutes?: number;

  /**
   * Optional tag strings shown below the metadata row.
   */
  tags?: string[];

  /**
   * Featured cover image rendered in high-end editorial frame below author bar.
   */
  coverImage?: {
    url?: string;
    description?: string;
  };

  /**
   * Version action button or pill (e.g. History v1.0).
   */
  versionAction?: React.ReactNode;

  /**
   * Inline actions toolbar (Like, Save, Comment, Share).
   */
  actions?: React.ReactNode;

  /**
   * Active locale ("en" | "vi"). Defaults to "en".
   */
  locale?: "en" | "vi";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format an ISO timestamp to a human-readable date string. */
function formatDate(iso: string, locale: "en" | "vi" = "en"): string {
  try {
    const localeString = locale === "vi" ? "vi-VN" : "en-US";
    return new Date(iso).toLocaleDateString(localeString, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Check if image caption is a generic placeholder like "Uploaded Image". */
function isGenericCaption(desc?: string): boolean {
  if (!desc) return true;
  const lower = desc.trim().toLowerCase();
  return (
    lower === "uploaded image" ||
    lower === "image" ||
    lower === "untitled" ||
    lower === "null" ||
    lower === "undefined"
  );
}

/**
 * Generates a simple initials-based avatar as an inline SVG data URI.
 */
function getInitialsAvatar(name: string): string {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hue = ((name.charCodeAt(0) ?? 65) * 37) % 360;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
  <circle cx="22" cy="22" r="22" fill="hsl(${hue},55%,48%)"/>
  <text x="22" y="28" text-anchor="middle" font-size="16" font-family="system-ui,sans-serif" font-weight="600" fill="white">${initials}</text>
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
  coverImage,
  versionAction,
  actions,
  locale = "en",
}: ArticleMetaProps) {
  return (
    <header className="ed-article-meta pt-4 pb-2">
      {/* ── 1. Eyebrow Metadata Row ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 text-xs text-muted-foreground mb-4">
        {category && (
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-xs"
            aria-label={`Category: ${category}`}
          >
            {category}
          </span>
        )}

        {publishedAt && (
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Calendar size={13} className="text-muted-foreground/80 shrink-0" />
            <time dateTime={publishedAt}>{formatDate(publishedAt, locale)}</time>
          </span>
        )}

        {readingTimeMinutes !== undefined && (
          <>
            <span className="text-border select-none" aria-hidden="true">·</span>
            <span
              className="inline-flex items-center gap-1.5 font-medium"
              aria-label={locale === "vi" ? `Thời gian đọc ước tính: ${readingTimeMinutes} phút` : `Estimated reading time: ${readingTimeMinutes} minutes`}
            >
              <Clock size={13} className="text-muted-foreground/80 shrink-0" />
              {readingTimeMinutes} {locale === "vi" ? "phút đọc" : "min read"}
            </span>
          </>
        )}

        {versionAction && (
          <>
            <span className="text-border select-none" aria-hidden="true">·</span>
            <div className="inline-flex items-center">{versionAction}</div>
          </>
        )}
      </div>

      {/* ── 2. Article Title ────────────────────────────────────────────────── */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.65rem] font-extrabold tracking-tight text-foreground leading-[1.18] mb-4 overflow-wrap-break-word">
        {title}
      </h1>

      {/* ── 3. Description / Excerpt ────────────────────────────────────────── */}
      {description && (
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mb-6">
          {description}
        </p>
      )}

      {/* ── 4. Author Identity & Inline Actions Toolbar ──────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-y border-border/50 mb-8">
        {author && (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={author.avatarUrl ?? getInitialsAvatar(author.name)}
              alt={author.avatarUrl ? `${author.name}'s avatar` : ""}
              aria-hidden={!author.avatarUrl}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-border/60 shrink-0 shadow-xs"
              width={44}
              height={44}
              loading="eager"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground leading-snug">
                {author.name}
              </span>
              {author.role && (
                <span className="text-xs text-muted-foreground leading-tight">
                  {author.role}
                </span>
              )}
            </div>
          </div>
        )}

        {actions && <div className="flex items-center flex-wrap gap-2">{actions}</div>}
      </div>

      {/* ── 5. Featured Cover Image ──────────────────────────────────────────── */}
      {coverImage?.url && (
        <div className="mb-8">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden border border-border/40 shadow-xl shadow-black/5 dark:shadow-black/30 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage.url}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              loading="eager"
            />
          </div>
          {coverImage.description && !isGenericCaption(coverImage.description) && (
            <p className="text-xs text-muted-foreground text-center italic mt-2.5">
              {coverImage.description}
            </p>
          )}
        </div>
      )}

      {/* ── 6. Tags ─────────────────────────────────────────────────────────── */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6" aria-label="Article tags">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted/60 hover:bg-muted text-muted-foreground border border-border/50 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
