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
  PanelLeftClose,
  Sparkles,
  Wand2,
  Paintbrush,
  Network,
  TrendingUp,
  Gauge,
  FileText,
  Loader2,
  ChevronDown,
} from "lucide-react";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";
import Link from "next/link";
import { useTranslation } from "@/app/hook/useTranslation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
  /** Post list panel open status */
  postListOpen?: boolean;
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
  /** Open Generate All Visuals (Batch) modal */
  onOpenBatchVisuals?: () => void;
  /** Active editing locale */
  activeLocale?: "en" | "vi";
  /** Callback when switching editing locale */
  onSelectLocale?: (locale: "en" | "vi") => void;
  /** Locales status (whether translated, published) */
  localesStatus?: {
    en?: { exists: boolean; published: boolean };
    vi?: { exists: boolean; published: boolean };
  };
  /** Trigger AI translation from alternate language */
  onTranslateFromSource?: () => void;
  /** Translation in progress */
  isTranslating?: boolean;
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
  postListOpen = false,
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
  onOpenBatchVisuals,
  activeLocale = "en",
  onSelectLocale,
  localesStatus,
  onTranslateFromSource,
  isTranslating = false,
}) => {
  const { t } = useTranslation();
  const canSave = hasTitle;
  const canPublish = isEditMode && !isPublished;

  const activeAiToolsCount = [
    aiPlannerOpen,
    aiImageGenOpen,
    aiImageEditOpen,
    aiDiagramOpen,
    seoOpen,
  ].filter(Boolean).length;

  return (
    <header
      className="sticky top-0 z-40 w-full max-w-full h-14 flex items-center justify-between px-2.5 sm:px-4 md:px-6 border-b border-[var(--color-editor-border)]/60 bg-[var(--color-editor-bg)]/80 backdrop-blur-xl"
      role="banner"
    >
      {/* Left section */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink min-w-0">
        {/* Post list toggle */}
        <button
          onClick={onTogglePostList}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs shrink-0 ${
            postListOpen
              ? "bg-[var(--color-editor-accent)] text-white"
              : "text-[var(--color-editor-text)] bg-[var(--color-editor-elevated)] hover:bg-[var(--color-editor-border)]/50 border border-[var(--color-editor-border)]"
          }`}
          aria-label={postListOpen ? t("editor.header.hide_sidebar") : t("editor.header.open_sidebar")}
          title={postListOpen ? t("editor.header.hide_sidebar") : t("editor.header.open_sidebar")}
        >
          <FileText size={14} className={postListOpen ? "text-white" : "text-violet-500"} />
          <span className="hidden md:inline font-semibold">{t("editor.header.my_posts")}</span>
          {postListOpen ? (
            <PanelLeftClose size={14} className="hidden sm:inline" />
          ) : (
            <PanelLeftOpen size={14} className="hidden sm:inline" />
          )}
        </button>

        {/* Back link */}
        <Link
          href="/"
          className="hidden md:flex items-center gap-1.5 text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] transition-colors duration-200 shrink-0"
          aria-label="Go home"
          title="OpenIdear Home"
        >
          <ArrowLeft size={16} />
          <span className="hidden lg:inline text-sm font-medium">OpenIdear</span>
        </Link>

        {/* Gradient separator */}
        <div className="hidden md:block w-px h-5 bg-gradient-to-b from-transparent via-[var(--color-editor-border)] to-transparent shrink-0" />

        {/* Status indicator */}
        <div className="shrink-0">
          <SaveStatusIndicator status={saveStatus} onRetry={onRetrySave} />
        </div>

        {/* ── Locale Tabs (EN / VI) ── */}
        {onSelectLocale && (
          <div className="flex items-center bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] rounded-xl p-0.5 shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => onSelectLocale("en")}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                activeLocale === "en"
                  ? "bg-[var(--color-editor-accent)] text-white shadow-xs"
                  : "text-[var(--color-editor-muted)] hover:text-[var(--color-editor-text)]"
              }`}
              aria-label={t("editor.header.english_translation")}
              title={t("editor.header.english_translation")}
            >
              <span>🇺🇸 EN</span>
              {localesStatus?.en?.published ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title={t("editor.header.published")} />
              ) : localesStatus?.en?.exists ? (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title={t("editor.header.draft")} />
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => onSelectLocale("vi")}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                activeLocale === "vi"
                  ? "bg-[var(--color-editor-accent)] text-white shadow-xs"
                  : "text-[var(--color-editor-muted)] hover:text-[var(--color-editor-text)]"
              }`}
              aria-label={t("editor.header.vietnamese_translation")}
              title={t("editor.header.vietnamese_translation")}
            >
              <span>🇻🇳 VI</span>
              {localesStatus?.vi?.exists ? (
                localesStatus.vi.published ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title={t("editor.header.published")} />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title={t("editor.header.draft")} />
                )
              ) : (
                <span className="text-[10px] opacity-70 font-normal">{t("editor.header.new_badge")}</span>
              )}
            </button>
          </div>
        )}

        {/* AI Translate draft button */}
        {onTranslateFromSource && (
          <button
            type="button"
            onClick={onTranslateFromSource}
            disabled={isTranslating}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs shrink-0 relative overflow-hidden ${
              isTranslating
                ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold shadow-amber-500/20 ring-1 ring-amber-400/40 cursor-wait animate-pulse"
                : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 dark:text-amber-300 border border-amber-500/30"
            }`}
            title={t("editor.header.translate_from_source_title", { source: activeLocale === "vi" ? "English (EN)" : "Vietnamese (VI)" })}
          >
            {isTranslating && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            )}
            {isTranslating ? (
              <Loader2 size={13} className="animate-spin text-slate-950 shrink-0" />
            ) : (
              <Sparkles size={13} />
            )}
            <span className="hidden 2xl:inline">{isTranslating ? t("editor.banner.translating") : t("editor.header.translate_from", { source: activeLocale === "vi" ? "EN" : "VI" })}</span>
            <span className="inline 2xl:hidden">{isTranslating ? t("editor.banner.translating") : t("editor.header.translate_short")}</span>
          </button>
        )}

        {/* Draft / Published badge */}
        <div
          className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors duration-200 shrink-0 ${
            isPublished
              ? "bg-[var(--color-editor-success)]/12 text-[var(--color-editor-success)]"
              : "bg-[var(--color-editor-warning)]/12 text-[var(--color-editor-warning)]"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-[var(--color-editor-success)]" : "bg-[var(--color-editor-warning)] animate-pulse"}`}
          />
          {isPublished ? t("editor.header.published") : t("editor.header.draft")}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* ── AI Tools: Full Expanded Row on 2xl screens (>=1536px) ── */}
        <div className="hidden 2xl:flex items-center gap-1 px-1.5 py-1 rounded-xl bg-[var(--color-editor-elevated)]/50 border border-[var(--color-editor-border)]/40">
          {/* 1-Click AI Publisher */}
          {onOpen1ClickAI && (
            <button
              onClick={onOpen1ClickAI}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
              aria-label={t("editor.header.one_click_ai_title")}
              title={t("editor.header.one_click_ai_title")}
            >
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
              <span>{t("editor.header.one_click_ai")}</span>
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
            aria-label={t("editor.header.ai_planner")}
            title={t("editor.header.ai_planner")}
          >
            <Sparkles size={14} className="text-[var(--color-editor-accent)]" />
            <span>{t("editor.header.ai_planner")}</span>
          </button>

          {/* AI Image Generator */}
          <button
            onClick={onToggleAIImageGen}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              aiImageGenOpen
                ? "bg-violet-500/15 text-violet-400 shadow-sm"
                : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-surface)]"
            }`}
            aria-label={t("editor.header.ai_image")}
            title={t("editor.header.ai_image")}
          >
            <Wand2 size={14} className="text-violet-400" />
            <span>{t("editor.header.ai_image")}</span>
          </button>

          {/* AI Image Editor */}
          <button
            onClick={onToggleAIImageEdit}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              aiImageEditOpen
                ? "bg-indigo-500/15 text-indigo-400 shadow-sm"
                : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-surface)]"
            }`}
            aria-label={t("editor.header.ai_edit")}
            title={t("editor.header.ai_edit")}
          >
            <Paintbrush size={14} className="text-indigo-400" />
            <span>{t("editor.header.ai_edit")}</span>
          </button>

          {/* AI Diagram Generator */}
          <button
            onClick={onToggleAIDiagram}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              aiDiagramOpen
                ? "bg-fuchsia-500/15 text-fuchsia-400 shadow-sm"
                : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-surface)]"
            }`}
            aria-label={t("editor.header.diagram")}
            title={t("editor.header.diagram")}
          >
            <Network size={14} className="text-fuchsia-400" />
            <span>{t("editor.header.diagram")}</span>
          </button>

          {/* SEO Score */}
          <button
            onClick={onToggleSEO}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              seoOpen
                ? "bg-emerald-500/15 text-emerald-500 shadow-sm"
                : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-surface)]"
            }`}
            aria-label={t("editor.header.seo")}
            title={t("editor.header.seo")}
          >
            <TrendingUp size={14} className={seoOpen ? "text-emerald-500" : "text-emerald-400"} />
            <span>{t("editor.header.seo")}</span>
          </button>

          {/* AI Usage Dashboard Link */}
          <Link
            href="/app/dashboard/ai"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-editor-secondary)] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-[var(--color-editor-surface)] transition-all duration-200 cursor-pointer"
            aria-label={t("editor.header.ai_usage")}
            title={t("editor.header.ai_usage")}
          >
            <Gauge size={14} className="text-blue-500" />
            <span>{t("editor.header.ai_usage")}</span>
          </Link>

          {/* Batch Action: Generate All Visuals */}
          {onOpenBatchVisuals && (
            <button
              onClick={onOpenBatchVisuals}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-500/15 hover:bg-violet-500/25 text-violet-600 dark:text-violet-300 border border-violet-500/25 shadow-2xs transition-all duration-200 cursor-pointer"
              aria-label={t("editor.header.generate_visuals")}
              title={t("editor.header.generate_visuals")}
            >
              <Sparkles size={14} className="text-violet-500 animate-pulse" />
              <span>{t("editor.header.generate_visuals")}</span>
            </button>
          )}
        </div>

        {/* ── AI Tools: Compact / Collapsed on screens < 2xl ── */}
        <div className="flex 2xl:hidden items-center gap-1.5">
          {/* 1-Click AI: Flagship action button */}
          {onOpen1ClickAI && (
            <button
              onClick={onOpen1ClickAI}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
              aria-label={t("editor.header.one_click_ai_title")}
              title={t("editor.header.one_click_ai_title")}
            >
              <Sparkles size={14} className="text-amber-300 animate-pulse shrink-0" />
              <span className="hidden sm:inline">{t("editor.header.one_click_ai")}</span>
              <span className="inline sm:hidden">AI</span>
            </button>
          )}

          {/* AI Tools Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border shrink-0 ${
                  activeAiToolsCount > 0
                    ? "bg-violet-500/15 border-violet-500/40 text-violet-600 dark:text-violet-300 shadow-xs"
                    : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] bg-[var(--color-editor-elevated)] hover:bg-[var(--color-editor-border)]/50 border-[var(--color-editor-border)]"
                }`}
                aria-label={t("editor.header.ai_tools", undefined, "AI Tools")}
                title={t("editor.header.ai_tools", undefined, "AI Tools")}
              >
                <Wand2 size={14} className={activeAiToolsCount > 0 ? "text-violet-500" : "text-violet-400"} />
                <span className="hidden md:inline">{t("editor.header.ai_tools", undefined, "AI Tools")}</span>
                {activeAiToolsCount > 0 && (
                  <span className="flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-violet-600 text-white">
                    {activeAiToolsCount}
                  </span>
                )}
                <ChevronDown size={13} className="opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl border border-[var(--color-editor-border)] bg-[var(--color-editor-bg)]/95 backdrop-blur-xl shadow-2xl z-50">
              <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-editor-muted)]">
                {t("editor.header.ai_tools", undefined, "AI Tools")}
              </DropdownMenuLabel>

              {/* AI Planner */}
              <DropdownMenuItem
                onClick={onToggleAIPlanner}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  aiPlannerOpen
                    ? "bg-[var(--color-editor-accent)]/15 text-[var(--color-editor-accent)]"
                    : "text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[var(--color-editor-accent)]" />
                  <span>{t("editor.header.ai_planner")}</span>
                </span>
                {aiPlannerOpen && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-editor-accent)]" />}
              </DropdownMenuItem>

              {/* AI Image */}
              <DropdownMenuItem
                onClick={onToggleAIImageGen}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  aiImageGenOpen
                    ? "bg-violet-500/15 text-violet-400"
                    : "text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Wand2 size={14} className="text-violet-400" />
                  <span>{t("editor.header.ai_image")}</span>
                </span>
                {aiImageGenOpen && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
              </DropdownMenuItem>

              {/* AI Edit */}
              <DropdownMenuItem
                onClick={onToggleAIImageEdit}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  aiImageEditOpen
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Paintbrush size={14} className="text-indigo-400" />
                  <span>{t("editor.header.ai_edit")}</span>
                </span>
                {aiImageEditOpen && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </DropdownMenuItem>

              {/* Diagram */}
              <DropdownMenuItem
                onClick={onToggleAIDiagram}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  aiDiagramOpen
                    ? "bg-fuchsia-500/15 text-fuchsia-400"
                    : "text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Network size={14} className="text-fuchsia-400" />
                  <span>{t("editor.header.diagram")}</span>
                </span>
                {aiDiagramOpen && <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />}
              </DropdownMenuItem>

              {/* SEO Score */}
              <DropdownMenuItem
                onClick={onToggleSEO}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  seoOpen
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <TrendingUp size={14} className={seoOpen ? "text-emerald-500" : "text-emerald-400"} />
                  <span>{t("editor.header.seo")}</span>
                </span>
                {seoOpen && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-[var(--color-editor-border)]/60" />

              {/* Generate All Visuals */}
              {onOpenBatchVisuals && (
                <DropdownMenuItem
                  onClick={onOpenBatchVisuals}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-violet-600 dark:text-violet-300 hover:bg-violet-500/10 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-500" />
                    <span>{t("editor.header.generate_visuals")}</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 font-semibold">
                    Auto
                  </span>
                </DropdownMenuItem>
              )}

              {/* AI Usage Dashboard */}
              <DropdownMenuItem asChild>
                <Link
                  href="/app/dashboard/ai"
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] cursor-pointer"
                >
                  <Gauge size={14} className="text-blue-500" />
                  <span>{t("editor.header.ai_usage")}</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Gradient separator */}
        <div className="w-px h-5 bg-gradient-to-b from-transparent via-[var(--color-editor-border)] to-transparent shrink-0 mx-0.5" />

        {/* ── Fixed Action Controls (Never Clipped, Always Visible) ── */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* HTML mode toggle */}
          <button
            onClick={onToggleHtmlMode}
            className={`p-2 rounded-xl transition-all duration-200 cursor-pointer shrink-0 ${
              htmlMode
                ? "bg-[var(--color-editor-accent)]/15 text-[var(--color-editor-accent)] shadow-sm"
                : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]"
            }`}
            aria-label={
              htmlMode ? t("editor.header.visual_mode") : t("editor.header.html_mode")
            }
            title={htmlMode ? t("editor.header.visual_mode") : t("editor.header.html_mode")}
          >
            <Code size={16} />
          </button>

          {/* Preview toggle */}
          {!htmlMode && (
            <button
              onClick={onTogglePreview}
              className={`p-2 rounded-xl transition-all duration-200 cursor-pointer shrink-0 ${
                previewMode
                  ? "bg-[var(--color-editor-accent)]/15 text-[var(--color-editor-accent)] shadow-sm"
                  : "text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)]"
              }`}
              aria-label={previewMode ? t("editor.header.exit_preview") : t("editor.header.preview")}
              title={previewMode ? t("editor.header.exit_preview") : t("editor.header.preview")}
            >
              {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}

          {/* Save button */}
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)]/60 hover:border-[var(--color-editor-secondary)]/50 active:scale-[0.97] hover:shadow-sm shrink-0"
            aria-label={t("editor.header.save")}
            title={t("editor.header.save_title")}
          >
            <Save size={14} />
            <span className="hidden sm:inline">{t("editor.header.save")}</span>
          </button>

          {/* Publish button */}
          <button
            onClick={onPublish}
            disabled={isPublished}
            className={`group relative flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer overflow-hidden shrink-0 ${
              !isPublished
                ? "bg-[var(--color-editor-accent)] hover:bg-[var(--color-editor-accent-hover)] text-white shadow-lg shadow-[var(--color-editor-accent)]/25 hover:shadow-[var(--color-editor-accent-hover)]/30 active:scale-[0.97]"
                : "bg-[var(--color-editor-elevated)] text-[var(--color-editor-muted)] cursor-not-allowed"
            }`}
            aria-label={isPublished ? t("editor.header.already_published") : t("editor.header.publish")}
            title={isPublished ? t("editor.header.already_published") : t("editor.header.publish_title")}
          >
            {/* Shimmer overlay on hover */}
            {!isPublished && (
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer transition-opacity duration-300" />
            )}
            <Send size={14} className="relative z-10 shrink-0" />
            <span className="relative z-10">{isPublished ? t("editor.header.published_btn") : t("editor.header.publish")}</span>
          </button>
        </div>      </div>
    </header>
  );
};

export default EditorHeader;
