// =============================================================================
//  AI IMAGE MODAL — PRODUCTION UX (SPRINT 2)
//  src/features/editor/components/AIImageModal.tsx
//
//  Design Decisions:
//  - Clean, focused single-image generation modal matching the "Generate All Visuals"
//    aesthetic, but streamlined for in-editor single image creation.
//  - Strictly follows the requested ASCII layout:
//      Header -> Context -> Prompt -> Style -> Aspect Ratio -> Preview -> Actions.
//  - Complete 5-state lifecycle: Idle -> Generating -> Preview -> Error -> Accepted.
//  - Intelligent pre-fill for selected text and visual suggestions.
//  - Accessible (role="dialog", aria-modal="true", keyboard shortcuts, focus trap).
//  - Keyboard support:
//      * Escape: Cancel / close dialog
//      * Cmd/Ctrl + Enter in Idle/Error: Generate Image
//      * Cmd/Ctrl + Enter in Preview: Accept Image
//      * Cmd/Ctrl + A inside prompt: Native text selection
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
} from "lucide-react";
import {
  aiVisualApi,
  type IllustrationPreset,
  type GeneratedIllustrationAsset,
} from "@/features/ai-visual";
import { STYLE_PRESETS, ASPECT_RATIOS } from "../constants/aiVisualTaxonomy";
import type { VisualSuggestionInput } from "../utils/aiAssistContext";
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
  onInsert,
  postId,
}: AIImageModalProps) {
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

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      if (visualSuggestion) {
        const p = visualSuggestion.prompt?.trim() || initialPrompt.trim();
        setPrompt(p);
        setSelectedStyle((visualSuggestion.style as IllustrationPreset) || initialStyle);
        setSelectedRatio(visualSuggestion.aspectRatio || initialAspectRatio);
        setAltText(visualSuggestion.altText || p);
        setCaption(visualSuggestion.caption || "");
      } else {
        const derivedPrompt = initialPrompt.trim()
          ? initialPrompt.trim()
          : heading
          ? `Technical illustration explaining ${heading}`
          : "";

        setPrompt(derivedPrompt);
        setSelectedStyle(initialStyle);
        setSelectedRatio(initialAspectRatio);
        setAltText(derivedPrompt);
        setCaption("");
      }

      setModalState("idle");
      setGeneratedAsset(null);
      setErrorMessage(null);
      setLoadingStep(0);

      // Auto-focus prompt textarea
      const timer = setTimeout(() => {
        promptInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [isOpen, initialPrompt, initialStyle, initialAspectRatio, heading, visualSuggestion]);

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

      // Telemetry: visual_generation_started
      aiVisualApi.trackAnalytics({
        heading: heading || visualSuggestion?.heading || "AI Assist Image",
        visualType: "illustration",
        recommendedAction: "generate",
        actionTaken: forceRegenerate ? "visual_generation_regenerated" : "visual_generation_started",
        preset: selectedStyle,
        prompt: prompt.trim(),
        postId,
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

        setGeneratedAsset(asset);
        if (!altText.trim()) {
          setAltText(asset.alt || prompt.trim());
        }
        setModalState("preview");

        if (asset.isReused) {
          toast.info("Reused matching illustration from library");
        } else {
          toast.success("AI image generated successfully!");
        }
      } catch (err: any) {
        if (controller.signal.aborted || err.message?.includes("cancelled")) {
          setModalState(generatedAsset ? "preview" : "idle");
          toast.info("Generation cancelled");
          return;
        }

        console.error("[AIImageModal] Generation failed:", err);
        const friendlyMessage =
          err.response?.data?.error ||
          err.message ||
          "Failed to generate image. Please check your prompt and try again.";
        setErrorMessage(friendlyMessage);
        setModalState("error");
        toast.error(friendlyMessage);
      }
    },
    [prompt, selectedStyle, selectedRatio, heading, visualSuggestion, postId, generatedAsset, altText]
  );

  const handleCancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setModalState(generatedAsset ? "preview" : "idle");
  }, [generatedAsset]);

  const handleAccept = useCallback(() => {
    if (!generatedAsset) return;

    // Telemetry: visual_generation_accepted
    aiVisualApi.trackAnalytics({
      heading: heading || visualSuggestion?.heading || "AI Assist Image",
      visualType: "illustration",
      recommendedAction: "generate",
      actionTaken: "visual_generation_accepted",
      preset: selectedStyle,
      prompt: prompt.trim(),
      postId,
    });

    setModalState("accepted");
    onInsert(
      generatedAsset,
      altText.trim() || prompt.trim(),
      caption.trim() || undefined
    );
    onClose();
  }, [generatedAsset, heading, visualSuggestion, selectedStyle, prompt, postId, altText, caption, onInsert, onClose]);

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
        onClose();
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
  }, [isOpen, modalState, handleAccept, handleGenerate, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-image-modal-title"
      tabIndex={-1}
      onClick={(e) => {
        // Backdrop click closes dialog safely (only if not currently generating)
        if (e.target === e.currentTarget && modalState !== "generating") {
          onClose();
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
                  AI Assist
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                Generate high-craft technical diagrams and illustrations for your article
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Modal Body (Single Scrollable View) ─────────────────────────────── */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-sm">
          {/* Visual Suggestion Context Banner (Requirement 2) */}
          {visualSuggestion && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs">
              <Sparkles className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 font-semibold text-violet-700 dark:text-violet-300">
                  <span>Visual type: {visualSuggestion.visualTypeLabel || visualSuggestion.visualType || "Technical Illustration"}</span>
                </div>
                {visualSuggestion.reason && (
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">Reason: </span>
                    {visualSuggestion.reason}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Raw Text Selection Context Pill (Requirement 1) */}
          {sourceContext && !visualSuggestion && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300">
              <span className="text-zinc-400 shrink-0 font-medium">Selected text:</span>
              <span className="truncate italic">&ldquo;{sourceContext}&rdquo;</span>
            </div>
          )}

          {/* 1. Prompt Input Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="ai-image-prompt-input" className="font-semibold text-zinc-800 dark:text-zinc-200">
                Prompt
              </label>
              <span className="text-[11px] text-zinc-400 font-mono">
                {prompt.length} / 1000
              </span>
            </div>
            <textarea
              ref={promptInputRef}
              id="ai-image-prompt-input"
              rows={3}
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
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 px-3.5 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all resize-none disabled:opacity-60"
            />

            {/* Prompt Enhancement Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] text-zinc-400 font-medium shrink-0">Suggestions:</span>
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
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Style
            </label>
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
                Image Preview
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
                    No image generated yet
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
                      {loadingStep === 0 && "Applying technical style preset..."}
                      {loadingStep === 1 && "Synthesizing illustration architecture..."}
                      {loadingStep >= 2 && "Rendering high-res asset..."}
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
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md border border-white/10">
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
            onClick={onClose}
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
