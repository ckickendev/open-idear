"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import "@/styles/editor.css";

// ─── Feature Hooks ──────────────────────────────────────────────────────────
import { usePostEditor } from "../hooks/usePostEditor";
import { useAutoSave } from "@/features/autosave/hooks/useAutoSave";
import { usePublishPost } from "@/features/publish/hooks/usePublishPost";
import { useImageUpload } from "@/features/media/hooks/useImageUpload";
import { mediaLibraryApi } from "@/features/media-library/api/mediaLibrary.api";
import { useEditorShortcuts } from "../hooks/useEditorShortcuts";
import { useContentMetrics } from "@/features/seo/hooks/useContentMetrics";
import { useAIPlanner, AIPlannerView, AIImageGeneratorView, AIImageEditorView, AIDiagramView, ImageEnhancementReviewModal, useImageEnhancementReview, AIGenerationModal, OneClickPublisherModal, type PipelineData, type PublisherResponse, aiApi } from "@/features/ai";
import { toEditorHtml } from "@/features/ai/utils/contentTransformer";
import { LivePreviewSystem } from "@/features/preview";
import { useTranslation } from "@/app/hook/useTranslation";
import { useLanguageStore } from "@/store/useLanguage";

// ─── Context ────────────────────────────────────────────────────────────────
import { EditorProvider } from "../context/EditorContext";
import { EditorErrorBoundary } from "./EditorErrorBoundary";

// ─── Child Components (existing, from create/) ─────────────────────────────
import Toolbar from "@/app/(editor)/create/ToolBar";
import HtmlEditor from "@/app/(editor)/create/HtmlEditor";
import BlockInsertButton from "@/app/(editor)/create/FloatingToolbar";
import PostListPanel from "@/app/(editor)/create/PostLists";
import { RecentPostsSection } from "@/app/(editor)/create/RecentPostsSection";
import EditorHeader from "@/app/(editor)/create/EditorHeader";
import EditorTitle from "@/app/(editor)/create/EditorTitle";
import PublishDrawer from "@/app/(editor)/create/PublishDrawer";
import Instruction from "@/app/(editor)/create/Instruction";
import ImageUpload from "@/app/(editor)/create/ImageUpload";
import { MediaLibraryModal } from "@/features/media-library";
import EditorCanvas from "./EditorCanvas";
import StickyOutlineNav from "./StickyOutlineNav";
import BlockActionMenu from "./BlockActionMenu";
import SEOScoreSidebar from "./SEOScoreSidebar";
import { AssetPickerDrawer } from "./AssetPickerDrawer";
import { BatchVisualsModal } from "./BatchVisualsModal";
import { AIImageModal } from "./AIImageModal";
import { extractEditorContextForAiImage, trackAiImageTelemetry } from "../utils/aiAssistContext";
import { showImageInsertedToast } from "./ImageInsertedToast";
import { aiVisualApi, type ImageSearchResult, type GeneratedIllustrationAsset } from "@/features/ai-visual";
import type { ImportedAssetRecord } from "@/features/ai-visual/types/aiVisual.types";
import { useBlockActions } from "../hooks/useBlockActions";

// ─── APIs ───────────────────────────────────────────────────────────────────
import { categoryApi } from "@/features/categories/api/category.api";
import { seriesApi } from "@/features/series/api/series.api";
import { postApi } from "@/features/ideas/api/post.api";
import { api } from "@/lib/api/axios";

// ─── Types ──────────────────────────────────────────────────────────────────
import type {
  Category,
  Series,
  MediaAsset,
  EditorMode,
} from "../types/editor.types";

// ─── Writer Metrics (inline — simple enough to keep here) ───────────────────
import {
  Clock,
  Sparkles,
  Wand2,
  BookOpen,
  FileText,
  AlertCircle,
  X,
  Loader2,
  Image as ImageIcon,
  Languages,
} from "lucide-react";
import { BubbleMenu } from "@tiptap/react/menus";

function WriterMetricsBar({
  wordCount,
  charCount,
  readingTime,
}: {
  wordCount: number;
  charCount: number;
  readingTime: number;
}) {
  if (wordCount === 0) return null;

  return (
    <div className="flex items-center justify-center gap-4 py-4 animate-[fade-in_0.2s_ease-out]">
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] shadow-sm">
        <span className="text-[11px] text-[var(--color-editor-muted)] tabular-nums">
          {wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}
        </span>
        <span className="w-px h-3 bg-[var(--color-editor-border)]" />
        <span className="text-[11px] text-[var(--color-editor-muted)] tabular-nums">
          {charCount.toLocaleString()} chars
        </span>
        <span className="w-px h-3 bg-[var(--color-editor-border)]" />
        <span className="flex items-center gap-1 text-[11px] text-[var(--color-editor-muted)]">
          <Clock size={10} />
          {readingTime} min read
        </span>
      </div>
    </div>
  );
}

