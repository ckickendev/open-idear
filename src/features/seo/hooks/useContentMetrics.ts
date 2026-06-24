"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import type {
  ContentMetrics,
  UseContentMetricsOptions,
  UseContentMetricsReturn,
} from "../types/seo.types";

const DEFAULT_DEBOUNCE_MS = 500;

const EMPTY_METRICS: ContentMetrics = {
  wordCount: 0,
  characterCount: 0,
  readingTime: 0,
  headingCount: { h1: 0, h2: 0, h3: 0 },
  imageCount: 0,
  linkCount: { internal: 0, external: 0 },
  paragraphCount: 0,
};

/**
 * Content metrics hook.
 *
 * Computes word count, reading time, heading structure, image/link counts
 * from the editor's JSON content. Analysis is debounced to avoid blocking
 * the main thread on every keystroke.
 *
 * Takes the editor instance directly to avoid re-render cascades from
 * string prop changes.
 */
export function useContentMetrics(
  editor: Editor | null,
  options: UseContentMetricsOptions = {},
): UseContentMetricsReturn {
  const { debounceMs = DEFAULT_DEBOUNCE_MS } = options;

  const [metrics, setMetrics] = useState<ContentMetrics>(EMPTY_METRICS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Analysis Function ────────────────────────────────────────────────

  const analyze = useCallback(() => {
    if (!editor) {
      setMetrics(EMPTY_METRICS);
      return;
    }

    setIsAnalyzing(true);

    const text = editor.getText();
    const html = editor.getHTML();
    const trimmed = text.trim();

    // Word & character counts
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = trimmed.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    // Parse headings from JSON content
    const json = editor.getJSON();
    const headingCount = { h1: 0, h2: 0, h3: 0 };
    let imageCount = 0;
    let paragraphCount = 0;
    const linkCount = { internal: 0, external: 0 };

    function walkContent(content: any[]) {
      for (const node of content) {
        if (node.type === "heading") {
          const level = node.attrs?.level;
          if (level === 1) headingCount.h1++;
          else if (level === 2) headingCount.h2++;
          else if (level === 3) headingCount.h3++;
        }
        if (node.type === "image") {
          imageCount++;
        }
        if (node.type === "paragraph") {
          paragraphCount++;
        }
        // Count links in marks
        if (node.marks) {
          for (const mark of node.marks) {
            if (mark.type === "link" && mark.attrs?.href) {
              const href = mark.attrs.href;
              if (
                href.startsWith("/") ||
                href.includes(window.location.hostname)
              ) {
                linkCount.internal++;
              } else {
                linkCount.external++;
              }
            }
          }
        }
        // Recurse
        if (node.content) {
          walkContent(node.content);
        }
      }
    }

    if (json.content) {
      walkContent(json.content);
    }

    setMetrics({
      wordCount: words,
      characterCount: chars,
      readingTime,
      headingCount,
      imageCount,
      linkCount,
      paragraphCount,
    });

    setIsAnalyzing(false);
  }, [editor]);

  // ─── Debounced Analysis on Editor Updates ─────────────────────────────

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(analyze, debounceMs);
    };

    // Initial analysis
    analyze();

    // Listen to editor updates
    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [editor, analyze, debounceMs]);

  return { metrics, isAnalyzing };
}
