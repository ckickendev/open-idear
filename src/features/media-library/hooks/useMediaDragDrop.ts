"use client";

import { useCallback } from "react";
import type { MediaAsset } from "../types/mediaLibrary.types";

// ═══════════════════════════════════════════════════════════════════
//  useMediaDragDrop — handles drag from media library to Tiptap editor
// ═══════════════════════════════════════════════════════════════════

/** Custom MIME type for intra-app media library drag data */
export const MEDIA_LIBRARY_MIME = "application/x-openidear-media";

export function useMediaDragDrop() {
  /**
   * Sets up the drag event with both custom and standard data types.
   * - Custom type: Full media metadata for Tiptap handler
   * - URI list: Fallback URL for external drop targets
   */
  const handleDragStart = useCallback(
    (e: React.DragEvent, media: MediaAsset) => {
      const payload = JSON.stringify({
        mediaId: media._id,
        url: media.urls.webp || media.urls.original,
        alt: media.altText || media.originalFilename || "",
        thumbnailUrl: media.urls.thumbnail_md || media.urls.thumbnail_sm,
      });

      e.dataTransfer.setData(MEDIA_LIBRARY_MIME, payload);
      e.dataTransfer.setData(
        "text/uri-list",
        media.urls.webp || media.urls.original
      );
      e.dataTransfer.effectAllowed = "copy";

      // Create a compact drag ghost
      const ghost = document.createElement("div");
      ghost.style.cssText = `
        width: 72px; height: 72px; border-radius: 8px; overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        position: absolute; top: -1000px;
      `;
      const img = document.createElement("img");
      img.src = media.urls.thumbnail_sm || media.urls.original;
      img.style.cssText = "width: 100%; height: 100%; object-fit: cover;";
      ghost.appendChild(img);
      document.body.appendChild(ghost);

      e.dataTransfer.setDragImage(ghost, 36, 36);

      // Clean up ghost after drag starts
      requestAnimationFrame(() => {
        if (document.body.contains(ghost)) {
          document.body.removeChild(ghost);
        }
      });
    },
    []
  );

  /**
   * Parse media library data from a drop event.
   * Returns null if the drop didn't come from the media library.
   */
  const parseDropData = useCallback(
    (
      e: DragEvent
    ): { mediaId: string; url: string; alt: string } | null => {
      const raw = e.dataTransfer?.getData(MEDIA_LIBRARY_MIME);
      if (!raw) return null;

      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },
    []
  );

  return { handleDragStart, parseDropData, MEDIA_LIBRARY_MIME };
}