// ─── Utility ────────────────────────────────────────────────────────────────
function formatHtml(html: string): string {
  if (!html) return "";
  let formatted = html.replace(/>\s*</g, ">\n<");
  const indent = 2;
  const lines = formatted.split("\n");
  let indentLevel = 0;

  formatted = lines
    .map((line: string) => {
      if (line.match(/^<\//)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      const indentation = " ".repeat(indentLevel * indent);
      const indentedLine = indentation + line;
      if (line.match(/<[^/][^>]*[^/]>$/)) {
        indentLevel++;
      }
      return indentedLine;
    })
    .join("\n");

  return formatted;
}

function isMongoObjectId(id?: string | null): boolean {
  return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
}

// ═══════════════════════════════════════════════════════════════════════════
// EditorShell — Main editor orchestrator
// ═══════════════════════════════════════════════════════════════════════════

export default function EditorShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { t, language } = useTranslation();

  // ─── Local UI State ───────────────────────────────────────────────────
  const [postId, setPostId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<EditorMode>("visual");
  const [rawHtml, setRawHtml] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  // ─── Locale & Bilingual Editing State (Sprint 3) ──────────────────────
  const [editorLocale, setEditorLocale] = useState<"en" | "vi">(() => {
    const param = searchParams.get("locale");
    if (param === "vi" || param === "en") return param;
    const storeLang = useLanguageStore.getState().lang;
    return storeLang === "vi" ? "vi" : "en";
  });
  const [localesStatus, setLocalesStatus] = useState<{
    en?: { exists: boolean; published: boolean };
    vi?: { exists: boolean; published: boolean };
  }>({});
  const [isNewTranslationDraft, setIsNewTranslationDraft] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const loadSeqRef = useRef(0);
  const switchingLocaleRef = useRef(false);
  const loadedLocaleRef = useRef<{ id: string; locale: string } | null>(null);

  // Panel states
  const [postListOpen, setPostListOpen] = useState(true);
  const [publishDrawerOpen, setPublishDrawerOpen] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageInsertPosition, setImageInsertPosition] = useState<number | null>(
    null,
  );

  // Responsive & persisted state for postListOpen
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("editor_post_list_open");
      if (saved !== null) {
        setPostListOpen(saved === "true");
      } else if (window.innerWidth < 1024) {
        setPostListOpen(false);
      }
    }
  }, []);

  const handleTogglePostList = useCallback(() => {
    setPostListOpen((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("editor_post_list_open", String(next));
      }
      return next;
    });
  }, []);

  const handleClosePostList = useCallback(() => {
    setPostListOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("editor_post_list_open", "false");
    }
  }, []);

  // Publish form state
  const [categories, setCategories] = useState<Category[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [descriptionPublic, setDescriptionPublic] = useState("");
  const [seriesPublic, setSeriesPublic] = useState("");
  const [categoryPublic, setCategoryPublic] = useState("");
  const [imagePublic, setImagePublic] = useState<string | null>(null);

  // ─── Unified right-panel state ────────────────────────────────────────
  // Replaces separate booleans with a discriminated union.
  // Only one panel can be open at a time (exclusive drawer pattern).
  type RightPanel = "planner" | "image-gen" | "image-edit" | "diagram" | "seo" | "asset-picker" | null;
  const [activeSidePanel, setActiveSidePanel] = useState<RightPanel>(null);

  // Derived boolean helpers for backwards-compatible prop passing
  const aiPlannerOpen = activeSidePanel === "planner";
  const aiImageGenOpen = activeSidePanel === "image-gen";
  const aiImageEditOpen = activeSidePanel === "image-edit";
  const aiDiagramOpen = activeSidePanel === "diagram";
  const seoOpen = activeSidePanel === "seo";
  const assetPickerOpen = activeSidePanel === "asset-picker";

  const [assetPickerContext, setAssetPickerContext] = useState<{
    heading?: string;
    searchQuery?: string;
    imagePrompt?: string;
    alt?: string;
    placeholderPos?: number;
  } | null>(null);

  function togglePanel(panel: RightPanel) {
    setActiveSidePanel((prev) => (prev === panel ? null : panel));
  }

  // Listen for ImagePlaceholder search button triggers
  useEffect(() => {
    const handleOpenAssetPicker = (e: Event) => {
      const customEvent = e as CustomEvent<{
        heading?: string;
        searchQuery?: string;
        imagePrompt?: string;
        alt?: string;
        placeholderPos?: number;
      }>;
      if (customEvent.detail) {
        setAssetPickerContext(customEvent.detail);
        setActiveSidePanel("asset-picker");
      }
    };

    window.addEventListener("open-asset-picker", handleOpenAssetPicker);
    return () => {
      window.removeEventListener("open-asset-picker", handleOpenAssetPicker);
    };
  }, []);

  const handleSelectAssetForPlaceholder = (
    asset: ImageSearchResult,
    altText: string,
    importedAsset?: ImportedAssetRecord
  ) => {
    if (!editor) return;

    // Use alt text from confirmation card (user may have edited it)
    const targetAlt = altText || asset.alt || assetPickerContext?.alt || asset.title || "Section visual";
    // Prefer imported asset URL (Cloudinary CDN) over raw external URL
    const targetUrl = importedAsset?.url || asset.url;
    const targetId  = importedAsset?._id || (asset.source === "asset_library" ? asset.id : undefined);
    const pos = assetPickerContext?.placeholderPos;

    if (typeof pos === "number" && pos >= 0) {
      try {
        editor
          .chain()
          .focus()
          .setNodeSelection(pos)
          .deleteSelection()
          .insertContentAt(pos, {
            type: "image",
            attrs: {
              src: targetUrl,
              alt: targetAlt,
              ...(targetId ? { "data-media-id": targetId } : {}),
            },
          })
          .run();
      } catch (err) {
        editor.chain().focus().setImage({ src: targetUrl, alt: targetAlt }).run();
      }
    } else {
      editor.chain().focus().setImage({ src: targetUrl, alt: targetAlt }).run();
    }

    // Track media library usage (only for existing library assets)
    if (postId && asset.source === "asset_library" && isMongoObjectId(asset.id)) {
      mediaLibraryApi.addUsage(asset.id, "post", postId, "content").catch(() => {});
    }

    // Telemetry: visual_search_selected
    aiVisualApi.trackAnalytics({
      heading: assetPickerContext?.heading,
      actionTaken: "visual_search_selected",
      postId: postId || undefined,
      metadata: { assetId: targetId, source: asset.source },
    });

    // Show post-insertion action bar
    showImageInsertedToast({
      pos,
      currentAlt: targetAlt,
      heading:    assetPickerContext?.heading,
      searchQuery: assetPickerContext?.searchQuery,
      imagePrompt: assetPickerContext?.imagePrompt,
      assetId:    targetId,
    });

    setActiveSidePanel(null);
    setAssetPickerContext(null);
    autoSave.markDirty();
  };

  // 1-Click AI Publisher Modal state
  const [is1ClickAIModalOpen, setIs1ClickAIModalOpen] = useState(false);

  // Batch Visuals Modal state (Sprint 3)
  const [isBatchVisualsModalOpen, setIsBatchVisualsModalOpen] = useState(false);

  const handleApply1ClickAIPipeline = (data: PipelineData) => {
    const generatedTitle = data.planner?.title || title;
    if (generatedTitle) {
      handleTitleChange(generatedTitle);
    }

    const markdown = data.enhancedMarkdown || data.writerMarkdown || "";
    if (markdown && editor) {
      const html = toEditorHtml(markdown, data.visualSuggestions || data.imageSuggestions);
      editor.commands.setContent(html);
      setGeneratedMarkdown(markdown);
      setGeneratedAiContext((prev) => ({
        ...prev,
        ...(data.aiContext || {}),
      }));
    }
    toast.success("1-Click Article pipeline generated and applied!");
    autoSave.markDirty();
  };

  const aiPlanner = useAIPlanner();

  // Bubble Menu AI Assist States
  const [bubbleView, setBubbleView] = useState<"icon" | "menu" | "input-improve" | "preview-improve" | "input-example" | "review-report" | "loading">("icon");
  const [improvePrompt, setImprovePrompt] = useState("");
  const [examplePrompt, setExamplePrompt] = useState("");
  const [loadingText, setLoadingText] = useState("");
  const [improvedResult, setImprovedResult] = useState<any>(null);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [lastSelectedText, setLastSelectedText] = useState("");

  // AI Image Modal States (Sprint 1, 2 & 3)
  const [isAiImageModalOpen, setIsAiImageModalOpen] = useState(false);
  const [aiImageContext, setAiImageContext] = useState<{
    prompt: string;
    heading?: string;
    sourceContext?: string;
    suggestedAlt?: string;
    visualSuggestion?: any;
    visualType?: string;
    visualIntent?: any;
    confidence?: number;
    recommendationReason?: string;
    recommendedPreset?: any;
    recommendedRatio?: string;
    contextType?: any;
  }>({ prompt: "" });

  // ─── Editor Hook ──────────────────────────────────────────────────────

  const {
    editor,
    isReady,
    getHTML,
    getText,
    setContent,
    wordCount,
    characterCount,
  } = usePostEditor({
    placeholder: "Start writing your ideas...",
    onContentChange: () => {
      // When editor content changes, mark auto-save as dirty
      if (postId) {
        autoSave.markDirty();
      }
    },
  });

  // ─── Post-Insertion Event Handlers (edit-image-alt, remove-image-node) ────────
  useEffect(() => {
    const handleEditAlt = (e: Event) => {
      if (!editor) return;
      const { pos, newAlt } = (e as CustomEvent<{ pos?: number; newAlt: string }>).detail;
      if (!newAlt) return;
      try {
        if (typeof pos === "number" && pos >= 0) {
          const node = editor.state.doc.nodeAt(pos);
          if (node?.type.name === "image") {
            editor.chain().focus().setNodeSelection(pos).updateAttributes("image", { alt: newAlt }).run();
          }
        }
      } catch (err) {
        console.warn("[EditorShell] edit-image-alt failed:", err);
      }
    };

    const handleRemoveNode = (e: Event) => {
      if (!editor) return;
      const { pos } = (e as CustomEvent<{ pos?: number }>).detail;
      try {
        if (typeof pos === "number" && pos >= 0) {
          editor.chain().focus().setNodeSelection(pos).deleteSelection().run();
        }
      } catch (err) {
        console.warn("[EditorShell] remove-image-node failed:", err);
      }
    };

    window.addEventListener("edit-image-alt", handleEditAlt);
    window.addEventListener("remove-image-node", handleRemoveNode);
    return () => {
      window.removeEventListener("edit-image-alt", handleEditAlt);
      window.removeEventListener("remove-image-node", handleRemoveNode);
    };
  }, [editor]);

  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>("");
  const [generatedAiContext, setGeneratedAiContext] = useState<Record<string, unknown> | null>(null);

  const getCurrentArticleMarkdown = useCallback(() => {
    if (generatedMarkdown && generatedMarkdown.trim()) {
      return generatedMarkdown;
    }
    if (editor) {
      const html = editor.getHTML();
      if (!html) return "";

      let md = html
        .replace(/\r\n/g, "\n")
        .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n")
        .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n")
        .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n")
        .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n\n#### $1\n\n")
        .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n\n##### $1\n\n")
        .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n\n###### $1\n\n")
        .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, "\n\n![$2]($1)\n\n")
        .replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, "\n\n![$1]($2)\n\n")
        .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, "\n\n![]($1)\n\n")
        .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "* $1\n")
        .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/([^\n])\s*(#{1,6}\s+[^\n]+)/g, "$1\n\n$2")
        .replace(/\n{3,}/g, "\n\n");

      return md.trim();
    }
    return "";
  }, [generatedMarkdown, editor]);

  // ─── Auto-Save Hook ──────────────────────────────────────────────────

  const autoSave = useAutoSave({
    postId,
    locale: editorLocale,
    getContent: () => ({
      title,
      html: getHTML(),
      text: getText().replace(/\n+/g, " ").trim(),
      ...(getCurrentArticleMarkdown() ? {
        markdown: getCurrentArticleMarkdown(),
        aiContext: generatedAiContext || undefined,
        contentVersion: "blocks-v1" as const,
      } : {}),
    }),
    enabled: !!postId,
  });

  // ─── Publish Hook ────────────────────────────────────────────────────

  const publishHook = usePublishPost({
    postId,
    locale: editorLocale,
    isPublished: false, // Will be updated on load
  });

  // ─── Image Upload Hook ───────────────────────────────────────────────

  const imageUpload = useImageUpload();

  // ─── AI Image Enhancement Review Hook ─────────────────────────────

  const enhancementReview = useImageEnhancementReview({
    editor,
    onSuccess: (count) => {
      if (count > 0) {
        toast.success(`Successfully inserted ${count} contextual images!`);
      }
    },
    onError: (msg) => {
      toast.error(msg);
    },
  });

  // ─── Content Metrics ─────────────────────────────────────────────────

  const { metrics } = useContentMetrics(editor);

  // ─── Block Actions Hook ────────────────────────────────────────────────

  const blockActions = useBlockActions({
    editor,
    title,
    category: categoryPublic,
    enabled: mode === "visual",
  });

  // ─── Missing AI state (moved from unified panel refactor) ─────────────

  const [isGenerating, setIsGenerating] = useState(false);
  const [sourceAssetToEdit, setSourceAssetToEdit] = useState<import("@/features/media-library/types/mediaLibrary.types").MediaAsset | null>(null);
  const [selectingSourceForEdit, setSelectingSourceForEdit] = useState(false);

  // ─── Keyboard Shortcuts ──────────────────────────────────────────────

  useEditorShortcuts({
    editor,
    onSave: () => autoSave.save(),
    onPublish: () => setPublishDrawerOpen(true),
    onTogglePreview: () =>
      setMode((prev) => (prev === "preview" ? "visual" : "preview")),
    onTogglePostList: handleTogglePostList,
  });

  // ─── Track fetched post for editor sync ──────────────────────────────
