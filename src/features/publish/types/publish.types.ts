import type { Category, Series, MediaAsset } from "@/features/editor/types/editor.types";

// ─── Publish State ──────────────────────────────────────────────────────────

export type PublishState =
  | "draft"
  | "publishing"
  | "published"
  | "scheduled"
  | "error";

// ─── Publish Config ─────────────────────────────────────────────────────────

export interface PublishConfig {
  postId: string;
  description: string;
  image: string | null;
  series: string;
  category: string;
}

// ─── Hook Return ────────────────────────────────────────────────────────────

export interface UsePublishPostOptions {
  postId: string | null;
  isPublished: boolean;
}

export interface UsePublishPostReturn {
  isPublishing: boolean;
  isPublished: boolean;
  canPublish: boolean;
  validationErrors: string[];
  publish: (config: PublishConfig) => Promise<boolean>;
  unpublish: () => Promise<boolean>;
}

// ─── Publish Drawer Props ───────────────────────────────────────────────────

export interface PublishDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => Promise<void>;
  /** Categories list */
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  /** Series list */
  seriesList: Series[];
  selectedSeries: string;
  onSeriesChange: (val: string) => void;
  onCreateSeries: (name: string) => void;
  /** Description */
  description: string;
  onDescriptionChange: (val: string) => void;
  /** Cover image */
  onCoverImageUploaded: (image: MediaAsset) => void;
  /** Publishing in progress */
  isPublishing?: boolean;
}
