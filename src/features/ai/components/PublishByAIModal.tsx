"use client";

// =============================================================================
//  PUBLISH BY AI MODAL
//  src/features/ai/components/PublishByAIModal.tsx
//
//  Streamlined modal for the "Publish by AI" feature.
//  User enters: Topic (required), Audience, Length.
//  A single "Generate" call runs the full backend pipeline and returns
//  a ready-to-use article. On success, `onApply(data)` is called.
//
//  Design Decisions:
//  - Distinct amber/orange gradient to visually separate from the existing
//    violet "1-Click AI Publisher" modal.
//  - Live elapsed timer so the user knows generation is in progress.
//  - Error banner with Retry affordance.
//  - No pipeline stages shown here — this is intentionally simpler.
// =============================================================================

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  Zap,
  Loader2,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Clock,
  ChevronRight,
  FileText,
} from "lucide-react";
import { usePublishByAI } from "../hooks/usePublishByAI";
import type { PublisherResponse, PublisherRequest } from "../api/publisher.api";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PublishByAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-fill the topic field (e.g. from the current editor title). */
  initialTopic?: string;
  /**
   * Called when generation succeeds.
   * The parent EditorShell uses this to populate the editor and save as Draft.
   */
  onApply: (data: PublisherResponse) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PublishByAIModal: React.FC<PublishByAIModalProps> = ({
  isOpen,
  onClose,
  initialTopic = "",
  onApply,
}) => {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [topic, setTopic] = useState(initialTopic);
  const [audience, setAudience] = useState("developers");
  const [length, setLength] = useState("medium");

  // Sync initial topic when modal opens
  useEffect(() => {
    if (isOpen && initialTopic) setTopic(initialTopic);
  }, [isOpen, initialTopic]);

  const topicRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => topicRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // ── AI mutation hook ─────────────────────────────────────────────────────────
  const ai = usePublishByAI();

  // Auto-close and apply on success
  useEffect(() => {
    if (ai.isSuccess && ai.data) {
      onApply(ai.data);
      onClose();
    }
  }, [ai.isSuccess, ai.data, onApply, onClose]);

  // Reset hook state when modal reopens
  useEffect(() => {
    if (isOpen) ai.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || ai.isPending) return;

    const payload: PublisherRequest = {
      topic: topic.trim(),
      audience,
      length,
      goal: "educate and provide actionable insights",
      tone: "informative",
    };
    await ai.generate(payload);
  };

  const handleRetry = () => {
    ai.reset();
  };

  const handleClose = () => {
    if (ai.isPending) ai.abort();
    onClose();
  };

  // Elapsed timer display
  const elapsedSec = (ai.elapsedMs / 1000).toFixed(1);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
      style={{ animation: "fade-in 0.2s ease-out" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-by-ai-title"
    >
      <div className="relative w-full max-w-lg flex flex-col rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          background: "var(--color-editor-surface, hsl(240,10%,10%))",
          borderColor: "var(--color-editor-border, hsl(240,10%,20%))",
          color: "var(--color-editor-text, white)",
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--color-editor-border)", background: "var(--color-editor-bg, transparent)" }}
        >
          <div className="flex items-center gap-3">
            {/* Amber icon to differentiate from violet 1-Click AI */}
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="publish-by-ai-title"
                className="text-base font-bold tracking-tight flex items-center gap-2"
                style={{ color: "var(--color-editor-text)" }}
              >
                Publish by AI
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Sprint 1
                </span>
              </h2>
              <p className="text-xs" style={{ color: "var(--color-editor-muted)" }}>
                Topic → Article → Draft saved automatically
              </p>
            </div>
          </div>

          <button
            type="button"
            id="publish-by-ai-close"
            onClick={handleClose}
            disabled={ai.isPending}
            className="p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
            style={{ color: "var(--color-editor-muted)" }}
            aria-label="Close Publish by AI modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="p-6">

          {/* ── Error State ─────────────────────────────────────────────── */}
          {ai.isError && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-400">Generation failed</p>
                <p className="text-xs text-red-300/80 mt-0.5">{ai.errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}

          {/* ── Form ────────────────────────────────────────────────────── */}
          {!ai.isError && (
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Topic */}
              <div>
                <label
                  htmlFor="publish-ai-topic"
                  className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--color-editor-muted)" }}
                >
                  Article Topic <span className="text-red-400">*</span>
                </label>
                <input
                  ref={topicRef}
                  id="publish-ai-topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Docker Networking"
                  required
                  disabled={ai.isPending}
                  className="w-full px-4 py-3 rounded-xl text-sm transition-colors focus:outline-none disabled:opacity-60"
                  style={{
                    background: "var(--color-editor-elevated)",
                    border: "1px solid var(--color-editor-border)",
                    color: "var(--color-editor-text)",
                  }}
                />
                <p className="text-[11px] mt-1" style={{ color: "var(--color-editor-muted)" }}>
                  Be specific — the more precise the topic, the better the article.
                </p>
              </div>

              {/* Audience + Length */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="publish-ai-audience"
                    className="block text-[10px] font-bold uppercase tracking-wider mb-1"
                    style={{ color: "var(--color-editor-muted)" }}
                  >
                    Audience
                  </label>
                  <select
                    id="publish-ai-audience"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    disabled={ai.isPending}
                    className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none cursor-pointer disabled:opacity-60"
                    style={{
                      background: "var(--color-editor-elevated)",
                      border: "1px solid var(--color-editor-border)",
                      color: "var(--color-editor-text)",
                    }}
                  >
                    <option value="developers">Developers</option>
                    <option value="architects">Software Architects</option>
                    <option value="beginners">Beginners</option>
                    <option value="executives">Tech Executives</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="publish-ai-length"
                    className="block text-[10px] font-bold uppercase tracking-wider mb-1"
                    style={{ color: "var(--color-editor-muted)" }}
                  >
                    Article Length
                  </label>
                  <select
                    id="publish-ai-length"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    disabled={ai.isPending}
                    className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none cursor-pointer disabled:opacity-60"
                    style={{
                      background: "var(--color-editor-elevated)",
                      border: "1px solid var(--color-editor-border)",
                      color: "var(--color-editor-text)",
                    }}
                  >
                    <option value="short">Short (~800 words)</option>
                    <option value="medium">Medium (~1,500 words)</option>
                    <option value="long">In-depth (~2,500 words)</option>
                  </select>
                </div>
              </div>

              {/* What AI will do */}
              <div
                className="rounded-xl p-3.5 border"
                style={{
                  background: "var(--color-editor-elevated)",
                  borderColor: "var(--color-editor-border)",
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--color-editor-muted)" }}>
                  What happens next
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Generate title, outline & keywords",
                    "Write full article in Markdown",
                    "Structure into ArticleBlock[] format",
                    "Auto-save as Draft",
                  ].map((step, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs" style={{ color: "var(--color-editor-text)" }}>
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                        style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b" }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Generate button */}
              <button
                type="submit"
                id="publish-ai-generate"
                disabled={!topic.trim() || ai.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm tracking-wide text-white transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
                style={{
                  background: (!topic.trim() || ai.isPending)
                    ? "var(--color-editor-elevated)"
                    : "linear-gradient(135deg, #f59e0b, #ea580c)",
                  boxShadow: (!topic.trim() || ai.isPending) ? "none" : "0 4px 20px rgba(245,158,11,0.3)",
                }}
              >
                {ai.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating article…</span>
                    <span
                      className="ml-auto flex items-center gap-1 text-[11px] font-mono opacity-75"
                    >
                      <Clock className="w-3 h-3" />
                      {elapsedSec}s
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Article</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── Retry after error ──────────────────────────────────────── */}
          {ai.isError && (
            <button
              type="button"
              onClick={handleRetry}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all cursor-pointer"
              style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)" }}
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>

        {/* ── Loading overlay ──────────────────────────────────────────────── */}
        {ai.isPending && (
          <div
            className="px-6 pb-5 flex items-center gap-3"
            style={{ borderTop: "1px solid var(--color-editor-border)" }}
          >
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--color-editor-elevated)" }}>
              <div
                className="h-full rounded-full animate-pulse"
                style={{
                  width: "60%",
                  background: "linear-gradient(90deg, #f59e0b, #ea580c)",
                  animation: "progress-slide 2s ease-in-out infinite",
                }}
              />
            </div>
            <span className="text-[11px] font-mono" style={{ color: "var(--color-editor-muted)" }}>
              {elapsedSec}s
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes progress-slide {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(80%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};
