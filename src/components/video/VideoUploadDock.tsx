"use client";

import React from "react";
import {
  ChevronUp,
  ChevronDown,
  X,
  Video,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useVideoUploadStore, VideoUploadTask } from "@/store/useVideoUploadStore";

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatSize = (bytes: number): string => {
  if (bytes <= 0) return "0 KB";
  if (bytes > 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
};

interface VideoUploadDockProps {
  onVideoAttach?: (lessonId: string, mediaId: string, title?: string) => void;
}

export const VideoUploadDock: React.FC<VideoUploadDockProps> = ({ onVideoAttach }) => {
  const {
    tasks,
    isDockMinimized,
    toggleDockMinimized,
    setDockMinimized,
    abortUpload,
    retryUpload,
    removeUpload,
    clearCompleted,
  } = useVideoUploadStore();

  if (tasks.length === 0) return null;

  const activeTasks = tasks.filter(
    (t) => t.status === "authorizing" || t.status === "uploading" || t.status === "saving"
  );
  const doneTasks = tasks.filter((t) => t.status === "done");
  const errorTasks = tasks.filter((t) => t.status === "error");

  // Aggregate progress calculation
  const totalBytes = tasks.reduce((sum, t) => sum + (t.totalBytes || 1), 0);
  const totalUploaded = tasks.reduce(
    (sum, t) => sum + (t.status === "done" ? t.totalBytes : t.bytesUploaded || 0),
    0
  );
  const overallPercent = totalBytes > 0 ? Math.min(100, Math.round((totalUploaded / totalBytes) * 100)) : 0;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-full max-w-[440px] transition-all duration-300 ease-out sm:right-6"
      style={{ filter: "drop-shadow(0 20px 25px rgba(0, 0, 0, 0.15))" }}
    >
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl transition-all">
        {/* ── Header / Minimized Bar ────────────────────────────────────── */}
        <div
          onClick={toggleDockMinimized}
          className="flex cursor-pointer items-center justify-between px-4 py-3 select-none hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {activeTasks.length > 0 ? (
                <Loader2 size={18} className="animate-spin text-primary" />
              ) : errorTasks.length > 0 ? (
                <AlertCircle size={18} className="text-amber-500" />
              ) : (
                <CheckCircle2 size={18} className="text-emerald-500" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-xs font-bold text-foreground">
                  {activeTasks.length > 0
                    ? `Uploading ${activeTasks.length} video${activeTasks.length > 1 ? "s" : ""}`
                    : doneTasks.length > 0
                    ? `All uploads complete (${doneTasks.length})`
                    : "Upload queue"}
                </span>
                {activeTasks.length > 0 && (
                  <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {overallPercent}%
                  </span>
                )}
              </div>
              <p className="truncate text-[11px] text-muted-foreground">
                {activeTasks.length > 0
                  ? `${formatSize(totalUploaded)} of ${formatSize(totalBytes)}`
                  : `${tasks.length} item${tasks.length > 1 ? "s" : ""} in queue`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={toggleDockMinimized}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title={isDockMinimized ? "Expand upload drawer" : "Minimize to bottom bar"}
            >
              {isDockMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {activeTasks.length === 0 && (
              <button
                type="button"
                onClick={clearCompleted}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Dismiss completed uploads"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Global Progress Bar Strip */}
        <div className="h-1 w-full bg-muted/60 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${overallPercent}%` }}
          />
        </div>

        {/* ── Expanded Task List ────────────────────────────────────────── */}
        {!isDockMinimized && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-2 bg-muted/20 text-[11px] text-muted-foreground">
              <span>Uploads ({tasks.length})</span>
              {doneTasks.length > 0 && (
                <button
                  type="button"
                  onClick={clearCompleted}
                  className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <Trash2 size={12} />
                  Clear finished
                </button>
              )}
            </div>

            <div className="max-h-[320px] overflow-y-auto divide-y divide-border/40 p-2 space-y-2">
              {tasks.map((task) => (
                <UploadCard
                  key={task.id}
                  task={task}
                  onAbort={() => abortUpload(task.id)}
                  onRetry={() => retryUpload(task.id)}
                  onRemove={() => removeUpload(task.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Upload Card ──────────────────────────────────────────────────────────────

interface UploadCardProps {
  task: VideoUploadTask;
  onAbort: () => void;
  onRetry: () => void;
  onRemove: () => void;
}

const UploadCard: React.FC<UploadCardProps> = ({ task, onAbort, onRetry, onRemove }) => {
  const isPending =
    task.status === "authorizing" || task.status === "uploading" || task.status === "saving";

  const handleCardClick = () => {
    if (typeof window !== "undefined" && task.lessonId) {
      window.dispatchEvent(
        new CustomEvent("openidear:open-lesson-upload", { detail: { lessonId: task.lessonId } })
      );
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group rounded-xl border border-border/40 bg-card p-3 shadow-xs hover:border-border hover:bg-muted/30 transition-all cursor-pointer"
      title="Click to view detailed upload modal"
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Video size={14} />
          </div>

          <div className="min-w-0 flex-1">
            <h5 className="truncate text-xs font-semibold text-foreground" title={task.lessonTitle}>
              {task.lessonTitle}
            </h5>
            <p className="truncate text-[10px] text-muted-foreground" title={task.fileName}>
              {task.fileName} • {formatSize(task.fileSize)}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {isPending ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAbort();
              }}
              className="rounded-md px-2 py-1 text-[11px] font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Abort upload"
            >
              Cancel
            </button>
          ) : task.status === "error" ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRetry();
              }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              title="Retry upload"
            >
              <RefreshCw size={11} />
              Retry
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Progress & Status */}
      <div className="mt-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            {task.status === "authorizing" && (
              <>
                <Loader2 size={11} className="animate-spin text-primary" />
                <span>Authorizing upload...</span>
              </>
            )}
            {task.status === "uploading" && (
              <>
                <UploadCloud size={11} className="text-primary animate-pulse" />
                <span>Uploading to Bunny Stream...</span>
              </>
            )}
            {task.status === "saving" && (
              <>
                <Loader2 size={11} className="animate-spin text-primary" />
                <span>Saving video metadata...</span>
              </>
            )}
            {task.status === "done" && (
              <>
                <CheckCircle2 size={11} className="text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Uploaded & attached
                </span>
              </>
            )}
            {task.status === "aborted" && <span className="text-muted-foreground">Cancelled</span>}
            {task.status === "error" && (
              <span className="text-rose-500 font-medium truncate max-w-[220px]" title={task.error}>
                {task.error || "Upload failed"}
              </span>
            )}
          </span>

          <span className="font-semibold text-foreground text-[10px]">
            {task.status === "done" ? "100%" : `${task.progress}%`}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              task.status === "done"
                ? "bg-emerald-500"
                : task.status === "error"
                ? "bg-rose-500"
                : task.status === "aborted"
                ? "bg-muted-foreground"
                : "bg-gradient-to-r from-violet-600 to-indigo-600"
            }`}
            style={{ width: `${task.status === "done" ? 100 : task.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoUploadDock;
