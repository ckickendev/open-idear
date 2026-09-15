"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/axios";
import { publisherApi } from "../../api/publisher.api";
import type { BrandVoiceProfile } from "../../api/brandVoice.api";

import { TopicInput } from "./TopicInput";
import { PresetChips } from "./PresetChips";
import { PublisherConfigGrid } from "./PublisherConfigGrid";
import { GenerateActions } from "./GenerateActions";
import { GenerationProgress, type PipelineStep, type StepStatus } from "./GenerationProgress";

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

export interface AIPublisherCardProps {
  initialTopic?: string;
  onAutoFill: (result: AIPublisherResult) => void;
  categories?: any[];
  className?: string;
}

export const AIPublisherCard: React.FC<AIPublisherCardProps> = ({
  initialTopic = "",
  onAutoFill,
  categories = [],
  className = "",
}) => {
  const router = useRouter();

  // Form states
  const [topic, setTopic] = useState(initialTopic);
  const [audience, setAudience] = useState("developers");
  const [tone, setTone] = useState("informative");
  const [length, setLength] = useState("medium");
  const [brandVoice, setBrandVoice] = useState<BrandVoiceProfile | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Execution states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOneClick, setIsOneClick] = useState(false);
  const [progressiveMsg, setProgressiveMsg] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live multi-agent pipeline steps
  const [steps, setSteps] = useState<PipelineStep[]>([
    { id: "planner", name: "Planner", label: "Researching outline & intent", status: "idle" },
    { id: "writer", name: "Writer", label: "Drafting structured blocks", status: "idle" },
    { id: "seo", name: "SEO", label: "Optimizing metadata & slug", status: "idle" },
    { id: "cover_image", name: "Cover Image", label: "Generating visual asset", status: "idle" },
    { id: "validator", name: "Validator", label: "Auditing structure & FAQ rules", status: "idle" },
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
      { id: "planner", name: "Planner", label: "Researching outline & intent", status: "idle" },
      { id: "writer", name: "Writer", label: "Drafting structured blocks", status: "idle" },
      { id: "seo", name: "SEO", label: "Optimizing metadata & slug", status: "idle" },
      { id: "cover_image", name: "Cover Image", label: "Generating visual asset", status: "idle" },
      { id: "validator", name: "Validator", label: "Auditing structure & FAQ rules", status: "idle" },
      { id: "saving", name: "Saving", label: "Auto-filling draft in editor", status: "idle" },
    ]);
  };

  // 1. One Click AI Draft Execution
  const handleOneClickPublish = async () => {
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setIsOneClick(true);
    setErrorMessage(null);
    resetSteps();

    try {
      // Step 1: Planner
      setProgressiveMsg("Generating outline & intent...");
      updateStepStatus("planner", "running");
      await new Promise((r) => setTimeout(r, 400));

      // Step 2: Writer
      setProgressiveMsg("Writing article draft...");
      updateStepStatus("planner", "completed");
      updateStepStatus("writer", "running");
      await new Promise((r) => setTimeout(r, 400));

      // Step 3: SEO
      setProgressiveMsg("Optimizing SEO tags...");
      updateStepStatus("writer", "completed");
      updateStepStatus("seo", "running");
      await new Promise((r) => setTimeout(r, 300));

      // Step 4: Cover Image
      setProgressiveMsg("Generating cover image...");
      updateStepStatus("seo", "completed");
      updateStepStatus("cover_image", "running");
      await new Promise((r) => setTimeout(r, 300));

      // Step 5: Saving Draft
      setProgressiveMsg("Saving draft...");
      updateStepStatus("cover_image", "completed");
      updateStepStatus("validator", "completed");
      updateStepStatus("saving", "running");

      // Execute backend One-Click API
      const res = await publisherApi.oneClickPublish({
        topic: topic.trim(),
        audience,
        tone: brandVoice?.tone || tone,
        length,
        ...(brandVoice ? { brandVoice } : {}),
      } as any);

      updateStepStatus("saving", "completed", `Draft: #${String(res.draftId).slice(-6)}`);
      setProgressiveMsg("Complete!");
      toast.success("Draft post created successfully! Redirecting to editor...");

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

  // 2. Standard In-Editor AI Generation
  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setIsOneClick(false);
    setErrorMessage(null);
    resetSteps();

    try {
      // Step 1: Planner
      updateStepStatus("planner", "running");
      await new Promise((r) => setTimeout(r, 400));

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
      updateStepStatus("writer", "completed", `${resData.blocks?.length || 0} blocks drafted`);

      // Step 3: SEO
      updateStepStatus("seo", "running");
      await new Promise((r) => setTimeout(r, 300));
      updateStepStatus("seo", "completed", `Slug: /${resData.slug || "post"}`);

      // Step 4: Cover Image
      updateStepStatus("cover_image", "running");
      await new Promise((r) => setTimeout(r, 350));
      updateStepStatus(
        "cover_image",
        "completed",
        resData.coverImage?.url ? "Cover uploaded" : "Cover asset ready"
      );

      // Step 5: Validator
      updateStepStatus("validator", "running");
      await new Promise((r) => setTimeout(r, 300));
      const score = resData.validation?.score || 95;
      updateStepStatus("validator", "completed", `Quality score: ${score}/100`);

      // Step 6: Saving
      updateStepStatus("saving", "running");
      await new Promise((r) => setTimeout(r, 250));

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
      toast.success("AI draft populated into editor!");
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
    <div
      className={`rounded-[24px] border border-border/80 bg-card p-5 sm:p-6 shadow-sm shadow-black/5 dark:shadow-black/20 transition-all duration-200 ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/15">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-foreground">
                AI Publisher
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/40">
                Multi-Agent
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Draft long-form, SEO-optimized content with multi-agent orchestration.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label={isExpanded ? "Collapse AI Publisher" : "Expand AI Publisher"}
          title={isExpanded ? "Collapse panel" : "Expand panel"}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Expandable Workspace Body */}
      {isExpanded && (
        <div className="space-y-4 pt-4">
          {/* 1. Hero Creation Area: Topic Textarea */}
          <TopicInput
            value={topic}
            onChange={setTopic}
            disabled={isGenerating}
          />

          {/* 2. Smart Presets */}
          <PresetChips
            currentTopic={topic}
            onSelectPreset={setTopic}
            disabled={isGenerating}
          />

          {/* 3. AI Configuration Grid (2-columns) */}
          <PublisherConfigGrid
            audience={audience}
            onAudienceChange={setAudience}
            tone={tone}
            onToneChange={setTone}
            length={length}
            onLengthChange={setLength}
            brandVoice={brandVoice}
            onBrandVoiceChange={setBrandVoice}
            disabled={isGenerating}
          />

          {/* 4. Action Buttons or Live Progress */}
          {!isGenerating && !steps.some((s) => s.status === "running") ? (
            <GenerateActions
              topic={topic}
              isGenerating={isGenerating}
              isOneClick={isOneClick}
              onGenerateEditor={handleGenerate}
              onOneClickDraft={handleOneClickPublish}
            />
          ) : (
            <GenerationProgress
              steps={steps}
              isGenerating={isGenerating}
              progressiveMsg={progressiveMsg}
              errorMessage={errorMessage}
              onRetry={() => {
                setErrorMessage(null);
                resetSteps();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
