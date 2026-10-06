// =============================================================================
//  AI IMAGE MODAL — INTELLIGENT CONTEXT-AWARE VISUAL ASSISTANT (SPRINT 3)
//  src/features/editor/components/AIImageModal.tsx
//
//  Design Decisions:
//  - Transforms AI Image from prompt-box to an intelligent Visual Assistant.
//  - Analyzes editor context with priority hierarchy (selection > paragraph > heading).
//  - Lightweight Explainable Recommendation Card ("Recommended: Architecture Diagram").
//  - 10 Visual Intents with tailored structured prompt synthesis & style intelligence.
//  - Guardrail: Never silently auto-publish or insert without author review.
//  - Complete telemetry suite tracking all 8 lifecycle events with sanitized metadata.
// =============================================================================

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  Image as ImageIcon,
  X,
  RotateCw,
  Check,
  AlertCircle,
  RefreshCw,
  Sliders,
  Type,
  AlignLeft,
  Command,
  ArrowRight,
} from "lucide-react";
import {
  aiVisualApi,
  type IllustrationPreset,
  type GeneratedIllustrationAsset,
  type VisualIntent,
} from "@/features/ai-visual";
import {
  STYLE_PRESETS,
  ASPECT_RATIOS,
  VISUAL_INTENTS,
  VISUAL_INTENT_LIST,
} from "../constants/aiVisualTaxonomy";
import {
  classifyVisualIntent,
  generateStructuredAiImagePrompt,
  trackAiImageTelemetry,
  type VisualSuggestionInput,
  type ContextSourceType,
} from "../utils/aiAssistContext";
import { toast } from "sonner";

export { STYLE_PRESETS, ASPECT_RATIOS };

const SUGGESTED_PROMPT_CHIPS = [
  "High-performance in-memory caching architecture",
  "Microservices event-driven communication topology",
  "Hardware power efficiency comparison chart",
  "Database read-replica indexing data flow",
];

export type AIImageModalState = "idle" | "generating" | "preview" | "error" | "accepted";

export interface AIImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialStyle?: IllustrationPreset;
  initialAspectRatio?: string;
  heading?: string;
  sourceContext?: string;
  visualSuggestion?: VisualSuggestionInput;
  initialIntent?: VisualIntent;
  initialConfidence?: number;
  recommendationReason?: string;
  contextType?: ContextSourceType;
  articleTitle?: string;
  onInsert: (asset: GeneratedIllustrationAsset, alt?: string, caption?: string) => void;
  postId?: string;
}

