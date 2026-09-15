"use client";

import React, { useState, useEffect } from "react";
import {
  Mic,
  Users,
  PenLine,
  Clock,
  Plus,
  Sparkles,
  X,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { brandVoiceApi, type BrandVoiceProfile } from "../../api/brandVoice.api";

export interface PublisherConfigGridProps {
  audience: string;
  onAudienceChange: (audience: string) => void;
  tone: string;
  onToneChange: (tone: string) => void;
  length: string;
  onLengthChange: (length: string) => void;
  brandVoice: BrandVoiceProfile | null;
  onBrandVoiceChange: (voice: BrandVoiceProfile | null) => void;
  disabled?: boolean;
}

const AUDIENCE_OPTIONS = [
  {
    value: "developers",
    label: "Developers",
    helper: "People who already have programming experience.",
  },
  {
    value: "architects",
    label: "Architects & Leads",
    helper: "System designers, tech leads, and staff engineers.",
  },
  {
    value: "beginners",
    label: "Beginners",
    helper: "Clear explanations with foundational concepts.",
  },
  {
    value: "executives",
    label: "Tech Executives",
    helper: "Strategic impact, high-level ROI, and business value.",
  },
];

const TONE_OPTIONS = [
  {
    value: "informative",
    label: "Informative",
    helper: "Balanced, factual, structured, and insightful.",
  },
  {
    value: "authoritative",
    label: "Authoritative",
    helper: "Direct, confident, industry-expert perspective.",
  },
  {
    value: "conversational",
    label: "Conversational",
    helper: "Engaging, approachable, and story-driven.",
  },
  {
    value: "tutorial",
    label: "Hands-on Tutorial",
    helper: "Actionable, step-by-step walkthrough with code.",
  },
];

const LENGTH_OPTIONS = [
  {
    value: "short",
    label: "Short (~800 words)",
    helper: "3 min quick read, focused on a single key takeaway.",
  },
  {
    value: "medium",
    label: "Medium (~1,500 words)",
    helper: "6 min standard technical guide with code examples.",
  },
  {
    value: "long",
    label: "Long (~2,500+ words)",
    helper: "10 min comprehensive deep dive with architecture analysis.",
  },
];

export const PublisherConfigGrid: React.FC<PublisherConfigGridProps> = ({
  audience,
  onAudienceChange,
  tone,
  onToneChange,
  length,
  onLengthChange,
  brandVoice,
  onBrandVoiceChange,
  disabled = false,
}) => {
  const [profiles, setProfiles] = useState<BrandVoiceProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // New Voice Profile State
  const [newVoiceName, setNewVoiceName] = useState("");
  const [newVoiceTone, setNewVoiceTone] = useState("Friendly Senior Engineer");
  const [newVoiceEmoji, setNewVoiceEmoji] = useState<"none" | "low" | "medium" | "high">("low");
  const [newVoiceLanguage, setNewVoiceLanguage] = useState("Vietnamese");
  const [newVoiceCodeStyle, setNewVoiceCodeStyle] = useState("TypeScript");
  const [creatingVoice, setCreatingVoice] = useState(false);

  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const data = await brandVoiceApi.getProfiles();
      setProfiles(data || []);
      if (!brandVoice && data && data.length > 0) {
        onBrandVoiceChange(data[0]);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateVoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoiceName.trim() || creatingVoice) return;

    setCreatingVoice(true);
    try {
      const created = await brandVoiceApi.createProfile({
        name: newVoiceName.trim(),
        tone: newVoiceTone,
        emoji: newVoiceEmoji,
        language: newVoiceLanguage,
        codeStyle: newVoiceCodeStyle,
      });

      toast.success("Brand Voice profile created!");
      setShowVoiceModal(false);
      setNewVoiceName("");
      await fetchProfiles();
      onBrandVoiceChange(created);
      if (created.tone) onToneChange(created.tone);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create brand voice profile");
    } finally {
      setCreatingVoice(false);
    }
  };

  const selectedAudienceHelper =
    AUDIENCE_OPTIONS.find((a) => a.value === audience)?.helper || "";
  const selectedToneHelper =
    TONE_OPTIONS.find((t) => t.value === tone)?.helper || "";
  const selectedLengthHelper =
    LENGTH_OPTIONS.find((l) => l.value === length)?.helper || "";

  return (
    <div className="space-y-2">
      <span className="text-[11px] font-medium text-muted-foreground block">
        AI Configuration
      </span>

      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* 1. Brand Voice */}
        <div className="p-3 rounded-[16px] bg-muted/20 dark:bg-zinc-900/40 border border-border/70 hover:border-border transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="config-brand-voice"
                className="text-[11px] font-semibold text-foreground flex items-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5 text-violet-500" />
                <span>Brand Voice</span>
              </label>
              <button
                type="button"
                onClick={() => setShowVoiceModal(true)}
                disabled={disabled}
                className="text-[10px] font-medium text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-2.5 h-2.5" /> New
              </button>
            </div>

            <div className="relative">
              <select
                id="config-brand-voice"
                value={brandVoice?._id || brandVoice?.name || "default"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "default") {
                    onBrandVoiceChange(null);
                  } else {
                    const found = profiles.find((p) => (p._id || p.name) === val);
                    if (found) {
                      onBrandVoiceChange(found);
                      if (found.tone) onToneChange(found.tone);
                    }
                  }
                }}
                disabled={disabled || loadingProfiles}
                className="w-full appearance-none bg-background border border-border/80 rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-foreground focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 cursor-pointer disabled:cursor-not-allowed"
              >
                <option value="default">Neutral Editorial Voice</option>
                {profiles.map((p) => (
                  <option key={p._id || p.name} value={p._id || p.name}>
                    {p.name} ({p.tone || "Custom"})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground leading-tight mt-2 truncate">
            {brandVoice
              ? `${brandVoice.tone} · ${brandVoice.language || "Vietnamese"}`
              : "Neutral editorial style without personalized phrasing."}
          </p>
        </div>

        {/* 2. Audience */}
        <div className="p-3 rounded-[16px] bg-muted/20 dark:bg-zinc-900/40 border border-border/70 hover:border-border transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="config-audience"
                className="text-[11px] font-semibold text-foreground flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-violet-500" />
                <span>Audience</span>
              </label>
            </div>

            <div className="relative">
              <select
                id="config-audience"
                value={audience}
                onChange={(e) => onAudienceChange(e.target.value)}
                disabled={disabled}
                className="w-full appearance-none bg-background border border-border/80 rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-foreground focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 cursor-pointer disabled:cursor-not-allowed"
              >
                {AUDIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground leading-tight mt-2 truncate">
            {selectedAudienceHelper}
          </p>
        </div>

        {/* 3. Tone */}
        <div className="p-3 rounded-[16px] bg-muted/20 dark:bg-zinc-900/40 border border-border/70 hover:border-border transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="config-tone"
                className="text-[11px] font-semibold text-foreground flex items-center gap-1.5"
              >
                <PenLine className="w-3.5 h-3.5 text-violet-500" />
                <span>Tone of Voice</span>
              </label>
            </div>

            <div className="relative">
              <select
                id="config-tone"
                value={tone}
                onChange={(e) => onToneChange(e.target.value)}
                disabled={disabled}
                className="w-full appearance-none bg-background border border-border/80 rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-foreground focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 cursor-pointer disabled:cursor-not-allowed"
              >
                {TONE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground leading-tight mt-2 truncate">
            {selectedToneHelper}
          </p>
        </div>

        {/* 4. Target Length */}
        <div className="p-3 rounded-[16px] bg-muted/20 dark:bg-zinc-900/40 border border-border/70 hover:border-border transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="config-length"
                className="text-[11px] font-semibold text-foreground flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-violet-500" />
                <span>Article Length</span>
              </label>
            </div>

            <div className="relative">
              <select
                id="config-length"
                value={length}
                onChange={(e) => onLengthChange(e.target.value)}
                disabled={disabled}
                className="w-full appearance-none bg-background border border-border/80 rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-foreground focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 cursor-pointer disabled:cursor-not-allowed"
              >
                {LENGTH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground leading-tight mt-2 truncate">
            {selectedLengthHelper}
          </p>
        </div>
      </div>

      {/* Brand Voice Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-5 text-foreground shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" /> Create Brand Voice Profile
              </h3>
              <button
                type="button"
                onClick={() => setShowVoiceModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVoice} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Profile Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={newVoiceName}
                  onChange={(e) => setNewVoiceName(e.target.value)}
                  placeholder="e.g. Senior Educator"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Tone Style
                </label>
                <input
                  type="text"
                  value={newVoiceTone}
                  onChange={(e) => setNewVoiceTone(e.target.value)}
                  placeholder="e.g. Friendly Senior Engineer"
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    Language
                  </label>
                  <select
                    value={newVoiceLanguage}
                    onChange={(e) => setNewVoiceLanguage(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-muted/40 border border-border text-xs text-foreground"
                  >
                    <option value="Vietnamese">Vietnamese</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    Code Preference
                  </label>
                  <select
                    value={newVoiceCodeStyle}
                    onChange={(e) => setNewVoiceCodeStyle(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-muted/40 border border-border text-xs text-foreground"
                  >
                    <option value="TypeScript">TypeScript</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Go">Go</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVoiceModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-muted-foreground border border-border rounded-xl hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newVoiceName.trim() || creatingVoice}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {creatingVoice ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
