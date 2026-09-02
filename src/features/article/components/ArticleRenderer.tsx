"use client";

// =============================================================================
//  ARTICLE RENDERER
//  src/features/article/components/ArticleRenderer.tsx
//
//  Master renderer that maps ArticleBlock[] → React components.
//
//  Sprint 3.4 Improvements:
//  - Inline HTML markup rendering in paragraphs, headings, and lists.
//  - Responsive image optimization with async decoding and lazy loading.
//  - Accessible heading anchor links with hover/focus state.
//  - Smooth block rhythm and consistent typography.
// =============================================================================

import React from "react";
import "@/styles/editorial.css";
import type { ArticleBlock, ContentVersion } from "../types/article.types";
import HtmlRenderer from "@/features/preview/components/HtmlRenderer";

// ─── Block Component Imports ───────────────────────────────────────────────

import ArticleCallout from "./ArticleCallout";
import ArticleCodeBlock from "./ArticleCodeBlock";
import ArticleComparisonTable from "./ArticleComparisonTable";
import ArticleFAQ from "./ArticleFAQ";
import ArticleCTA from "./ArticleCTA";
import ArticleQuote from "./ArticleQuote";

// ─── Props ────────────────────────────────────────────────────────────────

interface ArticleRendererProps {
  /**
   * Content version discriminator from the post document.
   * - "blocks-v1"    → render blocks[] with typed components
   * - "html-v1"      → render legacy htmlContent with HtmlRenderer
   * - undefined/null → treated as "html-v1" for backwards compatibility
   */
  contentVersion?: ContentVersion | null;

  /**
   * Structured article blocks. Required when contentVersion === "blocks-v1".
   */
  blocks?: ArticleBlock[] | null;

  /**
   * Legacy HTML content string. Required when contentVersion !== "blocks-v1".
   * This is passed directly to HtmlRenderer.
   */
  htmlContent?: string;

  /**
   * Whether the parent container uses the dark theme.
   * Forwarded to HtmlRenderer for legacy rendering.
   */
  isDark?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Checks if a string contains inline HTML tags (e.g. <strong>, <em>, <code>, <a>). */
function hasInlineHtml(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str);
}

// ─── Inline Primitive Renderers ───────────────────────────────────────────

function ArticleParagraph({ content, id }: { content: string; id: string }) {
  if (hasInlineHtml(content)) {
    return (
      <p
        id={`block-${id}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return <p id={`block-${id}`}>{content}</p>;
}

function ArticleHeading({
  level,
  content,
  id,
}: {
  level: 2 | 3;
  content: string;
  id: string;
}) {
  const anchorHref = `#block-${id}`;
  const containsHtml = hasInlineHtml(content);

  const anchor = (
    <a
      href={anchorHref}
      className="ed-heading-anchor__link"
      aria-label={`Link to section: ${content.replace(/<[^>]*>/g, "")}`}
      tabIndex={0}
    >
      #
    </a>
  );

  if (level === 2) {
    if (containsHtml) {
      return (
        <h2 id={`block-${id}`} className="ed-heading-anchor">
          {anchor}
          <span dangerouslySetInnerHTML={{ __html: content }} />
        </h2>
      );
    }
    return (
      <h2 id={`block-${id}`} className="ed-heading-anchor">
        {anchor}
        {content}
      </h2>
    );
  }

  if (containsHtml) {
    return (
      <h3 id={`block-${id}`} className="ed-heading-anchor">
        {anchor}
        <span dangerouslySetInnerHTML={{ __html: content }} />
      </h3>
    );
  }

  return (
    <h3 id={`block-${id}`} className="ed-heading-anchor">
      {anchor}
      {content}
    </h3>
  );
}

function ArticleImage({
  block,
}: {
  block: Extract<ArticleBlock, { type: "image" }>;
}) {
  return (
    <figure id={`block-${block.id}`} className="ed-image">
      <div className="ed-image__wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.src}
          alt={block.alt || ""}
          width={block.width}
          height={block.height}
          className="ed-image__img"
          loading="lazy"
          decoding="async"
        />
      </div>
      {block.caption && (
        <figcaption className="ed-image__caption">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

function ArticleList({
  block,
}: {
  block: Extract<ArticleBlock, { type: "list" }>;
}) {
  const Tag = block.style === "ordered" ? "ol" : "ul";
  return (
    <Tag id={`block-${block.id}`}>
      {block.items.map((item, i) => {
        if (hasInlineHtml(item)) {
          return (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          );
        }
        return <li key={i}>{item}</li>;
      })}
    </Tag>
  );
}

// ─── Unknown Block Fallback ────────────────────────────────────────────────

function UnknownBlock({ type }: { type: string }) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[ArticleRenderer] Unknown block type: "${type}". Block will not render.`);
  }
  return null;
}

// ─── Single Block Dispatcher ──────────────────────────────────────────────

function ArticleBlockItem({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "paragraph":
      return <ArticleParagraph content={block.content} id={block.id} />;
    case "heading":
      return <ArticleHeading level={block.level} content={block.content} id={block.id} />;
    case "image":
      return <ArticleImage block={block} />;
    case "code":
      return <ArticleCodeBlock block={block} />;
    case "callout":
      return <ArticleCallout block={block} />;
    case "comparison":
      return <ArticleComparisonTable block={block} />;
    case "faq":
      return <ArticleFAQ block={block} />;
    case "cta":
      return <ArticleCTA block={block} />;
    case "quote":
      return <ArticleQuote block={block} />;
    case "list":
      return <ArticleList block={block} />;
    default:
      return <UnknownBlock type={(block as ArticleBlock).type} />;
  }
}

import HTMLRenderer from "./HTMLRenderer";

// ─── Main Renderer ─────────────────────────────────────────────────────────

export default function ArticleRenderer({
  contentVersion,
  blocks,
  htmlContent = "",
  isDark = false,
}: ArticleRendererProps) {
  // ── Backward Compatibility Branch ────────────────────────────────────────
  if (contentVersion !== "blocks-v1" || !blocks || blocks.length === 0) {
    return <HTMLRenderer html={htmlContent} isDark={isDark} />;
  }

  // ── Structured Block Rendering Branch ────────────────────────────────────
  return (
    <article className="article-blocks-renderer" aria-label="Article content">
      {blocks.map((block) => (
        <ArticleBlockItem key={block.id} block={block} />
      ))}
    </article>
  );
}
