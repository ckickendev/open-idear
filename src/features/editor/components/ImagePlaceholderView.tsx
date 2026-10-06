// =============================================================================
//  IMAGE PLACEHOLDER NODE VIEW (REACT) — SPRINT 3 INTELLIGENCE LAYER
//  src/features/editor/components/ImagePlaceholderView.tsx
//
//  Design Decisions:
//  - Minimal, high-craft Notion / Linear / Apple aesthetic.
//  - Decision Engine: Visual Classifier outputs visualType, confidence, reason.
//  - Explainable UX:
//      Recommended: Diagram
//      Why? This section explains system architecture.
//      Buttons: Use Recommendation, Choose Another, Generate, Search.
//  - Analytics telemetry for generated, accepted, regenerated, deleted, search_preferred.
// =============================================================================

"use client";

import React, { useState, useEffect, useRef } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import {
  Sparkles,
  Search,
  X,
  Check,
  RotateCw,
  ImageIcon,
  Lightbulb,
  Box,
  Compass,
  Layers,
  Cpu,
  AlertCircle,
  Network,
  BarChart3,
  Monitor,
  Camera,
  Split,
  Code,
  ChevronDown,
  ArrowRight,
  Palette,
  Trash2,
} from "lucide-react";
import {
  aiVisualApi,
  type IllustrationPreset,
  type GeneratedIllustrationAsset,
  type VisualType,
  type VisualRecommendation,
} from "@/features/ai-visual";
import { toast } from "sonner";

const PRESET_OPTIONS: Array<{
  id: IllustrationPreset;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
}> = [
  { id: "isometric", label: "Isometric", icon: Box, hint: "30° orthographic 3D view" },
  { id: "blueprint", label: "Blueprint", icon: Compass, hint: "CAD technical schematic" },
  { id: "flat_vector", label: "Flat Vector", icon: Layers, hint: "Modern minimal icon style" },
  { id: "3d_technical", label: "3D Technical", icon: Cpu, hint: "Soft volumetric matte 3D" },
];

const VISUAL_TYPE_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    badgeBg: string;
  }
> = {
  diagram: {
    label: "Diagram",
    icon: Network,
    color: "text-violet-600 dark:text-violet-400",
    badgeBg: "bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800/60",
  },
  illustration: {
    label: "AI Illustration",
    icon: Sparkles,
    color: "text-indigo-600 dark:text-indigo-400",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/60",
  },
  screenshot: {
    label: "Screenshot",
    icon: Monitor,
    color: "text-sky-600 dark:text-sky-400",
    badgeBg: "bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800/60",
  },
  product: {
    label: "Product Photo",
    icon: Camera,
    color: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60",
  },
  comparison: {
    label: "Split Comparison",
    icon: Split,
    color: "text-pink-600 dark:text-pink-400",
    badgeBg: "bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800/60",
  },
  chart: {
    label: "Data Chart",
    icon: BarChart3,
    color: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60",
  },
  code: {
    label: "Code Visual",
    icon: Code,
    color: "text-cyan-600 dark:text-cyan-400",
    badgeBg: "bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800/60",
  },
  none: {
    label: "No Visual",
    icon: ImageIcon,
    color: "text-zinc-500 dark:text-zinc-400",
    badgeBg: "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
  },
};

const ALL_VISUAL_TYPES: VisualType[] = [
  "diagram",
  "illustration",
  "screenshot",
  "product",
  "comparison",
  "chart",
  "code",
];

