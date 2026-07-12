// =============================================================================
//  AI PUBLISHING FEATURE — PUBLISH SCHEDULER COMPONENT
//  src/features/publish/components/PublishScheduler.tsx
//
//  Design Decisions:
//  - Interactive control panel supporting immediate and scheduled status switches.
//  - Fully manages Save Draft, Unpublish, and Republish transitions.
//  - Resolves client-local browser timezones automatically using Intl APIs.
//  - Disables action triggers if publication validations block launch.
// =============================================================================

import React, { useState, useEffect } from "react";
import { Clock, Calendar, Globe, AlertCircle, FileText, CheckCircle2, CloudLightning } from "lucide-react";

export type ClientPublishStatus = "draft" | "scheduled" | "published";

interface PublishSchedulerProps {
  readonly currentStatus: ClientPublishStatus;
  readonly onPublishImmediately: () => Promise<void> | void;
  readonly onSchedulePublish: (dateStr: string, timezone: string) => Promise<void> | void;
  readonly onSaveDraft: () => Promise<void> | void;
  readonly onUnpublish: () => Promise<void> | void;
  readonly onRepublish: () => Promise<void> | void;
  readonly isActionBlocked?: boolean; // Blocked if checklist has errors
  readonly isSaving?: boolean;
}

// Common timezones to choose from
const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Asia/Saigon", label: "Asia/Saigon (ICT)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEDT)" },
];

