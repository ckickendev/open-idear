"use client";

import React from "react";
import type { SaveStatus, SaveStatusIndicatorProps } from "../types/autosave.types";

const statusConfig: Record<
  SaveStatus,
  { dot: string; label: string; textColor: string }
> = {
  idle: { dot: "", label: "", textColor: "" },
  saving: {
    dot: "bg-[var(--color-editor-accent)]",
    label: "Saving...",
    textColor: "text-[var(--color-editor-secondary)]",
  },
  saved: {
    dot: "bg-[var(--color-editor-success)]",
    label: "Saved",
    textColor: "text-[var(--color-editor-success)]",
  },
  error: {
    dot: "bg-[var(--color-editor-danger)]",
    label: "Save failed",
    textColor: "text-[var(--color-editor-danger)]",
  },
  unsaved: {
    dot: "bg-[var(--color-editor-warning)]",
    label: "Unsaved changes",
    textColor: "text-[var(--color-editor-warning)]",
  },
  conflict: {
    dot: "bg-[var(--color-editor-danger)]",
    label: "Conflict detected",
    textColor: "text-[var(--color-editor-danger)]",
  },
};

/**
 * Save status indicator component.
 *
 * Shows the current auto-save state with a colored dot and label.
 * Now supports the 'conflict' status for future collaboration features.
 */
const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  onRetry,
  lastSavedAt,
}) => {
  if (status === "idle") return null;

  const config = statusConfig[status];

  return (
    <div
      className="flex items-center gap-2 transition-all duration-200"
      role="status"
      aria-live="polite"
      aria-label={config.label}
    >
      <span
        className={`inline-block w-2 h-2 rounded-full ${config.dot} ${
          status === "saving"
            ? "animate-[pulse-dot_1.5s_ease-in-out_infinite]"
            : ""
        }`}
      />
      <span
        className={`text-xs font-medium ${config.textColor} transition-colors duration-200`}
      >
        {config.label}
      </span>
      {(status === "error" || status === "conflict") && onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-medium text-[var(--color-editor-accent)] hover:text-[var(--color-editor-accent-hover)] underline underline-offset-2 transition-colors cursor-pointer ml-1"
          aria-label="Retry saving"
        >
          Retry
        </button>
      )}
      {lastSavedAt && status === "saved" && (
        <span className="text-[10px] text-[var(--color-editor-muted)] ml-1">
          {lastSavedAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  );
};

export default SaveStatusIndicator;

// Re-export the type for backward compatibility
export type { SaveStatus } from "../types/autosave.types";