export function ImagePlaceholderView({
  node,
  getPos,
  deleteNode,
  editor,
  selected,
}: NodeViewProps) {
  const { heading, searchQuery, imagePrompt, alt } = node.attrs;

  // ─── Recommendation State ──────────────────────────────────────────────────
  const [recommendation, setRecommendation] = useState<VisualRecommendation>({
    heading: heading || "Section Visual",
    visualType: (node.attrs.visualType as VisualType) || "diagram",
    confidence: node.attrs.confidence ? Number(node.attrs.confidence) : 0.94,
    reason: node.attrs.reason || "This section explains system architecture and component interactions.",
    recommendedAction: node.attrs.recommendedAction || "generate",
    suggestedPreset: "isometric",
  });
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // ─── Generation & UI State ──────────────────────────────────────────────────
  const [status, setStatus] = useState<"idle" | "generating" | "preview" | "error">("idle");
  const [selectedPreset, setSelectedPreset] = useState<IllustrationPreset>("isometric");
  const [generatedAsset, setGeneratedAsset] = useState<GeneratedIllustrationAsset | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showStyleSwitcher, setShowStyleSwitcher] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const rawBasePrompt = imagePrompt || searchQuery || heading || "Technical Architecture";

  // Fetch / refine recommendation on mount if not pre-populated
  useEffect(() => {
    let isMounted = true;
    if (!node.attrs.reason || !node.attrs.visualType) {
      aiVisualApi.classifySection(heading || "", rawBasePrompt).then((rec) => {
        if (isMounted && rec) {
          setRecommendation(rec);
          if (rec.suggestedPreset) {
            setSelectedPreset(rec.suggestedPreset);
          }
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [heading, rawBasePrompt, node.attrs.reason, node.attrs.visualType]);

  // Loading progress animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "generating") {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => Math.min(prev + 1, 2));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [status]);

  // ─── Actions & Telemetry ───────────────────────────────────────────────────

  const handleGenerate = async (forceNew = false, customStyle?: IllustrationPreset) => {
    const styleToUse = customStyle || selectedPreset;
    if (customStyle) {
      setSelectedPreset(customStyle);
    }
    setStatus("generating");
    setErrorMessage(null);
    setShowStyleSwitcher(false);

    const freshSeed = Math.floor(Math.random() * 1_000_000);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Telemetry: visual_generation_started
    aiVisualApi.trackAnalytics({
      heading: heading || "Section Visual",
      visualType: recommendation.visualType,
      recommendedAction: recommendation.recommendedAction,
      actionTaken: "visual_generation_started",
      preset: styleToUse,
      prompt: rawBasePrompt,
      confidence: recommendation.confidence,
    });

    try {
      const asset = await aiVisualApi.generateIllustration(
        {
          prompt: rawBasePrompt,
          style: styleToUse,
          aspectRatio: "16:9",
          seed: freshSeed,
          force: forceNew,
        },
        controller.signal
      );

      setGeneratedAsset(asset);
      setStatus("preview");

      if (asset.isReused) {
        toast.info("Reused existing matching illustration from library");
      } else {
        toast.success("Technical illustration generated!");
      }
    } catch (err: any) {
      if (controller.signal.aborted || err.message?.includes("cancelled")) {
        setStatus(generatedAsset ? "preview" : "idle");
        toast.info("Generation cancelled");
        return;
      }
      console.error("[ImagePlaceholderView] Generation failed:", err);
      setErrorMessage(err.message || "Failed to generate illustration. Please try again.");
      setStatus("error");
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus(generatedAsset ? "preview" : "idle");
  };

  const handleUseRecommendation = () => {
    if (
      recommendation.recommendedAction === "search" ||
      recommendation.visualType === "product"
    ) {
      // Telemetry: search_preferred
      aiVisualApi.trackAnalytics({
        heading: heading || "Section Visual",
        visualType: recommendation.visualType,
        recommendedAction: recommendation.recommendedAction,
        actionTaken: "search_preferred",
        confidence: recommendation.confidence,
      });
      handleOpenSearch();
    } else {
      if (recommendation.suggestedPreset) {
        setSelectedPreset(recommendation.suggestedPreset);
      }
      handleGenerate(false);
    }
  };

  const handleAccept = () => {
    if (!generatedAsset || !editor) return;

    // Telemetry: visual_generation_accepted
    aiVisualApi.trackAnalytics({
      heading: heading || "Section Visual",
      visualType: recommendation.visualType,
      recommendedAction: recommendation.recommendedAction,
      actionTaken: "visual_generation_accepted",
      preset: selectedPreset,
      prompt: rawBasePrompt,
    });

    const pos = typeof getPos === "function" ? getPos() : undefined;
    const targetAlt = generatedAsset.alt || alt || heading || "Technical illustration";

    if (typeof pos === "number" && pos >= 0) {
      try {
        editor
          .chain()
          .focus()
          .setNodeSelection(pos)
          .deleteSelection()
          .insertContentAt(pos, {
            type: "image",
            attrs: {
              src: generatedAsset.url,
              alt: targetAlt,
              "data-media-id": generatedAsset._id,
            },
          })
          .run();
        toast.success("Visual accepted and inserted!");
      } catch (err) {
        editor.chain().focus().setImage({ src: generatedAsset.url, alt: targetAlt }).run();
      }
    } else {
      editor.chain().focus().setImage({ src: generatedAsset.url, alt: targetAlt }).run();
    }
  };

  const handleRegenerate = () => {
    // Telemetry: visual_generation_regenerated
    aiVisualApi.trackAnalytics({
      heading: heading || "Section Visual",
      visualType: recommendation.visualType,
      recommendedAction: recommendation.recommendedAction,
      actionTaken: "visual_generation_regenerated",
      preset: selectedPreset,
      prompt: rawBasePrompt,
    });
    handleGenerate(true);
  };

  const handleDelete = () => {
    // Telemetry: visual_suggestion_dismissed
    aiVisualApi.trackAnalytics({
      heading: heading || "Section Visual",
      visualType: recommendation.visualType,
      recommendedAction: recommendation.recommendedAction,
      actionTaken: "visual_suggestion_dismissed",
    });
    deleteNode();
  };

  const handleOpenSearch = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    // Telemetry: visual_search_started
    aiVisualApi.trackAnalytics({
      heading: heading || "Section Visual",
      visualType: recommendation.visualType,
      recommendedAction: recommendation.recommendedAction,
      actionTaken: "visual_search_started",
    });

    const pos = typeof getPos === "function" ? getPos() : undefined;

    window.dispatchEvent(
      new CustomEvent("open-asset-picker", {
        detail: {
          heading: heading || "Section Visual",
          searchQuery: searchQuery || heading || "",
          imagePrompt: imagePrompt || "",
          alt: alt || searchQuery || "",
          placeholderPos: pos,
        },
      })
    );
  };

  const normalizedType = (recommendation.visualType || "diagram").toLowerCase();
  const activeVisualConfig =
    VISUAL_TYPE_CONFIG[normalizedType as VisualType] ||
    (normalizedType.includes("diagram") ? VISUAL_TYPE_CONFIG.diagram :
     normalizedType.includes("search") ? VISUAL_TYPE_CONFIG.product :
     normalizedType.includes("code") ? VISUAL_TYPE_CONFIG.code :
     normalizedType.includes("chart") ? VISUAL_TYPE_CONFIG.chart :
     normalizedType.includes("screen") ? VISUAL_TYPE_CONFIG.screenshot :
     VISUAL_TYPE_CONFIG.illustration);
  const ActiveVisualIcon = activeVisualConfig.icon;

  const handleReject = () => {
    aiVisualApi.trackAnalytics({
      heading: heading || "Section Visual",
      visualType: recommendation.visualType,
      recommendedAction: recommendation.recommendedAction,
      actionTaken: "visual_generation_rejected",
      preset: selectedPreset,
      prompt: rawBasePrompt,
    });
    setGeneratedAsset(null);
    setStatus("idle");
    toast.info("Generated illustration discarded");
  };

  return (
    <NodeViewWrapper
      className={`my-6 select-none transition-all duration-200 ${
        selected ? "ring-2 ring-violet-500/40 rounded-xl" : ""
      }`}
    >
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-900/40 p-4 sm:p-5 transition-colors group">
        {/* Decorative backdrop glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-500/5 blur-2xl" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/70 dark:border-violet-800/50">
              <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>AI Visual Assistant</span>
            </div>

            {heading && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-xs sm:max-w-md">
                Section: <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{heading}</strong>
              </span>
            )}
          </div>

          {/* Dismiss Action */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete();
            }}
            title="Dismiss visual placeholder"
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── STATE 1: GENERATING / LOADING PROGRESS ─────────────────────────── */}
        {status === "generating" && (
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-center gap-3 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
              <RotateCw className="w-4 h-4 animate-spin text-violet-500" />
              <span>
                {loadingStep === 0 && "Applying technical style preset..."}
                {loadingStep === 1 && "Rendering technical illustration..."}
                {loadingStep >= 2 && "Optimizing & uploading to Asset Library..."}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700 ease-out"
                style={{
                  width: loadingStep === 0 ? "35%" : loadingStep === 1 ? "75%" : "95%",
                }}
              />
            </div>

            <p className="text-center text-[11px] text-zinc-400 font-mono truncate px-4">
              &ldquo;{rawBasePrompt}&rdquo; • {selectedPreset.toUpperCase()}
            </p>

            {/* Cancel Button */}
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={handleCancelGeneration}
                className="px-3 py-1 rounded-md text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel Generation</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STATE 2: PREVIEW GENERATED ASSET ───────────────────────────────── */}
        {status === "preview" && generatedAsset && (
          <div className="py-3 space-y-3">
            <div className="relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-950/20 max-h-80 flex items-center justify-center">
              <img
                src={generatedAsset.url}
                alt={generatedAsset.alt || rawBasePrompt}
                className="max-h-72 w-full object-contain rounded-lg shadow-sm"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-sm text-white border border-white/10">
                <span className="uppercase tracking-wider">{selectedPreset}</span>
                {generatedAsset.isReused && (
                  <span className="text-emerald-400 font-mono">• Reused Match</span>
                )}
              </div>
            </div>

            {/* Style Switcher Dropdown */}
            {showStyleSwitcher && (
              <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 space-y-2 animate-in fade-in-50 duration-150">
                <span className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Switch Preset and Regenerate:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {PRESET_OPTIONS.map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = selectedPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleGenerate(true, preset.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                          isSelected
                            ? "bg-violet-600 text-white shadow-xs"
                            : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 border border-zinc-200 dark:border-zinc-700"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sprint 4 Result Actions: [Use Image] | [Regenerate] | [Change Style] | [Reject] | [Dismiss] */}
            <div className="pt-2 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleAccept}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors cursor-pointer active:scale-98"
                title="Insert accepted image into article"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Use Image</span>
              </button>

              <button
                type="button"
                onClick={handleRegenerate}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                title="Generate a new variation with fresh seed"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={() => setShowStyleSwitcher(!showStyleSwitcher)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                  showStyleSwitcher
                    ? "bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border-violet-300 dark:border-violet-700"
                    : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                }`}
                title="Switch technical style preset"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Change Style</span>
              </button>

              <button
                type="button"
                onClick={handleReject}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-amber-50 dark:bg-zinc-800 dark:hover:bg-amber-950/40 text-zinc-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-400 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                title="Reject generation and return to recommendations"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-rose-50 dark:bg-zinc-800 dark:hover:bg-rose-950/40 text-zinc-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                title="Discard and remove placeholder"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STATE 3: ERROR / RETRY ─────────────────────────────────────────── */}
        {status === "error" && (
          <div className="py-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleGenerate(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Retry Generation</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenSearch()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Existing Assets</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STATE 4: IDLE / SPRINT 4 VISUAL INTELLIGENCE UX ──────────────── */}
        {status === "idle" && (
          <div className="py-2.5 space-y-3">
            {/* 1. Decision Recommendation Card */}
            <div className="p-3.5 rounded-lg bg-white/90 dark:bg-zinc-850/80 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Recommended:
                  </span>
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${activeVisualConfig.badgeBg}`}
                  >
                    <ActiveVisualIcon className={`w-3.5 h-3.5 ${activeVisualConfig.color}`} />
                    <span className={activeVisualConfig.color}>[{activeVisualConfig.label}]</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                    {Math.round((recommendation.confidence || 0.85) * 100)}% match
                  </span>
                </div>

                {/* Choose Another dropdown toggle */}
                <button
                  type="button"
                  onClick={() => setShowTypeSelector(!showTypeSelector)}
                  className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Choose Another</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      showTypeSelector ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Explainable Why? Callout */}
              <div className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-1.5 pt-0.5">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 shrink-0">
                  Why?
                </span>
                <span className="leading-relaxed">&ldquo;{recommendation.reason}&rdquo;</span>
              </div>

              {/* Visual Types Selector Bar (When Choose Another is open) */}
              {showTypeSelector && (
                <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 animate-in fade-in-50 duration-150">
                  <span className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                    Select alternative visual type:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ALL_VISUAL_TYPES.map((t) => {
                      const isCurrent = normalizedType === t;
                      const cfg = VISUAL_TYPE_CONFIG[t];
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setRecommendation((prev) => ({
                              ...prev,
                              visualType: t,
                              recommendedAction: t === "product" ? "search" : "generate",
                              reason: `Author selected ${cfg.label} visual layout for this section.`,
                            }));
                            setShowTypeSelector(false);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                            isCurrent
                              ? "bg-violet-600 text-white shadow-xs"
                              : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Subject preview */}
            {rawBasePrompt && (
              <div className="flex items-baseline gap-2 text-xs">
                <span className="text-zinc-400 font-medium shrink-0">Subject:</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-medium break-words truncate">
                  &ldquo;{rawBasePrompt}&rdquo;
                </span>
              </div>
            )}

            {/* Technical Style Presets Selector */}
            <div className="pt-1">
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                Technical Style Preset:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PRESET_OPTIONS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPreset(preset.id)}
                      title={preset.hint}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                        isSelected
                          ? "bg-violet-600 text-white shadow-xs"
                          : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-transparent"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Buttons: [Search] | [Generate] | [Dismiss] */}
            <div className="pt-2 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleOpenSearch}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/60 transition-colors cursor-pointer active:scale-98"
                title="Search existing assets in library or stock"
              >
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenerate(false)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer active:scale-98 ${
                  recommendation.recommendedAction === "search"
                    ? "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/60"
                    : "bg-violet-600 hover:bg-violet-500 text-white"
                }`}
                title="Generate illustration or diagram with AI"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate</span>
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-rose-50 dark:bg-zinc-800/80 dark:hover:bg-rose-950/40 text-zinc-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 border border-zinc-200/80 dark:border-zinc-700/60 transition-colors cursor-pointer active:scale-98"
                title="Dismiss this visual recommendation"
              >
                <X className="w-3.5 h-3.5" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
