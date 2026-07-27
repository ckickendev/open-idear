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

  // Define widths based on viewport selection
  const getWidthClass = () => {
    switch (viewport) {
      case "mobile":
        return "max-w-[390px] border-[12px] border-zinc-800 rounded-[32px] shadow-2xl h-[780px]";
      case "tablet":
        return "max-w-[768px] border-[8px] border-zinc-700 rounded-2xl shadow-xl h-[960px]";
      case "desktop":
      default:
        return "w-full max-w-[840px] border border-[var(--color-editor-border)] rounded-xl shadow-sm min-h-[600px]";
    }
  };

  return (
    <div className="live-preview-container flex flex-col gap-5 w-full h-full animate-[fade-in_0.2s_ease-out]">
      {/* ─── Modular Control Toolbar ─────────────────────────────────────────── */}
      <PreviewToolbar
        viewport={viewport}
        onChangeViewport={setViewport}
        isDark={isPreviewDark}
        onToggleDark={() => setIsPreviewDark(!isPreviewDark)}
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
                      max-width: 800px;
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
      <div className="flex justify-center items-start gap-6 w-full overflow-x-auto py-4 bg-[var(--color-editor-bg)] rounded-2xl min-h-[640px]">
        {viewport === "desktop" && (
          <div className="hidden lg:block shrink-0 sticky top-4">
            <StickyOutlineNav html={html} />
          </div>
        )}
        <div
          className={`flex flex-col transition-all duration-300 ease-out bg-[var(--color-editor-surface)] overflow-y-auto ${getWidthClass()}`}
        >
          {/* Simulated Mobile Status Bar / Speaker Notch */}
          {viewport === "mobile" && (
            <div className="w-full bg-zinc-800 text-zinc-400 flex items-center justify-between px-6 py-1.5 text-[10px] select-none shrink-0 font-medium font-mono">
              <span>9:41</span>
              <div className="w-20 h-4 bg-black rounded-b-xl absolute left-1/2 -translate-x-1/2 top-0" />
              <div className="flex items-center gap-1">
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
          <div className={`flex-1 p-6 md:p-8 overflow-y-auto ${isPreviewDark ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"}`}>
            {/* Title Header inside Preview context */}
            <header className="mb-8 border-b pb-6 border-zinc-200 dark:border-zinc-800">
              <h1 className="text-[2.25rem] leading-[1.25] font-bold tracking-tight">
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
            <div className="w-full bg-zinc-800 py-2 flex justify-center shrink-0">
              <div className="w-28 h-1 bg-zinc-600 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
