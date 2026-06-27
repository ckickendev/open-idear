"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api/axios";
import type { AIMetadata } from "../types/mediaLibrary.types";

// ═══════════════════════════════════════════════════════════════════
//  useMediaAI — generates alt text, description, and tags via Gemini
// ═══════════════════════════════════════════════════════════════════

export function useMediaAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate all metadata (alt text + description + tags) for an image.
   * Calls the Next.js API route which proxies to Gemini Vision.
   */
  const generateMetadata = useCallback(
    async (imageUrl: string): Promise<AIMetadata | null> => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await api.post<{ data: AIMetadata }>(
          "/api/ai/media-metadata",
          { imageUrl }
        );

        if (response.success) {
          return response.data.data;
        }
        throw new Error(response.message || "Failed to generate metadata");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "AI generation failed";
        setError(message);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  /** Shortcut: generate only alt text */
  const generateAltText = useCallback(
    async (imageUrl: string): Promise<string | null> => {
      const metadata = await generateMetadata(imageUrl);
      return metadata?.altText || null;
    },
    [generateMetadata]
  );

  const reset = useCallback(() => {
    setIsGenerating(false);
    setError(null);
  }, []);

  return {
    generateMetadata,
    generateAltText,
    isGenerating,
    error,
    reset,
  };
}
