import { useState, useEffect, useMemo, useCallback } from "react";

export interface HeadingItem {
  readonly id: string;
  readonly title: string;
  readonly level: number;
}

/**
 * Converts heading text to clean, URL-safe slug ID.
 * Handles Vietnamese accents and special characters gracefully.
 */
export function slugifyHeading(text: string, index: number = 0): string {
  if (!text) return `heading-${index}`;

  const cleanText = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return cleanText ? `heading-${cleanText}` : `heading-${index}`;
}

/**
 * Clean string for fuzzy text matching.
 */
function cleanHeadingText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\u00c0-\u024f\u1ea0-\u1eff]/gi, "").trim();
}

/**
 * Parses H2 and H3 headings from an HTML content string.
 */
export function parseHeadingsFromHtml(html: string): HeadingItem[] {
  if (!html || typeof window === "undefined") return [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const elements = doc.querySelectorAll("h1, h2, h3, h4");
    const result: HeadingItem[] = [];

    elements.forEach((el, idx) => {
      const text = el.textContent?.trim() || "";
      if (!text) return;

      const tagLevel = parseInt(el.tagName.replace("H", ""), 10) || 2;
      const existingId = el.getAttribute("id");
      const id = existingId || slugifyHeading(text, idx);

      result.push({
        id,
        title: text,
        level: tagLevel,
      });
    });

    return result;
  } catch (err) {
    console.error("[useHeadingOutline] Error parsing headings:", err);
    return [];
  }
}

interface UseHeadingOutlineOptions {
  readonly html?: string;
  readonly outlinePlan?: Array<{ title: string; level: number; description?: string }>;
  readonly containerSelector?: string;
}

export function useHeadingOutline(options: UseHeadingOutlineOptions = {}) {
  const { html = "", outlinePlan, containerSelector } = options;
  const [activeId, setActiveId] = useState<string>("");

  // Derive heading items list
  const headings = useMemo<HeadingItem[]>(() => {
    // 1. If HTML content exists and contains headings, parse from HTML
    const htmlHeadings = parseHeadingsFromHtml(html);
    if (htmlHeadings.length > 0) {
      return htmlHeadings;
    }

    // 2. Fallback to AI Planner outline structure if provided
    if (outlinePlan && outlinePlan.length > 0) {
      return outlinePlan.map((item, idx) => ({
        id: slugifyHeading(item.title, idx),
        title: item.title,
        level: item.level,
      }));
    }

    return [];
  }, [html, outlinePlan]);

  // Helper to locate DOM element for a heading and auto-assign ID if missing
  const findAndBindHeadingElement = useCallback((h: HeadingItem, index: number): HTMLElement | null => {
    if (typeof window === "undefined") return null;

    // 1. Try finding by ID directly
    let el = document.getElementById(h.id);
    if (el) return el;

    // 2. Search DOM heading nodes in editor, preview, or article containers
    const candidates = document.querySelectorAll(
      ".editor-canvas h1, .editor-canvas h2, .editor-canvas h3, .editor-canvas h4, " +
      ".ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4, " +
      ".html-renderer-root h1, .html-renderer-root h2, .html-renderer-root h3, .html-renderer-root h4, " +
      "article h1, article h2, article h3, article h4, h1, h2, h3, h4"
    );

    const targetClean = cleanHeadingText(h.title);

    for (let i = 0; i < candidates.length; i++) {
      const cand = candidates[i] as HTMLElement;
      const candClean = cleanHeadingText(cand.textContent || "");

      if (candClean && (candClean === targetClean || candClean.includes(targetClean) || targetClean.includes(candClean))) {
        cand.setAttribute("id", h.id);
        return cand;
      }
    }

    // 3. Positional fallback if index matches heading list length
    if (candidates[index]) {
      const cand = candidates[index] as HTMLElement;
      cand.setAttribute("id", h.id);
      return cand;
    }

    return null;
  }, []);

  // Track active heading in viewport on scroll
  useEffect(() => {
    if (headings.length === 0 || typeof window === "undefined") return;

    // Bind DOM IDs to ensure elements are queryable
    const boundElements = headings
      .map((h, idx) => findAndBindHeadingElement(h, idx))
      .filter((el): el is HTMLElement => el !== null);

    if (boundElements.length === 0) return;

    // Set initial active heading to the first one if none set
    setActiveId((prev) => (prev ? prev : headings[0].id));

    // IntersectionObserver for modern viewport tracking
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        root: containerSelector ? document.querySelector(containerSelector) : null,
        rootMargin: "-60px 0px -50% 0px",
        threshold: 0.1,
      }
    );

    boundElements.forEach((el) => observer.observe(el));

    // Scroll listener fallback for precise active section calculation
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      let currentActiveId = headings[0].id;

      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            currentActiveId = h.id;
          }
        }
      }

      setActiveId(currentActiveId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings, containerSelector, findAndBindHeadingElement]);

  // Smooth scroll to target heading
  const scrollToHeading = useCallback((id: string) => {
    if (typeof window === "undefined") return;

    const targetHeading = headings.find((h) => h.id === id);
    let element = document.getElementById(id);

    if (!element && targetHeading) {
      const idx = headings.indexOf(targetHeading);
      element = findAndBindHeadingElement(targetHeading, idx);
    }

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setActiveId(id);
    }
  }, [headings, findAndBindHeadingElement]);

  return {
    headings,
    activeId,
    scrollToHeading,
  };
}
