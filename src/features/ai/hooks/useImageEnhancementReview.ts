import { useState, useCallback, useRef } from "react";
import { Editor } from "@tiptap/react";
import { aiApi, ResolvedImage } from "../api/ai.api";
import { toEditorHtml } from "../utils/contentTransformer";

export interface UseImageEnhancementReviewOptions {
  editor: Editor | null;
  onSuccess?: (insertedCount: number) => void;
  onError?: (errMessage: string) => void;
}

export const useImageEnhancementReview = ({
  editor,
  onSuccess,
  onError,
}: UseImageEnhancementReviewOptions) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [resolvedImages, setResolvedImages] = useState<ResolvedImage[]>([]);
  const [currentMarkdown, setCurrentMarkdown] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Triggers the enhancement pipeline asynchronously without blocking the UI.
   */
  const runEnhancementPipeline = useCallback(
    async (markdown: string, postId?: string) => {
      if (!markdown || !markdown.trim()) return;

      setIsEnhancing(true);
      setProgressPercent(20);
      setCurrentMarkdown(markdown);

      abortControllerRef.current = new AbortController();

      try {
        setProgressPercent(50);
        const response = await aiApi.enhanceContent({
          markdown,
          options: { postId },
        });

        setProgressPercent(80);

        if (response.data && response.data.insertedAssets && response.data.insertedAssets.length > 0) {
          setResolvedImages(response.data.insertedAssets);
          setReviewModalOpen(true);
        } else {
          onSuccess?.(0);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("[useImageEnhancementReview] Pipeline error:", err);
          onError?.(err.message || "Enhancement pipeline failed.");
        }
      } finally {
        setIsEnhancing(false);
        setProgressPercent(100);
        abortControllerRef.current = null;
      }
    },
    [onSuccess, onError]
  );

  /**
   * Applies confirmed images into the TipTap editor, maintaining editor undo history.
   */
  const applyApprovedImages = useCallback(
    (approvedImages: ResolvedImage[]) => {
      if (!editor || approvedImages.length === 0) return;

      let enhancedMarkdown = currentMarkdown;
      approvedImages.forEach((img) => {
        if (img.markdownSnippet && !enhancedMarkdown.includes(img.url)) {
          enhancedMarkdown += `\n\n${img.markdownSnippet}`;
        }
      });

      const html = toEditorHtml(enhancedMarkdown);

      editor
        .chain()
        .focus()
        .setContent(html, { emitUpdate: false })
        .run();

      onSuccess?.(approvedImages.length);
    },
    [editor, currentMarkdown, onSuccess]
  );

  /**
   * Cancels an active enhancement pipeline request.
   */
  const cancelEnhancement = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsEnhancing(false);
      setProgressPercent(0);
    }
  }, []);

  return {
    isEnhancing,
    progressPercent,
    reviewModalOpen,
    setReviewModalOpen,
    resolvedImages,
    runEnhancementPipeline,
    applyApprovedImages,
    cancelEnhancement,
  };
};
