// =============================================================================
//  FRONTEND AI FEATURE REGISTRY — TYPE DEFINITIONS
//  src/features/ai/types/aiFeature.types.ts
//
//  Mirrors backend AI Feature Registry definitions for end-to-end type safety.
//  No membership, no billing, no credit deduction logic.
// =============================================================================

export const AI_FEATURE_CATEGORIES = [
  "authoring",
  "editing",
  "growth",
  "publishing",
  "research",
  "media",
] as const;

export type AIFeatureCategory = (typeof AI_FEATURE_CATEGORIES)[number];

export const AI_FEATURE_IDS = [
  // ── Core Requested Features ────────────────────────────────────────────────
  "rewrite",
  "improve_tone",
  "summarize",
  "faq_generation",
  "comparison_generation",
  "seo_outline",
  "research_topic",
  "publish_by_ai",

  // ── Authoring & Core Workflows ─────────────────────────────────────────────
  "article_writer",
  "article_writer_stream",
  "content_structure",

  // ── Editor / Copilot Actions ───────────────────────────────────────────────
  "continue",
  "improve",
  "example",
  "review",
  "shorten",
  "expand",

  // ── Growth Tasks ───────────────────────────────────────────────────────────
  "internal_links",
  "social_post",
  "affiliate",
  "content_gap",

  // ── Publishing Tasks ───────────────────────────────────────────────────────
  "publish_metadata",
  "publish_review",
  "publish_seo",
  "publish_category",
  "publisher_cover_image",

  // ── Media & Visuals ────────────────────────────────────────────────────────
  "image_generation",
  "image_editing",
  "diagram_generation",
  "content_enhancement",
  "image_enhancement",
] as const;

export type AIFeatureId = (typeof AI_FEATURE_IDS)[number];

export interface AIFeatureDefinition<TId extends AIFeatureId = AIFeatureId> {
  readonly id: TId;
  readonly name: string;
  readonly description: string;
  readonly category: AIFeatureCategory;
  /** Estimated credit cost (strictly placeholder only, no deductions or billing) */
  readonly estimatedCreditCost: number;
  readonly telemetryKey: string;
  readonly endpoint?: string;
  readonly defaultModel?: "fast" | "quality" | string;
  readonly tags?: readonly string[];
}
