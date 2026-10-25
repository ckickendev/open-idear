"use client";

// =============================================================================
//  AI PREVIEW FEATURE — LIVE PREVIEW SYSTEM
//  src/features/preview/components/LivePreviewSystem.tsx
//
//  Design Decisions:
//  - Fully encapsulated wrapper housing Desktop, Tablet, and Mobile frames.
//  - Leverages local State triggers for Light/Dark toggles and viewport widths.
//  - Uses responsive transition effects for device-width changes.
// =============================================================================

import React, { useState } from "react";
import { toast } from "sonner";
import PreviewToolbar from "./PreviewToolbar";
import HtmlRenderer from "./HtmlRenderer";
import { StickyOutlineNav } from "@/features/editor";

interface LivePreviewSystemProps {
  readonly html: string;
  readonly title: string;
}

type ViewportType = "desktop" | "tablet" | "mobile";

export default function LivePreviewSystem({ html, title }: LivePreviewSystemProps) {
  const [viewport, setViewport] = useState<ViewportType>("desktop");
  const [isPreviewDark, setIsPreviewDark] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showToc, setShowToc] = useState<boolean>(true);

  // Define widths based on viewport selection
  const getWidthClass = () => {
    switch (viewport) {
      case "mobile":
        return "w-full max-w-[420px] border-[10px] border-zinc-800 rounded-[36px] shadow-2xl h-[840px]";
      case "tablet":
        return "w-full max-w-[820px] border-[8px] border-zinc-700 rounded-2xl shadow-xl h-[940px]";
      case "desktop":
      default:
        return "w-full flex-1 max-w-4xl xl:max-w-5xl border border-[var(--color-editor-border)] rounded-2xl shadow-sm min-h-[720px]";
    }
  };

  return (
    <div
      className={`live-preview-container flex flex-col gap-4 w-full h-full animate-[fade-in_0.2s_ease-out] ${
        isFullscreen
          ? "fixed inset-0 z-50 p-4 sm:p-6 bg-[var(--color-editor-bg)] overflow-y-auto"
          : ""
      }`}
    >
      {/* ─── Modular Control Toolbar ─────────────────────────────────────────── */}
      <PreviewToolbar
        viewport={viewport}
        onChangeViewport={setViewport}
        isDark={isPreviewDark}
        onToggleDark={() => setIsPreviewDark(!isPreviewDark)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        showToc={showToc}
        onToggleToc={() => setShowToc(!showToc)}
        onRefresh={() => {
          toast.success("Preview re-synchronized!");
        }}
        onOpenNewWindow={() => {
          const win = window.open("", "_blank");
          if (win) {
            win.document.write(`
              <html>
                <head>
                  <title>${title || "Draft Preview"}</title>
                  <style>
                    body {
                      background: ${isPreviewDark ? "#090d16" : "#ffffff"};
                      color: ${isPreviewDark ? "#f1f5f9" : "#1e293b"};
                      font-family: sans-serif;
                      padding: 3rem;
                      max-width: 900px;
                      margin: 0 auto;
                      line-height: 1.6;
                    }
                  </style>
                </head>
                <body>
                  <h1>${title || "Untitled Draft"}</h1>
                  <div>${html}</div>
                </body>
              </html>
            `);
            win.document.close();
          }
        }}
      />

      {/* ─── Device Wrapper Canvas ───────────────────────────────────────────── */}
      <div className="flex justify-center items-start gap-6 w-full py-2 sm:py-4 rounded-2xl min-h-[640px]">
        {viewport === "desktop" && showToc && (
          <aside className="hidden xl:block w-64 shrink-0 sticky top-4">
            <StickyOutlineNav html={html} />
          </aside>
        )}
        <div
          className={`flex flex-col transition-all duration-300 ease-out bg-[var(--color-editor-surface)] overflow-y-auto ${getWidthClass()}`}
        >
          {/* Simulated Mobile Status Bar / Speaker Notch */}
          {viewport === "mobile" && (
            <div className="w-full bg-zinc-800 text-zinc-400 flex items-center justify-between px-6 py-2 text-[10px] select-none shrink-0 font-medium font-mono">
              <span>9:41</span>
              <div className="w-24 h-4 bg-black rounded-b-xl absolute left-1/2 -translate-x-1/2 top-0" />
              <div className="flex items-center gap-1.5">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>
          )}

          {/* Simulated Tablet Speaker Notch */}
          {viewport === "tablet" && (
            <div className="w-full h-3 bg-zinc-700 select-none shrink-0" />
          )}

          {/* Preview Canvas Content */}
          <div
            className={`flex-1 px-6 py-8 sm:px-10 sm:py-12 md:px-14 overflow-y-auto ${
              isPreviewDark ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"
            }`}
          >
            {/* Title Header inside Preview context */}
            <header className="mb-8 border-b pb-6 border-zinc-200 dark:border-zinc-800">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                {title || "Untitled Draft"}
              </h1>
              <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
                <span>By Editorial Staff</span>
                <span>•</span>
                <span>Preview Draft Mode</span>
              </div>
            </header>

            {/* Rendered prose section */}
            <HtmlRenderer html={html} isDark={isPreviewDark} />
          </div>

          {/* Simulated Mobile Home Bar Indicator */}
          {viewport === "mobile" && (
            <div className="w-full bg-zinc-800 py-2.5 flex justify-center shrink-0">
              <div className="w-28 h-1 bg-zinc-600 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
