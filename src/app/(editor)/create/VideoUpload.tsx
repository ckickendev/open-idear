"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Video,
  Loader2,
  CheckCircle2,
  CloudUpload,
} from "lucide-react";
import { courseApi } from "@/features/series/api/course.api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VideoUploadProps {
  /** Called after the video is saved to the backend. Receives the media _id and lesson title. */
  onVideoUploaded: (mediaId: string, title: string) => void;
  onClose: () => void;
  /** Whether to show the modal header with a close button (default: true) */
  isTitleDisplay?: boolean;
}

type UploadState = "idle" | "uploading" | "saving" | "done" | "error";

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
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = uploadState === "uploading" || uploadState === "saving";

  // ── File selection & validation ──────────────────────────────────────────

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("video/")) {
      setError("Please select a valid video file (MP4, MOV, AVI, …)");
      return;
    }
    // 2 GB max
    if (selectedFile.size > 2 * 1024 * 1024 * 1024) {
      setError("File size must be less than 2 GB");
      return;
    }
    setFile(selectedFile);
    if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    setError("");
    setUploadState("idle");
    setProgress(0);
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
    setFile(null);
    setTitle("");
    setError("");
    setUploadState("idle");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Upload flow ──────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setError("Please select a file and enter a title.");
      return;
    }
    setError("");

    try {
      // Step 1 — Obtain Cloudflare Stream upload URL from our backend
      setUploadState("uploading");
      setProgress(0);

      const uploadUrlRes = await courseApi.getCloudflareUploadUrl();
      if (uploadUrlRes.data.status !== "success") {
        throw new Error("Could not get upload URL from server.");
      }
      const { uploadURL, uid: videoId } = uploadUrlRes.data.data;

      // Step 2 — Upload the file directly to Cloudflare Stream (with XHR progress)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadURL);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed (HTTP ${xhr.status})`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload."));

        const fd = new FormData();
        fd.append("file", file);
        xhr.send(fd);
      });

      // Step 3 — Persist metadata in our backend
      setUploadState("saving");
      console.log("videoId", videoId);
      console.log("title", title);
      const saveRes = await courseApi.saveCloudflareVideo({ videoId, title });
      if (saveRes.data.status !== "success") {
        throw new Error("Could not save video metadata.");
      }
      console.log("saveRes", saveRes);
      const mediaId: string = saveRes.data.data._id;

      // Step 4 — Notify parent
      setUploadState("done");
      setTimeout(() => {
        onVideoUploaded(mediaId, title);
      }, 800);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setUploadState("error");
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
          {!isUploading && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[var(--color-editor-elevated)] text-[var(--color-editor-muted)] hover:text-[var(--color-editor-text)] transition-all duration-200 cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Dropzone / File info */}
        {!file || uploadState === "idle" ? (
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
          <div className="flex items-center gap-3 bg-[var(--color-editor-accent)]/8 rounded-xl p-3 border border-[var(--color-editor-accent)]/20">
            <Video className="text-[var(--color-editor-accent)] shrink-0" size={22} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-editor-text)] truncate">
                {file.name}
              </p>
              <p className="text-xs text-[var(--color-editor-muted)]">
                {formatSize(file.size)}
              </p>
            </div>
            {!isUploading && uploadState !== "done" && (
              <button
                onClick={clearFile}
                className="text-[var(--color-editor-muted)] hover:text-red-500 text-xs transition-colors cursor-pointer"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Lesson title input */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-editor-secondary)] mb-1">
            Lesson title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
            placeholder="Enter lesson title…"
            className="w-full px-3 py-2 border border-[var(--color-editor-border)] rounded-xl text-sm bg-[var(--color-editor-elevated)] text-[var(--color-editor-text)] placeholder:text-[var(--color-editor-muted)]
 focus:ring-2 focus:ring-[var(--color-editor-accent)]/40 focus:border-[var(--color-editor-accent)]/50 outline-none
 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 animate-[fade-in_0.15s_ease-out]">
            {error}
          </div>
        )}

        {/* Upload progress */}
        {uploadState === "uploading" && (
          <div className="space-y-2 animate-[fade-in_0.15s_ease-out]">
            <div className="flex justify-between text-xs text-[var(--color-editor-muted)]">
              <span className="flex items-center gap-1.5">
                <Loader2 className="animate-spin" size={12} />
                Uploading to Cloudflare Stream…
              </span>
              <span className="font-bold text-[var(--color-editor-accent)]">{progress}%</span>
            </div>
            <div className="w-full bg-[var(--color-editor-elevated)] rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 bg-gradient-to-r from-[var(--color-editor-accent)] to-violet-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-[var(--color-editor-muted)] text-right">
              {formatSize(file?.size ?? 0)} total
            </p>
          </div>
        )}

        {/* Saving state */}
        {uploadState === "saving" && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-editor-accent)] animate-pulse">
            <Loader2 className="animate-spin" size={14} />
            Saving video metadata…
          </div>
        )}

        {/* Done state */}
        {uploadState === "done" && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-editor-success)] font-medium animate-[fade-in_0.2s_ease-out]">
            <CheckCircle2 size={16} className="text-[var(--color-editor-success)]" />
            Video uploaded successfully!
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex gap-2 justify-end px-5 py-4 border-t border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]/50">
        <button
          onClick={onClose}
          disabled={isUploading}
          className="px-4 py-2 text-sm rounded-xl border border-[var(--color-editor-border)] text-[var(--color-editor-secondary)] hover:bg-[var(--color-editor-elevated)]
 disabled:opacity-50 transition-all duration-200 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={
            !file || !title.trim() || isUploading || uploadState === "done"
          }
          className="px-5 py-2 text-sm rounded-xl bg-[var(--color-editor-accent)] text-white font-semibold
 hover:bg-[var(--color-editor-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed
 flex items-center gap-2 transition-all duration-200 shadow-sm active:scale-[0.97]"
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
      </div>
    </div>
  );
};

export default VideoUpload;
