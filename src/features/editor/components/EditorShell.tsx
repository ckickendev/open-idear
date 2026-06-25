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
import { useEditorShortcuts } from "../hooks/useEditorShortcuts";
import { useContentMetrics } from "@/features/seo/hooks/useContentMetrics";

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
import EditorCanvas from "./EditorCanvas";

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
import { Clock } from "lucide-react";

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

  // AI state
  const [isGenerating, setIsGenerating] = useState(false);

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

  // ─── Auto-Save Hook ──────────────────────────────────────────────────

  const autoSave = useAutoSave({
    postId,
    getContent: () => ({
      title,
      html: getHTML(),
      text: getText().replace(/\n/g, ""),
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

  // ─── Content Metrics ─────────────────────────────────────────────────

  const { metrics } = useContentMetrics(editor);

  // ─── Keyboard Shortcuts ──────────────────────────────────────────────

  useEditorShortcuts({
    editor,
    onSave: () => autoSave.save(),
    onPublish: () => setPublishDrawerOpen(true),
    onTogglePreview: () =>
      setMode((prev) => (prev === "preview" ? "visual" : "preview")),
  });

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
          setContent("");
          setPageLoading(false);
          return;
        }

        const resPost = await postApi.getPostToEdit(currentPostId);
        if (resPost.success) {
          setTitle(resPost.data.post.title);
          setContent(resPost.data.post.content);
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
    }
  };

  // ─── Image Upload Handlers ───────────────────────────────────────────

  const handleImageUploaded = (image: MediaAsset) => {
    if (editor && imageInsertPosition !== null) {
      editor
        .chain()
        .focus()
        .insertContentAt(imageInsertPosition, {
          type: "image",
          attrs: { src: image.url, alt: image.description || "" },
        })
        .run();
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

  // ─── Title Change ────────────────────────────────────────────────────

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (postId) {
      autoSave.markDirty();
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
      <div className="min-h-screen bg-editor-bg flex flex-col">
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
          onPublish={() => setPublishDrawerOpen(true)}
          onTogglePostList={() => setPostListOpen(!postListOpen)}
          saveStatus={autoSave.status === "conflict" ? "error" : autoSave.status}
          onRetrySave={() => autoSave.retry()}
          hasTitle={!!title.trim()}
          onAIGenerate={handleAutoGenerate}
          isGenerating={isGenerating}
        />

        {/* Post list panel (left drawer) */}
        <PostListPanel
          isOpen={postListOpen}
          onClose={() => setPostListOpen(false)}
        />

        {/* Main editor area */}
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-[slide-up_0.3s_ease-out]">
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
              /* Preview mode — uses read-only EditorContent instead of dangerouslySetInnerHTML */
              <div className="preview-pane animate-[fade-in_0.15s_ease-out]">
                <h1 className="text-[2.5rem] leading-[1.2] font-bold tracking-[-0.02em] text-[var(--color-editor-text)] mb-8">
                  {title || "Untitled Post"}
                </h1>
                {editor && (
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: getHTML() }}
                  />
                )}
              </div>
            ) : (
              /* Visual editor */
              <div className="animate-[fade-in_0.15s_ease-out]">
                {/* Toolbar */}
                {editor && <Toolbar editor={editor} />}

                {/* Editor canvas */}
                <EditorCanvas editor={editor} />

                {/* Floating Block insert button */}
                <div className="fixed bottom-8 right-8 z-40 animate-[slide-up_0.3s_ease-out]">
                  <BlockInsertButton onInsert={insertElementAtPosition} />
                </div>
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
        />

        {/* Image upload modal */}
        {showImageUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/30 backdrop-blur-sm animate-[fade-in_0.15s_ease-out]">
            <div className="bg-[var(--color-editor-surface)] rounded-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-[var(--color-editor-border)] shadow-2xl">
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                onClose={() => {
                  setShowImageUpload(false);
                  setImageInsertPosition(null);
                }}
                isTitleDisplay={true}
              />
            </div>
          </div>
        )}
      </div>
    </EditorProvider>
  );
}
