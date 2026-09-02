"use client";

// =============================================================================
//  BRAND VOICE SELECTOR COMPONENT
//  src/features/ai/components/BrandVoiceSelector.tsx
//
//  Design: Beautiful purple OpenAI-like design for selecting & managing
//  reusable Brand Voice profiles before AI generation.
// =============================================================================

import React, { useState, useEffect } from "react";
import { Mic, Plus, Trash2, Check, Sparkles, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { brandVoiceApi, type BrandVoiceProfile } from "../api/brandVoice.api";
export type { BrandVoiceProfile };

export interface BrandVoiceSelectorProps {
  selectedProfile?: BrandVoiceProfile | null;
  onSelectProfile: (profile: BrandVoiceProfile) => void;
}

export const BrandVoiceSelector: React.FC<BrandVoiceSelectorProps> = ({
  selectedProfile,
  onSelectProfile,
}) => {
  const [profiles, setProfiles] = useState<BrandVoiceProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Profile Form
  const [name, setName] = useState("");
  const [tone, setTone] = useState("Friendly Senior Engineer");
  const [emoji, setEmoji] = useState<"none" | "low" | "medium" | "high">("low");
  const [language, setLanguage] = useState("Vietnamese");
  const [codeStyle, setCodeStyle] = useState("TypeScript");

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const data = await brandVoiceApi.getProfiles();
      setProfiles(data);
      if (!selectedProfile && data.length > 0) {
        onSelectProfile(data[0]);
      }
    } catch (err: any) {
      console.warn("Failed to fetch brand voice profiles:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const newProfile = await brandVoiceApi.createProfile({
        name: name.trim(),
        tone,
        emoji,
        language,
        codeStyle,
      });

      toast.success("New Brand Voice profile created!");
      setShowCreateModal(false);
      setName("");
      await fetchProfiles();
      onSelectProfile(newProfile);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create brand voice profile");
    }
  };

  const handleDeleteProfile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await brandVoiceApi.deleteProfile(id);
      toast.success("Profile deleted");
      await fetchProfiles();
    } catch (err: any) {
      toast.error("Failed to delete profile");
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-[9px] font-bold uppercase tracking-wider text-purple-300/80 flex items-center gap-1">
          <Mic className="w-2.5 h-2.5 text-purple-400" /> Brand Voice
        </label>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="text-[10px] font-semibold text-purple-300 hover:text-white flex items-center gap-0.5 transition-colors cursor-pointer"
        >
          <Plus className="w-2.5 h-2.5 text-amber-300" /> Custom
        </button>
      </div>

      {/* Select Dropdown */}
      <select
        value={selectedProfile?._id || selectedProfile?.name || ""}
        onChange={(e) => {
          const val = e.target.value;
          const found = profiles.find((p) => (p._id || p.name) === val);
          if (found) onSelectProfile(found);
        }}
        disabled={isLoading}
        className="w-full px-2.5 py-1.5 rounded-lg bg-purple-950/50 border border-purple-500/30 text-[11px] text-white focus:outline-none focus:border-purple-400 cursor-pointer"
      >
        {profiles.map((p) => (
          <option key={p._id || p.name} value={p._id || p.name}>
            {p.name} ({p.tone})
          </option>
        ))}
      </select>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fade-in_0.15s_ease-out]">
          <div className="relative w-full max-w-sm rounded-2xl border border-purple-500/40 bg-slate-950 p-5 text-white shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2.5">
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Create Brand Voice Profile
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-purple-300/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-purple-300 mb-1">
                  Profile Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Senior Educator"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-purple-500/30 text-xs text-white placeholder:text-purple-300/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-purple-300 mb-1">
                  Tone
                </label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="e.g. Friendly Senior Engineer"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-purple-500/30 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-purple-300 mb-1">
                    Emoji Usage
                  </label>
                  <select
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-purple-500/30 text-xs text-white"
                  >
                    <option value="none">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-purple-300 mb-1">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-purple-500/30 text-xs text-white"
                  >
                    <option value="Vietnamese">Vietnamese</option>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-purple-300 mb-1">
                  Code Style
                </label>
                <select
                  value={codeStyle}
                  onChange={(e) => setCodeStyle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-purple-500/30 text-xs text-white"
                >
                  <option value="TypeScript">TypeScript</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Python">Python</option>
                  <option value="Go">Go</option>
                  <option value="Rust">Rust</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-purple-300 border border-purple-500/20 rounded-lg hover:bg-purple-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="flex-1 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-md disabled:opacity-50"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
