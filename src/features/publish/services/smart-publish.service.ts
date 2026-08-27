// =============================================================================
//  SMART PUBLISH API SERVICE
//  src/features/publish/services/smart-publish.service.ts
//
//  Design Decisions:
//  - Reuses the existing `api` client from lib/api/axios for consistent auth headers.
//  - Returns strongly-typed SmartPublishResult matching backend Zod schemas.
//  - Separates API concerns from UI state (hook handles state management).
// =============================================================================

import { api } from "@/lib/api/axios";

export interface CategoryMatch {
  readonly id: string;
  readonly name: string;
  readonly confidence: number;
}

export interface CoverImageSuggestion {
  readonly url: string;
  readonly alt: string;
  readonly mediaId?: string;
  readonly provider: "local" | "pexels" | "unsplash" | "ai-generated";
  readonly previewUrl?: string;
}

export interface SEOIssue {
  readonly field: string;
  readonly severity: "error" | "warning" | "info";
  readonly message: string;
}

export interface SEOValidation {
  readonly score: number;
  readonly issues: SEOIssue[];
  readonly passed: boolean;
}

export interface TaskError {
  readonly taskName: string;
  readonly error: string;
}

export interface SmartPublishResult {
  readonly description: string | null;
  readonly tags: string[] | null;
  readonly suggestedCategory: CategoryMatch | null;
  readonly slug: string | null;
  readonly readTimeMinutes: number | null;
  readonly coverImage: CoverImageSuggestion | null;
  readonly seoValidation: SEOValidation | null;
  readonly taskErrors: TaskError[];
}

export const smartPublishApi = {
  /**
   * Triggers the Smart Publish "Fill" workflow for an article.
   */
  fill: async (articleId: string) => {
    return api.post<{ status: string; data: SmartPublishResult }>(
      "/api/smart-publish/fill",
      { articleId }
    );
  },
};
