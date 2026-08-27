// =============================================================================
//  SMART PUBLISH RESULT PANEL
//  src/features/publish/components/SmartPublishResult.tsx
//
//  Design Decisions:
//  - Renders each AI-generated field with accept/reject toggle.
//  - Shows confidence badges, character counts, and visual previews.
//  - Displays partial errors with per-task retry hints.
//  - "Accept All" action for fast workflow.
//  - Matches editor design system (var(--color-editor-*)).
// =============================================================================

import React from "react";
import {
  CheckCircle,
  X,
  Tag,
  FolderOpen,
  Link2,
  Clock,
  Image as ImageIcon,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Sparkles,
} from "lucide-react";
import type { SmartPublishResult as SmartPublishResultData } from "../services/smart-publish.service";

interface AcceptedFields {
  description: boolean;
  tags: boolean;
  category: boolean;
  slug: boolean;
  readTime: boolean;
  coverImage: boolean;
}

interface SmartPublishResultProps {
  readonly result: SmartPublishResultData;
  readonly acceptedFields: AcceptedFields;
  readonly onToggleField: (field: keyof AcceptedFields) => void;
  readonly onAcceptAll: () => void;
}

export default function SmartPublishResult({
  result,
  acceptedFields,
  onToggleField,
  onAcceptAll,
}: SmartPublishResultProps) {
  const hasAnyResult =
    result.description !== null ||
    result.tags !== null ||
    result.suggestedCategory !== null ||
    result.slug !== null;

  if (!hasAnyResult) {
    return (
      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 text-center text-xs text-red-400">
        <XCircle size={20} className="mx-auto mb-2 opacity-60" />
        <p className="font-semibold">No results generated</p>
        <p className="text-[10px] text-red-400/60 mt-1">All tasks failed. Please retry.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 animate-[fade-in_0.25s_ease-out]">
      {/* Header with Accept All */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-editor-muted)]">
          <Sparkles size={11} className="text-indigo-400" />
          <span className="font-semibold uppercase tracking-wider">AI Suggestions</span>
        </div>
        <button
          type="button"
          onClick={onAcceptAll}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 hover:bg-emerald-500/15 transition-all cursor-pointer active:scale-[0.97]"
        >
          <CheckCircle size={10} />
          Accept All
        </button>
      </div>

      {/* ── Description ────────────────────────────────────────────── */}
      {result.description !== null && (
        <FieldCard
          icon={<ShieldCheck size={13} />}
          label="Meta Description"
          accepted={acceptedFields.description}
          onToggle={() => onToggleField("description")}
        >
          <p className="text-[var(--color-editor-text)] leading-relaxed">
            {result.description}
          </p>
          <span className="text-[10px] text-[var(--color-editor-muted)] mt-1 block">
            {result.description.length} / 160 characters
          </span>
        </FieldCard>
      )}

      {/* ── Tags ───────────────────────────────────────────────────── */}
      {result.tags !== null && (
        <FieldCard
          icon={<Tag size={13} />}
          label={`Tags (${result.tags.length})`}
          accepted={acceptedFields.tags}
          onToggle={() => onToggleField("tags")}
        >
          <div className="flex flex-wrap gap-1.5">
            {result.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-medium border border-indigo-500/15"
              >
                {tag}
              </span>
            ))}
          </div>
        </FieldCard>
      )}

      {/* ── Category ───────────────────────────────────────────────── */}
      {result.suggestedCategory !== null && (
        <FieldCard
          icon={<FolderOpen size={13} />}
          label="Category"
          accepted={acceptedFields.category}
          onToggle={() => onToggleField("category")}
        >
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-editor-text)] font-semibold">
              {result.suggestedCategory.name}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                result.suggestedCategory.confidence >= 0.8
                  ? "bg-emerald-500/15 text-emerald-400"
                  : result.suggestedCategory.confidence >= 0.5
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {Math.round(result.suggestedCategory.confidence * 100)}% match
            </span>
          </div>
        </FieldCard>
      )}

      {/* ── Slug ───────────────────────────────────────────────────── */}
      {result.slug !== null && (
        <FieldCard
          icon={<Link2 size={13} />}
          label="URL Slug"
          accepted={acceptedFields.slug}
          onToggle={() => onToggleField("slug")}
        >
          <code className="text-[var(--color-editor-text)] bg-[var(--color-editor-elevated)] px-2 py-1 rounded text-[11px] font-mono">
            /{result.slug}
          </code>
        </FieldCard>
      )}

      {/* ── Read Time ──────────────────────────────────────────────── */}
      {result.readTimeMinutes !== null && (
        <FieldCard
          icon={<Clock size={13} />}
          label="Estimated Read Time"
          accepted={acceptedFields.readTime}
          onToggle={() => onToggleField("readTime")}
        >
          <span className="text-[var(--color-editor-text)] font-semibold">
            {result.readTimeMinutes} min read
          </span>
        </FieldCard>
      )}

      {/* ── Cover Image ────────────────────────────────────────────── */}
      {result.coverImage !== null && (
        <FieldCard
          icon={<ImageIcon size={13} />}
          label={`Cover Image (${result.coverImage.provider})`}
          accepted={acceptedFields.coverImage}
          onToggle={() => onToggleField("coverImage")}
        >
          <div className="flex items-center gap-3">
            <div className="w-20 h-12 rounded-lg overflow-hidden border border-[var(--color-editor-border)] flex-shrink-0 bg-[var(--color-editor-elevated)]">
              <img
                src={result.coverImage.previewUrl || result.coverImage.url}
                alt={result.coverImage.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] text-[var(--color-editor-text)] truncate">
                {result.coverImage.alt}
              </span>
              <span className="text-[9px] text-[var(--color-editor-muted)]">
                Source: {result.coverImage.provider}
              </span>
            </div>
          </div>
        </FieldCard>
      )}

      {/* ── SEO Score ──────────────────────────────────────────────── */}
      {result.seoValidation !== null && (
        <div className="p-3 rounded-xl bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-editor-text)]">
              <ShieldCheck size={13} className={result.seoValidation.passed ? "text-emerald-400" : "text-amber-400"} />
              SEO Score
            </div>
            <span
              className={`text-sm font-extrabold ${
                result.seoValidation.score >= 80
                  ? "text-emerald-400"
                  : result.seoValidation.score >= 50
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {result.seoValidation.score}/100
            </span>
          </div>
          {result.seoValidation.issues.length > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              {result.seoValidation.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-1.5 text-[10px]"
                >
                  {issue.severity === "error" ? (
                    <XCircle size={10} className="text-red-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle size={10} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-[var(--color-editor-secondary)]">{issue.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Task Errors ────────────────────────────────────────────── */}
      {result.taskErrors.length > 0 && (
        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-red-400 mb-1.5">
            <AlertTriangle size={11} />
            Some tasks encountered errors
          </div>
          <div className="flex flex-col gap-1">
            {result.taskErrors.map((err, idx) => (
              <div key={idx} className="text-[10px] text-red-400/70">
                <span className="font-semibold capitalize">{err.taskName}:</span>{" "}
                {err.error}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reusable Field Card ─────────────────────────────────────────────────────

interface FieldCardProps {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly accepted: boolean;
  readonly onToggle: () => void;
  readonly children: React.ReactNode;
}

function FieldCard({ icon, label, accepted, onToggle, children }: FieldCardProps) {
  return (
    <div
      className={`p-3 rounded-xl border transition-all duration-200 ${
        accepted
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-[var(--color-editor-surface)] border-[var(--color-editor-border)]"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-editor-text)]">
          <span className={accepted ? "text-emerald-400" : "text-[var(--color-editor-secondary)]"}>
            {icon}
          </span>
          {label}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
            accepted
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-[var(--color-editor-elevated)] text-[var(--color-editor-secondary)] border border-[var(--color-editor-border)] hover:text-[var(--color-editor-text)]"
          }`}
        >
          {accepted ? (
            <>
              <CheckCircle size={9} />
              Accepted
            </>
          ) : (
            <>
              <X size={9} />
              Pending
            </>
          )}
        </button>
      </div>
      {children}
    </div>
  );
}
