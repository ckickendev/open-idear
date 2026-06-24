"use client";

import { useState, useCallback } from "react";
import type {
  UsePublishPostOptions,
  UsePublishPostReturn,
  PublishConfig,
} from "../types/publish.types";
import { postApi } from "@/features/ideas/api/post.api";
import { toast } from "sonner";

/**
 * Publish workflow hook.
 *
 * Handles validation, publishing, and unpublishing.
 * Keeps the publish state separate from editor state.
 */
export function usePublishPost(
  options: UsePublishPostOptions,
): UsePublishPostReturn {
  const { postId, isPublished: initialPublished } = options;

  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // ─── Validation ───────────────────────────────────────────────────────

  const validate = useCallback((config: PublishConfig): string[] => {
    const errors: string[] = [];

    if (!config.postId) {
      errors.push("Post must be saved before publishing.");
    }
    if (!config.category) {
      errors.push("Category is required.");
    }

    return errors;
  }, []);

  // ─── Publish ──────────────────────────────────────────────────────────

  const publish = useCallback(
    async (config: PublishConfig): Promise<boolean> => {
      const errors = validate(config);
      setValidationErrors(errors);

      if (errors.length > 0) {
        toast.error(errors[0]);
        return false;
      }

      setIsPublishing(true);

      try {
        const res = await postApi.publishPost({
          publicInfo: {
            postId: config.postId,
            description: config.description,
            image: config.image,
            series: config.series,
            category: config.category,
          },
        });

        if (res.success) {
          toast.success("Post published successfully!");
          setIsPublished(true);
          return true;
        } else {
          toast.error(res.message || "Error publishing post");
          return false;
        }
      } catch {
        toast.error("Failed to publish post");
        return false;
      } finally {
        setIsPublishing(false);
      }
    },
    [validate],
  );

  // ─── Unpublish ────────────────────────────────────────────────────────

  const unpublish = useCallback(async (): Promise<boolean> => {
    if (!postId) return false;

    try {
      const res = await postApi.changePublicManager(postId, false);
      if (res.success) {
        setIsPublished(false);
        toast.success("Post unpublished");
        return true;
      }
      return false;
    } catch {
      toast.error("Failed to unpublish");
      return false;
    }
  }, [postId]);

  // ─── Computed ─────────────────────────────────────────────────────────

  const canPublish = !!postId && !isPublished;

  return {
    isPublishing,
    isPublished,
    canPublish,
    validationErrors,
    publish,
    unpublish,
  };
}
