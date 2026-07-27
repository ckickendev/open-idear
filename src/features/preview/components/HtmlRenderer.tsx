// =============================================================================
//  AI PREVIEW FEATURE — HTML RENDERER
//  src/features/preview/components/HtmlRenderer.tsx
//
//  Design Decisions:
//  - Event delegation is used for image clicks and link hovers to minimize
//    the number of event listeners in the DOM tree, optimizing performance.
//  - Intercepts code blocks to render a copy button and formatting.
//  - Intercepts images to render in a fullscreen lightbox modal.
//  - Intercepts internal links to show a localized popover preview,
//    preventing navigation away from the workspace.
// =============================================================================

import React, { useMemo, useState, useRef, useEffect } from "react";
import { Copy, Check, ExternalLink, X } from "lucide-react";
import { slugifyHeading } from "@/features/editor/hooks/useHeadingOutline";

interface HtmlRendererProps {
  readonly html: string;
  readonly isDark: boolean;
}

export default function HtmlRenderer({ html, isDark }: HtmlRendererProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Link Hover Preview State
  const [hoverLink, setHoverLink] = useState<{
    url: string;
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // State to track copied code blocks (by index/id)
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ─── Rendering Pipeline ──────────────────────────────────────────────────────
  // We use useMemo to avoid re-rendering or running DOM updates unless HTML changes.
  const processedContent = useMemo(() => {
    if (!html) return { __html: "<p className='text-gray-400 italic'>No content written yet.</p>" };

    // Standardize code blocks, tables, images, and links in the HTML string
    let parsed = html;

    // 1. Wrap tables in responsive containers
    parsed = parsed.replace(
      /<table([^>]*)>([\s\S]*?)<\/table>/g,
      '<div class="responsive-table-wrapper"><table class="preview-table" $1>$2</table></div>'
    );

    // 2. Inject anchor IDs into heading elements for scroll targets
    let headingCount = 0;
    parsed = parsed.replace(
      /<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi,
      (match, tag, attrs, innerText) => {
        if (/id=["']/i.test(attrs)) {
          return match;
        }
        const cleanText = innerText.replace(/<[^>]*>/g, "").trim();
        const id = slugifyHeading(cleanText, headingCount++);
        return `<${tag}${attrs} id="${id}">${innerText}</${tag}>`;
      }
    );

    return { __html: parsed };
  }, [html]);

  // ─── Event Delegation & Interaction Interceptors ────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Helper to extract clean attributes
    const handleContainerClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 1. Intercept Image clicks for Lightbox
      if (target.tagName === "IMG") {
        e.preventDefault();
        const src = target.getAttribute("src");
        if (src) setLightboxImage(src);
      }

      // 2. Intercept copy code blocks button clicks
      const copyBtn = target.closest(".copy-code-btn");
      if (copyBtn) {
        e.preventDefault();
        const blockId = copyBtn.getAttribute("data-block-id");
        const codeElement = container.querySelector(`#code-block-${blockId}`);
        if (codeElement) {
          const textToCopy = codeElement.textContent || "";
          navigator.clipboard.writeText(textToCopy).then(() => {
            setCopiedId(blockId);
            setTimeout(() => setCopiedId(null), 2000);
          });
        }
      }

      // 3. Intercept link navigation to avoid breaking editor flow
      const link = target.closest("a");
      if (link) {
        e.preventDefault();
        const href = link.getAttribute("href") || "";
        const isInternal = href.startsWith("/") || href.includes(window.location.host);
        
        // Show notification or inline status instead of redirecting
        if (isInternal) {
          alert(`Internal Link Intercepted: "${href}"\nWithin the Editor preview, internal routes do not trigger page changes.`);
        } else {
          window.open(href, "_blank", "noopener,noreferrer");
        }
      }
    };

    // 4. Link Hover Events
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link) {
        const href = link.getAttribute("href") || "";
        const isInternal = href.startsWith("/") || href.includes(window.location.host);
        
        if (isInternal) {
          const rect = link.getBoundingClientRect();
          setHoverLink({
            url: href,
            text: link.textContent || "Internal Link",
            x: rect.left + window.scrollX,
            y: rect.bottom + window.scrollY + 8,
          });
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a")) {
        setHoverLink(null);
      }
    };

    container.addEventListener("click", handleContainerClick);
    container.addEventListener("mouseover", handleMouseOver);
    container.addEventListener("mouseout", handleMouseOut);

    return () => {
      container.removeEventListener("click", handleContainerClick);
      container.removeEventListener("mouseover", handleMouseOver);
      container.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  // Post-render addition of Copy buttons to TiP-Tap pre/code structures
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Query all code blocks
    const preBlocks = container.querySelectorAll("pre");
    preBlocks.forEach((pre, index) => {
      // Ensure we don't duplicate buttons
      if (pre.querySelector(".copy-code-container")) return;

      const code = pre.querySelector("code");
      const blockId = `block-${index}`;
      if (code) {
        code.setAttribute("id", `code-block-${blockId}`);
      }

      // Create overlay copy button wrapper
      const btnWrapper = document.createElement("div");
      btnWrapper.className = "copy-code-container";
      
      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-code-btn";
      button.setAttribute("data-block-id", blockId);
      button.setAttribute("title", "Copy Code");
      button.innerHTML = `
        <span class="btn-copy-label">Copy</span>
      `;

      btnWrapper.appendChild(button);
      pre.insertBefore(btnWrapper, pre.firstChild);
    });
  }, [processedContent]);

  return (
    <div className={`html-renderer-root ${isDark ? "preview-dark" : "preview-light"}`}>
      {/* Content Canvas Container */}
      <div
        ref={containerRef}
        className="preview-content-prose prose max-w-none"
        dangerouslySetInnerHTML={processedContent}
      />

      {/* Real-time Link Hover Preview Overlay */}
      {hoverLink && (
        <div
          className="absolute z-50 bg-[var(--color-editor-surface)] text-[var(--color-editor-text)] border border-[var(--color-editor-border)] shadow-xl rounded-lg p-3 text-[11px] max-w-xs animate-[fade-in_0.15s_ease-out]"
          style={{ left: hoverLink.x, top: hoverLink.y }}
        >
          <div className="font-semibold text-cyan-500 flex items-center gap-1">
            <span>🔗 Internal Link</span>
          </div>
          <p className="text-[var(--color-editor-muted)] mt-1 truncate">{hoverLink.url}</p>
          <p className="italic text-[10px] text-gray-500 mt-1">Hovers show routes. Normal clicks are blocked in Editor preview.</p>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer"
            onClick={() => setLightboxImage(null)}
          >
            <X size={24} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Preview Lightbox"
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl animate-[zoom-in_0.2s_ease-out]"
          />
        </div>
      )}
    </div>
  );
}
