// ─── Save Status ────────────────────────────────────────────────────────────

export type SaveStatus =
  | "idle"
  | "unsaved"
  | "saving"
  | "saved"
  | "error"
  | "conflict";

// ─── Auto-Save Hook ─────────────────────────────────────────────────────────

export interface UseAutoSaveOptions {
  /** Current post ID. Null = new post (no auto-save until first manual save). */
  postId: string | null;
  /** Callback to get current editor content snapshot. */
  getContent: () => {
    title: string;
    html: string;
    text: string;
    markdown?: string;
    contentVersion?: "html-v1" | "blocks-v1";
    blocks?: unknown[];
    aiContext?: Record<string, unknown>;
    hero?: Record<string, unknown>;
    seo?: Record<string, unknown>;
  };
  /** Debounce delay in ms. Default: 3000 */
  debounceMs?: number;
  /** Whether auto-save is enabled. Default: true */
  enabled?: boolean;
}

export interface UseAutoSaveReturn {
  status: SaveStatus;
  lastSavedAt: Date | null;
  /** Manually trigger save (bypasses debounce). */
  save: () => Promise<void>;
  /** Retry the last failed save. */
  retry: () => Promise<void>;
  /** Whether there are unsaved changes. */
  hasUnsavedChanges: boolean;
  /** Mark content as changed (triggers debounced auto-save). */
  markDirty: () => void;
}

// ─── Save Status Indicator Props ────────────────────────────────────────────

export interface SaveStatusIndicatorProps {
  status: SaveStatus;
  onRetry?: () => void;
  lastSavedAt?: Date | null;
}
