"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { aiApi } from "../api/ai.api";
import type {
  AspectRatio,
  ImageStyle,
  ImageProviderMeta,
} from "../api/ai.api";
import type { MediaAsset } from "@/features/media-library/types/mediaLibrary.types";

// ─── State shape ──────────────────────────────────────────────────────────────

export interface ImageGenerationState {
  isGenerating: boolean;
  generatedAssets: MediaAsset[];
  error: string | null;
  providers: ImageProviderMeta[];
  providersLoading: boolean;
  revisedPrompts: (string | undefined)[];
  lastUsedProviderId: string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAIImageGenerator() {
  const [state, setState] = useState<ImageGenerationState>({
    isGenerating: false,
    generatedAssets: [],
    error: null,
    providers: [],
    providersLoading: false,
    revisedPrompts: [],
    lastUsedProviderId: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  // ── Load providers on mount ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, providersLoading: true }));

    aiApi.getImageProviders()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          setState((s) => ({ ...s, providers: res.data.providers, providersLoading: false }));
        }
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, providersLoading: false }));
      });

    return () => { cancelled = true; };
  }, []);

  // ── Generate ────────────────────────────────────────────────────────────────
  const generate = useCallback(async (options: {
    prompt: string;
    negativePrompt?: string;
    aspectRatio?: AspectRatio;
    style?: ImageStyle;
    count?: number;
    providerId?: string;
    folderId?: string;
  }) => {
    const { prompt } = options;
    if (!prompt.trim()) return;

    setState((s) => ({
      ...s,
      isGenerating: true,
      error: null,
      generatedAssets: [],
      revisedPrompts: [],
    }));

    abortRef.current = new AbortController();

    try {
      const res = await aiApi.generateImage(options);

      if (res.success && res.data) {
        setState((s) => ({
          ...s,
          isGenerating: false,
          generatedAssets: res.data.assets as MediaAsset[],
          revisedPrompts: res.data.revisedPrompts,
          lastUsedProviderId: res.data.providerId,
        }));
      } else {
        setState((s) => ({
          ...s,
          isGenerating: false,
          error: (res as any).message || "Image generation failed.",
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

  // ── Cancel ──────────────────────────────────────────────────────────────────
  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState((s) => ({ ...s, isGenerating: false }));
  }, []);

  // ── Clear results ───────────────────────────────────────────────────────────
  const clear = useCallback(() => {
    setState((s) => ({
      ...s,
      generatedAssets: [],
      error: null,
      revisedPrompts: [],
      lastUsedProviderId: null,
    }));
  }, []);

  return {
    ...state,
    generate,
    cancel,
    clear,
  };
}
