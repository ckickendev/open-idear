// =============================================================================
//  SMART PUBLISH HOOK
//  src/features/publish/hooks/useSmartPublish.ts
//
//  Design Decisions:
//  - Manages complete lifecycle: idle → loading → success/error/partial.
//  - AbortController for cleanup on unmount or re-execution.
//  - Individual field acceptance/rejection for granular review UX.
//  - Retry support for failed executions.
//  - Partial status when some tasks succeed but others fail.
// =============================================================================

import { useState, useCallback, useRef, useEffect } from "react";
import { smartPublishApi, type SmartPublishResult } from "../services/smart-publish.service";

export type SmartPublishStatus = "idle" | "loading" | "success" | "error" | "partial";

interface AcceptedFields {
  description: boolean;
  tags: boolean;
  category: boolean;
  slug: boolean;
  readTime: boolean;
  coverImage: boolean;
}

export interface UseSmartPublishReturn {
  /** Current execution status */
  readonly status: SmartPublishStatus;
  /** Full result from the workflow (null before execution) */
  readonly result: SmartPublishResult | null;
  /** Error message if status is 'error' */
  readonly error: string | null;
  /** Which fields the user has accepted */
  readonly acceptedFields: AcceptedFields;
  /** Execute smart fill for an article */
  execute: (articleId: string) => Promise<void>;
  /** Retry the last execution */
  retry: () => Promise<void>;
  /** Accept or reject a specific field */
  toggleField: (field: keyof AcceptedFields) => void;
  /** Accept all suggested fields at once */
  acceptAll: () => void;
  /** Reset to idle state */
  reset: () => void;
}

const DEFAULT_ACCEPTED: AcceptedFields = {
  description: false,
  tags: false,
  category: false,
  slug: false,
  readTime: false,
  coverImage: false,
};

export function useSmartPublish(): UseSmartPublishReturn {
  const [status, setStatus] = useState<SmartPublishStatus>("idle");
  const [result, setResult] = useState<SmartPublishResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acceptedFields, setAcceptedFields] = useState<AcceptedFields>({ ...DEFAULT_ACCEPTED });

  const lastArticleIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const execute = useCallback(async (articleId: string) => {
    // Cancel any in-flight request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    lastArticleIdRef.current = articleId;
    setStatus("loading");
    setError(null);
    setResult(null);
    setAcceptedFields({ ...DEFAULT_ACCEPTED });

    try {
      const response = await smartPublishApi.fill(articleId);

      if (!response.success) {
        setError(response.message || "Smart Fill request failed.");
        setStatus("error");
        return;
      }

      const data = response.data?.data;
      if (!data) {
        setError("No data returned from Smart Fill.");
        setStatus("error");
        return;
      }

      setResult(data);

      // Determine if partial (some tasks failed but others succeeded)
      const hasErrors = data.taskErrors && data.taskErrors.length > 0;
      const hasAnyResult =
        data.description !== null ||
        data.tags !== null ||
        data.suggestedCategory !== null ||
        data.slug !== null;

      if (hasErrors && !hasAnyResult) {
        setError("All Smart Fill tasks failed. Please try again.");
        setStatus("error");
      } else if (hasErrors) {
        setStatus("partial");
      } else {
        setStatus("success");
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "An unexpected error occurred.");
      setStatus("error");
    }
  }, []);

  const retry = useCallback(async () => {
    if (lastArticleIdRef.current) {
      await execute(lastArticleIdRef.current);
    }
  }, [execute]);

  const toggleField = useCallback((field: keyof AcceptedFields) => {
    setAcceptedFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }, []);

  const acceptAll = useCallback(() => {
    if (!result) return;
    setAcceptedFields({
      description: result.description !== null,
      tags: result.tags !== null,
      category: result.suggestedCategory !== null,
      slug: result.slug !== null,
      readTime: result.readTimeMinutes !== null,
      coverImage: result.coverImage !== null,
    });
  }, [result]);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setStatus("idle");
    setResult(null);
    setError(null);
    setAcceptedFields({ ...DEFAULT_ACCEPTED });
    lastArticleIdRef.current = null;
  }, []);

  return {
    status,
    result,
    error,
    acceptedFields,
    execute,
    retry,
    toggleField,
    acceptAll,
    reset,
  };
}
