"use client";

import React, { memo } from "react";
import { Heart, MoreVertical, Check } from "lucide-react";
import type { MediaGridItemProps } from "../types/mediaLibrary.types";

// ═══════════════════════════════════════════════════════════════════
//  MediaGridItem — single image card in the grid
// ═══════════════════════════════════════════════════════════════════

function MediaGridItemComponent({
  media,
  isSelected,
  onSelect,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  viewMode,
}: MediaGridItemProps) {
  const thumbnailUrl =
    viewMode === "grid"
      ? media.urls.thumbnail_md || media.urls.thumbnail_sm || media.urls.webp
      : media.urls.thumbnail_sm || media.urls.webp;

  const fileSizeLabel = formatBytes(media.fileSize);

  if (viewMode === "list") {
    return (
      <button
        type="button"
        className={`
          group flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left
          transition-all duration-150 cursor-pointer
          ${isSelected
            ? "bg-primary/10 ring-1 ring-primary/30"
            : "hover:bg-accent/50"
          }
        `}
        onClick={() => onSelect(media)}
        onDoubleClick={() => onDoubleClick(media)}
        onContextMenu={(e) => onContextMenu(e, media)}
        draggable={!!onDragStart}
        onDragStart={(e) => onDragStart?.(e, media)}
      >
        {/* Selection checkbox */}
        <div
          className={`
            flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center
            transition-all duration-150
            ${isSelected
              ? "bg-primary border-primary text-primary-foreground"
              : "border-border group-hover:border-primary/40"
            }
          `}
        >
          {isSelected && <Check size={12} strokeWidth={3} />}
        </div>

        {/* Thumbnail */}
        <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden bg-muted">
          <img
            src={thumbnailUrl || media.urls.original}
            alt={media.altText || media.originalFilename}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {media.originalFilename}
          </p>
          <p className="text-xs text-muted-foreground">
            {media.dimensions
              ? `${media.dimensions.width}×${media.dimensions.height}`
              : ""}{" "}
            · {fileSizeLabel}
          </p>
        </div>

        {/* Favorite indicator */}
        {media.isFavorite && (
          <Heart size={14} className="flex-shrink-0 fill-rose-500 text-rose-500" />
        )}
      </button>
    );
  }

  // Grid view
  return (
    <button
      type="button"
      className={`
        group relative aspect-square rounded-xl overflow-hidden
        transition-all duration-200 cursor-pointer
        ${isSelected
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[0.97]"
          : "hover:ring-1 hover:ring-border hover:shadow-md"
        }
      `}
      onClick={() => onSelect(media)}
      onDoubleClick={() => onDoubleClick(media)}
      onContextMenu={(e) => onContextMenu(e, media)}
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, media)}
    >
      {/* Image */}
      <img
        src={thumbnailUrl || media.urls.original}
        alt={media.altText || media.originalFilename}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* Selection overlay */}
      <div
        className={`
          absolute inset-0 transition-all duration-150
          ${isSelected ? "bg-primary/20" : "bg-transparent group-hover:bg-black/5 dark:group-hover:bg-white/5"}
        `}
      />

      {/* Selection checkbox */}
      <div
        className={`
          absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center
          transition-all duration-150 border-2
          ${isSelected
            ? "bg-primary border-primary text-primary-foreground scale-100"
            : "bg-background/80 border-border opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
          }
        `}
      >
        {isSelected && <Check size={12} strokeWidth={3} />}
      </div>

      {/* Favorite badge */}
      {media.isFavorite && (
        <div className="absolute top-2 right-2">
          <Heart size={14} className="fill-rose-500 text-rose-500 drop-shadow-sm" />
        </div>
      )}

      {/* Bottom info bar */}
      <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <p className="text-[11px] text-white truncate font-medium">
          {media.originalFilename}
        </p>
        <p className="text-[10px] text-white/70">
          {fileSizeLabel}
          {media.dimensions
            ? ` · ${media.dimensions.width}×${media.dimensions.height}`
            : ""}
        </p>
      </div>

      {/* More menu trigger (only on hover) */}
      <button
        type="button"
        className="absolute top-2 right-2 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
        onClick={(e) => {
          e.stopPropagation();
          onContextMenu(e as unknown as React.MouseEvent, media);
        }}
      >
        <MoreVertical size={12} className="text-foreground" />
      </button>
    </button>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const MediaGridItem = memo(MediaGridItemComponent);
