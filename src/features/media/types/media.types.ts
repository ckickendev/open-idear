import type { MediaAsset } from "@/features/editor/types/editor.types";

// ─── Upload State ───────────────────────────────────────────────────────────

export type UploadState =
  | "idle"
  | "validating"
  | "uploading"
  | "success"
  | "error";

// ─── Image Upload Hook ──────────────────────────────────────────────────────

export interface UseImageUploadOptions {
  /** Max file size in bytes. Default: 5MB */
  maxSizeBytes?: number;
  /** Allowed MIME types. */
  allowedTypes?: string[];
}

export interface UseImageUploadReturn {
  /** Upload a file and get the CDN result. */
  upload: (file: File, description?: string) => Promise<MediaAsset | null>;
  /** Current upload state. */
  state: UploadState;
  /** Upload progress (0-100). */
  progress: number;
  /** Error message if upload failed. */
  error: string | null;
  /** Reset the upload state. */
  reset: () => void;
}

// ─── Image Upload Component Props ───────────────────────────────────────────

export interface ImageUploadProps {
  onImageUploaded: (image: MediaAsset) => void;
  onClose?: () => void;
  isTitleDisplay?: boolean;
}

// ─── Media Browser Props ────────────────────────────────────────────────────

export interface MediaBrowserProps {
  onSelect: (media: MediaAsset) => void;
  onClose: () => void;
}
