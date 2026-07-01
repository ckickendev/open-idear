// ═══════════════════════════════════════════════════════════════════
//  MEDIA LIBRARY — TypeScript Interfaces
//  Aligned with backend models/mediaAsset.schema.js
// ═══════════════════════════════════════════════════════════════════

// ─── API Response Types ─────────────────────────────────────────

export interface MediaAsset {
  _id: string;
  user: string;
  originalFilename: string;
  mimeType: string;
  fileHash: string;
  pHash?: string;
  type: "image" | "video" | "audio" | "document";
  urls: {
    original: string;
    webp?: string;
    thumbnail_sm?: string;
    thumbnail_md?: string;
    thumbnail_lg?: string;
  };
  dimensions?: { width: number; height: number };
  fileSize: number;
  fileSizeWebp?: number;
  provider: "cloudinary" | "cloudflare" | "s3";
  providerAssetId?: string;
  altText: string;
  description: string;
  tags: string[];
  folder: string | null;
  isFavorite: boolean;
  usedIn: MediaUsageEntry[];
  usageCount: number;
  aiStatus: "pending" | "processing" | "completed" | "failed";
  aiError?: string | null;
  aiRetryCount?: number;
  userEditedFields?: string[];
  aiMetadata?: AIMetadata;
  createdAt: string;
  updatedAt: string;
  ocrText?: string;
  ocrLanguage?: string;
  ocrConfidence?: number;
}

export interface MediaUsageEntry {
  entityType: "post" | "course" | "series" | "user_avatar" | "user_background";
  entityId: string;
  field: string;
  entity?: {
    _id: string;
    title: string;
    slug: string;
    published: boolean;
  } | null;
}

export interface AIMetadata {
  altText?: string;
  description?: string;
  tags?: string[];
  generatedAt?: string;
  model?: string;
  confidence?: number;
  prompt?: string;
  negativePrompt?: string;
  editedFrom?: string;
  editOperation?: string;
  editSummary?: string;
}

export interface MediaFolder {
  _id: string;
  name: string;
  slug: string;
  parent: string | null;
  color: string;
  assetCount: number;
  children?: MediaFolder[];
  createdAt: string;
  updatedAt: string;
}

export interface MediaPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

// ─── API Payloads ───────────────────────────────────────────────

export interface BrowseMediaParams {
  page?: number;
  limit?: number;
  sort?: SortOption;
  folder?: string;
  type?: MediaAsset["type"];
  isFavorite?: boolean;
  tag?: string;
}

export interface SearchMediaParams {
  q: string;
  page?: number;
  limit?: number;
  sort?: SortOption;
}

export interface UpdateMetadataPayload {
  altText?: string;
  description?: string;
  tags?: string[];
  folder?: string | null;
  isFavorite?: boolean;
}

export interface BulkMovePayload {
  mediaIds: string[];
  folderId: string | null;
}

export interface BulkTagPayload {
  mediaIds: string[];
  tags: string[];
  operation: "add" | "remove";
}

export interface BulkFavoritePayload {
  mediaIds: string[];
  isFavorite: boolean;
}

export interface CreateFolderPayload {
  name: string;
  parent?: string | null;
  color?: string;
}

// ─── Component Props ────────────────────────────────────────────

export type ViewMode = "grid" | "list";
export type SortOption =
  | "-createdAt"
  | "createdAt"
  | "originalFilename"
  | "-fileSize"
  | "fileSize"
  | "-relevance"
  | "-recentlyUsed"
  | "-usageCount";

export type QuickFilter = "all" | "suggested" | "online" | "favorites" | "recent";

export interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaAsset) => void;
  /** Enable drag-to-editor mode */
  allowDrag?: boolean;
  /** Filter to specific media types */
  typeFilter?: MediaAsset["type"];
  /** Allow multiple selection */
  multiSelect?: boolean;
  /** Pass editor content for AI suggestions */
  editorContent?: string;
}

export interface MediaGridItemProps {
  media: MediaAsset;
  isSelected: boolean;
  onSelect: (media: MediaAsset) => void;
  onDoubleClick: (media: MediaAsset) => void;
  onContextMenu: (e: React.MouseEvent, media: MediaAsset) => void;
  onDragStart?: (e: React.DragEvent, media: MediaAsset) => void;
  viewMode: ViewMode;
}

// ─── Store State ────────────────────────────────────────────────

export interface MediaLibraryState {
  // Modal visibility
  isOpen: boolean;
  onSelectCallback: ((media: MediaAsset) => void) | null;

  // View
  viewMode: ViewMode;
  sortBy: SortOption;
  activeFilter: QuickFilter;
  currentFolder: string | null;
  searchQuery: string;

  // Selection
  selectedIds: Set<string>;
  detailMedia: MediaAsset | null;

  // Data
  media: MediaAsset[];
  folders: MediaFolder[];
  pagination: MediaPagination | null;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;

  // Actions
  open: (onSelect: (media: MediaAsset) => void) => void;
  close: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortOption) => void;
  setActiveFilter: (filter: QuickFilter) => void;
  setCurrentFolder: (folderId: string | null) => void;
  setSearchQuery: (query: string) => void;
  toggleSelect: (mediaId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setDetailMedia: (media: MediaAsset | null) => void;
  setMedia: (media: MediaAsset[]) => void;
  appendMedia: (media: MediaAsset[]) => void;
  prependMedia: (media: MediaAsset) => void;
  updateMediaItem: (id: string, updates: Partial<MediaAsset>) => void;
  removeMediaItem: (id: string) => void;
  setFolders: (folders: MediaFolder[]) => void;
  setPagination: (pagination: MediaPagination | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsUploading: (uploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
}
