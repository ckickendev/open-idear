"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMediaLibraryStore } from "../store/mediaLibraryStore";
import { mediaLibraryApi } from "../api/mediaLibrary.api";
import type {
  BrowseMediaParams,
  MediaAsset,
  QuickFilter,
} from "../types/mediaLibrary.types";

// ═══════════════════════════════════════════════════════════════════
//  useMediaLibrary — orchestrates data fetching for the library
// ═══════════════════════════════════════════════════════════════════

export function useMediaLibrary() {
  const store = useMediaLibraryStore();
  const abortRef = useRef<AbortController | null>(null);

  // ─── Fetch media based on current filters ─────────────────────

  const fetchMedia = useCallback(
    async (page = 1, append = false) => {
      // Abort any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      store.setIsLoading(true);

      try {
        let result;

        if (store.searchQuery.trim()) {
          // Search mode
          result = await mediaLibraryApi.search({
            q: store.searchQuery,
            page,
            limit: 30,
          });
        } else {
          // Browse mode
          const params: BrowseMediaParams = {
            page,
            limit: 30,
            sort: store.sortBy,
          };

          // Apply filters
          if (store.currentFolder) {
            params.folder = store.currentFolder;
          }
          if (store.activeFilter === "favorites") {
            params.isFavorite = true;
          }

          result = await mediaLibraryApi.browse(params);
        }

        if (result.success) {
          if (append) {
            store.appendMedia(result.data.media);
          } else {
            store.setMedia(result.data.media);
          }
          store.setPagination(result.data.pagination);
        }
      } catch {
        // AbortError is expected on rapid filter changes — ignore
      } finally {
        store.setIsLoading(false);
      }
    },
    [store.searchQuery, store.sortBy, store.currentFolder, store.activeFilter]
  );

  // ─── Fetch folders ────────────────────────────────────────────

  const fetchFolders = useCallback(async () => {
    const result = await mediaLibraryApi.getFolders(true);
    if (result.success) {
      store.setFolders(result.data);
    }
  }, []);

  // ─── Load more (infinite scroll) ─────────────────────────────

  const loadMore = useCallback(() => {
    if (store.pagination?.hasMore && !store.isLoading) {
      fetchMedia(store.pagination.page + 1, true);
    }
  }, [store.pagination, store.isLoading, fetchMedia]);

  // ─── Refetch on filter changes ────────────────────────────────

  useEffect(() => {
    if (store.isOpen) {
      fetchMedia(1, false);
    }
  }, [
    store.isOpen,
    store.searchQuery,
    store.sortBy,
    store.currentFolder,
    store.activeFilter,
  ]);

  // ─── Load folders when modal opens ────────────────────────────

  useEffect(() => {
    if (store.isOpen) {
      fetchFolders();
    }
  }, [store.isOpen]);

  // ─── Actions ──────────────────────────────────────────────────

  const toggleFavorite = useCallback(
    async (media: MediaAsset) => {
      const newValue = !media.isFavorite;
      // Optimistic update
      store.updateMediaItem(media._id, { isFavorite: newValue });

      const result = await mediaLibraryApi.updateMetadata(media._id, {
        isFavorite: newValue,
      });
      if (!result.success) {
        // Revert on failure
        store.updateMediaItem(media._id, { isFavorite: !newValue });
      }
    },
    []
  );

  const deleteMedia = useCallback(
    async (mediaId: string) => {
      store.removeMediaItem(mediaId);
      await mediaLibraryApi.deleteAsset(mediaId);
    },
    []
  );

  const bulkDelete = useCallback(async () => {
    const ids = Array.from(store.selectedIds);
    if (ids.length === 0) return;

    // Optimistic: remove from UI
    ids.forEach((id) => store.removeMediaItem(id));
    store.clearSelection();

    await mediaLibraryApi.bulkDelete(ids);
  }, [store.selectedIds]);

  const bulkMove = useCallback(
    async (folderId: string | null) => {
      const ids = Array.from(store.selectedIds);
      if (ids.length === 0) return;

      // Optimistic update
      ids.forEach((id) => store.updateMediaItem(id, { folder: folderId }));
      store.clearSelection();

      await mediaLibraryApi.bulkMove({ mediaIds: ids, folderId });
      fetchFolders(); // Refresh folder counts
    },
    [store.selectedIds, fetchFolders]
  );

  const bulkFavorite = useCallback(
    async (isFavorite: boolean) => {
      const ids = Array.from(store.selectedIds);
      if (ids.length === 0) return;

      ids.forEach((id) => store.updateMediaItem(id, { isFavorite }));
      store.clearSelection();

      await mediaLibraryApi.bulkFavorite({ mediaIds: ids, isFavorite });
    },
    [store.selectedIds]
  );

  return {
    ...store,
    fetchMedia,
    fetchFolders,
    loadMore,
    toggleFavorite,
    deleteMedia,
    bulkDelete,
    bulkMove,
    bulkFavorite,
  };
}
