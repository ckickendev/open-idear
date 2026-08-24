"use client";

// =============================================================================
//  ARTICLE RENDERER
//  src/features/article/components/ArticleRenderer.tsx
//
//  Master renderer that maps ArticleBlock[] → React components.
//
//  Design Decisions:
//  - contentVersion drives the rendering branch:
//      "blocks-v1"              → structured block components
//      "html-v1" or undefined   → HtmlRenderer (dangerouslySetInnerHTML)
//  - Unknown block types fail gracefully with a warning, not a crash.
//  - HtmlRenderer is imported from the existing preview feature to preserve
//    the exact same rendering behaviour for legacy HTML posts.
//  - This component is the single integration point for future block types.
//    Add new block type cases to the switch below only via approved Sprints.
// =============================================================================

import React from "react";
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

// ─── Inline Primitive Renderers ───────────────────────────────────────────

function ArticleParagraph({ content, id }: { content: string; id: string }) {
  return (
    <p
      id={`block-${id}`}
      className="my-4 text-base leading-relaxed text-foreground/90"
    >
      {content}
    </p>
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
  if (level === 2) {
    return (
      <h2
        id={`block-${id}`}
        className="text-2xl font-bold mt-10 mb-4 text-foreground"
      >
        {content}
      </h2>
    );
  }
  return (
    <h3
      id={`block-${id}`}
      className="text-xl font-semibold mt-8 mb-3 text-foreground/90"
    >
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
    <figure id={`block-${block.id}`} className="my-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={block.src}
        alt={block.alt}
        width={block.width}
        height={block.height}
        className="w-full rounded-xl object-cover"
        loading="lazy"
      />
      {block.caption && (
        <figcaption className="mt-2 text-center text-xs text-foreground/50 italic">
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
    <Tag
      id={`block-${block.id}`}
      className={`my-4 pl-6 space-y-1 text-foreground/90 ${
        block.style === "ordered" ? "list-decimal" : "list-disc"
      }`}
    >
      {block.items.map((item, i) => (
        <li key={i} className="leading-relaxed">
          {item}
        </li>
      ))}
    </Tag>
  );
}

// ─── Unknown Block Fallback ────────────────────────────────────────────────

function UnknownBlock({ type }: { type: string }) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[ArticleRenderer] Unknown block type: "${type}". Block will not render.`);
  }
  return null; // Fail gracefully — no crash, no visible output in production
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

// ─── Main Renderer ─────────────────────────────────────────────────────────

export default function ArticleRenderer({
  contentVersion,
  blocks,
  htmlContent = "",
  isDark = false,
}: ArticleRendererProps) {
  // ── Backward Compatibility Branch ────────────────────────────────────────
  // If contentVersion is not "blocks-v1", fall back to the existing
  // HtmlRenderer. This ensures all legacy html-v1 posts render identically.
  if (contentVersion !== "blocks-v1" || !blocks || blocks.length === 0) {
    return <HtmlRenderer html={htmlContent} isDark={isDark} />;
  }

  // ── Structured Block Rendering Branch ────────────────────────────────────
  return (
    <article className="article-blocks-renderer max-w-none">
      {blocks.map((block) => (
        <ArticleBlockItem key={block.id} block={block} />
      ))}
    </article>
  );
}
