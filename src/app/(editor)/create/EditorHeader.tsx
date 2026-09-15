"use client";

import React from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Code,
  Save,
  Send,
  PanelLeftOpen,
  Sparkles,
  Wand2,
  Paintbrush,
  Network,
  TrendingUp,
} from "lucide-react";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";
import Link from "next/link";

interface EditorHeaderProps {
  /** Whether we're editing an existing post */
  isEditMode: boolean;
  /** Post is already published */
  isPublished: boolean;
  /** Current preview mode */
  previewMode: boolean;
  onTogglePreview: () => void;
  /** HTML mode */
  htmlMode: boolean;
  onToggleHtmlMode: () => void;
  /** Save */
  onSave: () => void;
  /** Open publish drawer */
  onPublish: () => void;
  /** Toggle post list panel */
  onTogglePostList: () => void;
  /** Auto-save status */
  saveStatus: SaveStatus;
  onRetrySave?: () => void;
  /** Has title — needed to enable save */
  hasTitle: boolean;
  /** Toggle AI Planner panel */
  onToggleAIPlanner: () => void;
  /** AI Planner open status */
  aiPlannerOpen: boolean;
  /** Toggle AI Image Generator panel */
  onToggleAIImageGen: () => void;
  /** AI Image Generator open status */
  aiImageGenOpen: boolean;
  /** Toggle AI Image Editor panel */
  onToggleAIImageEdit: () => void;
  /** AI Image Editor open status */
  aiImageEditOpen: boolean;
  /** Toggle AI Diagram Generator panel */
  onToggleAIDiagram: () => void;
  /** AI Diagram Generator open status */
  aiDiagramOpen: boolean;
  /** Toggle SEO Score panel */
  onToggleSEO: () => void;
  /** SEO Score panel open status */
  seoOpen: boolean;
  /** Open 1-Click AI Publisher modal */
  onOpen1ClickAI?: () => void;
  /** Open Publish by AI modal (simpler single-call pipeline) */
  onOpenPublishByAI?: () => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  isEditMode,
  isPublished,
  previewMode,
  onTogglePreview,
  htmlMode,
  onToggleHtmlMode,
  onSave,
  onPublish,
  onTogglePostList,
  saveStatus,
  onRetrySave,
  hasTitle,
  onToggleAIPlanner,
  aiPlannerOpen,
  onToggleAIImageGen,
  aiImageGenOpen,
  onToggleAIImageEdit,
  aiImageEditOpen,
  onToggleAIDiagram,
  aiDiagramOpen,
  onToggleSEO,
  seoOpen,
  onOpen1ClickAI,
  onOpenPublishByAI,
}) => {
  const canSave = hasTitle;
  const canPublish = isEditMode && !isPublished;

  return (
    <header
      className="sticky top-0 z-40 w-full h-14 flex items-center justify-between px-4 md:px-6 border-b border-[var(--color-editor-border)]/60 bg-[var(--color-editor-bg)]/80 backdrop-blur-xl"
      role="banner"
    >
      {/* Left section */}
      <div className="flex items-center gap-2.5">
        {/* Post list toggle */}
        <button
          onClick={onTogglePostList}
          className="p-2 rounded-xl text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] transition-all duration-200 cursor-pointer hover:shadow-sm"
          aria-label="Toggle post list"
          title="Post list"
        >
          <PanelLeftOpen size={18} />
        </button>

        {/* Back link */}
        <Link
          href="/"
          className="hidden sm:flex items-center gap-1.5 text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] transition-colors duration-200"
          aria-label="Go home"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">OpenIdear</span>
        </Link>

        {/* Gradient separator */}
        <div className="hidden sm:block w-px h-5 bg-gradient-to-b from-transparent via-[var(--color-editor-border)] to-transparent" />

        {/* Status indicator */}
        <SaveStatusIndicator status={saveStatus} onRetry={onRetrySave} />

        {/* Draft / Published badge */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors duration-200 ${
            isPublished
              ? "bg-[var(--color-editor-success)]/12 text-[var(--color-editor-success)]"
              : "bg-[var(--color-editor-warning)]/12 text-[var(--color-editor-warning)]"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-[var(--color-editor-success)]" : "bg-[var(--color-editor-warning)] animate-pulse"}`}
          />
          {isPublished ? "Published" : "Draft"}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5">
        {/* ── AI Tools Cluster ── */}
        <div className="hidden sm:flex items-center gap-1 px-1.5 py-1 rounded-xl bg-[var(--color-editor-elevated)]/50 border border-[var(--color-editor-border)]/40">
          {/* ✨ Publish by AI — amber gradient (simpler pipeline) */}
          {onOpenPublishByAI && (
            <button
              onClick={onOpenPublishByAI}
              id="publish-by-ai-header-btn"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer active:scale-95 hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                boxShadow: "0 2px 12px rgba(245,158,11,0.25)",
              }}
              aria-label="Open Publish by AI"
              title="Publish by AI"
            >
              <Sparkles size={13} className="text-white" />
              <span>Publish by AI</span>
            </button>
          )}

          {/* 1-Click AI Publisher */}
          {onOpen1ClickAI && (
            <button
              onClick={onOpen1ClickAI}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
              aria-label="Open 1-Click AI Publisher"
              title="1-Click AI Publisher"
            >
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
              <span>1-Click AI</span>
            </button>
          )}

          {/* Separator within AI cluster */}
          <div className="w-px h-4 bg-[var(--color-editor-border)]/50 mx-0.5" />

          {/* AI Planner */}
          <button
            onClick={onToggleAIPlanner}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              aiPlannerOpen
                ? "bg-[var(--color-editor-accent)]/15 text-[var(--color-editor-accent)] shadow-sm"
                : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-surface)]"
            }`}
            aria-label="Toggle AI Planner"
            title="AI Planner"
          >
            <Sparkles size={14} className="text-[var(--color-editor-accent)]" />
            <span className="hidden lg:inline">AI Planner</span>
          </button>

          {/* AI Image Generator */}
          <button
            onClick={onToggleAIImageGen}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              aiImageGenOpen
                ? "bg-violet-500/15 text-violet-400 shadow-sm"
                : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-surface)]"
            }`}
            aria-label="Toggle AI Image Generator"
            title="AI Image Generator"
          >
            <Wand2 size={14} className="text-violet-400" />
            <span className="hidden lg:inline">AI Image</span>
          </button>

          {/* AI Image Editor */}
          <button
            onClick={onToggleAIImageEdit}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              aiImageEditOpen
                ? "bg-indigo-500/15 text-indigo-400 shadow-sm"
                : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-surface)]"
            }`}
            aria-label="Toggle AI Image Editor"
            title="AI Image Editor"
          >
            <Paintbrush size={14} className="text-indigo-400" />
            <span className="hidden lg:inline">AI Edit</span>
          </button>

          {/* AI Diagram Generator */}
          <button
            onClick={onToggleAIDiagram}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              aiDiagramOpen
                ? "bg-fuchsia-500/15 text-fuchsia-400 shadow-sm"
                : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-surface)]"
            }`}
            aria-label="Toggle AI Diagram Generator"
            title="AI Diagram Generator"
          >
            <Network size={14} className="text-fuchsia-400" />
            <span className="hidden lg:inline">Diagram</span>
          </button>

          {/* SEO Score */}
          <button
            onClick={onToggleSEO}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              seoOpen
                ? "bg-emerald-500/15 text-emerald-500 shadow-sm"
                : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-surface)]"
            }`}
            aria-label="Toggle SEO Score panel"
            title="SEO Score"
          >
            <TrendingUp size={14} className={seoOpen ? "text-emerald-500" : "text-emerald-400"} />
            <span className="hidden lg:inline">SEO</span>
          </button>
        </div>

        {/* Gradient separator */}
        <div className="hidden sm:block w-px h-5 bg-gradient-to-b from-transparent via-[var(--color-editor-border)] to-transparent" />

        {/* HTML mode toggle */}
        <button
          onClick={onToggleHtmlMode}
          className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
            htmlMode
              ? "bg-[var(--color-editor-accent)]/15 text-[var(--color-editor-accent)] shadow-sm"
              : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]"
          }`}
          aria-label={
            htmlMode ? "Switch to visual editor" : "Switch to HTML mode"
          }
          title={htmlMode ? "Visual mode" : "HTML mode"}
        >
          <Code size={16} />
        </button>

        {/* Preview toggle */}
        {!htmlMode && (
          <button
            onClick={onTogglePreview}
            className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
              previewMode
                ? "bg-[var(--color-editor-accent)]/15 text-[var(--color-editor-accent)] shadow-sm"
                : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]"
            }`}
            aria-label={previewMode ? "Exit preview" : "Preview post"}
            title={previewMode ? "Exit preview" : "Preview"}
          >
            {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {/* Save button */}
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)]/60 hover:border-[var(--color-editor-secondary)]/50 active:scale-[0.97] hover:shadow-sm"
          aria-label="Save draft"
          title="Save (⌘S)"
        >
          <Save size={14} />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Publish button */}
        <button
          onClick={onPublish}
          disabled={isPublished}
          className={`group relative flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer overflow-hidden ${
            !isPublished
              ? "bg-[var(--color-editor-accent)] hover:bg-[var(--color-editor-accent-hover)] text-white shadow-lg shadow-[var(--color-editor-accent)]/25 hover:shadow-[var(--color-editor-accent-hover)]/30 active:scale-[0.97]"
              : "bg-[var(--color-editor-elevated)] text-[var(--color-editor-muted)] cursor-not-allowed"
          }`}
          aria-label={isPublished ? "Already published" : "Publish post"}
          title={isPublished ? "Already published" : "Publish (⌘Enter)"}
        >
          {/* Shimmer overlay on hover */}
          {!isPublished && (
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer transition-opacity duration-300" />
          )}
          <Send size={14} className="relative z-10" />
          <span className="relative z-10">{isPublished ? "Published" : "Publish"}</span>
        </button>
      </div>
    </header>
  );
};

export default EditorHeader;
