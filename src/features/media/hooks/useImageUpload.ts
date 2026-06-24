"use client";

import { useState, useCallback } from "react";
import { ENV } from "@/api/const";
import { getHeadersToken } from "@/lib/api/axios";
import type {
  UploadState,
  UseImageUploadOptions,
  UseImageUploadReturn,
} from "../types/media.types";
import type { MediaAsset } from "@/features/editor/types/editor.types";

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

/**
 * Image upload hook — CDN-first approach.
 *
 * KEY DESIGN DECISION: NEVER store base64 in the editor.
 * Always upload to CDN first, then insert the CDN URL into the editor.
 * This prevents 3-5MB base64 strings from bloating editor state
 * and being sent over the network on every auto-save.
 */
export function useImageUpload(
  options: UseImageUploadOptions = {},
): UseImageUploadReturn {
  const {
    maxSizeBytes = DEFAULT_MAX_SIZE,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
  } = options;

  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ─── Validate File ────────────────────────────────────────────────────

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!allowedTypes.includes(file.type)) {
        return `Invalid file type. Allowed: ${allowedTypes.map((t) => t.split("/")[1]).join(", ")}`;
      }
      if (file.size > maxSizeBytes) {
        const maxMB = Math.round(maxSizeBytes / 1024 / 1024);
        return `File size must be less than ${maxMB}MB`;
      }
      return null;
    },
    [allowedTypes, maxSizeBytes],
  );

  // ─── Upload ───────────────────────────────────────────────────────────

  const upload = useCallback(
    async (
      file: File,
      description: string = "",
    ): Promise<MediaAsset | null> => {
      // Validate
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setState("error");
        return null;
      }

      setState("uploading");
      setProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append("image", file);
      formData.append("description", description);

      try {
        const response = await fetch(`${ENV.ROOT_API}/media/uploadImage`, {
          method: "POST",
          body: formData,
          headers: getHeadersToken(),
        });

        if (!response.ok) {
          throw new Error(`Upload failed (HTTP ${response.status})`);
        }

        const data = await response.json();

        if (data.status === "success") {
          setProgress(100);
          setState("success");

          const asset: MediaAsset = {
            _id: data.image._id,
            url: data.image.url,
            description: data.image.description || description,
          };

          return asset;
        } else {
          throw new Error(data.error || "Upload failed");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Upload failed. Please try again.";
        setError(message);
        setState("error");
        return null;
      }
    },
    [validateFile],
  );

  // ─── Reset ────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setState("idle");
    setProgress(0);
    setError(null);
  }, []);

  return {
    upload,
    state,
    progress,
    error,
    reset,
  };
}
