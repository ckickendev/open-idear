// =============================================================================
//  IMAGE INSERTED TOAST (SPRINT 2)
//  src/features/editor/components/ImageInsertedToast.tsx
//
//  Post-insertion action bar shown as a Sonner custom toast:
//    ✓ Image added  · Replace · Edit Alt Text · Open Asset · Remove
//
//  Design Decisions:
//  - Uses Sonner's custom toast API (toast.custom) to keep the same notification
//    system as the rest of the editor.
//  - Replace → fires `open-asset-picker` CustomEvent to reopen the drawer.
//  - Edit Alt Text → targets the nearest img[data-pos] in the editor and
//    fires a custom `edit-image-alt` event that EditorShell handles.
//  - Open Asset → navigates to /app/dashboard/media-library?asset={assetId}
//    (only when assetId is available).
//  - Remove → fires `remove-image-node` CustomEvent with the editor position.
// =============================================================================

"use client";

import React from "react";
import { toast } from "sonner";
import { Check, RefreshCw, Pencil, FolderOpen, Trash2 } from "lucide-react";

export interface ImageInsertedContext {
  /** Tiptap node position — used for Replace and Remove. */
  pos?: number;
  /** Current alt text of the inserted image. */
  currentAlt?: string;
  /** Section heading (for Replace, to pre-fill search context). */
  heading?: string;
  /** Original search query (for Replace). */
  searchQuery?: string;
  /** imagePrompt (for Replace). */
  imagePrompt?: string;
  /** Asset Library ID — enables "Open Asset" link. */
  assetId?: string;
}

/**
 * Displays the post-insertion action bar as a Sonner custom toast.
 * Call `showImageInsertedToast(context)` after a successful insertion.
 */
export function showImageInsertedToast(context: ImageInsertedContext): void {
  toast.custom(
    (toastId) => (
      <ImageInsertedToastContent toastId={toastId} context={context} />
    ),
    {
      duration: 8000,
      position: "bottom-center",
    }
  );
}

// ─── Toast Content Component ──────────────────────────────────────────────────

function ImageInsertedToastContent({
  toastId,
  context,
}: {
  toastId: string | number;
  context: ImageInsertedContext;
}) {
  const handleReplace = () => {
    toast.dismiss(toastId);
    window.dispatchEvent(
      new CustomEvent("open-asset-picker", {
        detail: {
          heading:      context.heading || "Section Visual",
          searchQuery:  context.searchQuery || context.heading || "",
          imagePrompt:  context.imagePrompt || "",
          alt:          context.currentAlt || "",
          placeholderPos: context.pos,
          // Signal that this is a replace (not first insert)
          isReplace: true,
        },
      })
    );
  };

  const handleEditAlt = () => {
    toast.dismiss(toastId);
    const currentAlt = context.currentAlt || "";
    const newAlt = window.prompt("Edit alt text:", currentAlt);
    if (newAlt !== null && newAlt !== currentAlt) {
      window.dispatchEvent(
        new CustomEvent("edit-image-alt", {
          detail: { pos: context.pos, newAlt: newAlt.trim() },
        })
      );
    }
  };

  const handleOpenAsset = () => {
    if (!context.assetId) return;
    toast.dismiss(toastId);
    window.open(`/app/dashboard/media-library?asset=${context.assetId}`, "_blank");
  };

  const handleRemove = () => {
    toast.dismiss(toastId);
    window.dispatchEvent(
      new CustomEvent("remove-image-node", {
        detail: { pos: context.pos },
      })
    );
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl border border-zinc-700 dark:border-zinc-300 max-w-sm w-full">
      {/* Success Icon */}
      <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 dark:bg-emerald-500/30 flex items-center justify-center">
        <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
      </div>

      <span className="text-xs font-medium text-zinc-200 dark:text-zinc-700 shrink-0">
        Image added
      </span>

      <div className="w-px h-4 bg-zinc-700 dark:bg-zinc-300 shrink-0" />

      {/* Actions */}
      <div className="flex items-center gap-0.5 flex-wrap">
        <ToastButton icon={<RefreshCw className="w-3 h-3" />} label="Replace" onClick={handleReplace} />
        <ToastButton icon={<Pencil className="w-3 h-3" />} label="Alt Text" onClick={handleEditAlt} />
        {context.assetId && (
          <ToastButton icon={<FolderOpen className="w-3 h-3" />} label="Asset" onClick={handleOpenAsset} />
        )}
        <ToastButton icon={<Trash2 className="w-3 h-3" />} label="Remove" onClick={handleRemove} danger />
      </div>
    </div>
  );
}

function ToastButton({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
        danger
          ? "text-red-400 dark:text-red-600 hover:bg-red-500/10 dark:hover:bg-red-100"
          : "text-zinc-300 dark:text-zinc-600 hover:bg-zinc-800 dark:hover:bg-zinc-200"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
