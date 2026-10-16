"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Send,
  Sparkles,
  Wand2,
  Loader2,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import { AIPublisherPanel, publisherApi, type AIPublisherResult, type CoverImageResult } from "@/features/ai";
import { useTranslation } from "@/app/hook/useTranslation";

interface PublishDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
  /** Categories */
  categories: any[];
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  /** Series */
  seriesList: any[];
  selectedSeries: string;
  onSeriesChange: (val: string) => void;
  onCreateSeries: (name: string) => void;
  /** Description */
  description: string;
  onDescriptionChange: (val: string) => void;
  /** Cover image */
  onCoverImageUploaded: (image: any) => void;
  /** Is publishing in progress */
  isPublishing?: boolean;
  /** Topic from editor title */
  initialTopic?: string;
  /** Auto fill handler callback */
  onAutoFillAI?: (result: AIPublisherResult) => void;
  /** Active editing locale being published */
  activeLocale?: "en" | "vi";
  /** Whether the active locale translation is currently published */
  isPublished?: boolean;
  /** Unpublish callback for active locale */
  onUnpublish?: () => void;
}

const PublishDrawer: React.FC<PublishDrawerProps> = ({
  isOpen,
  onClose,
  onPublish,
  categories,
  selectedCategory,
  onCategoryChange,
  seriesList,
  selectedSeries,
  onSeriesChange,
  onCreateSeries,
  description,
  onDescriptionChange,
  onCoverImageUploaded,
  isPublishing = false,
  initialTopic = "",
  onAutoFillAI,
  activeLocale = "en",
  isPublished = false,
  onUnpublish,
}) => {
  const { t } = useTranslation();
  const [aiCoverImage, setAiCoverImage] = useState<CoverImageResult | null>(null);
  const [isRegeneratingCover, setIsRegeneratingCover] = useState(false);
  const [showCreateSeries, setShowCreateSeries] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    coverImage: true,
    category: true,
    series: false,
  });
  const [isClosing, setIsClosing] = useState(false);

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  };

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRegenerateCover = async () => {
    const titleToUse = initialTopic || "Article Cover";
    setIsRegeneratingCover(true);
    try {
      const cover = await publisherApi.regenerateCoverImage({ title: titleToUse });
      setAiCoverImage(cover);
      if (cover?.url) {
        onCoverImageUploaded(cover);
      }
      toast.success(t("editor.publish_drawer.cover_success"));
    } catch (err: any) {
      toast.error(err?.message || t("editor.publish_drawer.cover_error"));
    } finally {
      setIsRegeneratingCover(false);
    }
  };

  const handleCreateSeries = () => {
    if (newSeriesName.trim()) {
      onCreateSeries(newSeriesName.trim());
      setNewSeriesName("");
      setShowCreateSeries(false);
    }
  };

  const handleAutoFillAIResult = (result: AIPublisherResult) => {
    // Auto fill description if present
    if (result.description) {
      onDescriptionChange(result.description);
    }

    // Auto fill cover image if present
    if (result.coverImage) {
      setAiCoverImage(result.coverImage);
      onCoverImageUploaded(result.coverImage);
    }

    // Auto match category if possible
    if (result.category && categories.length > 0) {
      const match = categories.find(
        (c: any) =>
          c.name?.toLowerCase() === result.category.toLowerCase() ||
          c.slug?.toLowerCase() === result.category.toLowerCase()
      );
      if (match?._id) {
        onCategoryChange(match._id);
      } else if (!selectedCategory && categories[0]?._id) {
        onCategoryChange(categories[0]._id);
      }
    }

    // Call parent editor shell auto fill callback
    onAutoFillAI?.(result);
  };

  // Determine publish readiness for visual feedback
  const isPublishReady = !!selectedCategory && !!description.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/30 backdrop-blur-sm animate-[fade-in_0.15s_ease-out]"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`relative w-full max-w-md h-full bg-[var(--color-editor-surface)] border-l border-[var(--color-editor-border)] flex flex-col shadow-2xl ${
          isClosing
            ? "animate-[slide-out-right_0.25s_ease-in_forwards]"
            : "animate-[slide-in-right_0.3s_ease-out]"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t("editor.publish_drawer.title")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-editor-border)]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[var(--color-editor-text)]">
                {t("editor.publish_drawer.title")}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-editor-accent)]/15 text-[var(--color-editor-accent)]">
                {activeLocale === "vi" ? "🇻🇳 Tiếng Việt" : "🇺🇸 English"}
              </span>
              {isPublished && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  {t("editor.header.published")}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--color-editor-muted)] mt-0.5">
              {t("editor.publish_drawer.configure_and_publish", {
                locale: activeLocale === "vi" ? t("editor.publish_drawer.vietnamese") : t("editor.publish_drawer.english"),
              })}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] transition-all duration-200 cursor-pointer"
            aria-label={t("editor.publish_drawer.close")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress steps */}
        <div className="px-6 py-3 border-b border-[var(--color-editor-border)]/50">
          <div className="flex items-center gap-2">
            {[
              { label: t("editor.publish_drawer.step_description"), done: !!description.trim() },
              { label: t("editor.publish_drawer.step_category"), done: !!selectedCategory },
              { label: t("editor.publish_drawer.step_publish"), done: false },
            ].map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors duration-200 ${
                      step.done
                        ? "bg-[var(--color-editor-success)]/15 text-[var(--color-editor-success)]"
                        : "bg-[var(--color-editor-elevated)] text-[var(--color-editor-muted)]"
                    }`}
                  >
                    {step.done ? "✓" : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium ${step.done ? "text-[var(--color-editor-success)]" : "text-[var(--color-editor-muted)]"}`}>
                    {step.label}
                  </span>
                </div>
                {i < 2 && (
                  <ChevronRight size={10} className="text-[var(--color-editor-muted)]/40 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Top Section: AI Publisher Panel */}
          <AIPublisherPanel
            initialTopic={initialTopic}
            categories={categories}
            onAutoFill={handleAutoFillAIResult}
          />

          {/* Existing Publish Settings Below */}
          {/* Description Section */}
          <CollapsibleSection
            title={t("editor.publish_drawer.description_title")}
            subtitle={t("editor.publish_drawer.description_subtitle")}
            expanded={expandedSections.description}
            onToggle={() => toggleSection("description")}
          >
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={3}
              placeholder={t("editor.publish_drawer.description_placeholder")}
              className="w-full bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-editor-text)] placeholder:text-[var(--color-editor-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-editor-accent)]/40 focus:border-[var(--color-editor-accent)]/50 resize-none transition-all duration-200"
              aria-label={t("editor.publish_drawer.description_title")}
            />
          </CollapsibleSection>

          {/* Cover Image Section */}
          <CollapsibleSection
            title={t("editor.publish_drawer.cover_title")}
            subtitle={t("editor.publish_drawer.cover_subtitle")}
            expanded={expandedSections.coverImage}
            onToggle={() => toggleSection("coverImage")}
          >
            <div className="space-y-3">
              {aiCoverImage?.url ? (
                <div className="relative rounded-xl overflow-hidden border border-purple-500/30 bg-purple-950/20 group">
                  <img
                    src={aiCoverImage.url}
                    alt={aiCoverImage.alt || "AI Cover Image"}
                    className="w-full h-44 object-cover rounded-xl"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-950/80 backdrop-blur-md border border-purple-500/30 text-[10px] font-bold text-purple-200">
                    <Sparkles className="w-3 h-3 text-purple-400" /> {t("editor.publish_drawer.ai_generated")}
                  </div>

                  <div className="p-3 bg-purple-950/40 border-t border-purple-500/20">
                    <p className="text-[11px] text-purple-200 font-medium truncate">
                      {aiCoverImage.prompt || aiCoverImage.alt}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-purple-300/60 font-mono">
                        {aiCoverImage.width}×{aiCoverImage.height}px
                      </span>
                      <button
                        type="button"
                        onClick={handleRegenerateCover}
                        disabled={isRegeneratingCover}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isRegeneratingCover ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {t("editor.publish_drawer.regenerating")}
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3 h-3 text-amber-300" />
                            {t("editor.publish_drawer.regenerate_cover")}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden">
                  <ImageUpload
                    onImageUploaded={onCoverImageUploaded}
                    onClose={() => {}}
                    isTitleDisplay={false}
                  />
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={handleRegenerateCover}
                      disabled={isRegeneratingCover}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isRegeneratingCover ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {t("editor.publish_drawer.generating_ai_cover")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          {t("editor.publish_drawer.generate_ai_cover")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Category Section */}
          <CollapsibleSection
            title={t("editor.publish_drawer.category_title")}
            subtitle={t("editor.publish_drawer.category_subtitle")}
            expanded={expandedSections.category}
            onToggle={() => toggleSection("category")}
            required
          >
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] rounded-xl px-4 py-3 pr-10 text-sm text-[var(--color-editor-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-editor-accent)]/40 focus:border-[var(--color-editor-accent)]/50 transition-all duration-200 cursor-pointer appearance-none"
                aria-label={t("editor.publish_drawer.select_category")}
              >
                <option value="">{t("editor.publish_drawer.select_category")}</option>
                {categories.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-editor-muted)] pointer-events-none" />
            </div>
          </CollapsibleSection>

          {/* Series Section */}
          <CollapsibleSection
            title={t("editor.publish_drawer.series_title")}
            subtitle={t("editor.publish_drawer.series_subtitle")}
            expanded={expandedSections.series}
            onToggle={() => toggleSection("series")}
          >
            {!showCreateSeries ? (
              <div className="space-y-3">
                <div className="relative">
                  <select
                    value={selectedSeries}
                    onChange={(e) => onSeriesChange(e.target.value)}
                    className="w-full bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] rounded-xl px-4 py-3 pr-10 text-sm text-[var(--color-editor-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-editor-accent)]/40 focus:border-[var(--color-editor-accent)]/50 transition-all duration-200 cursor-pointer appearance-none"
                    aria-label={t("editor.publish_drawer.series_title")}
                  >
                    <option value="">{t("editor.publish_drawer.no_series")}</option>
                    {seriesList.map((ser: any) => (
                      <option key={ser._id} value={ser._id}>
                        {ser.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-editor-muted)] pointer-events-none" />
                </div>
                <button
                  onClick={() => setShowCreateSeries(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-editor-accent)] hover:text-[var(--color-editor-accent-hover)] transition-colors cursor-pointer"
                >
                  <Plus size={14} /> {t("editor.publish_drawer.create_new_series")}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newSeriesName}
                  onChange={(e) => setNewSeriesName(e.target.value)}
                  placeholder={t("editor.publish_drawer.series_name_placeholder")}
                  className="w-full bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-editor-text)] placeholder:text-[var(--color-editor-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-editor-accent)]/40 focus:border-[var(--color-editor-accent)]/50 transition-all duration-200"
                  aria-label={t("editor.publish_drawer.series_name_placeholder")}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCreateSeries(false);
                      setNewSeriesName("");
                    }}
                    className="flex-1 px-3 py-2 text-xs font-medium text-[var(--color-editor-secondary)] border border-[var(--color-editor-border)] rounded-lg hover:bg-[var(--color-editor-elevated)] transition-all duration-200 cursor-pointer"
                  >
                    {t("editor.publish_drawer.cancel")}
                  </button>
                  <button
                    onClick={handleCreateSeries}
                    disabled={!newSeriesName.trim()}
                    className="flex-1 px-3 py-2 text-xs font-medium bg-[var(--color-editor-accent)] text-white rounded-lg hover:bg-[var(--color-editor-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                  >
                    {t("editor.publish_drawer.create")}
                  </button>
                </div>
              </div>
            )}
          </CollapsibleSection>
        </div>

        {/* Footer — sticky at bottom */}
        <div className="px-6 py-4 border-t border-[var(--color-editor-border)] bg-[var(--color-editor-surface)]">
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-3 py-2.5 text-sm font-medium text-[var(--color-editor-secondary)] border border-[var(--color-editor-border)] rounded-xl hover:bg-[var(--color-editor-elevated)] hover:text-[var(--color-editor-text)] transition-all duration-200 cursor-pointer"
            >
              {t("editor.publish_drawer.cancel")}
            </button>
            {isPublished && onUnpublish && (
              <button
                type="button"
                onClick={onUnpublish}
                disabled={isPublishing}
                className="px-3 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-xl hover:bg-rose-500/10 transition-all duration-200 cursor-pointer disabled:opacity-40"
              >
                {t("editor.publish_drawer.unpublish", { locale: activeLocale.toUpperCase() })}
              </button>
            )}
            <button
              onClick={onPublish}
              disabled={isPublishing || !selectedCategory}
              className={`group relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[var(--color-editor-accent)] text-white rounded-xl hover:bg-[var(--color-editor-accent-hover)] shadow-lg shadow-[var(--color-editor-accent)]/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 cursor-pointer active:scale-[0.97] overflow-hidden ${
                isPublishReady && !isPublishing ? "animate-[pulse-ring_2s_ease-in-out_infinite]" : ""
              }`}
            >
              {/* Shimmer overlay */}
              {!isPublishing && !(!selectedCategory) && (
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer transition-opacity duration-300" />
              )}
              {isPublishing ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4 relative z-10"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="relative z-10 font-bold">{t("editor.publish_drawer.publishing")}</span>
                </>
              ) : (
                <>
                  <Send size={15} className="relative z-10 transition-transform group-hover:translate-x-0.5" />
                  <span className="relative z-10 font-bold">
                    {isPublished
                      ? t("editor.publish_drawer.update_action", { locale: activeLocale.toUpperCase() })
                      : t("editor.publish_drawer.publish_action", { locale: activeLocale.toUpperCase() })}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---- Collapsible Section ---- */
interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  expanded: boolean;
  onToggle: () => void;
  required?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  expanded,
  onToggle,
  required,
  children,
}) => (
  <div className="border-b border-[var(--color-editor-border)]/50 last:border-0">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full py-4 group cursor-pointer"
      aria-expanded={expanded}
    >
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-[var(--color-editor-text)]">
          {title}
          {required && (
            <span className="text-[var(--color-editor-danger)] ml-0.5">*</span>
          )}
        </h3>
        {subtitle && (
          <span className="text-[10px] text-[var(--color-editor-muted)] font-medium uppercase tracking-wider">
            {subtitle}
          </span>
        )}
      </div>
      <div className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
        <ChevronDown
          size={16}
          className="text-[var(--color-editor-muted)] group-hover:text-[var(--color-editor-secondary)] transition-colors"
        />
      </div>
    </button>
    {expanded && (
      <div className="pb-4 animate-[fade-in_0.15s_ease-out]">{children}</div>
    )}
  </div>
);

export default PublishDrawer;
