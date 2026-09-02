import { api } from "@/lib/api/axios";

export interface InternalLinkRequest {
  blocks: any[];
  currentPostId?: string;
}

export interface InternalLinkResponse {
  blocks: any[];
  insertedLinksCount: number;
  insertedSlugs: string[];
}

export const internalLinkApi = {
  processInternalLinks: async (payload: InternalLinkRequest): Promise<InternalLinkResponse> => {
    const res = await api.post<{ status: string; data: InternalLinkResponse }>("/ai/v1/internal-link", payload);
    if (!res.success) {
      throw new Error(res.message || "Failed to process internal links");
    }
    const envelope = res.data as any;
    return envelope?.data || res.data;
  },
};
