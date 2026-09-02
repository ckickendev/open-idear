"use client";

// =============================================================================
//  PUBLISH BY AI — MUTATION HOOK
//  src/features/ai/hooks/usePublishByAI.ts
//
//  Encapsulates all async state for the Publish-by-AI generation call:
//  loading, error, result, and an elapsed timer.
//
//  Design Decisions:
//  - No external dependencies (no React Query) — pure useState + useCallback.
//  - Exposes a `generate(payload)` function that mirrors a mutation pattern.
//  - Cooperative cancellation via AbortController.
//  - Elapsed timer via setInterval updates `elapsedMs` every 100ms.
// =============================================================================

import { useState, useRef, useCallback } from "react";
import { publisherApi, type PublisherRequest, type PublisherResponse } from "../api/publisher.api";

export interface UsePublishByAIReturn {
  /** Call this to trigger generation. Resolves with the result or null on error. */
  generate: (payload: PublisherRequest) => Promise<PublisherResponse | null>;
  /** Abort an in-flight request. */
  abort: () => void;
  /** Reset state back to idle. */
  reset: () => void;
  /** True while the request is in-flight. */
  isPending: boolean;
  /** True if the last call completed successfully. */
  isSuccess: boolean;
  /** True if the last call failed. */
  isError: boolean;
  /** Error message from the last failed call. */
  errorMessage: string | null;
  /** The successful result from the last call. */
  data: PublisherResponse | null;
  /** Elapsed time in milliseconds (updated every 100ms during generation). */
  elapsedMs: number;
}

export function usePublishByAI(): UsePublishByAIReturn {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<PublisherResponse | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const reset = useCallback(() => {
    stopTimer();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsPending(false);
    setIsSuccess(false);
    setIsError(false);
    setErrorMessage(null);
    setData(null);
    setElapsedMs(0);
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    stopTimer();
    setIsPending(false);
    setElapsedMs(0);
  }, []);

  const generate = useCallback(async (payload: PublisherRequest): Promise<PublisherResponse | null> => {
    // Reset any previous state
    stopTimer();
    setIsSuccess(false);
    setIsError(false);
    setErrorMessage(null);
    setData(null);
    setElapsedMs(0);
    setIsPending(true);

    // Start elapsed timer
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 100);

    // Setup cancellation
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await publisherApi.generate(payload);
      stopTimer();
      setData(result);
      setIsSuccess(true);
      setElapsedMs(Date.now() - startTime);
      return result;
    } catch (err: unknown) {
      stopTimer();
      const msg = err instanceof Error ? err.message : "Generation failed. Please try again.";
      setIsError(true);
      setErrorMessage(msg);
      return null;
    } finally {
      setIsPending(false);
      abortControllerRef.current = null;
    }
  }, []);

  return {
    generate,
    abort,
    reset,
    isPending,
    isSuccess,
    isError,
    errorMessage,
    data,
    elapsedMs,
  };
}
