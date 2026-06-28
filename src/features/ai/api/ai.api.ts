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
};