// ─── Helpers for Restoring Post & Structured Content ────────────────
function convertBlocksToHtml(blocks: any[]): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";
  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading": {
          const level = block.level === 3 ? 3 : 2;
          return `<h${level}>${block.content || ""}</h${level}>`;
        }
        case "paragraph": {
          return `<p>${block.content || ""}</p>`;
        }
        case "code": {
          const lang = block.language ? ` class="language-${block.language}"` : "";
          return `<pre><code${lang}>${block.code || ""}</code></pre>`;
        }
        case "list": {
          const tag = block.style === "ordered" ? "ol" : "ul";
          const items = (block.items || []).map((it: string) => `<li>${it}</li>`).join("");
          return `<${tag}>${items}</${tag}>`;
        }
        case "image": {
          return `<img src="${block.src || ""}" alt="${block.alt || ""}" />`;
        }
        case "quote": {
          return `<blockquote><p>${block.content || ""}</p></blockquote>`;
        }
        case "callout": {
          return `<blockquote><p><strong>${block.title || block.variant || "Note"}</strong>: ${block.content || ""}</p></blockquote>`;
        }
        case "faq": {
          const title = block.title || "Frequently Asked Questions";
          const items = (block.items || [])
            .map((it: any) => `<h3>${it.question || ""}</h3><p>${it.answer || ""}</p>`)
            .join("");
          return `<h2>${title}</h2>${items}`;
        }
        default:
          return block.content ? `<p>${block.content}</p>` : "";
      }
    })
    .join("\n");
}

