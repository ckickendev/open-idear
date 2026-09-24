// =============================================================================
//  AI VISUAL ASSISTANT — TYPES (SPRINT 3 UPGRADE)
//  src/features/ai-visual/types/aiVisual.types.ts
// =============================================================================

export interface ImageSuggestion {
  readonly heading: string;
  readonly searchQuery: string;
  readonly imagePrompt: string;
  readonly alt: string;
  readonly position?: number | string;
}

export type ImageSourceType = "asset_library" | "stock" | "upload" | "ai_generated";

export type IllustrationPreset =
  | "isometric"
  | "blueprint"
  | "flat_vector"
  | "3d_technical"
  | "technical-isometric"
  | "flat-vector"
  | "3d-technical";

export type VisualDecisionType =
  | "SEARCH_IMAGE"
  | "GENERATE_IMAGE"
  | "DIAGRAM"
  | "SCREENSHOT"
  | "CHART"
  | "CODE_VISUAL"
  | "NO_VISUAL";

export type VisualType =
  | "diagram"
  | "illustration"
  | "screenshot"
  | "product"
  | "comparison"
  | "chart"
  | "code"
  | "none"
  | VisualDecisionType;

export interface VisualSuggestion {
  readonly id: string;
  readonly target: string;
  readonly position: string;
  readonly visualType: VisualType;
  readonly searchQuery: string;
  readonly imagePrompt: string;
  readonly altText: string;
  readonly reason: string;
  readonly confidence: number;
}

export type RecommendedAction =
  | "search"
  | "generate"
  | "diagram"
  | "chart"
  | "screenshot"
  | "comparison"
  | "code"
  | "none";

export interface VisualRecommendation {
  heading: string;
  visualType: VisualType;
  recommendation?: VisualDecisionType;
  confidence: number;
  reason: string;
  recommendedAction: RecommendedAction;
  suggestedPrompt?: string;
  suggestedSearchQuery?: string;
  suggestedPreset?: IllustrationPreset;
  searchQuery?: string;
  imagePrompt?: string;
}

export interface SectionAnalysis {
  heading: string;
  level: number;
  content: string;
  isCompleted: boolean;
  existingImageUrls: string[];
  recommendation: VisualRecommendation;
}

export interface BatchVisualItemResult {
  heading: string;
  visualType: VisualType;
  recommendation?: VisualDecisionType;
  action: "searched" | "generated" | "skipped";
  imageUrl?: string;
  reason: string;
  isReused?: boolean;
}

export interface BatchVisualResult {
  total: number;
  searched: number;
  generated: number;
  skipped: number;
  items: BatchVisualItemResult[];
  updatedMarkdown: string;
  summaryMessage: string;
}

export type VisualAnalyticsAction =
  | "visual_suggestion_created"
  | "visual_search_started"
  | "visual_search_selected"
  | "visual_generation_started"
  | "visual_generation_accepted"
  | "visual_generation_rejected"
  | "visual_generation_regenerated"
  | "visual_suggestion_dismissed"
  | "generated"
  | "accepted"
  | "regenerated"
  | "deleted"
  | "search_preferred";

export interface VisualAnalyticsEvent {
  heading?: string;
  visualType?: string;
  recommendedAction?: string;
  actionTaken: VisualAnalyticsAction;
  preset?: string;
  prompt?: string;
  confidence?: number;
  postId?: string;
  metadata?: Record<string, any>;
}

export interface ImageSearchResult {
  readonly id: string;
  readonly url: string;
  readonly thumbnailUrl: string;
  readonly title: string;
  readonly alt: string;
  readonly source: ImageSourceType;
  readonly prompt?:         string;
  readonly width?:          number;
  readonly height?:         number;
  readonly tags?:           string[];
  // ─── Provider Safety (Sprint 2) ──────────────────────────────────────────
  /** Photographer or creator name from the source provider. */
  readonly author?:         string;
  /**
   * License identifier: "unsplash" | "pexels" | "cc0".
   * Do NOT present as "free to use" unless explicitly supplied.
   */
  readonly license?:        string;
  /** Attribution URL back to the original source page. */
  readonly attributionUrl?: string;
  /** Provider slug, e.g. "unsplash" | "pexels". */
  readonly sourceProvider?: string;
  /** Original provider asset page URL (for dedup & attribution). */
  readonly sourceUrl?:      string;
}

export interface ImageSearchResponse {
  readonly status: string;
  readonly query: string;
  readonly page?: number;
  readonly total: number;
  readonly data: ImageSearchResult[];
}

export interface ImageSearchOptions {
  readonly query: string;
  readonly limit?: number;
  readonly page?: number;
}

export interface ImagePlaceholderAttributes {
  heading: string;
  searchQuery: string;
  imagePrompt: string;
  alt: string;
  position?: number | string;
  visualType?: VisualType;
  confidence?: number;
  reason?: string;
  recommendedAction?: RecommendedAction;
}

export interface GenerateIllustrationPayload {
  prompt: string;
  style?: IllustrationPreset | string;
  aspectRatio?: string;
  seed?: number;
  suggestionId?: string;
  force?: boolean;
}

export interface GeneratedIllustrationAsset {
  _id: string;
  url: string;
  thumbnailUrl: string;
  prompt: string;
  style?: string;
  model?: string;
  seed?: number;
  type: "ai";
  createdBy?: string;
  alt?: string;
  isReused?: boolean;
  width?: number;
  height?: number;
}

export interface GenerateIllustrationResponse {
  status: string;
  data: GeneratedIllustrationAsset;
}

/**
 * The imported asset record returned by POST /ai/images/import.
 * Articles should reference this _id rather than raw external URLs.
 */
export interface ImportedAssetRecord {
  readonly _id: string;
  readonly url: string;
  readonly thumbnailUrl: string;
  readonly alt: string;
  readonly source: string;
  readonly sourceProvider?: string;
  readonly sourceUrl?:      string;
  readonly author?:         string;
  readonly license?:        string;
  readonly attributionUrl?: string;
  /** True if the asset already existed (dedup returned an existing record). */
  readonly isExisting?: boolean;
}

export interface ImportStockImageResponse {
  readonly status: string;
  readonly isExisting: boolean;
  readonly data: ImportedAssetRecord;
}
