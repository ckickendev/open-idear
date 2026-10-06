// =============================================================================
//  AI CONTENT STUDIO — API CLIENT
//  src/features/content-studio/api/contentStudio.api.ts
// =============================================================================

import { api } from "@/lib/api/axios";
import type {
  GenerateIdeasRequest,
  GenerateIdeasResponse,
  GenerateBriefRequest,
  GenerateBriefResponse,
  ContentIdea,
  ContentBrief,
} from "../types/contentStudio.types";

export const contentStudioApi = {
  /**
   * Generates structured, content-aware content ideas for a given topic and content goal.
   * Leverages backend `/ai/v1/content-studio/ideas` with automatic fallback to `/api/ai/content-studio/ideas`.
   */
  async generateIdeas(
    payload: GenerateIdeasRequest
  ): Promise<{
    ideas: ContentIdea[];
    intelligence?: import("../types/contentStudio.types").ContentIntelligence;
  }> {
    try {
      // 1. Primary: Direct backend route
      const res = await api.post<GenerateIdeasResponse>(
        "/ai/v1/content-studio/ideas",
        payload
      );

      if (res.success && res.data?.ideas && res.data.ideas.length > 0) {
        return {
          ideas: res.data.ideas,
          intelligence: res.data.intelligence,
        };
      }
    } catch (primaryErr) {
      console.warn(
        "[contentStudioApi] /ai/v1/content-studio/ideas failed, falling back to /api/ai/content-studio/ideas:",
        primaryErr
      );
    }

    // 2. Fallback: Internal Next.js App Router route
    const fallbackRes = await api.post<GenerateIdeasResponse>(
      "/api/ai/content-studio/ideas",
      payload
    );

    if (fallbackRes.success && fallbackRes.data?.ideas) {
      return {
        ideas: fallbackRes.data.ideas,
        intelligence: fallbackRes.data.intelligence,
      };
    }

    throw new Error(
      fallbackRes.message ||
        "We couldn't generate ideas right now. Please try again."
    );
  },

  /**
   * Directly inspects OpenIdear content inventory and gap analysis for a topic.
   */
  async getContentIntelligence(
    topic: string
  ): Promise<import("../types/contentStudio.types").ContentIntelligence | null> {
    try {
      const res = await api.post<{ intelligence: import("../types/contentStudio.types").ContentIntelligence }>(
        "/ai/v1/content-studio/intelligence",
        { topic }
      );
      if (res.success && res.data?.intelligence) {
        return res.data.intelligence;
      }
    } catch {
      // proceed to fallback
    }

    try {
      const fallbackRes = await api.post<{ intelligence: import("../types/contentStudio.types").ContentIntelligence }>(
        "/api/ai/content-studio/intelligence",
        { topic }
      );
      if (fallbackRes.success && fallbackRes.data?.intelligence) {
        return fallbackRes.data.intelligence;
      }
    } catch {
      // silent fallback
    }

    return null;
  },

  /**
   * Generates a structured Content Brief for a selected idea.
   * Leverages backend `/ai/v1/content-studio/brief` with automatic fallback to `/api/ai/content-studio/brief`.
   */
  async generateBrief(
    payload: GenerateBriefRequest
  ): Promise<ContentBrief> {
    try {
      // 1. Primary: Direct backend route
      const res = await api.post<GenerateBriefResponse>(
        "/ai/v1/content-studio/brief",
        payload
      );

      if (res.success && res.data?.brief) {
        return res.data.brief;
      }
    } catch (primaryErr) {
      console.warn(
        "[contentStudioApi] /ai/v1/content-studio/brief failed, falling back to /api/ai/content-studio/brief:",
        primaryErr
      );
    }

    // 2. Fallback: Internal Next.js App Router route
    const fallbackRes = await api.post<GenerateBriefResponse>(
      "/api/ai/content-studio/brief",
      payload
    );

    if (fallbackRes.success && fallbackRes.data?.brief) {
      return fallbackRes.data.brief;
    }

    throw new Error(
      fallbackRes.message ||
        "We couldn't generate a content brief right now. Please try again."
    );
  },

  /**
   * Generates a structured Content Outline from an idea and brief.
   * Leverages backend `/ai/v1/content-studio/outline` with automatic fallback to `/api/ai/content-studio/outline`.
   */
  async generateOutline(
    payload: {
      idea: ContentIdea;
      contentBrief: ContentBrief;
    }
  ): Promise<import("../types/contentStudio.types").ContentOutline> {
    try {
      // 1. Primary: Direct backend route
      const res = await api.post<{ outline: import("../types/contentStudio.types").ContentOutline }>(
        "/ai/v1/content-studio/outline",
        payload
      );

      if (res.success && res.data?.outline) {
        return res.data.outline;
      }
    } catch (primaryErr) {
      console.warn(
        "[contentStudioApi] /ai/v1/content-studio/outline failed, falling back to /api/ai/content-studio/outline:",
        primaryErr
      );
    }

    // 2. Fallback: Internal Next.js App Router route
    const fallbackRes = await api.post<{ outline: import("../types/contentStudio.types").ContentOutline }>(
      "/api/ai/content-studio/outline",
      payload
    );

    if (fallbackRes.success && fallbackRes.data?.outline) {
      return fallbackRes.data.outline;
    }

    throw new Error(
      fallbackRes.message ||
        "We couldn't generate a content outline right now. Please try again."
    );
  },
};

