"use client";

import React, { useState, useCallback, useEffect } from "react";
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
import { useAIPlanner, AIPlannerView, AIImageGeneratorView, AIImageEditorView, AIDiagramView, ImageEnhancementReviewModal, useImageEnhancementReview, AIGenerationModal, PublishByAIModal, OneClickPublisherModal, type PipelineData, type PublisherResponse, aiApi } from "@/features/ai";
import { toEditorHtml } from "@/features/ai/utils/contentTransformer";
import { LivePreviewSystem } from "@/features/preview";

// ─── Context ────────────────────────────────────────────────────────────────
import { EditorProvider } from "../context/EditorContext";
import { EditorErrorBoundary } from "./EditorErrorBoundary";

// ─── Child Components (existing, from create/) ─────────────────────────────
import Toolbar from "@/app/(editor)/create/ToolBar";
import HtmlEditor from "@/app/(editor)/create/HtmlEditor";
import BlockInsertButton from "@/app/(editor)/create/FloatingToolbar";
import PostListPanel from "@/app/(editor)/create/PostLists";
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

// ═══════════════════════════════════════════════════════════════════════════
// EditorShell — Main editor orchestrator
// ═══════════════════════════════════════════════════════════════════════════

export default function EditorShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // ─── Local UI State ───────────────────────────────────────────────────
  const [postId, setPostId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<EditorMode>("visual");
  const [rawHtml, setRawHtml] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  // Panel states
  const [postListOpen, setPostListOpen] = useState(false);
  const [publishDrawerOpen, setPublishDrawerOpen] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageInsertPosition, setImageInsertPosition] = useState<number | null>(
    null,
  );

  // Publish form state
  const [categories, setCategories] = useState<Category[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [descriptionPublic, setDescriptionPublic] = useState("");
  const [seriesPublic, setSeriesPublic] = useState("");
  const [categoryPublic, setCategoryPublic] = useState("");
  const [imagePublic, setImagePublic] = useState<string | null>(null);

  // ─── Unified right-panel state ────────────────────────────────────────
  // Replaces 4 separate booleans with a discriminated union.
  // Only one panel can be open at a time (exclusive drawer pattern).
  type RightPanel = "planner" | "image-gen" | "image-edit" | "diagram" | "seo" | null;
  const [activeSidePanel, setActiveSidePanel] = useState<RightPanel>(null);

  // Derived boolean helpers for backwards-compatible prop passing
  const aiPlannerOpen = activeSidePanel === "planner";
  const aiImageGenOpen = activeSidePanel === "image-gen";
  const aiImageEditOpen = activeSidePanel === "image-edit";
  const aiDiagramOpen = activeSidePanel === "diagram";
  const seoOpen = activeSidePanel === "seo";

  function togglePanel(panel: RightPanel) {
    setActiveSidePanel((prev) => (prev === panel ? null : panel));
  }

  // 1-Click AI Publisher Modal state
  const [is1ClickAIModalOpen, setIs1ClickAIModalOpen] = useState(false);

  // Publish by AI Modal state
  const [isPublishByAIOpen, setIsPublishByAIOpen] = useState(false);

  const handleApplyPublishByAI = async (data: PublisherResponse) => {
    // 1. Populate title
    if (data.title) {
      handleTitleChange(data.title);
    }

    // 2. Populate editor content from markdown
    if (data.markdown && editor) {
      const html = toEditorHtml(data.markdown);
      editor.commands.setContent(html);
      setGeneratedMarkdown(data.markdown);
    }

    // 3. Persist AI context (keywords, category, etc.)
    setGeneratedAiContext({
      plannerOutput: {
        title: data.title,
        keywords: data.keywords,
        category: data.category,
      },
      generation: {
        model: "PublishByAI-v1",
        generatedAt: new Date().toISOString(),
      },
    });

    // 4. Pre-fill publish panel fields from generated data
    if (data.category) setCategoryPublic(data.category);
    if (data.description) setDescriptionPublic(data.description);

    // 5. Mark dirty and auto-save as Draft
    autoSave.markDirty();
    await autoSave.save();

    toast.success("Draft created by AI and saved!");
  };

  const handleApply1ClickAIPipeline = (data: PipelineData) => {
    const generatedTitle = data.planner?.title || title;
    if (generatedTitle) {
      handleTitleChange(generatedTitle);
    }

    const markdown = data.enhancedMarkdown || data.writerMarkdown || "";
    if (markdown && editor) {
      const html = toEditorHtml(markdown);
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

  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>("");
  const [generatedAiContext, setGeneratedAiContext] = useState<Record<string, unknown> | null>(null);

  // ─── Auto-Save Hook ──────────────────────────────────────────────────

  const autoSave = useAutoSave({
    postId,
    getContent: () => ({
      title,
      html: getHTML(),
      text: getText().replace(/\n/g, ""),
      ...(generatedMarkdown ? {
        markdown: generatedMarkdown,
        aiContext: generatedAiContext || undefined,
        contentVersion: "blocks-v1" as const,
      } : {}),
    }),
    enabled: !!postId,
  });

  // ─── Publish Hook ────────────────────────────────────────────────────

  const publishHook = usePublishPost({
    postId,
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
  });

  // ─── Track fetched post for editor sync ──────────────────────────────
  const [loadedPost, setLoadedPost] = useState<any>(null);

  // Sync post content into TipTap editor whenever editor becomes ready or loadedPost updates
  useEffect(() => {
    if (editor && loadedPost?.content !== undefined) {
      editor.commands.setContent(loadedPost.content || "");
    }
  }, [editor, isReady, loadedPost]);

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

        // Fetch categories + series in parallel
        const [resCategory, resSeries] = await Promise.all([
          categoryApi.getCategories(),
          seriesApi.getSeriesByUser(),
        ]);

        if (resCategory.success) setCategories(resCategory.data.categories);
        if (resSeries.success) setSeriesList(resSeries.data.series);

        setPostId(currentPostId);
        if (!currentPostId) {
          setTitle("");
          setLoadedPost(null);
          if (editor) setContent("");
          setPageLoading(false);
          return;
        }

        const resPost = await postApi.getPostToEdit(currentPostId);
        if (resPost.success && resPost.data?.post) {
          const post = resPost.data.post;
          setTitle(post.title || "");
          setDescriptionPublic(post.description || "");
          setCategoryPublic(
            typeof post.category === "object" ? post.category?._id || "" : post.category || ""
          );
          setSeriesPublic(
            typeof post.series === "object" ? post.series?._id || "" : post.series || ""
          );
          setImagePublic(
            typeof post.image === "object" ? post.image?.url || null : post.image || null
          );
          setLoadedPost(post);
          if (editor) {
            editor.commands.setContent(post.content || "");
          }
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

    if (postId && media._id) {
      mediaLibraryApi.addUsage(media._id, "post", postId, "content");
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

    if (postId && media._id) {
      mediaLibraryApi.addUsage(media._id, "post", postId, "content");
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
        context: {
          surroundingContext: textBefore,
          articleTitle: title,
          audience: categoryPublic || "Developers",
          tone: "informative",
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
        context: {
          selectedText: selected,
          instruction: improvePrompt,
          audience: categoryPublic || "Developers",
          tone: "professional",
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
        context: {
          selectedText: selected || "",
          additionalInstructions: examplePrompt,
          language: "typescript",
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
        context: {
          currentArticle: editor.getText(),
          articleTitle: title || "Untitled",
          audience: categoryPublic || "Developers",
          tone: "professional",
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
      if (postId && media._id) {
        mediaLibraryApi.addUsage(media._id, "post", postId, "content");
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
      description: descriptionPublic,
      image: imagePublic,
      series: seriesPublic,
      category: categoryPublic,
    });

    if (success) {
      setPublishDrawerOpen(false);
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
        router.push("/create");
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
        language: "en",
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
      <div className="min-h-screen bg-editor-bg flex flex-col h-screen overflow-hidden">
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
          onTogglePostList={() => setPostListOpen(!postListOpen)}
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
          onOpenPublishByAI={() => setIsPublishByAIOpen(true)}
        />

        {/* Post list panel (left drawer) */}
        <PostListPanel
          isOpen={postListOpen}
          onClose={() => setPostListOpen(false)}
          activePostId={postId}
          onSelectPost={handleSelectPost}
        />

        {/* Main Editor Wrapper with side-by-side AI planning & sticky outline */}
        <div className="flex-1 flex relative w-full overflow-hidden">
          {/* Sticky Left Outline Navigation ("Xem nhanh") */}
          {mode === "visual" && (
            <aside className="hidden xl:block w-72 shrink-0 p-6 pr-2 sticky top-4 self-start">
              <StickyOutlineNav
                html={getHTML()}
                outlinePlan={aiPlanner.outline?.outline}
              />
            </aside>
          )}

          {/* Main editor area */}
          <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 overflow-y-auto">
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
                  <div className="fixed bottom-8 right-8 z-40 animate-[slide-up_0.3s_ease-out]">
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
        </div>

        {/* Publish drawer */}
        <PublishDrawer
          isOpen={publishDrawerOpen}
          onClose={() => setPublishDrawerOpen(false)}
          onPublish={onPublishHandle}
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
              const html = toEditorHtml(result.markdown);
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

        {/* Publish by AI Modal */}
        <PublishByAIModal
          isOpen={isPublishByAIOpen}
          onClose={() => setIsPublishByAIOpen(false)}
          initialTopic={title}
          onApply={handleApplyPublishByAI}
        />

        {/* One Click Autonomous Publisher Modal */}
        <OneClickPublisherModal
          isOpen={is1ClickAIModalOpen}
          onClose={() => setIs1ClickAIModalOpen(false)}
          initialTopic={title}
        />
      </div>
    </EditorProvider>
  );
}