export function AIImageModal({
  isOpen,
  onClose,
  initialPrompt = "",
  initialStyle = "isometric",
  initialAspectRatio = "16:9",
  heading,
  sourceContext,
  visualSuggestion,
  initialIntent,
  initialConfidence,
  recommendationReason,
  contextType = "selection",
  articleTitle,
  onInsert,
  postId,
}: AIImageModalProps) {
  // Recommendation & Intent State
  const [activeIntent, setActiveIntent] = useState<VisualIntent>(
    initialIntent || "architecture"
  );
  const [recommendation, setRecommendation] = useState<{
    intent: VisualIntent;
    confidence: number;
    reason: string;
  }>({
    intent: initialIntent || "architecture",
    confidence: initialConfidence || 0.92,
    reason:
      recommendationReason ||
      "The selected text describes component boundaries, service interactions, and system architecture.",
  });
  const [showIntentSelector, setShowIntentSelector] = useState(false);

  // Form State
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedStyle, setSelectedStyle] = useState<IllustrationPreset>(initialStyle);
  const [selectedRatio, setSelectedRatio] = useState<string>(initialAspectRatio);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");

  // Lifecycle State
  const [modalState, setModalState] = useState<AIImageModalState>("idle");
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedAsset, setGeneratedAsset] = useState<GeneratedIllustrationAsset | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const generationStartTimeRef = useRef<number>(0);

  // Sync state & perform context intelligence on modal open
  useEffect(() => {
    if (isOpen) {
      const rawText = sourceContext || initialPrompt;
      const classification = classifyVisualIntent(rawText, heading);
      const chosenIntent = (visualSuggestion?.visualType as VisualIntent) || initialIntent || classification.intent;
      const intentDef = VISUAL_INTENTS[chosenIntent] || VISUAL_INTENTS.architecture;

      setActiveIntent(chosenIntent);
      setRecommendation({
        intent: chosenIntent,
        confidence: visualSuggestion ? 0.95 : initialConfidence || classification.confidence,
        reason: visualSuggestion?.reason || recommendationReason || classification.reason,
      });

      if (visualSuggestion) {
        const p = visualSuggestion.prompt?.trim() || initialPrompt.trim();
        setPrompt(p);
        setSelectedStyle((visualSuggestion.style as IllustrationPreset) || intentDef.defaultPreset);
        setSelectedRatio(visualSuggestion.aspectRatio || intentDef.defaultRatio);
        setAltText(visualSuggestion.altText || p);
        setCaption(visualSuggestion.caption || "");
      } else {
        const structuredPrompt = initialPrompt.trim()
          ? initialPrompt.trim()
          : generateStructuredAiImagePrompt({
              text: rawText,
              heading,
              intent: chosenIntent,
              articleTitle,
            });

        setPrompt(structuredPrompt);
        setSelectedStyle(initialStyle || intentDef.defaultPreset);
        setSelectedRatio(initialAspectRatio || intentDef.defaultRatio);
        setAltText(`Illustration of ${heading || articleTitle || "system architecture"}`);
        setCaption("");
      }

      setModalState("idle");
      setGeneratedAsset(null);
      setErrorMessage(null);
      setLoadingStep(0);
      setShowIntentSelector(false);

      // Telemetry: ai_image_opened & recommendation_shown
      trackAiImageTelemetry("ai_image_opened", {
        heading,
        intent: chosenIntent,
        postId,
        contextType,
      });
      trackAiImageTelemetry("ai_image_context_detected", {
        heading,
        intent: chosenIntent,
        postId,
        contextType,
        promptLength: rawText.length,
      });
      trackAiImageTelemetry("ai_image_recommendation_shown", {
        heading,
        intent: chosenIntent,
        confidence: classification.confidence,
        preset: intentDef.defaultPreset,
        postId,
      });

      // Auto-focus prompt textarea
      const timer = setTimeout(() => {
        promptInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    } else {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [
    isOpen,
    initialPrompt,
    initialStyle,
    initialAspectRatio,
    heading,
    sourceContext,
    visualSuggestion,
    initialIntent,
    initialConfidence,
    recommendationReason,
    contextType,
    articleTitle,
    postId,
  ]);

  // Loading animation step simulator
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (modalState === "generating") {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [modalState]);

  // ─── Intent Switching & Recommendation Handling ─────────────────────────────

  const handleApplyRecommendation = useCallback(() => {
    const targetIntent = recommendation.intent;
    setActiveIntent(targetIntent);
    const def = VISUAL_INTENTS[targetIntent] || VISUAL_INTENTS.architecture;
    setSelectedStyle(def.defaultPreset);
    setSelectedRatio(def.defaultRatio);

    const structuredPrompt = generateStructuredAiImagePrompt({
      text: sourceContext || initialPrompt,
      heading,
      intent: targetIntent,
      articleTitle,
    });
    setPrompt(structuredPrompt);
    setShowIntentSelector(false);
    toast.success(`Applied ${def.label} recommendation`);
  }, [recommendation, sourceContext, initialPrompt, heading, articleTitle]);

  const handleSelectIntent = useCallback(
    (newIntent: VisualIntent) => {
      setActiveIntent(newIntent);
      const def = VISUAL_INTENTS[newIntent] || VISUAL_INTENTS.technical_illustration;
      setSelectedStyle(def.defaultPreset);
      setSelectedRatio(def.defaultRatio);

      const structuredPrompt = generateStructuredAiImagePrompt({
        text: sourceContext || initialPrompt,
        heading,
        intent: newIntent,
        articleTitle,
      });
      setPrompt(structuredPrompt);
      toast.info(`Switched to ${def.label}`);
    },
    [sourceContext, initialPrompt, heading, articleTitle]
  );

  // ─── Actions ────────────────────────────────────────────────────────────────

  const handleGenerate = useCallback(
    async (forceRegenerate = false) => {
      if (!prompt.trim()) {
        toast.error("Please enter a prompt for the image.");
        promptInputRef.current?.focus();
        return;
      }

      setModalState("generating");
      setErrorMessage(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const freshSeed = Math.floor(Math.random() * 1_000_000);
      generationStartTimeRef.current = Date.now();

      // Telemetry: visual_generation_started
      const analyticsAction = forceRegenerate
        ? "ai_image_regenerated"
        : "ai_image_generated";

      trackAiImageTelemetry(analyticsAction, {
        heading: heading || visualSuggestion?.heading || "AI Assist Image",
        intent: activeIntent,
        preset: selectedStyle,
        postId,
        contextType,
        promptLength: prompt.trim().length,
      });

      try {
        const asset = await aiVisualApi.generateIllustration(
          {
            prompt: prompt.trim(),
            style: selectedStyle,
            aspectRatio: selectedRatio,
            seed: freshSeed,
            force: true,
          },
          controller.signal
        );

        const latencyMs = Date.now() - generationStartTimeRef.current;
        setGeneratedAsset(asset);
        if (!altText.trim()) {
          setAltText(asset.alt || prompt.trim());
        }
        setModalState("preview");

        // Telemetry: success
        trackAiImageTelemetry("visual_generation_started", {
          heading: heading || "AI Assist Image",
          intent: activeIntent,
          preset: selectedStyle,
          postId,
          latencyMs,
          success: true,
          model: asset.model,
        });

        if (asset.isReused) {
          toast.info("Reused matching illustration from library");
        } else {
          toast.success("Technical visual generated successfully!");
        }
      } catch (err: any) {
        if (controller.signal.aborted || err.message?.includes("cancelled")) {
          setModalState(generatedAsset ? "preview" : "idle");
          toast.info("Generation cancelled");
          return;
        }

        const latencyMs = Date.now() - generationStartTimeRef.current;
        console.error("[AIImageModal] Generation failed:", err);
        const friendlyMessage =
          err.response?.data?.error ||
          err.message ||
          "Failed to generate image. Please check your prompt and try again.";
        setErrorMessage(friendlyMessage);
        setModalState("error");
        toast.error(friendlyMessage);

        trackAiImageTelemetry("visual_generation_started", {
          heading: heading || "AI Assist Image",
          intent: activeIntent,
          preset: selectedStyle,
          postId,
          latencyMs,
          success: false,
        });
      }
    },
    [
      prompt,
      selectedStyle,
      selectedRatio,
      heading,
      visualSuggestion,
      postId,
      generatedAsset,
      altText,
      activeIntent,
      contextType,
    ]
  );

  const handleCancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setModalState(generatedAsset ? "preview" : "idle");
  }, [generatedAsset]);

  const handleAccept = useCallback(() => {
    if (!generatedAsset) return;

    // Telemetry: ai_image_accepted
    trackAiImageTelemetry("ai_image_accepted", {
      heading: heading || visualSuggestion?.heading || "AI Assist Image",
      intent: activeIntent,
      preset: selectedStyle,
      postId,
      contextType,
      model: generatedAsset.model,
    });

    setModalState("accepted");
    onInsert(
      generatedAsset,
      altText.trim() || prompt.trim(),
      caption.trim() || undefined
    );
    onClose();
  }, [
    generatedAsset,
    heading,
    visualSuggestion,
    activeIntent,
    selectedStyle,
    postId,
    contextType,
    onInsert,
    altText,
    prompt,
    caption,
    onClose,
  ]);

  const handleRejectOrClose = useCallback(() => {
    if (modalState === "preview") {
      trackAiImageTelemetry("ai_image_rejected", {
        heading,
        intent: activeIntent,
        postId,
        contextType,
      });
    }
    onClose();
  }, [modalState, heading, activeIntent, postId, contextType, onClose]);

  // ─── Keyboard Shortcuts ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape: Close modal and abort any in-flight request
      if (e.key === "Escape") {
        e.preventDefault();
        if (modalState === "generating" && abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        handleRejectOrClose();
        return;
      }

      // Cmd/Ctrl + Enter
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (modalState === "preview") {
          handleAccept();
        } else if (modalState === "idle" || modalState === "error") {
          handleGenerate(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, modalState, handleAccept, handleGenerate, handleRejectOrClose]);

  if (!isOpen) return null;

  const currentIntentDef = VISUAL_INTENTS[activeIntent] || VISUAL_INTENTS.architecture;
  const IntentIcon = currentIntentDef.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-image-modal-title"
      tabIndex={-1}
      onClick={(e) => {
        // Backdrop click closes dialog safely (only if not currently generating)
        if (e.target === e.currentTarget && modalState !== "generating") {
          handleRejectOrClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in-50 duration-200"
    >
      <div
        ref={modalContainerRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* ── Modal Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200/80 dark:border-violet-800/60 text-violet-600 dark:text-violet-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="ai-image-modal-title"
                  className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  AI Image
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                  AI Visual Assistant
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                Context-aware visual recommendations and structured diagram synthesis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRejectOrClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Modal Body (Single Scrollable View) ─────────────────────────────── */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-sm">
          {/* ── Sprint 3 Lightweight Recommendation Card ──────────────────────── */}
          {recommendation && (
            <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-violet-600 dark:text-violet-400">
                        AI Recommendation
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-700 dark:text-violet-300">
                        {Math.round(recommendation.confidence * 100)}% match
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 flex items-center gap-1.5">
                      <IntentIcon className="w-3.5 h-3.5 text-violet-500" />
                      <span>{currentIntentDef.label}</span>
                    </h3>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      {recommendation.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleApplyRecommendation}
                    disabled={modalState === "generating"}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/60 hover:bg-violet-200 dark:hover:bg-violet-800 border border-violet-300 dark:border-violet-700 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    Use Recommendation
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowIntentSelector((prev) => !prev)}
                    className="p-1 rounded-lg text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Change Visual Intent"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Intent Tabs Selector */}
              {showIntentSelector && (
                <div className="pt-2 border-t border-violet-500/20 space-y-1.5 animate-in fade-in-50">
                  <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                    Explore different visual intents for this section:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {VISUAL_INTENT_LIST.map((def) => {
                      const Icon = def.icon;
                      const isSelected = activeIntent === def.id;
                      return (
                        <button
                          key={def.id}
                          type="button"
                          onClick={() => handleSelectIntent(def.id)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                              : "bg-white/60 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                          }`}
                        >
                          <Icon className="w-3 h-3 shrink-0" />
                          <span>{def.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Raw Text Selection Context Pill */}
          {sourceContext && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300">
              <span className="text-zinc-400 shrink-0 font-medium">Context ({contextType}):</span>
              <span className="truncate italic">&ldquo;{sourceContext}&rdquo;</span>
            </div>
          )}

          {/* 1. Prompt Input Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="ai-image-prompt-input" className="font-semibold text-zinc-800 dark:text-zinc-200">
                Generation Prompt
              </label>
              <span className="text-[11px] text-zinc-400 font-mono">
                {prompt.length} / 1000
              </span>
            </div>
            <textarea
              ref={promptInputRef}
              id="ai-image-prompt-input"
              rows={4}
              value={prompt}
              disabled={modalState === "generating"}
              onChange={(e) => setPrompt(e.target.value.slice(0, 1000))}
              onKeyDown={(e) => {
                // Ensure Cmd+A selects prompt text without bubbling to editor
                if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
                  e.stopPropagation();
                }
              }}
              placeholder="Create a technical illustration of..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 px-3.5 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all resize-none disabled:opacity-60 leading-relaxed font-mono sm:font-sans"
            />

            {/* Prompt Enhancement Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] text-zinc-400 font-medium shrink-0">Ideas:</span>
              {SUGGESTED_PROMPT_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={modalState === "generating"}
                  onClick={() => setPrompt(chip)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300 border border-zinc-200/80 dark:border-zinc-700/60 transition-colors cursor-pointer truncate max-w-[210px] disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Style Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-zinc-800 dark:text-zinc-200">
                Style Preset
              </label>
              <span className="text-[10px] text-zinc-400">
                Recommended: {VISUAL_INTENTS[activeIntent]?.defaultPreset}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STYLE_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedStyle === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={modalState === "generating"}
                    onClick={() => setSelectedStyle(preset.id)}
                    title={preset.hint}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border transition-all cursor-pointer text-left disabled:opacity-60 ${
                      isSelected
                        ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                        : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Aspect Ratio Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((ratio) => {
                const isSelected = selectedRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    type="button"
                    disabled={modalState === "generating"}
                    onClick={() => setSelectedRatio(ratio.id)}
                    className={`flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-medium border transition-all cursor-pointer disabled:opacity-60 ${
                      isSelected
                        ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                        : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className="font-semibold">{ratio.label}</span>
                    <span className="text-[10px] opacity-75">({ratio.description})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Preview Area (Always present as specified in ASCII layout) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-zinc-800 dark:text-zinc-200">
                Visual Preview
              </label>
              {modalState === "preview" && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready to Insert
                </span>
              )}
            </div>

            {/* Container */}
            <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950/90 min-h-[220px] max-h-[320px] flex items-center justify-center">
              {/* STATE 1: IDLE */}
              {modalState === "idle" && (
                <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-400">
                  <ImageIcon className="w-8 h-8 text-zinc-600 mb-2 opacity-60" />
                  <p className="text-xs font-medium text-zinc-400">
                    No visual generated yet
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Click &ldquo;Generate Image&rdquo; below to preview
                  </p>
                </div>
              )}

              {/* STATE 2: GENERATING */}
              {modalState === "generating" && (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3" aria-live="polite">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-violet-950/80 border border-violet-800 flex items-center justify-center text-violet-400">
                      <RotateCw className="w-6 h-6 animate-spin" />
                    </div>
                    <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-violet-600 text-white">
                      <Sparkles className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-zinc-100">
                      {loadingStep === 0 && `Applying ${currentIntentDef.label} preset...`}
                      {loadingStep === 1 && "Synthesizing technical diagram architecture..."}
                      {loadingStep >= 2 && "Rendering high-resolution vector visual..."}
                    </p>
                    <p className="text-[11px] text-zinc-400 max-w-sm truncate">
                      &ldquo;{prompt}&rdquo;
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-48 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500 rounded-full"
                      style={{
                        width: loadingStep === 0 ? "35%" : loadingStep === 1 ? "75%" : "95%",
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCancelGeneration}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 underline underline-offset-2 cursor-pointer pt-1"
                  >
                    Cancel Generation
                  </button>
                </div>
              )}

              {/* STATE 3: PREVIEW */}
              {modalState === "preview" && generatedAsset && (
                <div className="relative w-full h-full flex items-center justify-center max-h-[320px]">
                  <img
                    src={generatedAsset.url}
                    alt={altText || generatedAsset.prompt}
                    className="w-full h-full object-contain max-h-[320px] rounded-lg"
                  />

                  {/* Badges overlay */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md border border-white/10 flex items-center gap-1">
                      <IntentIcon className="w-3 h-3 text-violet-400" />
                      <span>{currentIntentDef.label}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/70 text-zinc-300 backdrop-blur-md border border-white/10">
                      {selectedStyle}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/70 text-zinc-300 backdrop-blur-md border border-white/10">
                      {selectedRatio}
                    </span>
                    {generatedAsset.isReused && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/80 text-white backdrop-blur-md">
                        Library Match
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* STATE 4: ERROR */}
              {modalState === "error" && (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 text-rose-300" aria-live="polite">
                  <AlertCircle className="w-8 h-8 text-rose-500" />
                  <p className="text-xs font-semibold text-rose-200">Generation Failed</p>
                  <p className="text-[11px] text-rose-300/80 max-w-sm">
                    {errorMessage || "Unable to complete image generation."}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleGenerate(false)}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 hover:bg-rose-900 text-xs font-medium cursor-pointer"
                  >
                    Retry Generation
                  </button>
                </div>
              )}
            </div>

            {/* Metadata and Alt Text / Caption Inputs (When in Preview state) */}
            {modalState === "preview" && generatedAsset && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Alt Text Input */}
                  <div className="space-y-1">
                    <label htmlFor="ai-image-alt-input" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Alt Text (SEO &amp; Accessibility)</span>
                    </label>
                    <input
                      id="ai-image-alt-input"
                      type="text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Descriptive alt text..."
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/30"
                    />
                  </div>

                  {/* Caption Input */}
                  <div className="space-y-1">
                    <label htmlFor="ai-image-caption-input" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <AlignLeft className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Caption (Optional)</span>
                    </label>
                    <input
                      id="ai-image-caption-input"
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Figure 1: Architecture diagram..."
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/30"
                    />
                  </div>
                </div>

                {/* Technical Meta Footer */}
                <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 font-mono">
                  <span>Intent: {currentIntentDef.label}</span>
                  <span>Model: {generatedAsset.model || "gemini-imagen"}</span>
                  {generatedAsset.seed && <span>Seed: {generatedAsset.seed}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Modal Footer ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <button
            type="button"
            onClick={handleRejectOrClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {/* When Generating: Show disabled loading button */}
            {modalState === "generating" && (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600/70 cursor-not-allowed"
              >
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </button>
            )}

            {/* When in Preview: Allow Regenerate or Accept Image */}
            {modalState === "preview" && (
              <>
                <button
                  type="button"
                  onClick={() => handleGenerate(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>

                <button
                  type="button"
                  onClick={handleAccept}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept Image</span>
                  <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-normal opacity-80 ml-1">
                    <Command className="w-2.5 h-2.5" />↵
                  </span>
                </button>
              </>
            )}

            {/* When in Idle or Error: Primary CTA */}
            {(modalState === "idle" || modalState === "error") && (
              <button
                type="button"
                onClick={() => handleGenerate(false)}
                disabled={!prompt.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-violet-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Generate Image</span>
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-normal opacity-80 ml-1">
                  <Command className="w-2.5 h-2.5" />↵
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIImageModal;
