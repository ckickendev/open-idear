// =============================================================================
//  AI PREVIEW FEATURE — PREVIEW TOOLBAR COMPONENT
//  src/features/preview/components/PreviewToolbar.tsx
//
//  Design Decisions:
//  - Reusable toolbar component hosting all controls for the Live Preview canvas.
//  - Features: Device Switch, Dark Mode, Refresh, Fullscreen, and Open in New Window.
//  - Modern layout styled with sleek icons and visual interactive indicators.
// =============================================================================

import React from "react";
import { Monitor, Tablet, Smartphone, Sun, Moon, RefreshCw, Maximize2, Minimize2, ExternalLink } from "lucide-react";

export type ViewportType = "desktop" | "tablet" | "mobile";

interface PreviewToolbarProps {
  readonly viewport: ViewportType;
  readonly onChangeViewport: (viewport: ViewportType) => void;
  readonly isDark: boolean;
  readonly onToggleDark: () => void;
  readonly onRefresh?: () => void;
  readonly isFullscreen?: boolean;
  readonly onToggleFullscreen?: () => void;
  readonly onOpenNewWindow?: () => void;
  readonly isRefreshing?: boolean;
}

export default function PreviewToolbar({
  viewport,
  onChangeViewport,
  isDark,
  onToggleDark,
  onRefresh,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenNewWindow,
  isRefreshing = false,
}: PreviewToolbarProps) {
  return (
    <div className="preview-toolbar flex flex-wrap items-center justify-between gap-4 p-3 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-xl shadow-xs select-none">
      
      {/* ─── Group 1: Device switches ────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-[var(--color-editor-bg)] p-1 rounded-lg border border-[var(--color-editor-border)]">
        <button
          type="button"
          onClick={() => onChangeViewport("desktop")}
          className={`p-2 rounded-md transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
            viewport === "desktop"
              ? "bg-[var(--color-editor-accent)] text-white shadow-xs"
              : "text-[var(--color-editor-secondary)] hover:bg-[var(--color-editor-elevated)]"
          }`}
          title="Desktop Preview View"
        >
          <Monitor size={13} />
          <span className="hidden sm:inline">Desktop</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeViewport("tablet")}
          className={`p-2 rounded-md transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
            viewport === "tablet"
              ? "bg-[var(--color-editor-accent)] text-white shadow-xs"
              : "text-[var(--color-editor-secondary)] hover:bg-[var(--color-editor-elevated)]"
          }`}
          title="Tablet Preview View"
        >
          <Tablet size={13} />
          <span className="hidden sm:inline">Tablet</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeViewport("mobile")}
          className={`p-2 rounded-md transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
            viewport === "mobile"
              ? "bg-[var(--color-editor-accent)] text-white shadow-xs"
              : "text-[var(--color-editor-secondary)] hover:bg-[var(--color-editor-elevated)]"
          }`}
          title="Mobile Preview View"
        >
          <Smartphone size={13} />
          <span className="hidden sm:inline">Mobile</span>
        </button>
      </div>

      {/* ─── Group 2: Action controls ────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Refresh Action */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg border border-[var(--color-editor-border)] hover:bg-[var(--color-editor-elevated)] text-[var(--color-editor-secondary)] cursor-pointer flex items-center justify-center transition-colors disabled:opacity-50"
            title="Refresh Preview content"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        )}

        {/* Light/Dark Toggle */}
        <button
          type="button"
          onClick={onToggleDark}
          className="p-2 rounded-lg border border-[var(--color-editor-border)] hover:bg-[var(--color-editor-elevated)] transition-colors text-[var(--color-editor-secondary)] cursor-pointer flex items-center justify-center"
          title={isDark ? "Switch to Light theme preview" : "Switch to Dark theme preview"}
        >
          {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
        </button>

        <span className="w-px h-5 bg-[var(--color-editor-border)]" />

        {/* Fullscreen Action */}
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg border border-[var(--color-editor-border)] hover:bg-[var(--color-editor-elevated)] text-[var(--color-editor-secondary)] cursor-pointer flex items-center justify-center transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen Preview"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        )}

        {/* Open in New Tab Window */}
        {onOpenNewWindow && (
          <button
            type="button"
            onClick={onOpenNewWindow}
            className="p-2 rounded-lg border border-[var(--color-editor-border)] hover:bg-[var(--color-editor-elevated)] text-[var(--color-editor-secondary)] cursor-pointer flex items-center justify-center transition-colors"
            title="Open preview in a new window"
          >
            <ExternalLink size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
