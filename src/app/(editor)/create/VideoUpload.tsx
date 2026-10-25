"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Video,
  Loader2,
  CheckCircle2,
  CloudUpload,
  RefreshCw,
  Minus,
  ArrowDownToLine,
} from "lucide-react";
import { toast } from "sonner";
import { useVideoUploadStore } from "@/store/useVideoUploadStore";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VideoUploadProps {
  /** Called after the video is saved to the backend. Receives the media _id and lesson title. */
  onVideoUploaded: (mediaId: string, title: string) => void;
  onClose: () => void;
  /** Whether to show the modal header with a close button (default: true) */
  isTitleDisplay?: boolean;
  initialTitle?: string;
  lessonId?: string;
  onMinimize?: () => void;
}

type UploadState = "idle" | "authorizing" | "uploading" | "saving" | "done" | "error" | "aborted";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatSize = (bytes: number): string =>
  bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;

// ─── Component ───────────────────────────────────────────────────────────────

const VideoUpload: React.FC<VideoUploadProps> = ({
  onVideoUploaded,
  onClose,
  isTitleDisplay = true,
  initialTitle = "",
  lessonId = "default",
  onMinimize,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startUpload = useVideoUploadStore((s) => s.startUpload);
  const abortUpload = useVideoUploadStore((s) => s.abortUpload);
  const removeUpload = useVideoUploadStore((s) => s.removeUpload);
  const retryUpload = useVideoUploadStore((s) => s.retryUpload);

  // Detect if an existing upload task is already tracked for this lesson
  const currentTask = useVideoUploadStore((s) => {
    if (activeTaskId) {
      return s.tasks.find((t) => t.id === activeTaskId) || null;
    }
    if (lessonId && lessonId !== "default") {
      return s.tasks.find((t) => t.lessonId === lessonId && t.status !== "aborted") || null;
    }
    return null;
  });

  // Effective file representation (either newly chosen in modal or active in store)
  const effectiveFile = file || currentTask?.file || null;
  const effectiveFileName = file?.name || currentTask?.fileName || "";
  const effectiveFileSize = file?.size || currentTask?.fileSize || 0;

  // Sync title from store if available
  useEffect(() => {
    if (currentTask?.lessonTitle && !title) {
      setTitle(currentTask.lessonTitle);
    }
  }, [currentTask?.lessonTitle]);

  const uploadState: UploadState = currentTask ? currentTask.status : "idle";
  const progress = currentTask ? currentTask.progress : 0;
  const error = localError || (currentTask?.error ?? "");

  const isUploading =
    uploadState === "authorizing" || uploadState === "uploading" || uploadState === "saving";

  // ── File selection & validation ──────────────────────────────────────────

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("video/")) {
      setLocalError("Please select a valid video file (MP4, MOV, AVI, …)");
      return;
    }
    // 2 GB max
    if (selectedFile.size > 2 * 1024 * 1024 * 1024) {
      setLocalError("File size must be less than 2 GB");
      return;
    }
    setFile(selectedFile);
    const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
    if (!title || title === initialTitle || /^Lesson\s+\d+$/i.test(title.trim())) {
      setTitle(fileNameWithoutExt);
    }
    setLocalError("");
    setActiveTaskId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const clearFile = () => {
    if (currentTask) {
      if (isUploading) {
        abortUpload(currentTask.id);
      } else {
        removeUpload(currentTask.id);
      }
    }
    setActiveTaskId(null);
    setFile(null);
    setTitle(initialTitle || "");
    setLocalError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Upload flow ──────────────────────────────────────────────────────────

  const handleUpload = async () => {
    const uploadFile = effectiveFile;
    if (!uploadFile || !title.trim()) {
      setLocalError("Please select a file and enter a title.");
      return;
    }
    setLocalError("");

    try {
      const taskId = await startUpload({
        file: uploadFile,
        lessonId,
        lessonTitle: title.trim(),
        onComplete: (mediaId, completedTitle) => {
          onVideoUploaded(mediaId, completedTitle);
        },
      });
      setActiveTaskId(taskId);
    } catch (err: any) {
      setLocalError(err.message || "Failed to start upload.");
    }
  };

  const handleRetry = async () => {
    if (currentTask) {
      setLocalError("");
      await retryUpload(currentTask.id);
    }
  };

  const handleMinimize = () => {
    toast.info("Upload running in the bottom dock. You can now edit or upload another video!");
    if (onMinimize) {
      onMinimize();
    } else {
      onClose();
    }
  };

  const handleCancelOrAbort = () => {
    if (currentTask && isUploading) {
      abortUpload(currentTask.id);
      setActiveTaskId(null);
    }
    onClose();
  };

  const handleClose = () => {
    if (isUploading) {
      handleMinimize();
    } else {
      onClose();
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-lg bg-[var(--color-editor-surface)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-editor-border)]">
      {/* Header */}
      {isTitleDisplay && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-editor-border)]">
          <div className="flex items-center gap-2">
            <CloudUpload className="text-[var(--color-editor-accent)]" size={22} />
            <h2 className="text-lg font-bold text-[var(--color-editor-text)]">Upload Video</h2>
          </div>
          <div className="flex items-center gap-1.5">
            {isUploading && (
              <button
                type="button"
                onClick={handleMinimize}
                className="p-1.5 rounded-xl hover:bg-[var(--color-editor-elevated)] text-[var(--color-editor-muted)] hover:text-[var(--color-editor-text)] transition-all duration-200 cursor-pointer"
                title="Minimize to bottom dock"
                aria-label="Minimize"
              >
                <Minus size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-xl hover:bg-[var(--color-editor-elevated)] text-[var(--color-editor-muted)] hover:text-[var(--color-editor-text)] transition-all duration-200 cursor-pointer"
              title={isUploading ? "Minimize & close window" : "Close"}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Dropzone / File info */}
        {!effectiveFileName || uploadState === "idle" ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
 ${
   isDragging
     ? "border-[var(--color-editor-accent)] bg-[var(--color-editor-accent)]/5 scale-[1.01]"
     : "border-[var(--color-editor-border)] hover:border-[var(--color-editor-accent)] hover:bg-[var(--color-editor-elevated)]"
 }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleInputChange}
            />
            <Upload
              className={`mx-auto mb-3 transition-colors duration-200 ${isDragging ? "text-[var(--color-editor-accent)]" : "text-[var(--color-editor-muted)]"}`}
              size={40}
            />
            <p className="text-sm font-semibold text-[var(--color-editor-text)]">
              Drag & drop your video here
            </p>
            <p className="text-xs text-[var(--color-editor-muted)] mt-1">
              or{" "}
              <span className="text-[var(--color-editor-accent)] font-medium">
                browse from your computer
              </span>
            </p>
            <p className="text-xs text-[var(--color-editor-muted)] mt-2">
              MP4, MOV, AVI — max 2 GB
            </p>
          </div>
        ) : (
          /* Selected file display */
          <div className="flex items-center justify-between p-3.5 bg-[var(--color-editor-elevated)] rounded-xl border border-[var(--color-editor-border)]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-[var(--color-editor-accent)]/10 text-[var(--color-editor-accent)] flex-shrink-0">
                <Video size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-editor-text)] truncate max-w-[280px]">
                  {effectiveFileName}
                </p>
                <p className="text-xs text-[var(--color-editor-muted)]">
                  {formatSize(effectiveFileSize)}
                </p>
              </div>
            </div>
            {!isUploading && (
              <button
                type="button"
                onClick={clearFile}
                className="p-1 rounded-lg text-[var(--color-editor-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                title="Remove file and upload another"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Lesson title input */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-editor-muted)] mb-1.5 uppercase tracking-wider">
            Lesson title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading || uploadState === "done"}
            placeholder="Enter lesson title…"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] text-[var(--color-editor-text)] placeholder-[var(--color-editor-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-editor-accent)] disabled:opacity-60 transition-all duration-200"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 animate-[fade-in_0.15s_ease-out]">
            {error}
          </div>
        )}

        {/* Upload progress */}
        {uploadState === "authorizing" && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-editor-accent)] animate-pulse">
            <Loader2 className="animate-spin" size={14} />
            Authorizing Bunny Stream upload session…
          </div>
        )}

        {uploadState === "uploading" && (
          <div className="space-y-2 animate-[fade-in_0.15s_ease-out]">
            <div className="flex justify-between text-xs text-[var(--color-editor-muted)]">
              <span className="flex items-center gap-1.5">
                <Loader2 className="animate-spin" size={12} />
                Uploading directly to Bunny Stream…
              </span>
              <span className="font-bold text-[var(--color-editor-accent)]">{progress}%</span>
            </div>
            <div className="w-full bg-[var(--color-editor-elevated)] rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 bg-gradient-to-r from-[var(--color-editor-accent)] to-emerald-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-[var(--color-editor-muted)] text-right">
              {formatSize(effectiveFileSize)} total
            </p>
          </div>
        )}

        {/* Saving state */}
        {uploadState === "saving" && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-editor-accent)] animate-pulse">
            <Loader2 className="animate-spin" size={14} />
            Registering video with backend…
          </div>
        )}

        {/* Done state */}
        {uploadState === "done" && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-editor-success)] font-medium animate-[fade-in_0.2s_ease-out]">
            <CheckCircle2 size={16} className="text-[var(--color-editor-success)]" />
            Video uploaded and registered successfully!
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]/50">
        <div>
          {isUploading && (
            <button
              type="button"
              onClick={handleMinimize}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-editor-accent)] hover:underline cursor-pointer"
            >
              <ArrowDownToLine size={14} />
              Minimize to bottom bar
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {uploadState === "done" ? (
            <>
              <button
                type="button"
                onClick={clearFile}
                className="px-4 py-2 text-sm rounded-xl border border-[var(--color-editor-border)] text-[var(--color-editor-secondary)] hover:bg-[var(--color-editor-elevated)] transition-all duration-200 cursor-pointer"
              >
                Upload different video
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-sm rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all duration-200 cursor-pointer"
              >
                Close
              </button>
            </>
          ) : uploadState === "error" ? (
            <>
              <button
                type="button"
                onClick={handleCancelOrAbort}
                className="px-4 py-2 text-sm rounded-xl border border-[var(--color-editor-border)] text-[var(--color-editor-secondary)] hover:bg-[var(--color-editor-elevated)] transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRetry}
                className="px-5 py-2 text-sm rounded-xl bg-[var(--color-editor-accent)] text-white font-semibold hover:bg-[var(--color-editor-accent-hover)] flex items-center gap-2 transition-all duration-200 cursor-pointer"
              >
                <RefreshCw size={14} /> Retry Upload
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancelOrAbort}
                className="px-4 py-2 text-sm rounded-xl border border-[var(--color-editor-border)] text-[var(--color-editor-secondary)] hover:bg-[var(--color-editor-elevated)] disabled:opacity-50 transition-all duration-200 cursor-pointer"
              >
                {isUploading ? "Abort" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!effectiveFileName || !title.trim() || isUploading}
                className="px-5 py-2 text-sm rounded-xl bg-[var(--color-editor-accent)] text-white font-semibold hover:bg-[var(--color-editor-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 shadow-sm active:scale-[0.97] cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" size={14} /> Uploading…
                  </>
                ) : (
                  <>
                    <Upload size={14} /> Upload
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;
