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
      className="sticky top-0 z-40 w-full h-14 flex items-center justify-between px-4 md:px-6 border-b border-[var(--color-editor-border)] bg-[var(--color-editor-bg)]/80 backdrop-blur-xl"
      role="banner"
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Post list toggle */}
        <button
          onClick={onTogglePostList}
          className="p-2 rounded-lg text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] transition-all duration-150 cursor-pointer"
          aria-label="Toggle post list"
        >
          <PanelLeftOpen size={18} />
        </button>

        {/* Back link */}
        <Link
          href="/"
          className="hidden sm:flex items-center gap-1.5 text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] transition-colors duration-150"
          aria-label="Go home"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">OpenIdear</span>
        </Link>

        {/* Separator */}
        <div className="hidden sm:block w-px h-5 bg-[var(--color-editor-border)]" />

        {/* Status indicator */}
        <SaveStatusIndicator status={saveStatus} onRetry={onRetrySave} />

        {/* Draft / Published badge */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
            isPublished
              ? "bg-[var(--color-editor-success)]/15 text-[var(--color-editor-success)]"
              : "bg-[var(--color-editor-warning)]/15 text-[var(--color-editor-warning)]"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-[var(--color-editor-success)]" : "bg-[var(--color-editor-warning)]"}`}
          />
          {isPublished ? "Published" : "Draft"}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5">
        {/* ✨ Publish by AI — amber gradient (simpler pipeline) */}
        {onOpenPublishByAI && (
          <button
            onClick={onOpenPublishByAI}
            id="publish-by-ai-header-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #ea580c)",
              boxShadow: "0 2px 12px rgba(245,158,11,0.25)",
            }}
            aria-label="Open Publish by AI"
          >
            <Sparkles size={13} className="text-white" />
            <span>Publish by AI</span>
          </button>
        )}

        {/* 1-Click AI Publisher */}
        {onOpen1ClickAI && (
          <button
            onClick={onOpen1ClickAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
            aria-label="Open 1-Click AI Publisher"
          >
            <Sparkles size={14} className="text-amber-300 animate-pulse" />
            <span>1-Click AI</span>
          </button>
        )}

        {/* AI Planner */}
        <button
          onClick={onToggleAIPlanner}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
            aiPlannerOpen
              ? "bg-[var(--color-editor-accent)]/15 text-[var(--color-editor-accent)]"
              : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]"
          }`}
          aria-label="Toggle AI Planner"
        >
          <Sparkles size={14} className="text-[var(--color-editor-accent)]" />
          <span>AI Planner</span>
        </button>

        {/* AI Image Generator */}
        <button
          onClick={onToggleAIImageGen}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
            aiImageGenOpen
              ? "bg-violet-500/15 text-violet-400"
              : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]"
          }`}
          aria-label="Toggle AI Image Generator"
        >
          <Wand2 size={14} className="text-violet-400" />
          <span>AI Image</span>
        </button>

        {/* AI Image Editor */}
        <button
          onClick={onToggleAIImageEdit}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
            aiImageEditOpen
              ? "bg-indigo-500/15 text-indigo-400"
              : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]"
          }`}
          aria-label="Toggle AI Image Editor"
        >
          <Paintbrush size={14} className="text-indigo-400" />
          <span>AI Edit</span>
        </button>

        {/* AI Diagram Generator */}
        <button
          onClick={onToggleAIDiagram}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
            aiDiagramOpen
              ? "bg-fuchsia-500/15 text-fuchsia-400"
              : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]"
          }`}
          aria-label="Toggle AI Diagram Generator"
        >
          <Network size={14} className="text-fuchsia-400" />
          <span>AI Diagram</span>
        </button>

        {/* SEO Score */}
        <button
          onClick={onToggleSEO}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
            seoOpen
              ? "bg-emerald-500/15 text-emerald-500"
              : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]"
          }`}
          aria-label="Toggle SEO Score panel"
        >
          <TrendingUp size={14} className={seoOpen ? "text-emerald-500" : "text-emerald-400"} />
          <span>SEO Score</span>
        </button>

        {/* Separator */}
        <div className="hidden sm:block w-px h-5 bg-[var(--color-editor-border)]" />

        {/* HTML mode toggle */}
        <button
          onClick={onToggleHtmlMode}
          className={`p-2 rounded-lg transition-all duration-150 cursor-pointer ${
            htmlMode
              ? "bg-[var(--color-editor-accent)]/15 text-[var(--color-editor-accent)]"
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
            className={`p-2 rounded-lg transition-all duration-150 cursor-pointer ${
              previewMode
                ? "bg-[var(--color-editor-accent)]/15 text-[var(--color-editor-accent)]"
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] hover:border-[var(--color-editor-secondary)] active:scale-[0.97]"
          aria-label="Save draft"
        >
          <Save size={14} />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Publish button */}
        <button
          onClick={onPublish}
          disabled={isPublished}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
            !isPublished
              ? "bg-[var(--color-editor-accent)] hover:bg-[var(--color-editor-accent-hover)] text-white shadow-lg shadow-[var(--color-editor-accent)]/25 hover:shadow-[var(--color-editor-accent-hover)]/30 active:scale-[0.97]"
              : "bg-[var(--color-editor-elevated)] text-[var(--color-editor-muted)] cursor-not-allowed"
          }`}
          aria-label={isPublished ? "Already published" : "Publish post"}
        >
          <Send size={14} />
          <span>{isPublished ? "Published" : "Publish"}</span>
        </button>
      </div>
    </header>
  );
};

export default EditorHeader;
