"use client";

import React from "react";
import {
  FolderInput,
  Tag,
  Star,
  Trash2,
  X,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
//  MediaToolbar — bulk action bar shown when items are selected
// ═══════════════════════════════════════════════════════════════════

interface MediaToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkFavorite: () => void;
  onSelectAll: () => void;
}

export function MediaToolbar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkFavorite,
  onSelectAll,
}: MediaToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-t border-primary/10 animate-in slide-in-from-bottom-2 duration-200">
      {/* Selection info */}
      <span className="text-sm font-medium text-primary">
        {selectedCount} selected
      </span>

      <button
        type="button"
        onClick={onSelectAll}
        className="text-xs text-primary/70 hover:text-primary underline cursor-pointer"
      >
        Select all
      </button>

      <div className="flex-1" />

      {/* Bulk actions */}
      <button
        type="button"
        onClick={onBulkFavorite}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
      >
        <Star size={14} />
        Favorite
      </button>

      <button
        type="button"
        onClick={() => {
          if (
            confirm(
              `Delete ${selectedCount} image${selectedCount === 1 ? "" : "s"}?`
            )
          ) {
            onBulkDelete();
          }
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
      >
        <Trash2 size={14} />
        Delete
      </button>

      {/* Close selection */}
      <button
        type="button"
        onClick={onClearSelection}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
}
