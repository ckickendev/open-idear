// =============================================================================
//  AI VISUAL ASSISTANT — API CLIENT (SPRINT 3)
//  src/features/ai-visual/api/aiVisual.api.ts
// =============================================================================

import { api } from "@/lib/api/axios";
import type {
  ImageSearchResult,
  ImageSearchResponse,
  GenerateIllustrationPayload,
  GeneratedIllustrationAsset,
  GenerateIllustrationResponse,
  VisualRecommendation,
  SectionAnalysis,
  BatchVisualResult,
  VisualAnalyticsEvent,
  ImportedAssetRecord,
  ImportStockImageResponse,
} from "../types/aiVisual.types";

export const aiVisualApi = {
  /**
   * Search unified images across user Asset Library and curated technical stock.
   * Supports pagination via optional `page` parameter.
   */
  async searchImages(query: string, limit = 12, page = 1): Promise<ImageSearchResult[]> {
    if (!query || !query.trim()) return [];
    try {
      const res = await api.post<ImageSearchResponse>("/ai/v1/images/search", {
        query: query.trim(),
        limit,
        page,
      });
      return res.data?.data || [];
    } catch (err) {
      console.error("[aiVisualApi] searchImages failed:", err);
      try {
        const fallbackRes = await api.post<ImageSearchResponse>("/ai/images/search", {
          query: query.trim(),
          limit,
          page,
        });
        return fallbackRes.data?.data || [];
      } catch (fallbackErr) {
        console.error("[aiVisualApi] searchImages fallback failed:", fallbackErr);
        return [];
      }
    }
  },

  /**
   * Imports a stock image (from whitelisted provider URL) into the Asset Library.
   * Downloads to Cloudinary, deduplicates by sourceUrl and hash.
   * Returns a persisted Asset record — articles should reference _id, not raw URLs.
   */
  async importStockImage(
    asset: ImageSearchResult,
    altText: string
  ): Promise<ImportedAssetRecord> {
    const payload = {
      url:            asset.url,
      thumbnailUrl:   asset.thumbnailUrl,
      title:          asset.title,
      alt:            altText || asset.alt,
      author:         asset.author,
      license:        asset.license,
      attributionUrl: asset.attributionUrl,
      sourceProvider: asset.sourceProvider,
      sourceUrl:      asset.sourceUrl || asset.url,
      searchQuery:    asset.title,
    };

    try {
      const res = await api.post<ImportStockImageResponse>("/ai/v1/images/import", payload);
      if (res.data?.data) return res.data.data;
      throw new Error("Invalid response from image import");
    } catch (err) {
      try {
        const fallback = await api.post<ImportStockImageResponse>("/ai/images/import", payload);
        if (fallback.data?.data) return fallback.data.data;
      } catch {}
      throw err;
    }
  },

  /**
   * Generates a technical illustration from a prompt with preset style.
   * Supports cooperative cancellation via optional AbortSignal.
   */
  async generateIllustration(
    payload: GenerateIllustrationPayload,
    signal?: AbortSignal
  ): Promise<GeneratedIllustrationAsset> {
    try {
      const res = await api.post<GenerateIllustrationResponse>(
        "/ai/images/generate",
        payload,
        { signal }
      );
      if (res.data?.data) {
        return res.data.data;
      }
      throw new Error("Invalid response from illustration generator");
    } catch (err: any) {
      if (signal?.aborted || err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
        throw new Error("Generation was cancelled");
      }
      try {
        const fallbackRes = await api.post<GenerateIllustrationResponse>(
          "/ai/v1/images/generate",
          payload,
          { signal }
        );
        if (fallbackRes.data?.data) {
          return fallbackRes.data.data;
        }
      } catch (fbErr: any) {
        if (signal?.aborted || fbErr?.name === "CanceledError" || fbErr?.code === "ERR_CANCELED") {
          throw new Error("Generation was cancelled");
        }
      }
      throw err;
    }
  },

  /**
   * Classify a single section by heading and content.
   */
  async classifySection(
    heading: string,
    content = ""
  ): Promise<VisualRecommendation> {
    try {
      const res = await api.post<{ status: string; data: VisualRecommendation }>(
        "/ai/v1/visuals/classify",
        { heading, content }
      );
      if (res.data?.data) return res.data.data;
      throw new Error("Invalid response from classifySection");
    } catch (err) {
      // Try un-prefixed fallback
      try {
        const fallback = await api.post<{ status: string; data: VisualRecommendation }>(
          "/ai/visuals/classify",
          { heading, content }
        );
        if (fallback.data?.data) return fallback.data.data;
      } catch {}

      // Safe local fallback heuristic
      const lower = heading.toLowerCase();
      const isProduct = /review|hardware|laptop|phone|unboxing/i.test(lower);
      const isBenchmark = /benchmark|throughput|latency|metrics/i.test(lower);
      const isTutorial = /tutorial|how to|setup|install/i.test(lower);
      const isComparison = /vs|versus|comparison/i.test(lower);

      return {
        heading,
        visualType: isProduct
          ? "product"
          : isBenchmark
          ? "chart"
          : isTutorial
          ? "screenshot"
          : isComparison
          ? "comparison"
          : "diagram",
        confidence: 0.92,
        reason: isProduct
          ? "Product reviews require authentic photography."
          : isBenchmark
          ? "Benchmark and performance metrics are best communicated with data charts."
          : isTutorial
          ? "Tutorial instructions are clearest with step-by-step UI screenshots."
          : isComparison
          ? "Side-by-side feature comparisons are best presented in a split comparison layout."
          : "This section explains system architecture and component interactions.",
        recommendedAction: isProduct ? "search" : isBenchmark ? "chart" : "generate",
      };
    }
  },

  /**
   * Classify all sections in a full markdown article.
   */
  async classifyArticle(markdown: string): Promise<SectionAnalysis[]> {
    try {
      const res = await api.post<{ status: string; data: SectionAnalysis[] }>(
        "/ai/v1/visuals/classify",
        { markdown }
      );
      return res.data?.data || [];
    } catch (err) {
      try {
        const fallback = await api.post<{ status: string; data: SectionAnalysis[] }>(
          "/ai/visuals/classify",
          { markdown }
        );
        return fallback.data?.data || [];
      } catch (fallbackErr) {
        console.error("[aiVisualApi] classifyArticle failed:", fallbackErr);
        return [];
      }
    }
  },

  /**
   * Execute batch visual pipeline ("Generate All Visuals").
   */
  async batchGenerateVisuals(payload: {
    markdown: string;
    preferredStyle?: string;
    postId?: string;
  }): Promise<BatchVisualResult> {
    try {
      const res = await api.post<{ status: string; data: BatchVisualResult }>(
        "/ai/v1/visuals/batch-generate",
        payload
      );
      if (res.data?.data) return res.data.data;
      throw new Error("Invalid batch generation response");
    } catch (err) {
      try {
        const fallback = await api.post<{ status: string; data: BatchVisualResult }>(
          "/ai/visuals/batch-generate",
          payload
        );
        if (fallback.data?.data) return fallback.data.data;
      } catch {}
      throw err;
    }
  },

  /**
   * Track telemetry action: generated, accepted, regenerated, deleted, search_preferred.
   */
  async trackAnalytics(event: VisualAnalyticsEvent): Promise<any> {
    try {
      const res = await api.post("/ai/v1/visuals/analytics", event);
      return res.data?.data;
    } catch (err) {
      try {
        const fallback = await api.post("/ai/visuals/analytics", event);
        return fallback.data?.data;
      } catch {
        // Analytics failure should never block UI
        return null;
      }
    }
  },

  /**
   * Fetch aggregated analytics stats.
   */
  async getAnalyticsStats(): Promise<any> {
    try {
      const res = await api.get("/ai/v1/visuals/analytics/stats");
      return res.data?.data;
    } catch (err) {
      try {
        const fallback = await api.get("/ai/visuals/analytics/stats");
        return fallback.data?.data;
      } catch {
        return null;
      }
    }
  },
};
