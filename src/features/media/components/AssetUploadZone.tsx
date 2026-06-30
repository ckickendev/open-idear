"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, AlertCircle, CheckCircle2, Image as ImageIcon, Loader2 } from "lucide-react";
import { useUploadAsset } from "../hooks/useAssetHooks";
import type { Asset } from "../api/asset.api";

interface AssetUploadZoneProps {
  readonly onUploadSuccess?: (asset: Asset) => void;
  readonly className?: string;
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function AssetUploadZone({
  onUploadSuccess,
  className = "",
}: AssetUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, error: uploadError, success } = useUploadAsset();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const validateAndSetFile = useCallback((file: File) => {
    setValidationError(null);

    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setValidationError("Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are supported.");
      return false;
    }

    // Validate size limit
    if (file.size > MAX_FILE_SIZE) {
      setValidationError("File is too large. Maximum size is 10MB.");
      return false;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    return true;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, [validateAndSetFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  }, [validateAndSetFile]);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  const handleStartUpload = useCallback(async () => {
    if (!selectedFile) return;
    const asset = await uploadFile(selectedFile);
    if (asset && onUploadSuccess) {
      onUploadSuccess(asset);
    }
  }, [selectedFile, uploadFile, onUploadSuccess]);

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* File Dropping Dropzone */}
      {!selectedFile && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? "border-primary bg-primary/5 scale-[0.99] shadow-inner"
              : "border-border hover:border-foreground/30 bg-accent/5"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleFileInput}
            className="hidden"
          />
          
          <div className="p-3 bg-background rounded-full border border-border shadow-sm mb-4 text-muted-foreground">
            <Upload className="w-6 h-6 animate-pulse" />
          </div>

          <p className="text-sm font-semibold text-foreground">
            Drag & drop your image here, or <span className="text-primary hover:underline">browse</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supports JPEG, PNG, WebP, GIF, SVG (max 10MB)
          </p>
        </div>
      )}

      {/* Selected File Previews / Progress */}
      {selectedFile && (
        <div className="border border-border rounded-xl p-4 bg-background shadow-sm flex flex-col gap-4 animate-[fade-in_0.15s_ease-out]">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-lg border overflow-hidden bg-accent/10 flex-shrink-0">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-6 h-6 m-5 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            {!isUploading && !success && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress / Status States */}
          {isUploading && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  Uploading and compressing...
                </span>
              </div>
              <div className="w-full bg-accent rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-1.5 rounded-full animate-[progress-pulse_1.5s_infinite_linear]" style={{ width: "80%" }} />
              </div>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-2.5 rounded-lg animate-[fade-in_0.15s_ease-out]">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Upload completed!</span>
            </div>
          )}

          {(validationError || uploadError) && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg animate-[fade-in_0.15s_ease-out]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError || uploadError}</span>
            </div>
          )}

          {/* Action buttons */}
          {!isUploading && !success && (
            <button
              type="button"
              onClick={handleStartUpload}
              className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/95 cursor-pointer transition-all shadow-sm"
            >
              Start Upload
            </button>
          )}

          {success && (
            <button
              type="button"
              onClick={handleClear}
              className="w-full py-2 px-4 rounded-lg border border-border text-foreground hover:bg-accent text-sm font-semibold cursor-pointer transition-all"
            >
              Upload Another Image
            </button>
          )}
        </div>
      )}
    </div>
  );
}
