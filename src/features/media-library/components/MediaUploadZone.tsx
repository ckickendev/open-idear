"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, CloudUpload, Loader2, FileCheck, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useMediaUpload } from "../hooks/useMediaUpload";
import { useMediaLibraryStore } from "../store/mediaLibraryStore";
import type { MediaAsset } from "../types/mediaLibrary.types";

// ═══════════════════════════════════════════════════════════════════
//  MediaUploadZone — drag-and-drop upload area
// ═══════════════════════════════════════════════════════════════════

interface MediaUploadZoneProps {
  onUploaded?: (media: MediaAsset) => void;
  compact?: boolean;
}

export function MediaUploadZone({ onUploaded, compact = false }: MediaUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, state, error, duplicateMedia, reset } = useMediaUpload();
  const { isUploading, uploadProgress, currentFolder } = useMediaLibraryStore();

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files);
      for (const file of fileArr) {
        const result = await upload(file, {
          folderId: currentFolder || undefined,
        });
        if (result) {
          onUploaded?.(result);
        }
      }
    },
    [upload, currentFolder, onUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      // Ignore media library internal drags
      if (e.dataTransfer.types.includes("application/x-openidear-media")) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.types.includes("application/x-openidear-media")) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        e.target.value = ""; // Reset so same file can be re-selected
      }
    },
    [handleFiles]
  );

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className="
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
            bg-primary text-primary-foreground
            hover:bg-primary/90 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer
          "
        >
          {isUploading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
      </>
    );
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        className={`
          relative flex flex-col items-center justify-center gap-3
          rounded-xl border-2 border-dashed p-8
          transition-all duration-200 cursor-pointer
          ${isDragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/40 hover:bg-accent/30"
          }
          ${isUploading ? "pointer-events-none opacity-70" : ""}
        `}
      >
        {isUploading ? (
          <>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {state === "hashing" && "Computing file hash…"}
                {state === "checking" && "Checking for duplicates…"}
                {state === "uploading" && "Uploading & processing…"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This may take a few seconds
              </p>
            </div>
            <Progress value={uploadProgress} className="w-48 h-1.5" />
          </>
        ) : state === "success" ? (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <FileCheck size={24} className="text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-emerald-600">
              Upload complete!
            </p>
          </>
        ) : (
          <>
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-colors
                ${isDragOver ? "bg-primary/10" : "bg-muted/50"}
              `}
            >
              <CloudUpload
                size={24}
                className={isDragOver ? "text-primary" : "text-muted-foreground"}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {isDragOver ? "Drop to upload" : "Drop images here or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, GIF, WebP, SVG · Max 10MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle size={14} />
          <span>{error}</span>
          <button
            type="button"
            onClick={reset}
            className="ml-auto text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Duplicate notice */}
      {duplicateMedia && (
        <div className="flex items-center gap-3 mt-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
          <img
            src={
              duplicateMedia.urls.thumbnail_sm || duplicateMedia.urls.original
            }
            alt=""
            className="w-10 h-10 rounded object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              This image already exists
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {duplicateMedia.originalFilename}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onUploaded?.(duplicateMedia);
              reset();
            }}
            className="text-xs font-medium text-primary hover:underline cursor-pointer"
          >
            Use existing
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
