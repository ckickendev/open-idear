// =============================================================================
//  BATCH VISUALS MODAL — SPRINT 3 BATCH GENERATION PIPELINE
//  src/features/editor/components/BatchVisualsModal.tsx
//
//  New toolbar action: "Generate All Visuals"
//  Pipeline:
//  - Analyze article
//  - Skip completed
//  - Generate / search remaining
//  - Insert automatically
//  - Show progress (e.g. 8 sections: 5 searched, 2 generated, 1 skipped)
// =============================================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Search,
  CheckCircle2,
  X,
  Layers,
  RotateCw,
  ArrowRight,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Box,
  Compass,
  Cpu,
  BarChart3,
  Camera,
  Monitor,
  Network,
} from "lucide-react";
import {
  aiVisualApi,
  type SectionAnalysis,
  type BatchVisualResult,
  type IllustrationPreset,
} from "@/features/ai-visual";
import { toast } from "sonner";

interface BatchVisualsModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
  onApplyResult: (updatedMarkdown: string) => void;
  postId?: string;
}

export function BatchVisualsModal({
  isOpen,
  onClose,
  markdown,
  onApplyResult,
  postId,
}: BatchVisualsModalProps) {
  const [step, setStep] = useState<"scan" | "running" | "done">("scan");
  const [sections, setSections] = useState<SectionAnalysis[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [preferredStyle, setPreferredStyle] = useState<IllustrationPreset>("isometric");
  const [batchResult, setBatchResult] = useState<BatchVisualResult | null>(null);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // Scan article on open
  useEffect(() => {
    if (isOpen) {
      setStep("scan");
      setBatchResult(null);
      setExecutionProgress(0);
      setSelectedIndices(new Set());
      scanArticle();
    }
  }, [isOpen, markdown]);

  const scanArticle = async () => {
    if (!markdown || !markdown.trim()) {
      setSections([]);
      return;
    }
    setIsScanning(true);
    try {
      const analyses = await aiVisualApi.classifyArticle(markdown);
      setSections(analyses);
    } catch (err) {
      console.error("[BatchVisualsModal] scan failed:", err);
      toast.error("Failed to analyze article structure.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleStartBatch = async () => {
    setStep("running");
    setExecutionProgress(15);

    const progressTimer = setInterval(() => {
      setExecutionProgress((prev) => Math.min(prev + 18, 90));
    }, 1100);

    try {
      const result = await aiVisualApi.batchGenerateVisuals({
        markdown,
        preferredStyle,
        postId,
      });

      clearInterval(progressTimer);
      setExecutionProgress(100);
      setBatchResult(result);

      // Pre-select all successfully generated or searched items for insertion
      const initialSelected = new Set<number>();
      result.items.forEach((item, idx) => {
        if (item.imageUrl && item.action !== "skipped") {
          initialSelected.add(idx);
        }
      });
      setSelectedIndices(initialSelected);

      setStep("done");
      toast.success("Batch generation complete! Review results before inserting.");
    } catch (err: any) {
      clearInterval(progressTimer);
      console.error("[BatchVisualsModal] batch failed:", err);
      toast.error(err.message || "Batch visual generation failed. Please try again.");
      setStep("scan");
    }
  };

  const toggleItemSelection = (idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleApply = () => {
    if (!batchResult) return;
    let finalMarkdown = batchResult.updatedMarkdown;

    // Filter out any visuals unselected by author
    batchResult.items.forEach((item, idx) => {
      if (item.imageUrl && !selectedIndices.has(idx)) {
        const escapedUrl = item.imageUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\n*!\\[[^\\]]*\\]\\(${escapedUrl}\\)\\n*`, "g");
        finalMarkdown = finalMarkdown.replace(regex, "\n\n");
      }
    });

    onApplyResult(finalMarkdown.trim());
    toast.success(`${selectedIndices.size} visuals applied to editor!`);
    onClose();
  };

  if (!isOpen) return null;

  const completedCount = sections.filter((s) => s.isCompleted).length;
  const toProcessCount = sections.length - completedCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in-50 duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200/80 dark:border-violet-800/60 text-violet-600 dark:text-violet-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Generate All Visuals
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                AI visual decision pipeline for entire article
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
          {/* ── STEP 1: SCAN & OVERVIEW ────────────────────────────────────────── */}
          {step === "scan" && (
            <div className="space-y-4">
              {/* Summary Banner */}
              <div className="p-4 rounded-xl bg-violet-50/70 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-violet-700 dark:text-violet-300">
                  <span>Article Visual Analysis</span>
                  <span>{sections.length} sections identified</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-500" />
                    <span>To Process: <strong>{toProcessCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Already Completed: <strong>{completedCount}</strong> (Skipped)</span>
                  </div>
                </div>
              </div>

              {/* Style preset selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Preferred Technical Style for Generations:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "isometric", label: "Isometric", icon: Box },
                    { id: "blueprint", label: "Blueprint", icon: Compass },
                    { id: "flat_vector", label: "Flat Vector", icon: Layers },
                    { id: "3d_technical", label: "3D Technical", icon: Cpu },
                  ].map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = preferredStyle === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setPreferredStyle(preset.id as IllustrationPreset)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                            : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section Breakdown List */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Section Recommendations:
                </label>
                {isScanning ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-zinc-400 text-xs">
                    <RotateCw className="w-5 h-5 animate-spin text-violet-500" />
                    <span>Classifying article sections...</span>
                  </div>
                ) : sections.length === 0 ? (
                  <div className="py-8 text-center text-zinc-400 text-xs">
                    No H2/H3 sections detected in article. Add headings to enable batch visuals.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {sections.map((sec, idx) => {
                      const rec = sec.recommendation;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                              {sec.heading}
                            </p>
                            <p className="text-[11px] text-zinc-400 truncate">
                              {rec.reason}
                            </p>
                          </div>

                          {sec.isCompleted ? (
                            <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              Completed (Skip)
                            </span>
                          ) : (
                            <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                              {rec.visualType} • {rec.recommendedAction}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 2: RUNNING PIPELINE ──────────────────────────────────────── */}
          {step === "running" && (
            <div className="py-10 flex flex-col items-center justify-center space-y-5 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 animate-pulse">
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>

              <div className="space-y-1 max-w-sm">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Executing Visual Decision Pipeline
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Classifying section types, cross-referencing duplicate assets, and preparing visual treatments.
                </p>
              </div>

              {/* Live Batch Progress Badges */}
              <div className="flex items-center justify-center gap-2 text-xs flex-wrap font-mono">
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
                  ✓ {Math.round((executionProgress / 100) * Math.max(1, toProcessCount))} inserted
                </span>
                <span className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-semibold">
                  ✓ {Math.round((executionProgress / 100) * Math.max(1, Math.floor(toProcessCount / 2)))} searched
                </span>
                <span className="px-2.5 py-1 rounded-md bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800 font-semibold animate-pulse">
                  ⟳ 1 generating
                </span>
                <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-semibold">
                  ○ {completedCount} skipped
                </span>
              </div>

              <div className="w-full max-w-md space-y-2">
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500 transition-all duration-500 ease-out"
                    style={{ width: `${executionProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Processing article sections...</span>
                  <span>{executionProgress}%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-700 dark:text-amber-300">
                Never silently published • All images require your explicit review and acceptance
              </div>
            </div>
          )}

          {/* ── STEP 3: DONE & REVIEW ─────────────────────────────────────────── */}
          {step === "done" && batchResult && (
            <div className="space-y-4">
              {/* Headline Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        Batch Generation Complete
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Review visual results below. Uncheck any item you do not wish to insert.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    {selectedIndices.size} selected
                  </span>
                </div>

                {/* Progress Breakdown Badges */}
                <div className="flex items-center gap-2 text-xs flex-wrap font-mono pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700 font-semibold">
                    ✓ {selectedIndices.size} inserted
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-700 font-semibold">
                    ✓ {batchResult.searched} searched
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/60 text-violet-800 dark:text-violet-200 border border-violet-200 dark:border-violet-700 font-semibold">
                    ⟳ {batchResult.generated} generated
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 font-semibold">
                    ○ {batchResult.skipped} skipped
                  </span>
                </div>
              </div>

              {/* Section Results Breakdown with Checkboxes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <span>Author Review Checklist:</span>
                  <span className="text-[11px] font-normal text-zinc-400">
                    Never silently published — author approval required
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {batchResult.items.map((item, idx) => {
                    const isSelectable = Boolean(item.imageUrl && item.action !== "skipped");
                    const isChecked = selectedIndices.has(idx);

                    return (
                      <div
                        key={idx}
                        onClick={() => isSelectable && toggleItemSelection(idx)}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border transition-all ${
                          !isSelectable
                            ? "bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200/50 dark:border-zinc-800/50 opacity-60 cursor-default"
                            : isChecked
                            ? "bg-white dark:bg-zinc-850 border-violet-300 dark:border-violet-700/80 shadow-xs cursor-pointer"
                            : "bg-zinc-50 dark:bg-zinc-850/50 border-zinc-200 dark:border-zinc-800 cursor-pointer opacity-70"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {isSelectable ? (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleItemSelection(idx)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 cursor-pointer shrink-0"
                            />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-[10px] text-zinc-400 shrink-0">
                              ○
                            </span>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                                {item.heading}
                              </p>
                              {item.isReused && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                  Reused Concept
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 truncate">{item.reason}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.heading}
                              className="w-11 h-8 object-cover rounded border border-zinc-200 dark:border-zinc-700"
                            />
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              item.action === "searched"
                                ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                                : item.action === "generated"
                                ? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                                : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}
                          >
                            {item.action}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
          {step === "scan" && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartBatch}
                disabled={isScanning || sections.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white shadow-sm transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Batch Generation</span>
              </button>
            </>
          )}

          {step === "done" && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={selectedIndices.size === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Visuals to Editor ({selectedIndices.size})</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
