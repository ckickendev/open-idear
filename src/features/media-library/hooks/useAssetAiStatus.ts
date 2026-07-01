"use client";

import { useEffect, useRef } from "react";
import { useMediaLibraryStore } from "../store/mediaLibraryStore";
import { mediaLibraryApi } from "../api/mediaLibrary.api";

/**
 * Hook that detects any media assets in the store with pending/processing
 * AI metadata generation and polls their status from the backend until complete.
 */
export function useAssetAiStatus() {
  const media = useMediaLibraryStore((state) => state.media);
  const updateMediaItem = useMediaLibraryStore((state) => state.updateMediaItem);
  const isOpen = useMediaLibraryStore((state) => state.isOpen);
  
  // Track currently polled asset IDs to avoid double-polling same items
  const activePollsRef = useRef<Set<string>>(new Set());
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (!isOpen) {
      // Clear all timers on modal close
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
      activePollsRef.current.clear();
      return;
    }

    // Filter list for assets in 'pending' or 'processing' state
    const inProgressAssets = media.filter(
      (item) => item.aiStatus === "pending" || item.aiStatus === "processing"
    );

    // Clean up timers for assets that are no longer in progress
    const inProgressIds = new Set(inProgressAssets.map((a) => a._id));
    timersRef.current.forEach((timer, id) => {
      if (!inProgressIds.has(id)) {
        clearTimeout(timer);
        timersRef.current.delete(id);
        activePollsRef.current.delete(id);
      }
    });

    inProgressAssets.forEach((asset) => {
      const assetId = asset._id;

      if (activePollsRef.current.has(assetId)) return;
      activePollsRef.current.add(assetId);

      const poll = async () => {
        try {
          const result = await mediaLibraryApi.getById(assetId);
          if (result.success && result.data) {
            const updated = result.data;

            // Update local Zustand store
            updateMediaItem(assetId, {
              aiStatus: updated.aiStatus,
              aiError: updated.aiError,
              aiRetryCount: updated.aiRetryCount,
              altText: updated.altText,
              description: updated.description,
              tags: updated.tags,
              aiMetadata: updated.aiMetadata,
            });

            // Re-schedule if still in-progress
            if (updated.aiStatus === "pending" || updated.aiStatus === "processing") {
              const nextTimer = setTimeout(poll, 4000);
              timersRef.current.set(assetId, nextTimer);
            } else {
              activePollsRef.current.delete(assetId);
              timersRef.current.delete(assetId);
            }
          } else {
            activePollsRef.current.delete(assetId);
            timersRef.current.delete(assetId);
          }
        } catch (err) {
          activePollsRef.current.delete(assetId);
          timersRef.current.delete(assetId);
        }
      };

      const timer = setTimeout(poll, 4000);
      timersRef.current.set(assetId, timer);
    });
  }, [media, isOpen, updateMediaItem]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      activePollsRef.current.clear();
    };
  }, []);
}
