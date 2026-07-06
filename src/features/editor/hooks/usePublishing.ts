import { useState, useCallback } from "react";
import { publishingApi, type PublishTaskResult } from "../api/publishing.api";

interface UsePublishingOptions {
  readonly postId: string;
  readonly onPublishSuccess?: () => void;
}

export function usePublishing({ postId, onPublishSuccess }: UsePublishingOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [taskResults, setTaskResults] = useState<Record<string, PublishTaskResult>>({});

  const runPreflight = useCallback(async () => {
    if (!postId) return;
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const tasks = ["metadata", "review", "seo", "category"];
    const results: Record<string, PublishTaskResult> = {};

    try {
      // Execute all preflight checks concurrently to minimize response latency
      const promises = tasks.map(async (task) => {
        const response = await publishingApi.runTask({
          task,
          articleId: postId,
        });

        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || `Preflight check "${task}" failed.`);
        }
      });

      const taskResultsList = await Promise.all(promises);
      
      const results: Record<string, PublishTaskResult> = {};
      for (const result of taskResultsList) {
        results[result.taskId] = result;
      }

      setTaskResults(results);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred during preflight checks.");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  const publish = useCallback(
    async (updates: Record<string, any>) => {
      if (!postId) return false;
      setIsPublishing(true);
      setError(null);

      try {
        const response = await publishingApi.publishPost(postId, updates);
        if (response.success) {
          onPublishSuccess?.();
          return true;
        } else {
          setError(response.message || "Failed to publish article.");
          return false;
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while publishing the article.");
        return false;
      } finally {
        setIsPublishing(false);
      }
    },
    [postId, onPublishSuccess]
  );

  // Compute overall score (based on review score, defaults to 0 if unchecked)
  const score = taskResults.review?.outputData?.score || 0;

  // Check if there are any blocker errors
  const hasErrors = Object.values(taskResults).some(
    (res) => !res.success && res.severity === "error"
  );

  return {
    runPreflight,
    publish,
    isLoading,
    isPublishing,
    error,
    success,
    taskResults,
    score,
    isReady: success && !hasErrors,
  };
}
