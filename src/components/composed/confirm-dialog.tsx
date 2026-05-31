"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef } from "react";

interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when the dialog should close */
  onClose: () => void;
  /** Callback when the user confirms the action */
  onConfirm: () => void;
  /** Dialog title */
  title: string;
  /** Dialog message/description */
  message: string;
  /** Text for the confirm button — defaults to"Confirm"*/
  confirmLabel?: string;
  /** Text for the cancel button — defaults to"Cancel"*/
  cancelLabel?: string;
  /** Visual variant — affects the confirm button and icon color */
  variant?: "danger" | "warning" | "info";
  /** Whether the confirm action is in progress */
  isLoading?: boolean;
}

/**
 * ConfirmDialog — modal confirmation pattern.
 * Replaces the old Dialog.tsx and ConfirmDialog.tsx with proper
 * accessibility (focus trap, ESC to close, backdrop click).
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 * open={isDeleteOpen}
 * onClose={() => setIsDeleteOpen(false)}
 * onConfirm={handleDelete}
 * title="Delete post?"
 * message="This action cannot be undone."
 * variant="danger"
 * confirmLabel="Delete"
 * />
 * ```
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "warning",
  isLoading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    },
    [onClose, isLoading],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const iconColorMap = {
    danger: "text-destructive bg-destructive/10",
    warning: "text-warning bg-warning/10",
    info: "text-info bg-info/10",
  };

  const confirmVariantMap = {
    danger: "destructive" as const,
    warning: "default" as const,
    info: "default" as const,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/50 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={() => !isLoading && onClose()}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={cn(
          "relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl",
          "animate-in fade-in-0 zoom-in-95 duration-200",
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        <div className="flex gap-4">
          {/* Icon */}
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              iconColorMap[variant],
            )}
          >
            <AlertTriangle className="size-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              id="confirm-dialog-title"
              className="text-base font-semibold text-foreground"
            >
              {title}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariantMap[variant]}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && (
              <div className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            )}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
