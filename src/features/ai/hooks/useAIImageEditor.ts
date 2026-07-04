"use client";

import { useState, useCallback, useRef } from "react";
import { aiApi } from "../api/ai.api";
import type { ImageEditRequest, ImageEditResponse } from "../api/ai.api";
import type { MediaAsset } from "@/features/media-library/types/mediaLibrary.types";

export interface ImageEditingState {
  isEditing: boolean;
  editedAsset: MediaAsset | null;
  error: string | null;
  summary: string | null;
}

export function useAIImageEditor() {
  const [state, setState] = useState<ImageEditingState>({
    isEditing: false,
    editedAsset: null,
    error: null,
    summary: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const edit = useCallback(async (payload: ImageEditRequest) => {
    setState((s) => ({
      ...s,
      isEditing: true,
      error: null,
      editedAsset: null,
      summary: null,
    }));

    abortRef.current = new AbortController();

    try {
      const res = await aiApi.editImage(payload);

      if (res.success && res.data) {
        setState({
          isEditing: false,
          editedAsset: res.data.asset as MediaAsset,
          summary: res.data.summary,
          error: null,
        });
      } else {
        setState((s) => ({
          ...s,
          isEditing: false,
          error: (res as any).message || "Image editing failed.",
        }));
      }
    } catch (err: any) {
      setState((s) => ({
        ...s,
        isEditing: false,
        error: err.message || "An unexpected error occurred.",
      }));
    } finally {
      abortRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState((s) => ({ ...s, isEditing: false }));
  }, []);

  const clear = useCallback(() => {
    setState({
      isEditing: false,
      editedAsset: null,
      error: null,
      summary: null,
    });
  }, []);

  return {
    ...state,
    edit,
    cancel,
    clear,
  };
}
