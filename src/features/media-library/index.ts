// ─── Media Library Feature — Public API ─────────────────────────────────────

// Components
export { MediaLibraryModal } from "./components/MediaLibraryModal";
export { MediaGrid } from "./components/MediaGrid";
export { MediaGridItem } from "./components/MediaGridItem";
export { MediaDetailPanel } from "./components/MediaDetailPanel";
export { MediaUploadZone } from "./components/MediaUploadZone";
export { MediaSidebar } from "./components/MediaSidebar";
export { MediaSearchBar } from "./components/MediaSearchBar";
export { MediaToolbar } from "./components/MediaToolbar";

// Hooks
export { useMediaLibrary } from "./hooks/useMediaLibrary";
export { useMediaUpload } from "./hooks/useMediaUpload";
export { useMediaSearch } from "./hooks/useMediaSearch";
export { useMediaDragDrop, MEDIA_LIBRARY_MIME } from "./hooks/useMediaDragDrop";
export { useMediaAI } from "./hooks/useMediaAI";
export { useAssetAiStatus } from "./hooks/useAssetAiStatus";
export { useSuggestedImages } from "./hooks/useSuggestedImages";

// Store
export { useMediaLibraryStore } from "./store/mediaLibraryStore";

// API
export { mediaLibraryApi } from "./api/mediaLibrary.api";

// Types
export type {
  MediaAsset,
  MediaFolder,
  MediaPagination,
  MediaUsageEntry,
  AIMetadata,
  MediaLibraryModalProps,
  MediaGridItemProps,
  ViewMode,
  SortOption,
  QuickFilter,
  MediaLibraryState,
  BrowseMediaParams,
  SearchMediaParams,
  UpdateMetadataPayload,
  CreateFolderPayload,
  BulkMovePayload,
  BulkTagPayload,
  BulkFavoritePayload,
} from "./types/mediaLibrary.types";
