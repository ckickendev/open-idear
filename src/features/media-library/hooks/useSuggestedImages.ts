"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { mediaLibraryApi } from "../api/mediaLibrary.api";
import type { MediaAsset } from "../types/mediaLibrary.types";

/**
 * Custom React hook that takes Tiptap/React editor content, debounces changes,
 * and fetches relevant image suggestions from the user's Media Library.
 */
export function useSuggestedImages(editorContent: string, debounceMs = 1500) {
  const [suggestions, setSuggestions] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (content: string) => {
    if (!content || content.trim() === "") {
      setSuggestions([]);
      return;
    }

    // Abort any active requests
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const result = await mediaLibraryApi.suggestImages(content);
      if (result.success && Array.isArray(result.data)) {
        setSuggestions(result.data);
      } else {
        setError(result.message || "Failed to fetch image suggestions.");
      }
    } catch (err: any) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        setError(err.message || "An error occurred fetching suggestions.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced effect for content updates
  useEffect(() => {
    const trimmed = editorContent?.trim() || "";
    if (trimmed === "") {
      setSuggestions([]);
      return;
    }

    const handler = setTimeout(() => {
      fetchSuggestions(trimmed);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [editorContent, debounceMs, fetchSuggestions]);

  // Clean up in-flight requests on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    refetch: () => fetchSuggestions(editorContent),
  };
}
