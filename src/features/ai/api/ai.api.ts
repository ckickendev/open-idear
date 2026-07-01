import { ENV } from "@/api/const";
import { getToken } from "@/lib/api/axios";
import { api } from "@/lib/api/axios";

export interface PlannerRequest {
  readonly topic: string;
  readonly audience: string;
  readonly goal: string;
  readonly tone: string;
  readonly length: string;
  readonly category: string;
  readonly language?: string;
  readonly userPreference?: string;
}

export interface OutlineItem {
  readonly title: string;
  readonly description: string;
  readonly level: number;
}

export interface PlannerResponse {
  readonly title: string;
  readonly difficulty: "beginner" | "intermediate" | "advanced";
  readonly estimatedReadingTime: number;
  readonly keywords: string[];
  readonly outline: OutlineItem[];
}

export interface WriterResponse {
  readonly markdown: string;
  readonly wordCount: number;
  readonly estimatedReadingTime: number;
}

// ─── Image Generation Types ───────────────────────────────────────────────────

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export type ImageStyle =
  | "photorealistic"
  | "digital-art"
  | "illustration"
  | "sketch"
  | "cinematic"
  | "minimalist";

export interface ImageGenerationRequest {
  readonly prompt: string;
  readonly negativePrompt?: string;
  readonly aspectRatio?: AspectRatio;
  readonly style?: ImageStyle;
  readonly count?: number;
  readonly providerId?: string;
  readonly folderId?: string;
}

export interface ImageProviderMeta {
  readonly id: string;
  readonly displayName: string;
  readonly available: boolean;
  readonly active: boolean;
}

export interface ImageGenerationResponse {
  readonly assets: any[]; // MediaAsset documents
  readonly providerId: string;
  readonly revisedPrompts: (string | undefined)[];
  readonly count: number;
}

// ─── API Client ───────────────────────────────────────────────────────────────

export const aiApi = {
  /**
   * Triggers the article outline planning workflow.
   */
  runPlanner: (payload: PlannerRequest) => {
    return api.post<PlannerResponse>("/ai/v1/planner", payload);
  },

  /**
   * Triggers the article writing workflow with raw SSE stream chunks.
   * Returns a promise resolving to the readable stream.
   */
  runWriterStream: async (
    payload: { plan: PlannerResponse; additionalInstructions?: string; language?: string; userPreference?: string },
    signal?: AbortSignal
  ): Promise<ReadableStream<Uint8Array>> => {
    const token = getToken();
    const response = await fetch(`${ENV.ROOT_API || "http://localhost:5001"}/ai/v1/writer/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.error || "Failed to initiate writing stream");
    }

    if (!response.body) {
      throw new Error("No response body received from stream");
    }

    return response.body;
  },

  /**
   * Generate 1–4 AI images and save them directly to the Media Library.
   */
  generateImage: (payload: ImageGenerationRequest) => {
    return api.post<ImageGenerationResponse>("/ai/v1/image/generate", payload);
  },

  /**
   * Returns all registered image generation providers with availability status.
   */
  getImageProviders: () => {
    return api.get<{ providers: ImageProviderMeta[] }>("/ai/v1/image/providers");
  },

  /**
   * Edit an existing Media Library image and save as a NEW asset.
   * Never overwrites the original.
   */
  editImage: (payload: ImageEditRequest) => {
    return api.post<ImageEditResponse>("/ai/v1/image/edit", payload);
  },
};

// ─── Image Editing Types ──────────────────────────────────────────────────────

export type EditOperation =
  | "remove-background"
  | "upscale"
  | "crop"
  | "expand"
  | "replace-object"
  | "change-style";

export type UpscaleFactor = 2 | 4;
export type ExpandDirection = "top" | "right" | "bottom" | "left" | "all";
export type ChangeStylePreset =
  | "oil-painting"
  | "watercolor"
  | "anime"
  | "sketch"
  | "pixel-art"
  | "3d-render"
  | "vintage-photo"
  | "neon-cyberpunk";

export type ImageEditRequest =
  | { sourceMediaId: string; operation: "remove-background" }
  | { sourceMediaId: string; operation: "upscale"; factor: UpscaleFactor }
  | { sourceMediaId: string; operation: "crop"; left: number; top: number; width: number; height: number }
  | { sourceMediaId: string; operation: "expand"; direction: ExpandDirection; fillPrompt?: string; pixels?: number }
  | { sourceMediaId: string; operation: "replace-object"; targetDescription: string; replacementDescription: string }
  | { sourceMediaId: string; operation: "change-style"; preset: ChangeStylePreset; customPrompt?: string };

export interface ImageEditResponse {
  readonly asset: any; // MediaAsset document
  readonly operation: EditOperation;
  readonly summary: string;
  readonly sourceMediaId: string;
}

