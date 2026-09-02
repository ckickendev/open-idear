import { api } from "@/lib/api/axios";

export interface BrandVoiceProfile {
  _id?: string;
  name: string;
  tone: string;
  emoji: "none" | "low" | "medium" | "high";
  language: string;
  codeStyle: string;
  isDefault?: boolean;
}

export const brandVoiceApi = {
  getProfiles: async (): Promise<BrandVoiceProfile[]> => {
    const res = await api.get<{ status: string; data: BrandVoiceProfile[] }>("/ai/v1/brand-voice");
    if (!res.success) throw new Error(res.message || "Failed to fetch brand voice profiles");
    const envelope = res.data as any;
    return envelope?.data || res.data || [];
  },

  createProfile: async (data: Partial<BrandVoiceProfile>): Promise<BrandVoiceProfile> => {
    const res = await api.post<{ status: string; data: BrandVoiceProfile }>("/ai/v1/brand-voice", data);
    if (!res.success) throw new Error(res.message || "Failed to create brand voice profile");
    const envelope = res.data as any;
    return envelope?.data || res.data;
  },

  deleteProfile: async (id: string): Promise<boolean> => {
    const res = await api.delete<{ status: string; data: { deleted: boolean } }>(`/ai/v1/brand-voice/${id}`);
    return res.success;
  },
};