export default function PublishScheduler({
  currentStatus,
  onPublishImmediately,
  onSchedulePublish,
  onSaveDraft,
  onUnpublish,
  onRepublish,
  isActionBlocked = false,
  isSaving = false,
}: PublishSchedulerProps) {
  // Local form states
  const [publishType, setPublishType] = useState<"immediate" | "scheduled">("immediate");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [timezone, setTimezone] = useState("UTC");

  // Pre-select local timezone on mount
  useEffect(() => {
    try {
      const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (localTz) {
        // Add local timezone to list if missing
        if (!COMMON_TIMEZONES.some((tz) => tz.value === localTz)) {
          COMMON_TIMEZONES.push({ value: localTz, label: `${localTz} (Local)` });
        }
        setTimezone(localTz);
      }
    } catch {
      // Fallback to UTC
    }
  }, []);

  const handleActionTrigger = async () => {
    if (publishType === "immediate") {
      await onPublishImmediately();
    } else {
      if (!scheduleDate || !scheduleTime) {
        alert("Please specify both date and time values for the schedule.");
        return;
      }
      const combinedDateStr = `${scheduleDate}T${scheduleTime}:00`;
      await onSchedulePublish(combinedDateStr, timezone);
    }
  };

  return (
    <div className="publish-scheduler-root space-y-4 text-xs text-[var(--color-editor-text)] animate-[fade-in_0.2s_ease-out]">
      {/* ─── Header status badge ──────────────────────────────────────────────── */}
      <div className="p-3.5 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-xl flex items-center justify-between select-none">
        <span className="font-semibold text-xs">Publication Status</span>
        <span
          className={`px-3 py-1 rounded-full uppercase tracking-wider font-bold text-[9px] ${
            currentStatus === "published"
              ? "bg-emerald-500/10 text-emerald-500"
              : currentStatus === "scheduled"
              ? "bg-blue-500/10 text-blue-500"
              : "bg-zinc-500/10 text-[var(--color-editor-secondary)]"
          }`}
        >
          ● {currentStatus.toUpperCase()}
        </span>
      </div>

      {/* ─── State 1: Post is currently a DRAFT or SCHEDULED ──────────────────── */}
      {currentStatus !== "published" && (
        <div className="p-4 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-2xl space-y-4 shadow-sm">
          {/* Options toggle */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] rounded-lg">
            <button
              type="button"
              onClick={() => setPublishType("immediate")}
              className={`py-2 rounded font-bold cursor-pointer transition-colors ${
                publishType === "immediate"
                  ? "bg-[var(--color-editor-border)] text-[var(--color-editor-text)] shadow-xs"
                  : "text-[var(--color-editor-secondary)]"
              }`}
            >
              Immediate Release
            </button>
            <button
              type="button"
              onClick={() => setPublishType("scheduled")}
              className={`py-2 rounded font-bold cursor-pointer transition-colors ${
                publishType === "scheduled"
                  ? "bg-[var(--color-editor-border)] text-[var(--color-editor-text)] shadow-xs"
                  : "text-[var(--color-editor-secondary)]"
              }`}
            >
              Schedule Launch
            </button>
          </div>

          {/* Schedule fields wrapper */}
          {publishType === "scheduled" && (
            <div className="space-y-3 pt-1.5 animate-[slide-down_0.15s_ease-out]">
              <div className="grid grid-cols-2 gap-3">
                {/* Date Input */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-[var(--color-editor-secondary)] uppercase">Date</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]">
                    <Calendar size={13} className="text-[var(--color-editor-muted)]" />
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="bg-transparent border-none outline-none flex-1 text-xs text-[var(--color-editor-text)]"
                    />
                  </div>
                </div>

                {/* Time Input */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-[var(--color-editor-secondary)] uppercase">Time</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]">
                    <Clock size={13} className="text-[var(--color-editor-muted)]" />
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="bg-transparent border-none outline-none flex-1 text-xs text-[var(--color-editor-text)]"
                    />
                  </div>
                </div>
              </div>

              {/* Timezone Select */}
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-[var(--color-editor-secondary)] uppercase flex items-center gap-1">
                  <Globe size={11} />
                  <span>Timezone</span>
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] text-xs text-[var(--color-editor-text)] outline-none"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Trigger release action buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleActionTrigger}
              disabled={isSaving || (publishType === "immediate" && isActionBlocked)}
              className={`w-full py-2.5 rounded-xl text-white font-bold tracking-wide transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
                isActionBlocked && publishType === "immediate"
                  ? "bg-zinc-700/50 text-zinc-500 border border-zinc-700 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              }`}
            >
              <CloudLightning size={14} className={isSaving ? "animate-spin" : "animate-bounce"} />
              <span>{publishType === "immediate" ? "Publish Immediately" : "Confirm Schedule Date"}</span>
            </button>

            {currentStatus === "scheduled" && (
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={isSaving}
                className="w-full py-2.5 border border-[var(--color-editor-border)] hover:bg-[var(--color-editor-elevated)] rounded-xl font-bold transition-all cursor-pointer text-[var(--color-editor-secondary)] flex items-center justify-center gap-1.5"
              >
                <FileText size={12} />
                <span>Cancel Schedule & Revert to Draft</span>
              </button>
            )}
          </div>

          {/* Locked validation alert warning */}
          {isActionBlocked && publishType === "immediate" && (
            <div className="p-3 bg-rose-500/[0.02] border border-rose-500/25 rounded-xl flex items-start gap-2 text-[10px] text-[var(--color-editor-muted)] leading-relaxed">
              <AlertCircle size={13} className="text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[var(--color-editor-text)] block">Preflight Validation Locked</span>
                <p className="mt-0.5">Publishing is disabled because there are unresolved critical errors in your pre-flight checklist.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── State 2: Post is currently active (PUBLISHED) ───────────────────── */}
      {currentStatus === "published" && (
        <div className="p-4 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-2xl space-y-4 shadow-sm">
          <div className="bg-emerald-500/[0.02] border border-emerald-500/25 rounded-xl p-3.5 flex items-start gap-2.5 text-[10px] text-[var(--color-editor-muted)] leading-relaxed">
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[var(--color-editor-text)] block">Post Live & Public</span>
              <p className="mt-0.5">This article has been published successfully and is searchable online. Readers can browse, share, and comment on the page.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Republish */}
            <button
              type="button"
              onClick={onRepublish}
              disabled={isSaving}
              className="py-2.5 bg-[var(--color-editor-accent)] hover:opacity-95 text-white rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <CloudLightning size={12} className="animate-spin" />
              <span>Update / Republish</span>
            </button>

            {/* Unpublish */}
            <button
              type="button"
              onClick={onUnpublish}
              disabled={isSaving}
              className="py-2.5 border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2Icon size={12} />
              <span>Unpublish Post</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple fallback inline icon for Unpublish
function Trash2Icon({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
    </svg>
  );
}
