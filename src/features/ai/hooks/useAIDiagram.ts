"use client";

import { useState, useCallback, useRef } from "react";
import { aiApi } from "../api/ai.api";
import type { DiagramRequest, DiagramResponse } from "../api/ai.api";

export interface DiagramState {
  isGenerating: boolean;
  result: DiagramResponse | null;
  error: string | null;
}

export function useAIDiagram() {
  const [state, setState] = useState<DiagramState>({
    isGenerating: false,
    result: null,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (payload: DiagramRequest) => {
    setState((s) => ({
      ...s,
      isGenerating: true,
      error: null,
      result: null,
    }));

    abortRef.current = new AbortController();

    try {
      const res = await aiApi.generateDiagram(payload);

      if (res.success && res.data) {
        setState({
          isGenerating: false,
          result: res.data,
          error: null,
        });
      } else {
        setState((s) => ({
          ...s,
          isGenerating: false,
          error: (res as any).message || "Diagram generation failed.",
        }));
      }
    } catch (err: any) {
      setState((s) => ({
        ...s,
        isGenerating: false,
        error: err.message || "An unexpected error occurred.",
      }));
    } finally {
      abortRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState((s) => ({ ...s, isGenerating: false }));
  }, []);

  const clear = useCallback(() => {
    setState({
      isGenerating: false,
      result: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    generate,
    cancel,
    clear,
  };
}
