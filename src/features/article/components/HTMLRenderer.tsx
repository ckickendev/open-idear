"use client";

// =============================================================================
//  HTML RENDERER — LEGACY ADAPTER COMPONENT
//  src/features/article/components/HTMLRenderer.tsx
//
//  Design Decisions:
//  - Legacy adapter component that renders raw HTML / legacy post content.
//  - Ensures backward compatibility for pre-blocks-v1 posts.
//  - Wraps legacy HTML with responsive table formatting and image Lightbox.
// =============================================================================

import React, { useMemo } from "react";
import HtmlRenderer from "@/features/preview/components/HtmlRenderer";

export interface HTMLRendererProps {
  /** Raw HTML or legacy content string */
  readonly html: string;
  /** Optional dark theme flag */
  readonly isDark?: boolean;
}

export const HTMLRenderer: React.FC<HTMLRendererProps> = ({
  html,
  isDark = false,
}) => {
  const safeHtml = useMemo(() => {
    if (!html || !html.trim()) {
      return "<p class='text-gray-400 italic'>No content available.</p>";
    }
    return html;
  }, [html]);

  return <HtmlRenderer html={safeHtml} isDark={isDark} />;
};

export default HTMLRenderer;
