import { create } from "zustand";
import type {
  MediaLibraryState,
  MediaAsset,
  MediaFolder,
  MediaPagination,
  QuickFilter,
  SortOption,
  ViewMode,
} from "../types/mediaLibrary.types";

// ═══════════════════════════════════════════════════════════════════
//  MEDIA LIBRARY ZUSTAND STORE
//  Global UI state for the media library modal.
//  Data fetching happens in hooks, not in the store.
// ═══════════════════════════════════════════════════════════════════

export const useMediaLibraryStore = create<MediaLibraryState>((set) => ({
  // ─── Modal ────────────────────────────────────────────────────
  isOpen: false,
  onSelectCallback: null,

  // ─── View ─────────────────────────────────────────────────────
  viewMode: "grid" as ViewMode,
  sortBy: "-createdAt" as SortOption,
  activeFilter: "all" as QuickFilter,
  currentFolder: null,
  searchQuery: "",

  // ─── Selection ────────────────────────────────────────────────
  selectedIds: new Set<string>(),
  detailMedia: null,

  // ─── Data ─────────────────────────────────────────────────────
  media: [],
  folders: [],
  pagination: null,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,

  // ─── Actions ──────────────────────────────────────────────────

  open: (onSelect) =>
    set({
      isOpen: true,
      onSelectCallback: onSelect,
      selectedIds: new Set(),
      detailMedia: null,
      searchQuery: "",
    }),

  close: () =>
    set({
      isOpen: false,
      onSelectCallback: null,
      selectedIds: new Set(),
      detailMedia: null,
      searchQuery: "",
    }),

  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setActiveFilter: (filter) =>
    set({ activeFilter: filter, currentFolder: null, selectedIds: new Set() }),
  setCurrentFolder: (folderId) =>
    set({
      currentFolder: folderId,
      activeFilter: "all",
      selectedIds: new Set(),
    }),
  setSearchQuery: (query) =>
    set((state) => {
      const nextSort = query.trim()
        ? (state.sortBy === "-createdAt" ? "-relevance" : state.sortBy)
        : (state.sortBy === "-relevance" ? "-createdAt" : state.sortBy);
      return { searchQuery: query, sortBy: nextSort };
    }),

  toggleSelect: (mediaId) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(mediaId)) next.delete(mediaId);
      else next.add(mediaId);
      return { selectedIds: next };
    }),

  selectAll: () =>
    set((state) => ({
      selectedIds: new Set(state.media.map((m) => m._id)),
    })),

  clearSelection: () => set({ selectedIds: new Set() }),

  setDetailMedia: (media) => set({ detailMedia: media }),

  // ─── Data Mutations ──────────────────────────────────────────

  setMedia: (media) => set({ media }),

  appendMedia: (newMedia) =>
    set((state) => ({ media: [...state.media, ...newMedia] })),

  prependMedia: (media) =>
    set((state) => ({ media: [media, ...state.media] })),

  updateMediaItem: (id, updates) =>
    set((state) => ({
      media: state.media.map((m) =>
        m._id === id ? { ...m, ...updates } : m
      ),
      detailMedia:
        state.detailMedia?._id === id
          ? { ...state.detailMedia, ...updates }
          : state.detailMedia,
    })),

  removeMediaItem: (id) =>
    set((state) => ({
      media: state.media.filter((m) => m._id !== id),
      selectedIds: (() => {
        const next = new Set(state.selectedIds);
        next.delete(id);
        return next;
      })(),
      detailMedia:
        state.detailMedia?._id === id ? null : state.detailMedia,
    })),

  setFolders: (folders) => set({ folders }),

  setPagination: (pagination) => set({ pagination }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsUploading: (uploading) => set({ isUploading: uploading }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
}));
