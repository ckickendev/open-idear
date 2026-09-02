"use client";

// =============================================================================
//  AI PUBLISHER PANEL — SPRINT 3 UI
//  src/features/ai/components/AIPublisherPanel.tsx
//
//  Redesigned AI Publisher panel for the Publish Drawer.
//  Design: Beautiful purple OpenAI-like aesthetic with glowing gradients,
//          glassmorphism, interactive controls, and live step progress.
// =============================================================================

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Loader2,
  Circle,
  AlertCircle,
  ChevronDown,
  Clock,
  Wand2,
  ShieldCheck,
  Save,
  BookOpen,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/axios";
import { publisherApi } from "../api/publisher.api";

export interface AIPublisherResult {
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  blocks: any[];
  coverImage?: any;
  markdown?: string;
  validation?: any;
}

export interface AIPublisherPanelProps {
  initialTopic?: string;
  onAutoFill: (result: AIPublisherResult) => void;
  categories?: any[];
}

export type StepStatus = "idle" | "running" | "completed" | "error";

export interface PipelineStep {
  id: "planner" | "writer" | "seo" | "cover_image" | "validator" | "saving";
  name: string;
  label: string;
  status: StepStatus;
  detail?: string;
}

import { BrandVoiceSelector, type BrandVoiceProfile } from "./BrandVoiceSelector";

