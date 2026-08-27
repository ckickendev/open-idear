"use client";

// =============================================================================
//  ONE CLICK AI PUBLISHER — GENERATION MODAL
//  src/features/ai/components/AIGenerationModal.tsx
//
//  Interactive modal displaying:
//  - Form inputs for Topic, Category, Audience, Tone, Goal, Length
//  - Realtime progress dashboard for all 6 pipeline stages:
//      1. Planner → 2. Writer → 3. Growth → 4. Structure → 5. SEO → 6. Save Draft
//  - Elapsed timers, status indicators (idle/running/completed/error)
//  - Stage output summaries
//  - Abort button, Retry stage button, Apply to Editor button
// =============================================================================

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Ban,
  FileCheck,
  ChevronRight,
} from "lucide-react";
import { useAIGeneratorPipeline } from "../hooks/useAIGeneratorPipeline";
import type {
  PipelineInput,
  PipelineStageState,
  PipelineData,
} from "../types/pipeline.types";

export interface AIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  initialCategory?: string;
  onApplyGeneratedContent: (data: PipelineData) => void;
  onAutosaveDraft?: (data: PipelineData) => Promise<void>;
}

export const AIGenerationModal: React.FC<AIGenerationModalProps> = ({
  isOpen,
  onClose,
  initialTopic = "",
  initialCategory = "general",
  onApplyGeneratedContent,
  onAutosaveDraft,
}) => {
  // Form states
  const [topic, setTopic] = useState(initialTopic);
  const [category, setCategory] = useState(initialCategory);
  const [audience, setAudience] = useState("developers");
  const [tone, setTone] = useState("informative");
  const [length, setLength] = useState("medium");
  const [goal, setGoal] = useState("educate and provide practical code examples");
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      if (initialTopic) setTopic(initialTopic);
      if (initialCategory) setCategory(initialCategory);
    }
  }, [isOpen, initialTopic, initialCategory]);

  const pipeline = useAIGeneratorPipeline({
    onAutosave: async (data) => {
      if (onAutosaveDraft) {
        await onAutosaveDraft(data);
      }
    },
  });

  if (!isOpen) return null;

  const currentInput: PipelineInput = {
    topic: topic.trim(),
    category,
    audience,
    tone,
    length,
    goal,
    additionalInstructions: additionalInstructions.trim() || undefined,
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    await pipeline.startPipeline(currentInput);
  };

  const handleApply = () => {
    onApplyGeneratedContent(pipeline.pipelineData);
    onClose();
  };

  const isRunning = pipeline.pipelineStatus === "running";
  const isCompleted = pipeline.pipelineStatus === "completed";
  const isError = pipeline.pipelineStatus === "error";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-[fade-in_0.2s_ease-out]">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-[var(--color-editor-surface,hsl(240,10%,10%))] border border-[var(--color-editor-border,hsl(240,10%,20%))] shadow-2xl text-[var(--color-editor-text,white)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-editor-border)] bg-[var(--color-editor-bg)]/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[var(--color-editor-text)] flex items-center gap-2">
                1-Click AI Publisher
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                  Sprint 5 Pipeline
                </span>
              </h2>
              <p className="text-xs text-[var(--color-editor-muted)]">
                Planner → Writer → Growth → Structure → SEO → Save Draft
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isRunning}
            className="p-1.5 rounded-lg text-[var(--color-editor-muted)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] transition-colors disabled:opacity-30 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Input Parameters Form (if not running/completed or allowing tweak) */}
          {pipeline.pipelineStatus === "idle" && (
            <form onSubmit={handleStart} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-editor-muted)] mb-1.5">
                  Article Topic / Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Building Scalable Microservices with Node.js & Docker"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] text-sm text-[var(--color-editor-text)] focus:outline-none focus:border-[var(--color-editor-accent)] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-editor-muted)] mb-1">
                    Audience
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] text-xs text-[var(--color-editor-text)] focus:outline-none"
                  >
                    <option value="developers">Developers</option>
                    <option value="architects">Software Architects</option>
                    <option value="beginners">Beginners</option>
                    <option value="executives">Tech Executives</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-editor-muted)] mb-1">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] text-xs text-[var(--color-editor-text)] focus:outline-none"
                  >
                    <option value="informative">Informative</option>
                    <option value="authoritative">Authoritative</option>
                    <option value="conversational">Conversational</option>
                    <option value="tutorial">Hands-on Tutorial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-editor-muted)] mb-1">
                    Length
                  </label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] text-xs text-[var(--color-editor-text)] focus:outline-none"
                  >
                    <option value="short">Short (~800 words)</option>
                    <option value="medium">Medium (~1500 words)</option>
                    <option value="long">In-depth (~2500 words)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-editor-muted)] mb-1">
                  Primary Objective / Goal
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. educate and provide practical code examples"
                  className="w-full px-3.5 py-1.5 rounded-lg bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] text-xs text-[var(--color-editor-text)] focus:outline-none focus:border-[var(--color-editor-accent)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-editor-muted)] mb-1">
                  Additional Guidance (Optional)
                </label>
                <input
                  type="text"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g. Include TypeScript code snippets and comparison table"
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] text-xs text-[var(--color-editor-text)] focus:outline-none focus:border-[var(--color-editor-accent)] transition-colors"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!topic.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-editor-accent)] hover:bg-[var(--color-editor-accent-hover)] text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Start 1-Click Generation
                </button>
              </div>
            </form>
          )}

          {/* Pipeline Realtime Dashboard (when running, completed, error, or aborted) */}
          {pipeline.pipelineStatus !== "idle" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-editor-muted)]">
                  Pipeline Execution Progress
                </p>
                {isRunning && (
                  <span className="flex items-center gap-1.5 text-xs text-indigo-400 animate-pulse font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Executing pipeline...
                  </span>
                )}
                {isCompleted && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                    <FileCheck className="w-4 h-4" /> All 6 Stages Completed!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {pipeline.stages.map((stage) => (
                  <StageCard
                    key={stage.id}
                    stage={stage}
                    isCurrent={pipeline.currentStageId === stage.id}
                    onRetry={() => pipeline.retryStage(stage.id, currentInput)}
                    disabled={isRunning}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-editor-border)] bg-[var(--color-editor-bg)]/80">
          <div>
            {pipeline.pipelineStatus !== "idle" && (
              <button
                type="button"
                onClick={pipeline.resetPipeline}
                disabled={isRunning}
                className="flex items-center gap-1.5 text-xs text-[var(--color-editor-muted)] hover:text-[var(--color-editor-text)] transition-colors disabled:opacity-40 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Start Over
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isRunning && (
              <button
                type="button"
                onClick={pipeline.abortPipeline}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 font-medium text-xs border border-red-500/30 transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" /> Abort Generation
              </button>
            )}

            {isCompleted && (
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
              >
                Apply & Open Editor <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {isError && (
              <button
                type="button"
                onClick={() => {
                  const failedStage = pipeline.stages.find((s) => s.status === "error");
                  if (failedStage) {
                    pipeline.retryStage(failedStage.id, currentInput);
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs tracking-wide transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retry Failed Stage
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component: Individual Stage Progress Card
function StageCard({
  stage,
  isCurrent,
  onRetry,
  disabled,
}: {
  stage: PipelineStageState;
  isCurrent: boolean;
  onRetry: () => void;
  disabled: boolean;
}) {
  const formatTime = (ms: number) => (ms / 1000).toFixed(1) + "s";

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all ${
        isCurrent
          ? "bg-indigo-500/10 border-indigo-500/40 shadow-sm"
          : stage.status === "completed"
          ? "bg-emerald-500/5 border-emerald-500/20"
          : stage.status === "error"
          ? "bg-red-500/10 border-red-500/30"
          : "bg-[var(--color-editor-elevated)] border-[var(--color-editor-border)] opacity-65"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Status Icon */}
          <div>
            {stage.status === "running" && (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            )}
            {stage.status === "completed" && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            {stage.status === "error" && (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            {stage.status === "idle" && (
              <div className="w-4 h-4 rounded-full border-2 border-[var(--color-editor-border)]" />
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold text-[var(--color-editor-text)] flex items-center gap-2">
              {stage.name}
              {stage.status === "completed" && (
                <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.2 rounded">
                  Done
                </span>
              )}
              {stage.status === "error" && (
                <span className="text-[9px] font-semibold text-red-400 uppercase tracking-wider bg-red-500/10 px-1.5 py-0.2 rounded">
                  Failed
                </span>
              )}
            </h4>
            <p className="text-[11px] text-[var(--color-editor-muted)]">
              {stage.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Elapsed Timer */}
          <span className="text-xs font-mono text-[var(--color-editor-muted)] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(stage.elapsedTimeMs)}
          </span>

          {/* Individual Retry button if failed */}
          {stage.status === "error" && !disabled && (
            <button
              type="button"
              onClick={onRetry}
              className="px-2.5 py-1 text-[10px] font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Retry
            </button>
          )}
        </div>
      </div>

      {/* Output Summary or Error Message */}
      {stage.outputSummary && stage.status === "completed" && (
        <div className="mt-2 pt-2 border-t border-emerald-500/15 text-[11px] font-mono text-emerald-300/90 leading-relaxed bg-emerald-500/5 p-2 rounded-lg">
          {stage.outputSummary}
        </div>
      )}

      {stage.error && stage.status === "error" && (
        <div className="mt-2 pt-2 border-t border-red-500/20 text-[11px] font-mono text-red-300 leading-relaxed bg-red-500/10 p-2 rounded-lg">
          ⚠️ {stage.error}
        </div>
      )}
    </div>
  );
}
