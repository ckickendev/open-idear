// =============================================================================
//  PUBLISH BY AI — API CLIENT
//  src/features/ai/api/publisher.api.ts
//
//  Typed API client for the POST /ai/v1/publisher/generate endpoint.
//  Wraps the standard `api.post` helper — no raw fetch, no duplicated auth.
// =============================================================================

import { api } from "@/lib/api/axios";
import type { ArticleBlock } from "@/features/article/types/article.types";

// ─── Request ──────────────────────────────────────────────────────────────────

export interface PublisherRequest {
  /** The user-supplied topic. Required. */
  readonly topic: string;
  /** Target audience. Defaults to "developers" on the server. */
  readonly audience?: string;
  /** Article length target: "short" | "medium" | "long". */
  readonly length?: string;
  /** Writing goal. Defaults to "educate". */
  readonly goal?: string;
  /** Writing tone. Defaults to "informative". */
  readonly tone?: string;
  /** Content category hint. Defaults to "general". */
  readonly category?: string;
}

// ─── Response ─────────────────────────────────────────────────────────────────

export interface CoverImageResult {
  _id?: string;
  url: string;
  alt: string;
  prompt: string;
  width: number;
  height: number;
  createdByAI: boolean;
}

export interface PublisherResponse {
  /** AI-generated article title. */
  readonly title: string;
  /** URL-safe slug derived from the title. */
  readonly slug: string;
  /** SEO meta description (≤160 chars). */
  readonly description: string;
  /** Suggested category. */
  readonly category: string;
  /** Keyword tags (up to 8). */
  readonly tags: string[];
  /** Structured ArticleBlock[] ready for the editor. */
  readonly blocks: ArticleBlock[];
  /** AI generated cover image. */
  readonly coverImage?: CoverImageResult;
  /** Raw Markdown (for editor context / re-structuring). */
  readonly markdown: string;
  /** All keywords from the planner. */
  readonly keywords: string[];
  /** Estimated reading time in minutes. */
  readonly estimatedReadingTime: number;
}

// ─── Internal envelope from the backend ───────────────────────────────────────
/** The backend wraps all responses in { status, data }. */
interface PublisherEnvelope {
  status: string;
  data: PublisherResponse;
}

// ─── API Client ───────────────────────────────────────────────────────────────

export const publisherApi = {
  /**
   * Runs the full server-side Publish-by-AI pipeline:
   *   Planner → Writer → SEO → Cover Image → Validator.
   */
  generate: async (payload: PublisherRequest): Promise<PublisherResponse> => {
    const res = await api.post<PublisherEnvelope>("/ai/v1/publisher/generate", payload);
    if (!res.success) {
      throw new Error(res.message ?? "Failed to generate article");
    }
    const envelope = res.data as any;
    if (envelope?.data && envelope.data.title) {
      return envelope.data as PublisherResponse;
    }
    return res.data as unknown as PublisherResponse;
  },

  /**
   * Regenerates AI Cover Image for an article topic.
   */
  regenerateCoverImage: async (payload: { title: string; keywords?: string[]; customPrompt?: string }): Promise<CoverImageResult> => {
    const res = await api.post<{ status: string; data: CoverImageResult }>("/ai/v1/publisher/cover-image", payload);
    if (!res.success) {
      throw new Error(res.message ?? "Failed to regenerate cover image");
    }
    const envelope = res.data as any;
    if (envelope?.data && envelope.data.url) {
      return envelope.data as CoverImageResult;
    }
    return res.data as unknown as CoverImageResult;
  },

  /**
   * Runs One-Click Autonomous Publisher:
   *   Planner → Writer → SEO → Cover Image → Validator → Save MongoDB Draft.
   *   Returns { draftId, title, slug }.
   */
  oneClickPublish: async (payload: PublisherRequest): Promise<{ draftId: string; title: string; slug: string; coverImage?: CoverImageResult }> => {
    const res = await api.post<{ status: string; data: { draftId: string; title: string; slug: string; coverImage?: CoverImageResult } }>("/ai/v1/publisher/one-click", payload);
    if (!res.success) {
      throw new Error(res.message ?? "One-click publishing failed");
    }
    const envelope = res.data as any;
    if (envelope?.data && envelope.data.draftId) {
      return envelope.data;
    }
    return res.data as unknown as { draftId: string; title: string; slug: string; coverImage?: CoverImageResult };
  },
};