function resolvePostEditorContent(post: any): { html: string; markdown: string } {
  if (!post) return { html: "", markdown: "" };

  // 1. Pristine Markdown from ArticleVersion or post.markdown
  if (post.markdown && typeof post.markdown === "string" && post.markdown.trim()) {
    const html = toEditorHtml(post.markdown);
    return { html, markdown: post.markdown };
  }

  const rawContent = post.content || "";

  // 2. Structured blocks with headings if content is unparsed or corrupted
  const hasHtmlHeadings = /<h[1-6][^>]*>/i.test(rawContent);
  const blocksHaveHeadings = Array.isArray(post.blocks) && post.blocks.some((b: any) => b.type === "heading");

  if (!hasHtmlHeadings && blocksHaveHeadings) {
    const htmlFromBlocks = convertBlocksToHtml(post.blocks);
    if (htmlFromBlocks) {
      return { html: htmlFromBlocks, markdown: "" };
    }
  }

  // 3. Raw markdown string stored in post.content
  if (/#{1,6}\s+/.test(rawContent) || /^\s*#[^#]/.test(rawContent)) {
    let md = rawContent;
    if (md.includes("<p") || md.includes("<h") || md.includes("<br")) {
      md = md
        .replace(/\r\n/g, "\n")
        .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, "\n\n## $1\n\n")
        .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "* $1\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }
    const html = toEditorHtml(md);
    return { html, markdown: md };
  }

  // 4. Content is already valid HTML
  return { html: rawContent, markdown: "" };
}

  // ─── Track fetched post for editor sync ──────────────────────────────
  const [loadedPost, setLoadedPost] = useState<any>(null);
  const contentAppliedKeyRef = useRef<string>("");

  // Sync post content into TipTap editor whenever editor becomes ready or loadedPost updates
  useEffect(() => {
    if (editor && loadedPost) {
      const key = `${loadedPost._id || loadedPost.title}::${editorLocale}`;
      if (contentAppliedKeyRef.current !== key) {
        const resolved = resolvePostEditorContent(loadedPost);
        if (resolved.html) {
          editor.commands.setContent(resolved.html, { emitUpdate: false });
          contentAppliedKeyRef.current = key;
        }
        if (resolved.markdown) {
          setGeneratedMarkdown(resolved.markdown);
        }
      }
    }
  }, [editor, isReady, loadedPost, editorLocale]);

  // ─── Locale-Aware Post Data Loader (Sprint 3) ────────────────────────
  const loadPostLocaleData = useCallback(
    async (targetPostId: string, targetLocale?: "en" | "vi") => {
      const seq = ++loadSeqRef.current;
      setPageLoading(true);

      try {
        const resPost = await postApi.getPostToEdit(targetPostId, targetLocale);
        if (seq !== loadSeqRef.current) {
          // Stale network response: author already switched to another tab
          return;
        }

        if (resPost.success && resPost.data?.post) {
          const post = resPost.data.post;
          const resolvedLocale = (post.activeLocale || post.defaultLocale || targetLocale || "en") as "en" | "vi";
          if (editorLocale !== resolvedLocale) {
            setEditorLocale(resolvedLocale);
          }
          loadedLocaleRef.current = { id: targetPostId, locale: resolvedLocale };

          // Shared parent Post fields
          setCategoryPublic(
            typeof post.category === "object" ? post.category?._id || "" : post.category || ""
          );
          setSeriesPublic(
            typeof post.series === "object" ? post.series?._id || "" : post.series || ""
          );
          setImagePublic(
            typeof post.image === "object" ? post.image?.url || null : post.image || null
          );

          // Update available locales status
          const translations: any[] = post.translations || [];
          const enTrans = translations.find((t) => t.locale === "en");
          const viTrans = translations.find((t) => t.locale === "vi");
          const defLoc = post.defaultLocale || "en";

          const enExists = !!enTrans || defLoc === "en" || (!post.isNewTranslation && resolvedLocale === "en");
          const viExists = !!viTrans || defLoc === "vi" || (!post.isNewTranslation && resolvedLocale === "vi");

          setLocalesStatus({
            en: {
              exists: enExists,
              published: enTrans ? !!enTrans.published : (defLoc === "en" && !post.isNewTranslation ? !!post.published : false),
            },
            vi: {
              exists: viExists,
              published: viTrans ? !!viTrans.published : (defLoc === "vi" && !post.isNewTranslation ? !!post.published : false),
            },
          });

          // Check if this locale translation is new / uncreated
          const isNew = !!post.isNewTranslation;
          setIsNewTranslationDraft(isNew);

          if (isNew) {
            setTitle("");
            setDescriptionPublic("");
            setGeneratedMarkdown("");
            publishHook.setIsPublished(false);
            if (editor) {
              editor.commands.setContent("", { emitUpdate: false });
            }
            contentAppliedKeyRef.current = `${targetPostId}::${resolvedLocale}`;
            autoSave.resetHash(`${resolvedLocale}::::`);
          } else {
            setTitle(post.title || "");
            setDescriptionPublic(post.description || "");
            publishHook.setIsPublished(!!post.published);

            const resolved = resolvePostEditorContent(post);
            setGeneratedMarkdown(resolved.markdown);

            if (editor) {
              editor.commands.setContent(resolved.html, { emitUpdate: false });
              contentAppliedKeyRef.current = `${targetPostId}::${resolvedLocale}`;
            }
            autoSave.resetHash(`${resolvedLocale}::${post.title || ""}::${resolved.html}`);

            try {
              sessionStorage.removeItem("content_studio_draft");
            } catch {}
          }

          setLoadedPost(post);
        }
      } catch (err) {
        console.error("Error loading post translation:", err);
        toast.error("Failed to load translation data");
      } finally {
        if (seq === loadSeqRef.current) {
          setPageLoading(false);
        }
      }
    },
    [editor, publishHook, autoSave]
  );

  // ─── Locale Tab Switcher Handler (Sprint 3) ───────────────────────────
  const handleSelectLocale = useCallback(
    async (newLocale: "en" | "vi") => {
      if (newLocale === editorLocale || switchingLocaleRef.current) return;
      switchingLocaleRef.current = true;

      try {
        // 1. Flush any pending debounced autosave before switching
        if (autoSave.hasUnsavedChanges) {
          toast.info("Saving pending changes before switching language...");
          await autoSave.save();
        }

        // 2. Clear editor content temporarily to prevent stale content flash
        setTitle("");
        if (editor) {
          editor.commands.setContent("");
        }

        // 3. Switch locale state
        setEditorLocale(newLocale);

        // 4. Update URL query params without full reload
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.set("locale", newLocale);
        router.replace(`${pathname}?${currentParams.toString()}`, { scroll: false });

        // 5. If we have an active post ID, load the target locale
        const currentPostId = searchParams.get("id") || postId;
        if (currentPostId) {
          await loadPostLocaleData(currentPostId, newLocale);
        }
      } finally {
        switchingLocaleRef.current = false;
      }
    },
    [editorLocale, autoSave, editor, router, pathname, searchParams, postId, loadPostLocaleData]
  );

  // Sync isNewTranslationDraft when an autosave completes
  useEffect(() => {
    if (autoSave.status === "saved" && isNewTranslationDraft) {
      setIsNewTranslationDraft(false);
      setLocalesStatus((prev) => ({
        ...prev,
        [editorLocale]: { exists: true, published: publishHook.isPublished },
      }));
    }
  }, [autoSave.status, isNewTranslationDraft, editorLocale, publishHook.isPublished]);

  const categoriesLoadedRef = useRef(false);
  const seriesLoadedRef = useRef(false);

  // ─── Fetch Initial Data ──────────────────────────────────────────────

  useEffect(() => {
    const fetchPreData = async () => {
      setPageLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        setPageLoading(false);
        return;
      }

      try {
        const currentPostId = searchParams.get("id");
        const localeParam = searchParams.get("locale") as "en" | "vi" | null;
        if (localeParam && (localeParam === "en" || localeParam === "vi")) {
          if (localeParam !== editorLocale) {
            setEditorLocale(localeParam);
          }
        }

        // Fetch categories + series only if not already loaded
        const fetchTasks: Promise<any>[] = [];
        const needCategory = !categoriesLoadedRef.current;
        const needSeries = !seriesLoadedRef.current;

        if (needCategory) fetchTasks.push(categoryApi.getCategories());
        if (needSeries) fetchTasks.push(seriesApi.getSeriesByUser());

        if (fetchTasks.length > 0) {
          const results = await Promise.all(fetchTasks);
          let idx = 0;
          if (needCategory) {
            const resCat = results[idx++];
            if (resCat?.success) {
              setCategories(resCat.data.categories);
              categoriesLoadedRef.current = true;
            }
          }
          if (needSeries) {
            const resSer = results[idx++];
            if (resSer?.success) {
              setSeriesList(resSer.data.series);
              seriesLoadedRef.current = true;
            }
          }
        }

        setPostId(currentPostId);
        if (!currentPostId) {
          loadedLocaleRef.current = null;
          try {
            const studioDraftRaw = sessionStorage.getItem("content_studio_draft");
            if (studioDraftRaw) {
              const draft = JSON.parse(studioDraftRaw);
              sessionStorage.removeItem("content_studio_draft");
              if (draft.title) setTitle(draft.title);
              if (draft.description) setDescriptionPublic(draft.description);
              if (draft.category) setCategoryPublic(draft.category);
              const resolved = resolvePostEditorContent(draft);
              if (resolved.markdown) setGeneratedMarkdown(resolved.markdown);
              setLoadedPost(draft);
              if (editor && resolved.html) {
                editor.commands.setContent(resolved.html, { emitUpdate: false });
                contentAppliedKeyRef.current = `draft::${draft.title}`;
              }
              setPageLoading(false);
              return;
            }
          } catch (e) {
            console.warn("[EditorShell] Error loading content_studio_draft:", e);
          }

          setTitle("");
          setDescriptionPublic("");
          setCategoryPublic("");
          setSeriesPublic("");
          setImagePublic(null);
          setLoadedPost(null);
          setIsNewTranslationDraft(false);
          setLocalesStatus({});
          if (editor) setContent("");
          setPageLoading(false);
          return;
        }

        if (
          loadedLocaleRef.current?.id !== currentPostId ||
          (localeParam && loadedLocaleRef.current?.locale !== localeParam) ||
          (!localeParam && !loadedLocaleRef.current)
        ) {
          await loadPostLocaleData(currentPostId, localeParam || undefined);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setPageLoading(false);
      }
    };
    fetchPreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, pathname]);

  // ─── AI Image Gen Integration ─────────────────────────────────────────

  const handleImageGenerated = (media: any) => {
    if (!editor) return;
    const position = editor.state.doc.content.size;
    const imgUrl = media.urls?.webp || media.urls?.original;
    const imgAlt = media.altText || media.description || "AI generated image";
    editor
      .chain()
      .focus()
      .insertContentAt(position, {
        type: "image",
        attrs: { src: imgUrl, alt: imgAlt, "data-media-id": media._id },
      })
      .run();

    if (postId && isMongoObjectId(media._id)) {
      mediaLibraryApi.addUsage(media._id, "post", postId, "content").catch(() => {});
    }
    setActiveSidePanel(null);
  };

  const handleImageEdited = (media: any) => {
    if (!editor) return;
    const position = editor.state.doc.content.size;
    const imgUrl = media.urls?.webp || media.urls?.original;
    const imgAlt = media.altText || media.description || "AI edited image";
    editor
      .chain()
      .focus()
      .insertContentAt(position, {
        type: "image",
        attrs: { src: imgUrl, alt: imgAlt, "data-media-id": media._id },
      })
      .run();

    if (postId && isMongoObjectId(media._id)) {
      mediaLibraryApi.addUsage(media._id, "post", postId, "content").catch(() => {});
    }
    setActiveSidePanel(null);
    setSourceAssetToEdit(null);
  };

  const handleInsertDiagram = (mermaidCode: string, title: string) => {
    if (!editor) return;
    const position = editor.state.doc.content.size;
    editor
      .chain()
      .focus()
      .insertContentAt(position, `<pre><code class="language-mermaid">${mermaidCode}</code></pre>`)
      .run();
    setActiveSidePanel(null);
  };

  // ─── AI Assist Bubble Menu Handlers ─────────────────────────────────────

  useEffect(() => {
    if (!editor) return;
    const handleSelectionChange = () => {
      setBubbleView("icon");
    };
    editor.on("selectionUpdate", handleSelectionChange);
    return () => {
      editor.off("selectionUpdate", handleSelectionChange);
    };
  }, [editor]);

  const handleContinueWriting = async () => {
    if (!editor) return;
    setBubbleView("loading");
    setLoadingText("Continuing writing...");
    try {
      const textBefore = editor.getText().slice(-2000);
      const res = await api.post("/api/editor/action", {
        action: "continue",
        locale: editorLocale,
        context: {
          surroundingContext: textBefore,
          articleTitle: title,
          audience: categoryPublic || "Developers",
          tone: "informative",
          locale: editorLocale,
          targetLanguage: editorLocale,
        },
      });

      if (res.data && res.data.status === "success" && res.data.data?.text) {
        editor.chain().focus().insertContent(res.data.data.text).run();
        toast.success("Text generated successfully!");
      } else {
        toast.error("Failed to generate continuation.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to continue writing.");
    } finally {
      setBubbleView("icon");
    }
  };

  const handleImproveText = async () => {
    if (!editor) return;
    const selected = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );
    if (!selected) {
      toast.error("Please select some text first.");
      return;
    }
    setLastSelectedText(selected);
    setBubbleView("loading");
    setLoadingText("Analyzing & rewriting...");
    try {
      const res = await api.post("/api/editor/action", {
        action: "improve",
        locale: editorLocale,
        context: {
          selectedText: selected,
          instruction: improvePrompt,
          audience: categoryPublic || "Developers",
          tone: "professional",
          locale: editorLocale,
          targetLanguage: editorLocale,
        },
      });

      if (res.data && res.data.status === "success" && res.data.data) {
        setImprovedResult(res.data.data);
        setBubbleView("preview-improve");
      } else {
        toast.error("Failed to improve text.");
        setBubbleView("menu");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to improve text.");
      setBubbleView("menu");
    }
  };

  const handleGenerateExample = async () => {
    if (!editor) return;
    const selected = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );
    setBubbleView("loading");
    setLoadingText("Generating example...");
    try {
      const res = await api.post("/api/editor/action", {
        action: "example",
        locale: editorLocale,
        context: {
          selectedText: selected || "",
          additionalInstructions: examplePrompt,
          language: "typescript",
          locale: editorLocale,
          targetLanguage: editorLocale,
        },
      });

      if (res.data && res.data.status === "success" && res.data.data?.markdown) {
        editor.chain().focus().insertContent(res.data.data.markdown).run();
        toast.success("Example inserted!");
      } else {
        toast.error("Failed to generate example.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate example.");
    } finally {
      setBubbleView("icon");
    }
  };

  const handleReviewArticle = async () => {
    if (!editor) return;
    setBubbleView("loading");
    setLoadingText("Reviewing article draft...");
    try {
      const res = await api.post("/api/editor/action", {
        action: "review",
        locale: editorLocale,
        context: {
          currentArticle: editor.getText(),
          articleTitle: title || "Untitled",
          audience: categoryPublic || "Developers",
          tone: "professional",
          locale: editorLocale,
          targetLanguage: editorLocale,
        },
      });

      if (res.data && res.data.status === "success" && res.data.data) {
        setReviewResult(res.data.data);
        setBubbleView("review-report");
      } else {
        toast.error("Failed to review article.");
        setBubbleView("menu");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to review article.");
      setBubbleView("menu");
    }
  };

  const handleOpenAiImageModal = useCallback((suggestion?: any) => {
    const ctx = extractEditorContextForAiImage(editor, suggestion, {
      title,
      category: categoryPublic,
    });
    setAiImageContext({
      prompt: ctx.suggestedPrompt,
      heading: ctx.heading,
      sourceContext: ctx.contextSnippet,
      suggestedAlt: ctx.suggestedAlt,
      visualSuggestion: ctx.visualSuggestion,
      visualType: ctx.visualIntent,
      visualIntent: ctx.visualIntent,
      confidence: ctx.confidence,
      recommendationReason: ctx.recommendationReason,
      recommendedPreset: ctx.recommendedPreset,
      recommendedRatio: ctx.recommendedRatio,
      contextType: ctx.contextType,
    });
    setBubbleView("icon");
    setIsAiImageModalOpen(true);
  }, [editor, title, categoryPublic]);

  const handleInsertAIImage = useCallback(
    (asset: GeneratedIllustrationAsset, customAlt?: string, customCaption?: string) => {
      if (!editor) return;
      const imgUrl = asset.url;
      const imgAlt = customAlt || asset.alt || asset.prompt || "AI generated illustration";
      const mediaId = asset._id;
      const isPersistentMedia = isMongoObjectId(mediaId);

      const { from, to, $to } = editor.state.selection;
      const hasActiveSelection = from !== to;

      if (hasActiveSelection) {
        // Safe insertion: insert AFTER the selected block rather than destroying selected text
        const insertPos = $to.end();
        editor
          .chain()
          .focus()
          .setTextSelection(insertPos)
          .insertContentAt(insertPos, {
            type: "image",
            attrs: {
              src: imgUrl,
              alt: imgAlt,
              ...(isPersistentMedia ? { "data-media-id": mediaId } : {}),
              ...(customCaption ? { caption: customCaption, title: customCaption } : {}),
            },
          })
          .run();
      } else {
        // Normal cursor insertion
        editor
          .chain()
          .focus()
          .insertContent({
            type: "image",
            attrs: {
              src: imgUrl,
              alt: imgAlt,
              ...(isPersistentMedia ? { "data-media-id": mediaId } : {}),
              ...(customCaption ? { caption: customCaption, title: customCaption } : {}),
            },
          })
          .run();
      }

      if (postId && isPersistentMedia) {
        mediaLibraryApi.addUsage(mediaId, "post", postId, "content").catch(() => {});
      }

      // Telemetry: ai_image_inserted
      trackAiImageTelemetry("ai_image_inserted", {
        heading: aiImageContext.heading,
        intent: aiImageContext.visualIntent,
        postId: postId || undefined,
        contextType: aiImageContext.contextType,
      });

      setIsAiImageModalOpen(false);
      autoSave.markDirty();
      toast.success("AI Image inserted into editor!");
    },
    [editor, postId, autoSave, aiImageContext]
  );

  // ─── AI Generate ──────────────────────────────────────────────────────

  const handleAutoGenerate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title to generate content.");
      return;
    }

    setIsGenerating(true);
    const response = await api.post("/api/generate", { title });

    if (response.success && response.data?.content) {
      setContent(response.data.content);
      toast.success("Content generated successfully!");
    } else {
      toast.error(response.message || "Failed to generate content");
    }
    setIsGenerating(false);
  };

  // ─── HTML Mode ────────────────────────────────────────────────────────

  const applyHtml = () => {
    if (editor) {
      editor.commands.setContent(rawHtml);
      setMode("visual");
    }
  };

  const toggleHtmlMode = () => {
    if (mode !== "html") {
      if (editor) {
        setRawHtml(formatHtml(editor.getHTML()));
      }
      setMode("html");
    } else {
      applyHtml();
    }
  };

  // ─── Block Insert ────────────────────────────────────────────────────

  const insertElementAtPosition = (type: string) => {
    if (!editor) return;
    const position = editor.state.doc.content.size;

    switch (type) {
      case "paragraph":
        editor
          .chain()
          .focus()
          .insertContentAt(position, "<p>Type your paragraph here</p>")
          .run();
        break;
      case "heading1":
        editor
          .chain()
          .focus()
          .insertContentAt(position, "<h1>Heading 1</h1>")
          .run();
        break;
      case "heading2":
        editor
          .chain()
          .focus()
          .insertContentAt(position, "<h2>Heading 2</h2>")
          .run();
        break;
      case "heading3":
        editor
          .chain()
          .focus()
          .insertContentAt(position, "<h3>Heading 3</h3>")
          .run();
        break;
      case "image":
        setImageInsertPosition(position);
        setShowImageUpload(true);
        break;
      case "link": {
        const url = prompt("Enter URL:", "https://example.com");
        const text = prompt("Enter link text:", "Link text");
        if (url && text) {
          editor
            .chain()
            .focus()
            .insertContentAt(position, text)
            .setTextSelection({ from: position, to: position + text.length })
            .setLink({ href: url })
            .setTextSelection(position + text.length)
            .run();
        }
        break;
      }
      case "blockquote":
        editor
          .chain()
          .focus()
          .insertContentAt(
            position,
            "<blockquote>Add a quote here</blockquote>",
          )
          .run();
        break;
      case "codeBlock":
        editor
          .chain()
          .focus()
          .insertContentAt(
            position,
            "<pre><code>// insert code here</code></pre>",
          )
          .run();
        break;
      case "callout":
        editor
          .chain()
          .focus()
          .insertContentAt(
            position,
            "<blockquote><strong>💡 Info:</strong> Add your callout content here.</blockquote>",
          )
          .run();
        break;
      case "faq":
        editor
          .chain()
          .focus()
          .insertContentAt(
            position,
            "<p><strong>Q: What is your question?</strong></p><p>A: Your answer goes here.</p>",
          )
          .run();
        break;
      case "comparison":
        editor
          .chain()
          .focus()
          .insertContentAt(
            position,
            "<table><tr><th>Option A</th><th>Option B</th></tr><tr><td>Feature 1</td><td>Feature 1</td></tr></table>",
          )
          .run();
        break;
      case "cta":
        editor
          .chain()
          .focus()
          .insertContentAt(
            position,
            "<p><strong>🚀 Get Started Today</strong></p><p>Take the next step. <a href=\"#\">Click here to learn more</a>.</p>",
          )
          .run();
        break;
    }
  };

  // ─── Image Upload Handlers ───────────────────────────────────────────

  const handleMediaSelected = (media: any) => {
    if (selectingSourceForEdit) {
      setSourceAssetToEdit(media);
      setSelectingSourceForEdit(false);
      setShowImageUpload(false);
      return;
    }

    if (editor && imageInsertPosition !== null) {
      const imgUrl = media.urls?.webp || media.urls?.original || media.url;
      const imgAlt = media.altText || media.description || "";
      editor
        .chain()
        .focus()
        .insertContentAt(imageInsertPosition, {
          type: "image",
          attrs: {
            src: imgUrl,
            alt: imgAlt,
            "data-media-id": media._id,
          },
        })
        .run();

      // Track usage
      if (postId && isMongoObjectId(media._id)) {
        mediaLibraryApi.addUsage(media._id, "post", postId, "content").catch(() => {});
      }
    }
    setShowImageUpload(false);
    setImageInsertPosition(null);
  };

  const handleImageUploadedPublic = (image: MediaAsset) => {
    setShowImageUpload(false);
    setImageInsertPosition(null);
    setImagePublic(image._id);
  };

  // ─── Series ──────────────────────────────────────────────────────────

  const createNewSeriesHandler = async (name: string) => {
    const res = await seriesApi.createSeries({ newSeries: name });
    if (res.success) {
      setSeriesList((prev) => [...prev, res.data.data]);
      toast.success("New series created successfully!");
    } else {
      toast.error(res.message || "Error creating series");
    }
  };

  // ─── Publish ─────────────────────────────────────────────────────────

  const onPublishHandle = async () => {
    const success = await publishHook.publish({
      postId: postId!,
      locale: editorLocale,
      title: title,
      content: getHTML(),
      description: descriptionPublic,
      image: imagePublic,
      series: seriesPublic,
      category: categoryPublic,
    });

    if (success) {
      setPublishDrawerOpen(false);
      setLocalesStatus((prev) => ({
        ...prev,
        [editorLocale]: { exists: true, published: true },
      }));
      setIsNewTranslationDraft(false);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("refresh-post-list"));
      }
    }
  };

  const handleUnpublish = async () => {
    if (!postId) return;
    const success = await publishHook.unpublish(editorLocale);
    if (success) {
      setLocalesStatus((prev) => ({
        ...prev,
        [editorLocale]: { ...prev[editorLocale], exists: true, published: false },
      }));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("refresh-post-list"));
      }
    }
  };

  const handleHeaderPublish = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title before publishing.");
      return;
    }
    if (!postId) {
      toast.info("Saving draft before publishing...");
      await autoSave.save();
    }
    setPublishDrawerOpen(true);
  };

  // ─── Title Change ────────────────────────────────────────────────────

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (postId) {
      autoSave.markDirty();
    }
  };

  // ─── Post List Navigation ───────────────────────────────────────────

  const handleSelectPost = useCallback(
    (selectedPostId: string | null) => {
      if (selectedPostId) {
        router.push(`/create?id=${selectedPostId}`);
      } else {
        router.push(`/create`);
      }
    },
    [router],
  );

  // ─── AI Writer Stream Integration ────────────────────────────────────

  const handleStartWriting = async (instructions: string) => {
    if (!aiPlanner.outline) return;

    // 1. Update Title automatically based on plan
    const generatedTitle = aiPlanner.outline.title;
    handleTitleChange(generatedTitle);

    // 2. Clear editor content
    setContent("");
    if (editor) {
      editor.commands.setContent("");
    }

    let accumulatedMarkdown = "";

    // 3. Trigger writing stream call
    await aiPlanner.writeStream(
      {
        additionalInstructions: instructions,
        language: editorLocale,
        userPreference: "",
      },
      (chunk) => {
        accumulatedMarkdown += chunk;
        if (editor) {
          const html = toEditorHtml(accumulatedMarkdown);
          editor.commands.setContent(html);
        }
      },
      async () => {
        toast.success("Article compiled successfully!");
        setGeneratedMarkdown(accumulatedMarkdown);
        const wCount = accumulatedMarkdown.split(/\s+/).filter(Boolean).length;
        setGeneratedAiContext({
          plannerOutput: aiPlanner.outline,
          writerOutput: {
            wordCount: wCount,
            estimatedReadingTime: Math.max(1, Math.ceil(wCount / 225)),
          },
        });
        // Run review modal enhancement pipeline
        enhancementReview.runEnhancementPipeline(accumulatedMarkdown, postId || undefined);
        autoSave.markDirty();
      }
    );
  };

  // ─── AI-Assisted Translation Integration (Sprint 4) ──────────────────

  const handleTranslateFromSource = async () => {
    if (!postId) {
      toast.error(t("editor.banner.save_original_first"));
      return;
    }
    const sourceLocale = editorLocale === "vi" ? "en" : "vi";
    const sourceLabel = sourceLocale === "en" ? (language === "vi" ? "Tiếng Anh" : "English") : (language === "vi" ? "Tiếng Việt" : "Vietnamese");
    const targetLabel = editorLocale === "vi" ? (language === "vi" ? "Tiếng Việt" : "Vietnamese") : (language === "vi" ? "Tiếng Anh" : "English");

    // Guard: Check if editor already has content in target draft
    const currentText = (editor ? editor.getText() : "").trim();
    if (currentText.length > 0 || title.trim().length > 0) {
      const confirmed = window.confirm(
        t("editor.banner.confirm_overwrite", { source: sourceLabel, target: targetLabel })
      );
      if (!confirmed) return;
    }

    setIsTranslating(true);
    try {
      // 1. Fetch source translation
      const resPost = await postApi.getPostToEdit(postId, sourceLocale);
      if (!resPost.success || !resPost.data?.post) {
        toast.error(t("editor.banner.could_not_retrieve", { source: sourceLabel }));
        setIsTranslating(false);
        return;
      }

      const src = resPost.data.post;
      const sourceContent = src.markdown || src.content || "";
      if (!sourceContent.trim() && !src.title?.trim()) {
        toast.error(t("editor.banner.no_content", { source: sourceLabel }));
        setIsTranslating(false);
        return;
      }

      // 2. Call AI translation endpoint
      const res = await aiApi.translateArticle({
        title: src.title || "",
        content: sourceContent,
        description: src.description || "",
        sourceLocale,
        targetLocale: editorLocale,
      });

      if (res.data) {
        const { title: transTitle, description: transDesc, content: transContent } = res.data;
        handleTitleChange(transTitle);
        if (transDesc) {
          setDescriptionPublic(transDesc);
        }
        setGeneratedMarkdown(transContent);
        if (editor) {
          const html = toEditorHtml(transContent);
          editor.commands.setContent(html);
        }
        autoSave.markDirty();
        toast.success(t("editor.banner.translated_success", { target: targetLabel }));
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to translate article.";
      toast.error(msg);
    } finally {
      setIsTranslating(false);
    }
  };

  // ─── Loading State ───────────────────────────────────────────────────

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-editor-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-[fade-in_0.3s_ease-out]">
          <div className="w-8 h-8 border-2 border-[var(--color-editor-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-editor-muted)]">
            Loading editor...
          </p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <EditorProvider editor={editor}>
      <div className="min-h-screen bg-editor-bg flex flex-col h-screen w-full max-w-full overflow-x-hidden">
        <Instruction />

        {/* Sticky header */}
        <EditorHeader
          isEditMode={!!postId}
          isPublished={publishHook.isPublished}
          previewMode={mode === "preview"}
          onTogglePreview={() =>
            setMode((prev) => (prev === "preview" ? "visual" : "preview"))
          }
          htmlMode={mode === "html"}
          onToggleHtmlMode={toggleHtmlMode}
          onSave={() => autoSave.save()}
          onPublish={handleHeaderPublish}
          onTogglePostList={handleTogglePostList}
          postListOpen={postListOpen}
          saveStatus={autoSave.status === "conflict" ? "error" : autoSave.status}
          onRetrySave={() => autoSave.retry()}
          hasTitle={!!title.trim()}
          onToggleAIPlanner={() => togglePanel("planner")}
          aiPlannerOpen={aiPlannerOpen}
          onToggleAIImageGen={() => togglePanel("image-gen")}
          aiImageGenOpen={aiImageGenOpen}
          onToggleAIImageEdit={() => togglePanel("image-edit")}
          aiImageEditOpen={aiImageEditOpen}
          onToggleAIDiagram={() => togglePanel("diagram")}
          aiDiagramOpen={aiDiagramOpen}
          onToggleSEO={() => togglePanel("seo")}
          seoOpen={seoOpen}
          onOpen1ClickAI={() => setIs1ClickAIModalOpen(true)}
          onOpenBatchVisuals={() => setIsBatchVisualsModalOpen(true)}
          activeLocale={editorLocale}
          onSelectLocale={handleSelectLocale}
          localesStatus={localesStatus}
          onTranslateFromSource={postId && localesStatus[editorLocale === "vi" ? "en" : "vi"]?.exists ? handleTranslateFromSource : undefined}
          isTranslating={isTranslating}
        />

        {/* Main Editor Wrapper with side-by-side post menu, outline, editor & AI planning */}
        <div className="flex-1 flex relative w-full overflow-hidden">
          {/* Post list panel (left bar) */}
          <PostListPanel
            isOpen={postListOpen}
            onClose={handleClosePostList}
            activePostId={postId}
            onSelectPost={handleSelectPost}
          />

          {/* Sticky Left Outline Navigation ("Xem nhanh") — only renders aside when headings exist */}
          {mode === "visual" && (
            <StickyOutlineNav
              asAside
              html={getHTML()}
              outlinePlan={aiPlanner.outline?.outline}
              className={postListOpen ? "hidden 2xl:block" : "hidden xl:block"}
            />
          )}

          {/* Main editor area */}
          <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-10 overflow-y-auto custom-scrollbar">
            {/* Quick access shelf to author's previous posts & drafts */}
            <RecentPostsSection
              activePostId={postId}
              onSelectPost={handleSelectPost}
              onOpenSidebar={() => setPostListOpen(true)}
            />

            {/* Translation Creation Notice Banner (Sprint 3 & 4) */}
            {isNewTranslationDraft && (
              <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-[fade-in_0.2s_ease-out]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                    <Languages className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base text-amber-100 flex items-center gap-2">
                      {t("editor.banner.new_translation_draft", { locale: editorLocale === "vi" ? (language === "vi" ? "Tiếng Việt (VI)" : "Vietnamese (VI)") : (language === "vi" ? "Tiếng Anh (EN)" : "English (EN)") })}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-medium">{t("editor.banner.uncreated")}</span>
                    </div>
                    <p className="text-xs text-amber-300/80 mt-1">
                      {t("editor.banner.uncreated_desc", { source: editorLocale === "vi" ? (language === "vi" ? "Tiếng Anh" : "English") : (language === "vi" ? "Tiếng Việt" : "Vietnamese") })}
                    </p>
                  </div>
                </div>

                {postId && localesStatus[editorLocale === "vi" ? "en" : "vi"]?.exists && (
                  <button
                    type="button"
                    onClick={handleTranslateFromSource}
                    disabled={isTranslating}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-semibold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                        <span>{t("editor.banner.translating")}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                        <span>{t("editor.banner.translate_with_ai", { source: editorLocale === "vi" ? "EN" : "VI" })}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Title */}
            <EditorTitle
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled"
            />

            {/* Spacer */}
            <div className="h-8" />

            {/* Editor content area */}
            <EditorErrorBoundary>
              {mode === "html" ? (
                /* HTML mode */
                <div className="animate-[fade-in_0.15s_ease-out]">
                  <HtmlEditor
                    editor={editor}
                    setRawHtml={setRawHtml}
                    rawHtml={rawHtml}
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={applyHtml}
                      className="px-4 py-2 text-sm font-medium bg-[var(--color-editor-accent)] text-white rounded-lg hover:bg-[var(--color-editor-accent-hover)] transition-all duration-150 cursor-pointer"
                    >
                      Apply HTML
                    </button>
                  </div>
                </div>
              ) : mode === "preview" ? (
                /* Dynamic Viewport and Theme Preview System */
                <LivePreviewSystem html={getHTML()} title={title} />
              ) : (
                /* Visual editor */
                <div className="animate-[fade-in_0.15s_ease-out] relative">
                  {/* Toolbar */}
                  {editor && <Toolbar editor={editor} />}

                  {/* Editor canvas */}
                  <EditorCanvas editor={editor} />

                  {/* Contextual AI Assist Bubble Menu */}
                  {editor && (
                    <BubbleMenu
                      editor={editor}
                      options={{
                        placement: "top-start",
                      }}
                      shouldShow={({ editor }) => {
                        // Show menu if editor is active, and either a selection exists or cursor is placed
                        return editor.isFocused && mode === "visual";
                      }}
                    >
                      <div className="bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-xl shadow-xl p-2.5 flex flex-col gap-2 max-w-xs text-xs z-50">
                        {/* 1. Closed Entry View */}
                        {bubbleView === "icon" && (
                          <button
                            type="button"
                            onClick={() => setBubbleView("menu")}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
                          >
                            <Sparkles size={12} className="text-amber-300 animate-pulse" />
                            <span>AI Assist</span>
                          </button>
                        )}

                        {/* 2. Selection Menu list */}
                        {bubbleView === "menu" && (
                          <div className="flex flex-col gap-1 w-48 text-[var(--color-editor-text)] animate-[fade-in_0.1s_ease-out]">
                            <div className="flex items-center justify-between border-b border-[var(--color-editor-border)] pb-1.5 mb-1 text-[10px] uppercase font-bold text-[var(--color-editor-secondary)]">
                              <span>✨ AI Copilot</span>
                              <button
                                type="button"
                                onClick={() => setBubbleView("icon")}
                                className="hover:text-[var(--color-editor-text)] cursor-pointer text-[var(--color-editor-secondary)]"
                              >
                                <X size={10} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={handleContinueWriting}
                              className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-[var(--color-editor-elevated)] transition-colors cursor-pointer"
                            >
                              <Sparkles size={12} className="text-violet-500" />
                              <span>Continue Writing</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setImprovePrompt("");
                                setBubbleView("input-improve");
                              }}
                              className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-[var(--color-editor-elevated)] transition-colors cursor-pointer"
                            >
                              <Wand2 size={12} className="text-indigo-500" />
                              <span>Improve Text</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setExamplePrompt("");
                                setBubbleView("input-example");
                              }}
                              className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-[var(--color-editor-elevated)] transition-colors cursor-pointer"
                            >
                              <BookOpen size={12} className="text-emerald-500" />
                              <span>Generate Example</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleReviewArticle}
                              className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-[var(--color-editor-elevated)] transition-colors cursor-pointer"
                            >
                              <FileText size={12} className="text-amber-500" />
                              <span>Review Article</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleOpenAiImageModal}
                              className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-[var(--color-editor-elevated)] transition-colors cursor-pointer group"
                              title="AI Visual Assistant: Generate AI visuals or find images on internet"
                            >
                              <Sparkles size={12} className="text-violet-500 group-hover:scale-110 transition-transform" />
                              <span className="font-medium text-violet-600 dark:text-violet-400">AI Visual Assistant</span>
                            </button>
                          </div>
                        )}

                        {/* 3. Loading animation indicator */}
                        {bubbleView === "loading" && (
                          <div className="flex items-center gap-2.5 px-3 py-2 w-48 text-[var(--color-editor-secondary)]">
                            <Loader2 size={14} className="animate-spin text-[var(--color-editor-accent)] shrink-0" />
                            <span className="text-[11px] truncate font-medium animate-pulse">{loadingText}</span>
                          </div>
                        )}

                        {/* 4. Text Improvement Input parameters */}
                        {bubbleView === "input-improve" && (
                          <div className="flex flex-col gap-2 w-56 text-[var(--color-editor-text)] animate-[fade-in_0.1s_ease-out]">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-[var(--color-editor-secondary)]">🪄 Improve Selection</span>
                              <button
                                type="button"
                                onClick={() => setBubbleView("menu")}
                                className="text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] cursor-pointer"
                              >
                                <X size={10} />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={improvePrompt}
                              onChange={(e) => setImprovePrompt(e.target.value)}
                              placeholder="e.g. make it simple, professional..."
                              className="px-2.5 py-1.5 text-xs rounded border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] outline-none focus:border-[var(--color-editor-accent)] w-full text-[var(--color-editor-text)]"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleImproveText();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleImproveText}
                              className="py-1 px-3 bg-[var(--color-editor-accent)] hover:opacity-90 text-white rounded font-bold text-[10px] tracking-wide self-end cursor-pointer"
                            >
                              Rewrite
                            </button>
                          </div>
                        )}

                        {/* 5. Rewrite previews */}
                        {bubbleView === "preview-improve" && improvedResult && (
                          <div className="flex flex-col gap-2 w-64 text-[var(--color-editor-text)] animate-[fade-in_0.15s_ease-out]">
                            <div className="flex items-center justify-between border-b border-[var(--color-editor-border)] pb-1">
                              <span className="text-[10px] uppercase font-bold text-[var(--color-editor-secondary)] flex items-center gap-1">
                                🪄 Preview (readability: {improvedResult.readabilityDelta > 0 ? `+${improvedResult.readabilityDelta}` : improvedResult.readabilityDelta})
                              </span>
                              <button
                                type="button"
                                onClick={() => setBubbleView("menu")}
                                className="text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] cursor-pointer"
                              >
                                <X size={10} />
                              </button>
                            </div>
                            <p className="text-[10px] font-mono leading-relaxed bg-[var(--color-editor-elevated)] p-2 rounded max-h-28 overflow-y-auto whitespace-pre-wrap border border-[var(--color-editor-border)] text-[var(--color-editor-text)]">
                              {improvedResult.improvedText}
                            </p>
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setBubbleView("menu")}
                                className="px-2.5 py-1 border border-[var(--color-editor-border)] hover:bg-[var(--color-editor-elevated)] rounded text-[9px] font-bold cursor-pointer text-[var(--color-editor-text)]"
                              >
                                Discard
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (editor) {
                                    // replace selection
                                    editor.chain().focus().insertContent(improvedResult.improvedText).run();
                                    toast.success("Selection replaced!");
                                  }
                                  setBubbleView("icon");
                                }}
                                className="px-2.5 py-1 bg-[var(--color-editor-accent)] hover:opacity-90 text-white rounded text-[9px] font-bold cursor-pointer"
                              >
                                Replace
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 6. Example generator prompts */}
                        {bubbleView === "input-example" && (
                          <div className="flex flex-col gap-2 w-56 text-[var(--color-editor-text)] animate-[fade-in_0.1s_ease-out]">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-[var(--color-editor-secondary)]">📝 Generate Example</span>
                              <button
                                type="button"
                                onClick={() => setBubbleView("menu")}
                                className="text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] cursor-pointer"
                              >
                                <X size={10} />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={examplePrompt}
                              onChange={(e) => setExamplePrompt(e.target.value)}
                              placeholder="e.g. Dockerfile, typescript type..."
                              className="px-2.5 py-1.5 text-xs rounded border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] outline-none focus:border-[var(--color-editor-accent)] w-full text-[var(--color-editor-text)]"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleGenerateExample();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleGenerateExample}
                              className="py-1 px-3 bg-[var(--color-editor-accent)] hover:opacity-90 text-white rounded font-bold text-[10px] tracking-wide self-end cursor-pointer"
                            >
                              Create
                            </button>
                          </div>
                        )}

                        {/* 7. Peer review card */}
                        {bubbleView === "review-report" && reviewResult && (
                          <div className="flex flex-col gap-2 w-64 text-[var(--color-editor-text)] animate-[fade-in_0.15s_ease-out]">
                            <div className="flex items-center justify-between border-b border-[var(--color-editor-border)] pb-1.5">
                              <span className="text-[10px] uppercase font-bold text-[var(--color-editor-secondary)] flex items-center gap-1">
                                🔍 Peer Review Report
                              </span>
                              <button
                                type="button"
                                onClick={() => setBubbleView("icon")}
                                className="text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] cursor-pointer"
                              >
                                <X size={10} />
                              </button>
                            </div>
                            <div className="space-y-1.5 max-h-44 overflow-y-auto text-[10px] text-[var(--color-editor-text)]">
                              <div className="grid grid-cols-2 gap-1.5 border-b border-[var(--color-editor-border)] pb-1.5 mb-1.5">
                                <div>
                                  <span className="text-[9px] text-[var(--color-editor-secondary)] block">Grammar</span>
                                  <span className="font-bold text-violet-500">{reviewResult.grammarScore}/100</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-[var(--color-editor-secondary)] block">Readability</span>
                                  <span className="font-bold text-indigo-500">{reviewResult.readabilityScore}/100</span>
                                </div>
                              </div>
                              <div className="space-y-1 border-b border-[var(--color-editor-border)] pb-1.5 mb-1.5 text-[9px] text-[var(--color-editor-secondary)]">
                                <div className="flex justify-between">
                                  <span>Missing Examples:</span>
                                  <span className="font-bold">{reviewResult.missingExamples ? "⚠️ Yes" : "✅ No"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Missing Images:</span>
                                  <span className="font-bold">{reviewResult.missingImages ? "⚠️ Yes" : "✅ No"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Missing Conclusion:</span>
                                  <span className="font-bold">{reviewResult.missingConclusion ? "⚠️ Yes" : "✅ No"}</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <span className="block font-bold text-[9px] uppercase tracking-wider text-[var(--color-editor-secondary)]">Refinements Suggestions</span>
                                {reviewResult.suggestions && reviewResult.suggestions.length > 0 ? (
                                  reviewResult.suggestions.slice(0, 3).map((s: any, idx: number) => (
                                    <div key={idx} className="bg-[var(--color-editor-elevated)] p-1.5 rounded border border-[var(--color-editor-border)] flex items-start gap-1">
                                      <AlertCircle size={10} className="text-amber-500 shrink-0 mt-0.5" />
                                      <div>
                                        <span className="font-bold block text-[9px] text-[var(--color-editor-secondary)]">[{s.severity.toUpperCase()}] {s.section}</span>
                                        <p className="leading-relaxed mt-0.5">{s.message}</p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-emerald-500 italic">Excellent draft! No revisions suggested.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </BubbleMenu>
                  )}

                   {/* Floating Block insert button */}
                  <div
                    className={`fixed bottom-8 ${
                      activeSidePanel ? "right-[21.5rem]" : "right-8"
                    } z-30 transition-all duration-200 animate-[slide-up_0.3s_ease-out]`}
                  >
                    <BlockInsertButton onInsert={insertElementAtPosition} />
                  </div>

                  {/* Block Action Menu — hover overlay */}
                  {blockActions.hoveredBlockRect && (
                    <BlockActionMenu
                      blockRect={blockActions.hoveredBlockRect}
                      isAIWorking={blockActions.isAIWorking}
                      aiActionLabel={blockActions.aiActionLabel}
                      onMoveUp={blockActions.moveHoveredUp}
                      onMoveDown={blockActions.moveHoveredDown}
                      onDuplicate={blockActions.duplicateHovered}
                      onDelete={blockActions.deleteHovered}
                      onRewrite={blockActions.rewriteBlock}
                      onShorten={blockActions.shortenBlock}
                      onExpand={blockActions.expandBlock}
                    />
                  )}
                </div>
              )}
            </EditorErrorBoundary>

            {/* Writer metrics */}
            <WriterMetricsBar
              wordCount={metrics.wordCount}
              charCount={metrics.characterCount}
              readingTime={metrics.readingTime}
            />
          </main>

          {/* AI Article Planner side drawer (right) */}
          {aiPlannerOpen && (
            <aside className="w-80 border-l border-[var(--color-editor-border)] bg-[var(--color-editor-bg)] h-full overflow-y-auto p-5 shrink-0 animate-[slide-left_0.2s_ease-out] z-30">
              <AIPlannerView
                plan={aiPlanner.plan}
                writeStream={aiPlanner.writeStream}
                cancelWriting={aiPlanner.cancelWriting}
                isRunning={aiPlanner.isRunning}
                isWriting={aiPlanner.isWriting}
                outline={aiPlanner.outline}
                error={aiPlanner.error}
                clear={aiPlanner.clear}
                onApplyTitle={(t) => handleTitleChange(t)}
                onStartWriting={handleStartWriting}
                initialTopic={title}
                language={editorLocale}
              />
            </aside>
          )}

          {/* AI Image Generator side drawer (right) */}
          {aiImageGenOpen && (
            <aside className="w-80 border-l border-[var(--color-editor-border)] bg-[var(--color-editor-bg)] h-full overflow-y-auto p-5 shrink-0 animate-[slide-left_0.2s_ease-out] z-30">
              <AIImageGeneratorView onInsertImage={handleImageGenerated} />
            </aside>
          )}

          {/* AI Image Editor side drawer (right) */}
          {aiImageEditOpen && (
            <aside className="w-80 border-l border-[var(--color-editor-border)] bg-[var(--color-editor-bg)] h-full overflow-y-auto p-5 shrink-0 animate-[slide-left_0.2s_ease-out] z-30">
              <AIImageEditorView
                sourceAsset={sourceAssetToEdit}
                onSelectSourceTrigger={() => {
                  setSelectingSourceForEdit(true);
                  setShowImageUpload(true);
                }}
                onInsertEditedImage={handleImageEdited}
                onCancel={() => {
                  setSourceAssetToEdit(null);
                  setSelectingSourceForEdit(false);
                }}
              />
            </aside>
          )}

          {/* AI Diagram Generator side drawer (right) */}
          {aiDiagramOpen && (
            <aside className="w-80 border-l border-[var(--color-editor-border)] bg-[var(--color-editor-bg)] h-full overflow-y-auto p-5 shrink-0 animate-[slide-left_0.2s_ease-out] z-30">
              <AIDiagramView
                editorContent={editor ? editor.getText() : ""}
                onInsertDiagram={handleInsertDiagram}
              />
            </aside>
          )}

          {/* SEO Score side panel (right) */}
          {seoOpen && (
            <aside className="w-80 border-l border-[var(--color-editor-border)] bg-[var(--color-editor-bg)] h-full shrink-0 animate-[slide-left_0.2s_ease-out] z-30">
              <SEOScoreSidebar
                metrics={metrics}
                title={title}
                description={descriptionPublic}
              />
            </aside>
          )}

          {/* AI Visual Assistant Asset Picker side drawer (right) */}
          {assetPickerOpen && (
            <aside className="w-88 border-l border-[var(--color-editor-border)] bg-[var(--color-editor-bg)] h-full overflow-hidden shrink-0 animate-[slide-left_0.2s_ease-out] z-30">
              <AssetPickerDrawer
                context={assetPickerContext}
                onClose={() => {
                  setActiveSidePanel(null);
                  setAssetPickerContext(null);
                }}
                onSelectAsset={handleSelectAssetForPlaceholder}
              />
            </aside>
          )}
        </div>

        {/* Publish drawer */}
        <PublishDrawer
          isOpen={publishDrawerOpen}
          onClose={() => setPublishDrawerOpen(false)}
          onPublish={onPublishHandle}
          onUnpublish={handleUnpublish}
          activeLocale={editorLocale}
          isPublished={publishHook.isPublished}
          categories={categories}
          selectedCategory={categoryPublic}
          onCategoryChange={setCategoryPublic}
          seriesList={seriesList}
          selectedSeries={seriesPublic}
          onSeriesChange={setSeriesPublic}
          onCreateSeries={createNewSeriesHandler}
          description={descriptionPublic}
          onDescriptionChange={setDescriptionPublic}
          onCoverImageUploaded={handleImageUploadedPublic}
          isPublishing={publishHook.isPublishing}
          initialTopic={title}
          onAutoFillAI={async (result) => {
            if (result.title) handleTitleChange(result.title);
            if (result.markdown && editor) {
              const html = toEditorHtml(result.markdown, result.visualSuggestions || result.imageSuggestions);
              editor.commands.setContent(html);
              setGeneratedMarkdown(result.markdown);
            }
            if (result.description) setDescriptionPublic(result.description);
            autoSave.markDirty();
            await autoSave.save();
            toast.success("AI Publisher generated content and auto-saved Draft!");
          }}
        />

        {/* Media Library modal — replaces old ImageUpload */}
        <MediaLibraryModal
          isOpen={showImageUpload}
          onClose={() => {
            setShowImageUpload(false);
            setImageInsertPosition(null);
          }}
          onSelect={handleMediaSelected}
          allowDrag={true}
          typeFilter="image"
          editorContent={editor ? editor.getText() : ""}
        />

        {/* AI Image Enhancement Review Modal */}
        <ImageEnhancementReviewModal
          isOpen={enhancementReview.reviewModalOpen}
          onClose={() => enhancementReview.setReviewModalOpen(false)}
          resolvedImages={enhancementReview.resolvedImages}
          onConfirm={enhancementReview.applyApprovedImages}
          isLoading={enhancementReview.isEnhancing}
        />

        {/* 1-Click AI Publisher Modal */}
        <AIGenerationModal
          isOpen={is1ClickAIModalOpen}
          onClose={() => setIs1ClickAIModalOpen(false)}
          initialTopic={title}
          initialCategory={categoryPublic || "general"}
          onApplyGeneratedContent={handleApply1ClickAIPipeline}
          onAutosaveDraft={async (data) => {
            if (data.planner?.title) {
              setTitle(data.planner.title);
            }
            if (data.aiContext) {
              setGeneratedAiContext((prev) => ({
                ...prev,
                ...(data.aiContext || {}),
              }));
            }
            if (data.enhancedMarkdown || data.writerMarkdown) {
              setGeneratedMarkdown(data.enhancedMarkdown || data.writerMarkdown || "");
            }
            autoSave.markDirty();
            await autoSave.save();
          }}
        />

        {/* One Click Autonomous Publisher Modal */}
        <OneClickPublisherModal
          isOpen={is1ClickAIModalOpen}
          onClose={() => setIs1ClickAIModalOpen(false)}
          initialTopic={title}
        />

        {/* Batch Visuals Pipeline Modal (Sprint 3) */}
        <BatchVisualsModal
          isOpen={isBatchVisualsModalOpen}
          onClose={() => setIsBatchVisualsModalOpen(false)}
          markdown={getCurrentArticleMarkdown()}
          postId={postId || undefined}
          editor={editor}
          onOpenAiFallback={(fallbackCtx) => {
            setAiImageContext({
              prompt: `${fallbackCtx.heading} technical illustration`,
              heading: fallbackCtx.heading,
              sourceContext: fallbackCtx.heading,
              visualIntent: (fallbackCtx.visualType as any) || "diagram",
              recommendedPreset: "technical_diagram",
              recommendedRatio: "16:9",
              confidence: 0.85,
              recommendationReason: `Fallback AI generation for section "${fallbackCtx.heading}"`,
              contextType: "selection",
            });
            setIsBatchVisualsModalOpen(false);
            setIsAiImageModalOpen(true);
          }}
          onApplyResult={(updatedMarkdown) => {
            if (!editor || !updatedMarkdown) return;
            const html = toEditorHtml(updatedMarkdown);
            editor.commands.setContent(html);
            setGeneratedMarkdown(updatedMarkdown);
            autoSave.markDirty();
          }}
        />

        {/* AI Assist Image Generation Modal (Sprint 1, 2 & 3) */}
        <AIImageModal
          isOpen={isAiImageModalOpen}
          onClose={() => setIsAiImageModalOpen(false)}
          initialPrompt={aiImageContext.prompt}
          heading={aiImageContext.heading}
          sourceContext={aiImageContext.sourceContext}
          visualSuggestion={aiImageContext.visualSuggestion}
          initialIntent={aiImageContext.visualIntent}
          initialConfidence={aiImageContext.confidence}
          recommendationReason={aiImageContext.recommendationReason}
          initialStyle={aiImageContext.recommendedPreset}
          initialAspectRatio={aiImageContext.recommendedRatio}
          contextType={aiImageContext.contextType}
          articleTitle={title}
          postId={postId || undefined}
          onInsert={handleInsertAIImage}
        />
      </div>
    </EditorProvider>
  );
}
