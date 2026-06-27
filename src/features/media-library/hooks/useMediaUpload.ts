"use client";

import { useState, useCallback } from "react";
import { mediaLibraryApi } from "../api/mediaLibrary.api";
import { useMediaLibraryStore } from "../store/mediaLibraryStore";
import type { MediaAsset } from "../types/mediaLibrary.types";

// ═══════════════════════════════════════════════════════════════════
//  useMediaUpload — handles file upload with dedup check + progress
// ═══════════════════════════════════════════════════════════════════

type UploadState = "idle" | "hashing" | "checking" | "uploading" | "success" | "error";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export function useMediaUpload() {
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [duplicateMedia, setDuplicateMedia] = useState<MediaAsset | null>(null);
  const store = useMediaLibraryStore();

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      const types = ALLOWED_TYPES.map((t) => t.split("/")[1]).join(", ");
      return `Invalid file type. Allowed: ${types}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  }, []);

  /**
   * Compute SHA-256 hash of a file using SubtleCrypto.
   * This runs in the browser for a quick dedup preview — the server
   * re-computes the hash from the actual buffer for security.
   */
  const computeHash = useCallback(async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }, []);

  const upload = useCallback(
    async (
      file: File,
      options: { folderId?: string; description?: string; altText?: string } = {}
    ): Promise<MediaAsset | null> => {
      // Validate
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setState("error");
        return null;
      }

      setError(null);
      setDuplicateMedia(null);

      try {
        // Step 1: Hash the file client-side for a quick dedup preview
        setState("hashing");
        store.setIsUploading(true);
        store.setUploadProgress(10);
        const fileHash = await computeHash(file);

        // Step 2: Check for duplicates
        setState("checking");
        store.setUploadProgress(20);
        const dupCheck = await mediaLibraryApi.checkDuplicate(fileHash);

        if (dupCheck.success && dupCheck.data.exists && dupCheck.data.media) {
          setDuplicateMedia(dupCheck.data.media);
          setState("idle");
          store.setIsUploading(false);
          store.setUploadProgress(0);
          // Return the existing media — caller decides what to do
          return dupCheck.data.media;
        }

        // Step 3: Upload
        setState("uploading");
        store.setUploadProgress(40);

        const result = await mediaLibraryApi.upload(file, options);
        store.setUploadProgress(90);

        if (result.success) {
          store.setUploadProgress(100);
          setState("success");

          // Add to grid immediately
          store.prependMedia(result.data.media);

          // Reset after brief success state
          setTimeout(() => {
            setState("idle");
            store.setIsUploading(false);
            store.setUploadProgress(0);
          }, 1500);

          return result.data.media;
        } else {
          throw new Error(result.message || "Upload failed");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Upload failed. Try again.";
        setError(message);
        setState("error");
        store.setIsUploading(false);
        store.setUploadProgress(0);
        return null;
      }
    },
    [validateFile, computeHash]
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    setDuplicateMedia(null);
    store.setIsUploading(false);
    store.setUploadProgress(0);
  }, []);

  return {
    upload,
    state,
    error,
    duplicateMedia,
    reset,
  };
}
