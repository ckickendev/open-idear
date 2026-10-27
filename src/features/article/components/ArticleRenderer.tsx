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

// ─── Block Component Imports ───────────────────────────────────────────────

import ArticleCallout from "./ArticleCallout";
import ArticleCodeBlock from "./ArticleCodeBlock";
import ArticleComparisonTable from "./ArticleComparisonTable";
import ArticleFAQ from "./ArticleFAQ";
import ArticleCTA from "./ArticleCTA";
import ArticleQuote from "./ArticleQuote";
import { ArticleProductEmbed } from "@/features/shop/components/embed/ArticleProductEmbed";

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

import { marked, type MarkedOptions } from "marked";

// Configure marked options once
const markedOptions: MarkedOptions = {
  async: false,
  gfm: true,
  breaks: true,
};
marked.setOptions(markedOptions);

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Checks if a string contains inline HTML tags (e.g. <strong>, <em>, <code>, <a>). */
function hasInlineHtml(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str);
}

/**
 * Transforms parsed prose HTML to promote standalone images and image captions
 * into responsive, accessible <figure> blocks with .ed-image styling.
 */
function transformProseHtml(rawHtml: string): string {
  if (!rawHtml) return "";

  // Pattern 1: <p><img ...> <em>caption with optional links</em></p>
  let html = rawHtml.replace(
    /<p>\s*(<img[^>]+>)\s*(?:<br\s*\/?>)?\s*(?:<em>(.*?)<\/em>)?\s*<\/p>/gi,
    (_match, imgTag: string, caption?: string) => {
      let enhancedImg = imgTag;
      if (!enhancedImg.includes("class=")) {
        enhancedImg = enhancedImg.replace("<img", "<img class=\"ed-image__img\" loading=\"lazy\" decoding=\"async\"");
      }
      return `<figure class="ed-image my-8"><div class="ed-image__wrap">${enhancedImg}</div>${
        caption ? `<figcaption class="ed-image__caption">${caption}</figcaption>` : ""
      }</figure>`;
    }
  );

  // Pattern 2: standalone <p><img ...></p>
  html = html.replace(
    /<p>\s*(<img[^>]+>)\s*<\/p>/gi,
    (_match, imgTag: string) => {
      let enhancedImg = imgTag;
      if (!enhancedImg.includes("class=")) {
        enhancedImg = enhancedImg.replace("<img", "<img class=\"ed-image__img\" loading=\"lazy\" decoding=\"async\"");
      }
      return `<figure class="ed-image my-8"><div class="ed-image__wrap">${enhancedImg}</div></figure>`;
    }
  );

  return html;
}

// ─── Inline Primitive Renderers ───────────────────────────────────────────

function ArticleParagraph({ content, id }: { content: string; id: string }) {
  const parsedHtml = React.useMemo(() => {
    if (!content) return "";
    const rawHtml = marked.parse(content, { breaks: true, gfm: true }) as string;
    return transformProseHtml(rawHtml);
  }, [content]);

  return (
    <div
      id={`block-${id}`}
      className="ed-paragraph-block"
      dangerouslySetInnerHTML={{ __html: parsedHtml }}
    />
  );
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
  const parsedContent = React.useMemo(() => {
    return marked.parseInline(content) as string;
  }, [content]);

  const cleanLabel = content.replace(/<[^>]*>/g, "").replace(/[#*`_~]/g, "");

  const anchor = (
    <a
      href={anchorHref}
      className="ed-heading-anchor__link"
      aria-label={`Link to section: ${cleanLabel}`}
      tabIndex={0}
    >
      #
    </a>
  );

  const Tag = level === 2 ? "h2" : "h3";

  return (
    <Tag id={`block-${id}`} className="ed-heading-anchor">
      {anchor}
      <span dangerouslySetInnerHTML={{ __html: parsedContent }} />
    </Tag>
  );
}

function ArticleImage({
  block,
}: {
  block: Extract<ArticleBlock, { type: "image" }>;
}) {
  const captionHtml = React.useMemo(() => {
    return block.caption ? (marked.parseInline(block.caption) as string) : null;
  }, [block.caption]);

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
      {captionHtml && (
        <figcaption
          className="ed-image__caption"
          dangerouslySetInnerHTML={{ __html: captionHtml }}
        />
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
      {block.items.map((item, i) => (
        <li
          key={i}
          dangerouslySetInnerHTML={{
            __html: marked.parseInline(item) as string,
          }}
        />
      ))}
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
    case "product_card":
      return (
        <ArticleProductEmbed
          productId={block.productId}
          contextualLabel={block.contextualLabel}
          layout={block.layout}
          embedId={block.id}
        />
      );
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