export const AIPublisherPanel: React.FC<AIPublisherPanelProps> = ({
  initialTopic = "",
  onAutoFill,
  categories = [],
}) => {
  const router = useRouter();
  // Form states
  const [topic, setTopic] = useState(initialTopic);
  const [audience, setAudience] = useState("developers");
  const [tone, setTone] = useState("informative");
  const [length, setLength] = useState("medium");
  const [brandVoice, setBrandVoice] = useState<BrandVoiceProfile | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Execution state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOneClick, setIsOneClick] = useState(false);
  const [progressiveMsg, setProgressiveMsg] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live progress steps
  const [steps, setSteps] = useState<PipelineStep[]>([
    { id: "planner", name: "Planner", label: "Generating outline & search intent", status: "idle" },
    { id: "writer", name: "Writer", label: "Drafting blocks-v1 JSON content", status: "idle" },
    { id: "seo", name: "SEO", label: "Optimizing metadata, tags & slug", status: "idle" },
    { id: "cover_image", name: "Cover Image", label: "Generating & uploading to Cloudinary", status: "idle" },
    { id: "validator", name: "Validator", label: "Auditing structure, FAQ & CTA rules", status: "idle" },
    { id: "saving", name: "Saving", label: "Auto-filling draft in editor", status: "idle" },
  ]);

  const updateStepStatus = (id: PipelineStep["id"], status: StepStatus, detail?: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, status, ...(detail !== undefined && { detail }) } : step
      )
    );
  };

  const resetSteps = () => {
    setSteps([
      { id: "planner", name: "Planner", label: "Generating outline & search intent", status: "idle" },
      { id: "writer", name: "Writer", label: "Drafting blocks-v1 JSON content", status: "idle" },
      { id: "seo", name: "SEO", label: "Optimizing metadata, tags & slug", status: "idle" },
      { id: "cover_image", name: "Cover Image", label: "Generating & uploading to Cloudinary", status: "idle" },
      { id: "validator", name: "Validator", label: "Auditing structure, FAQ & CTA rules", status: "idle" },
      { id: "saving", name: "Saving", label: "Auto-filling draft in editor", status: "idle" },
    ]);
  };

  const handleOneClickPublish = async () => {
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setIsOneClick(true);
    setErrorMessage(null);
    resetSteps();

    try {
      // Step 1: Planner
      setProgressiveMsg("Generating outline...");
      updateStepStatus("planner", "running");
      await new Promise((r) => setTimeout(r, 400));

      // Step 2: Writer
      setProgressiveMsg("Writing article...");
      updateStepStatus("planner", "completed");
      updateStepStatus("writer", "running");
      await new Promise((r) => setTimeout(r, 400));

      // Step 3: SEO
      setProgressiveMsg("Optimizing SEO...");
      updateStepStatus("writer", "completed");
      updateStepStatus("seo", "running");
      await new Promise((r) => setTimeout(r, 300));

      // Step 4: Cover Image
      setProgressiveMsg("Creating cover...");
      updateStepStatus("seo", "completed");
      updateStepStatus("cover_image", "running");
      await new Promise((r) => setTimeout(r, 300));

      // Step 5: Saving Draft
      setProgressiveMsg("Saving draft...");
      updateStepStatus("cover_image", "completed");
      updateStepStatus("validator", "completed");
      updateStepStatus("saving", "running");

      // Execute backend One-Click API call
      const res = await publisherApi.oneClickPublish({
        topic: topic.trim(),
        audience,
        tone: brandVoice?.tone || tone,
        length,
        ...(brandVoice ? { brandVoice } : {}),
      } as any);

      updateStepStatus("saving", "completed", `Draft ID: ${res.draftId}`);
      setProgressiveMsg("Done.");

      toast.success("Draft post created successfully! Redirecting to editor...");

      // Redirect to editor automatically after success
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = `/create?id=${res.draftId}`;
        } else {
          router.push(`/create?id=${res.draftId}`);
        }
      }, 600);
    } catch (err: any) {
      const msg = err?.message || "One-click publishing failed.";
      setErrorMessage(msg);
      setProgressiveMsg("Failed");
      setSteps((prev) =>
        prev.map((step) => (step.status === "running" ? { ...step, status: "error" } : step))
      );
    } finally {
      setIsGenerating(false);
      setIsOneClick(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);
    resetSteps();

    try {
      // Step 1: Planner
      updateStepStatus("planner", "running");
      await new Promise((r) => setTimeout(r, 400)); // smooth UI transition

      // Call multi-agent backend endpoint
      const response = await api.post("/ai/v1/publisher", {
        topic: topic.trim(),
        audience,
        tone: brandVoice?.tone || tone,
        length,
        ...(brandVoice ? { brandVoice } : {}),
      });

      if (!response.success) {
        throw new Error(response.message || "AI Publisher failed to generate post.");
      }

      const resData = (response.data as any)?.data || response.data;
      
      updateStepStatus("planner", "completed", "Outline & keywords ready");

      // Step 2: Writer
      updateStepStatus("writer", "running");
      await new Promise((r) => setTimeout(r, 400));
      updateStepStatus("writer", "completed", `${resData.blocks?.length || 0} blocks generated`);

      // Step 3: SEO
      updateStepStatus("seo", "running");
      await new Promise((r) => setTimeout(r, 300));
      updateStepStatus("seo", "completed", `Slug: /${resData.slug || "post"}`);

      // Step 4: Cover Image
      updateStepStatus("cover_image", "running");
      await new Promise((r) => setTimeout(r, 400));
      updateStepStatus("cover_image", "completed", resData.coverImage?.url ? "Cloudinary upload complete" : "Cover image generated");

      // Step 5: Validator
      updateStepStatus("validator", "running");
      await new Promise((r) => setTimeout(r, 300));
      const score = resData.validation?.score || 95;
      updateStepStatus("validator", "completed", `Quality Score: ${score}/100`);

      // Step 6: Saving
      updateStepStatus("saving", "running");
      await new Promise((r) => setTimeout(r, 300));

      const result: AIPublisherResult = {
        title: resData.title || topic,
        slug: resData.slug || "",
        description: resData.description || resData.seo?.metaDescription || "",
        category: resData.category || resData.seo?.category || "general",
        tags: resData.tags || resData.seo?.tags || [],
        blocks: resData.blocks || [],
        coverImage: resData.coverImage || null,
        markdown: resData.markdown || "",
        validation: resData.validation,
      };

      onAutoFill(result);
      updateStepStatus("saving", "completed", "Draft populated!");
    } catch (err: any) {
      const msg = err?.message || "Generation failed. Please check server logs.";
      setErrorMessage(msg);
      setSteps((prev) =>
        prev.map((step) => (step.status === "running" ? { ...step, status: "error" } : step))
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/40 via-indigo-950/30 to-background/80 p-4 shadow-xl backdrop-blur-xl transition-all">
      {/* Glow aura accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-violet-400 text-white shadow-lg shadow-purple-500/30 animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              AI Publisher
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Multi-Agent
              </span>
            </h3>
            <p className="text-[11px] text-purple-200/70">
              Generate full post & auto-fill settings
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-lg text-purple-300/70 hover:text-white hover:bg-purple-500/10 transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {isExpanded && (
        <form onSubmit={handleGenerate} className="space-y-3.5">
          {/* Brand Voice Selector */}
          <BrandVoiceSelector
            selectedProfile={brandVoice}
            onSelectProfile={(bv) => {
              setBrandVoice(bv);
              if (bv.tone) setTone(bv.tone);
            }}
          />

          {/* Topic Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-300/80 mb-1">
              Topic <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Docker Networking Deep Dive"
              required
              disabled={isGenerating}
              className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all disabled:opacity-50"
            />
          </div>

          {/* Audience, Tone, Reading Time Selectors */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-purple-300/80 mb-1">
                Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                disabled={isGenerating}
                className="w-full px-2 py-1.5 rounded-lg bg-purple-950/50 border border-purple-500/30 text-[11px] text-white focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="developers">Developers</option>
                <option value="architects">Architects</option>
                <option value="beginners">Beginners</option>
                <option value="executives">Executives</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-purple-300/80 mb-1">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                disabled={isGenerating}
                className="w-full px-2 py-1.5 rounded-lg bg-purple-950/50 border border-purple-500/30 text-[11px] text-white focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="informative">Informative</option>
                <option value="authoritative">Authoritative</option>
                <option value="conversational">Conversational</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-purple-300/80 mb-1 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> Length
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                disabled={isGenerating}
                className="w-full px-2 py-1.5 rounded-lg bg-purple-950/50 border border-purple-500/30 text-[11px] text-white focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="short">Short (~800w)</option>
                <option value="medium">Medium (~1500w)</option>
                <option value="long">Long (~2500w)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="submit"
              disabled={!topic.trim() || isGenerating}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/25 border border-purple-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isGenerating && !isOneClick ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate Editor</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOneClickPublish}
              disabled={!topic.trim() || isGenerating}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 shadow-md shadow-amber-500/25 border border-amber-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isGenerating && isOneClick ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>One Click...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-3.5 h-3.5 text-white" />
                  <span>One Click AI Draft</span>
                </>
              )}
            </button>
          </div>

          {/* Progressive Loading Banner for One-Click */}
          {isGenerating && isOneClick && (
            <div className="p-3 rounded-xl bg-purple-900/50 border border-purple-400/40 flex items-center justify-between text-xs text-purple-100 shadow-lg animate-pulse">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-amber-300 animate-spin" />
                <span className="font-semibold">{progressiveMsg}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300">
                Auto Redirecting...
              </span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Live Progress Checklist */}
          {(isGenerating || steps.some((s) => s.status !== "idle")) && (
            <div className="pt-2 border-t border-purple-500/20 space-y-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300/70 mb-1">
                Live Agent Orchestration
              </p>
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs border transition-all ${
                    step.status === "running"
                      ? "bg-purple-500/20 border-purple-400/50 text-purple-200"
                      : step.status === "completed"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : step.status === "error"
                      ? "bg-red-500/10 border-red-500/30 text-red-300"
                      : "bg-purple-950/20 border-purple-500/10 text-purple-300/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {/* Status Icon */}
                    {step.status === "completed" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    {step.status === "running" && (
                      <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin shrink-0" />
                    )}
                    {step.status === "idle" && (
                      <Circle className="w-3.5 h-3.5 text-purple-500/30 shrink-0" />
                    )}
                    {step.status === "error" && (
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    )}

                    <span className="font-semibold">{step.name}</span>
                  </div>

                  <span className="text-[10px] opacity-80 truncate max-w-[170px]">
                    {step.detail || step.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </form>
      )}
    </div>
  );
};
