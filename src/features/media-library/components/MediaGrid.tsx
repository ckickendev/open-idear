"use client";

import React, { useRef, useEffect } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaGridItem } from "./MediaGridItem";
import { useMediaDragDrop } from "../hooks/useMediaDragDrop";
import type { MediaAsset, ViewMode } from "../types/mediaLibrary.types";

// ═══════════════════════════════════════════════════════════════════
//  MediaGrid — renders the image grid/list with infinite scroll
// ═══════════════════════════════════════════════════════════════════

interface MediaGridProps {
  media: MediaAsset[];
  selectedIds: Set<string>;
  viewMode: ViewMode;
  isLoading: boolean;
  hasMore: boolean;
  onSelect: (media: MediaAsset) => void;
  onDoubleClick: (media: MediaAsset) => void;
  onContextMenu: (e: React.MouseEvent, media: MediaAsset) => void;
  onLoadMore: () => void;
  allowDrag?: boolean;
}

export function MediaGrid({
  media,
  selectedIds,
  viewMode,
  isLoading,
  hasMore,
  onSelect,
  onDoubleClick,
  onContextMenu,
  onLoadMore,
  allowDrag = false,
}: MediaGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { handleDragStart } = useMediaDragDrop();

  // ─── Infinite scroll via IntersectionObserver ─────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  // ─── Empty state ─────────────────────────────────────────────
  if (!isLoading && media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <ImageOff size={28} className="text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium">No images found</p>
        <p className="text-xs mt-1">
          Upload an image or try a different filter
        </p>
      </div>
    );
  }

  return (
    <div>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {media.map((m) => (
            <MediaGridItem
              key={m._id}
              media={m}
              isSelected={selectedIds.has(m._id)}
              onSelect={onSelect}
              onDoubleClick={onDoubleClick}
              onContextMenu={onContextMenu}
              onDragStart={allowDrag ? handleDragStart : undefined}
              viewMode="grid"
            />
          ))}

          {/* Loading skeleton placeholders */}
          {isLoading &&
            Array.from({ length: 10 }).map((_, i) => (
              <Skeleton
                key={`skeleton-${i}`}
                className="aspect-square rounded-xl"
              />
            ))}
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {media.map((m) => (
            <MediaGridItem
              key={m._id}
              media={m}
              isSelected={selectedIds.has(m._id)}
              onSelect={onSelect}
              onDoubleClick={onDoubleClick}
              onContextMenu={onContextMenu}
              onDragStart={allowDrag ? handleDragStart : undefined}
              viewMode="list"
            />
          ))}

          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={`skeleton-${i}`}
                className="h-12 rounded-lg"
              />
            ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-8" data-sentinel />

      {/* Loading indicator for infinite scroll */}
      {isLoading && media.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
