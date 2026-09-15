"use client";

// =============================================================================
//  ONE CLICK AI PUBLISHER MODAL — SPRINT 5
//  src/features/ai/components/OneClickPublisherModal.tsx
//
//  Autonomous One-Click publishing modal:
//    User inputs Topic → clicks "Generate & Save Draft"
//    Progressive loading displays real-time steps:
//      - Generating outline...
//      - Writing article...
//      - Optimizing SEO...
//      - Creating cover...
//      - Saving draft...
//      - Done.
//    Returns Draft ID → Redirects to /create?id={draftId} automatically!
// =============================================================================

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Sparkles,
  Rocket,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { publisherApi } from "../api/publisher.api";

export interface OneClickPublisherModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export const OneClickPublisherModal: React.FC<OneClickPublisherModalProps> = ({
  isOpen,
  onClose,
  initialTopic = "",
}) => {
  const router = useRouter();
  const [topic, setTopic] = useState(initialTopic);
  const [audience, setAudience] = useState("developers");
  const [tone, setTone] = useState("informative");
  const [length, setLength] = useState("medium");

  const [isPublishing, setIsPublishing] = useState(false);
  const [progressiveMsg, setProgressiveMsg] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOneClickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isPublishing) return;

    setIsPublishing(true);
    setErrorMessage(null);

    try {
      // Progressive status updates matching exact spec
      setProgressiveMsg("Generating outline...");
      await new Promise((r) => setTimeout(r, 400));

      setProgressiveMsg("Writing article...");
      await new Promise((r) => setTimeout(r, 400));

      setProgressiveMsg("Optimizing SEO...");
      await new Promise((r) => setTimeout(r, 300));

      setProgressiveMsg("Creating cover...");
      await new Promise((r) => setTimeout(r, 300));

      setProgressiveMsg("Saving draft...");

      const result = await publisherApi.oneClickPublish({
        topic: topic.trim(),
        audience,
        tone,
        length,
      });

      setProgressiveMsg("Done.");
      toast.success("Draft created in MongoDB! Redirecting to editor...");

      // Automatically redirect to /create?id={draftId}
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = `/create?id=${result.draftId}`;
        } else {
          router.push(`/create?id=${result.draftId}`);
        }
      }, 500);
    } catch (err: any) {
      setErrorMessage(err?.message || "One-click autonomous publishing failed.");
      setIsPublishing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-[fade-in_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-purple-500/30 bg-slate-950 text-white shadow-2xl overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                One Click AI Publisher
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Sprint 5
                </span>
              </h2>
              <p className="text-xs text-purple-200/70">
                Autonomous generation & draft creation in 1 click
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="p-1.5 rounded-lg text-purple-300/70 hover:text-white hover:bg-purple-500/10 transition-colors disabled:opacity-30 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleOneClickSubmit} className="p-6 space-y-4">
          {/* Topic */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-300/80 mb-1.5">
              Topic <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Docker Networking"
              required
              disabled={isPublishing}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-purple-500/30 text-sm text-white placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-60"
            />
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-300/80 mb-1">
                Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                disabled={isPublishing}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-purple-500/30 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="developers">Developers</option>
                <option value="architects">Architects</option>
                <option value="beginners">Beginners</option>
                <option value="executives">Executives</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-300/80 mb-1">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                disabled={isPublishing}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-purple-500/30 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="informative">Informative</option>
                <option value="authoritative">Authoritative</option>
                <option value="conversational">Conversational</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-300/80 mb-1">
                Length
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                disabled={isPublishing}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-purple-500/30 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="short">Short (~800w)</option>
                <option value="medium">Medium (~1500w)</option>
                <option value="long">Long (~2500w)</option>
              </select>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Progressive Banner during loading */}
          {isPublishing && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-400/40 flex items-center justify-between text-sm text-purple-100 shadow-xl animate-pulse">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-amber-300 animate-spin" />
                <span className="font-bold">{progressiveMsg}</span>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-950 text-amber-300 border border-amber-400/30">
                Processing
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!topic.trim() || isPublishing}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] shadow-lg shadow-amber-500/30 border border-amber-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{progressiveMsg || "Autonomous Publishing..."}</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>Generate & Save Draft</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
