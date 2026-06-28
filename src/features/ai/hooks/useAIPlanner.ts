import { useState, useCallback, useRef } from "react";
import { aiApi, type PlannerRequest, type PlannerResponse } from "../api/ai.api";

export function useAIPlanner() {
  const [isRunning, setIsRunning] = useState(false);
  const [outline, setOutline] = useState<PlannerResponse | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Triggers the article planner API.
   */
  const plan = useCallback(async (payload: PlannerRequest) => {
    setIsRunning(true);
    setError(null);
    setOutline(null);

    try {
      const response = await aiApi.runPlanner(payload);
      if (response.success && response.data) {
        setOutline(response.data);
      } else {
        setError(response.message || "Failed to generate article outline plan.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while compiling outline plan.");
    } finally {
      setIsRunning(false);
    }
  }, []);

  /**
   * Triggers the article writer streaming API.
   * Handles progressive reading, errors, and cancellation.
   */
  const writeStream = useCallback(async (
    options: {
      additionalInstructions?: string;
      language?: string;
      userPreference?: string;
    },
    onChunk: (text: string) => void,
    onComplete: () => void
  ) => {
    if (!outline) {
      setError("No outline plan found. Generate outline first.");
      return;
    }

    setIsWriting(true);
    setError(null);

    // Setup cancellation controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const stream = await aiApi.runWriterStream({
        plan: outline,
        additionalInstructions: options.additionalInstructions,
        language: options.language,
        userPreference: options.userPreference,
      }, controller.signal);

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine.startsWith("data: ")) continue;
          const dataStr = cleanLine.substring(6);

          if (dataStr === "[DONE]") {
            break;
          }

          const parsed = JSON.parse(dataStr);
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.chunk) {
            onChunk(parsed.chunk);
          }
        }
      }

      onComplete();
    } catch (err: any) {
      if (err.name === "AbortError" || controller.signal.aborted) {
        console.log("[useAIPlanner] Writing stream cancelled by user.");
      } else {
        setError(err.message || "An error occurred while drafting the article content.");
      }
    } finally {
      setIsWriting(false);
      abortControllerRef.current = null;
    }
  }, [outline]);

  /**
   * Cancels the active article writing stream request.
   */
  const cancelWriting = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsWriting(false);
    }
  }, []);

  const clear = useCallback(() => {
    setOutline(null);
    setError(null);
    setIsRunning(false);
    setIsWriting(false);
    cancelWriting();
  }, [cancelWriting]);

  return {
    plan,
    writeStream,
    cancelWriting,
    isRunning,
    isWriting,
    outline,
    error,
    clear,
  };
}
