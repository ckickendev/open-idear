"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  Trash2,
  Sparkles,
  ExternalLink,
  Star,
  Loader2,
  Save,
  Link as LinkIcon,
  Copy,
  Check,
  FolderOpen,
  Info,
  Calendar,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useMediaAI } from "../hooks/useMediaAI";
import { mediaLibraryApi } from "../api/mediaLibrary.api";
import { useMediaLibraryStore } from "../store/mediaLibraryStore";
import type { MediaAsset, MediaUsageEntry } from "../types/mediaLibrary.types";
import { toast } from "sonner";

// ─── Props ───────────────────────────────────────────────────────────────────

interface MediaDetailPanelProps {
  media: MediaAsset;
  onClose: () => void;
  onInsert: (media: MediaAsset) => void;
  onUpdate: (id: string, updates: Partial<MediaAsset>) => void;
  onDelete: (id: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MediaDetailPanel({
  media,
  onClose,
  onInsert,
  onUpdate,
  onDelete,
}: MediaDetailPanelProps) {
  const setDetailMedia = useMediaLibraryStore((s) => s.setDetailMedia);

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "ai-ocr" | "context">("overview");

  // Local Form state
  const [altText, setAltText] = useState(media.altText || "");
  const [description, setDescription] = useState(media.description || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(media.tags || []);
  const [isSaving, setIsSaving] = useState(false);

  // Async details states
  const [usage, setUsage] = useState<MediaUsageEntry[] | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);

  const [duplicates, setDuplicates] = useState<{ fileHash: string; pHash: string; matches: any[] } | null>(null);
  const [isLoadingDuplicates, setIsLoadingDuplicates] = useState(false);

  const [similarImages, setSimilarImages] = useState<MediaAsset[] | null>(null);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Copy states
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isExternal = media._id.startsWith("unsplash_") ||
                    media._id.startsWith("pexels_") ||
                    media._id.startsWith("pixabay_");

  const { generateMetadata, isGenerating } = useMediaAI();

  // ─── Load Async Data on Media ID Change ─────────────────────────────────────
  useEffect(() => {
    setAltText(media.altText || "");
    setDescription(media.description || "");
    setTags(media.tags || []);
    setUsage(null);
    setDuplicates(null);
    setSimilarImages(null);

    // Fetch Usage
    setIsLoadingUsage(true);
    mediaLibraryApi.getUsage(media._id)
      .then((res) => { if (res.success) setUsage(res.data.usedIn || []); })
      .catch(() => {})
      .finally(() => setIsLoadingUsage(false));

    // Fetch Duplicates (Only for imported assets)
    if (!isExternal) {
      setIsLoadingDuplicates(true);
      mediaLibraryApi.getDuplicates(media._id)
        .then((res) => { if (res.success) setDuplicates(res.data); })
        .catch(() => {})
        .finally(() => setIsLoadingDuplicates(false));
    }

    // Fetch Similar Images
    setIsLoadingSimilar(true);
    mediaLibraryApi.getSimilar(media._id)
      .then((res) => { if (res.success) setSimilarImages(res.data); })
      .catch(() => {})
      .finally(() => setIsLoadingSimilar(false));
  }, [media._id, isExternal]);

  // ─── Save Metadata ───────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const result = await mediaLibraryApi.updateMetadata(media._id, {
      altText,
      description,
      tags,
    });
    if (result.success) {
      onUpdate(media._id, { altText, description, tags });
      toast.success("Metadata updated successfully.");
    } else {
      toast.error("Failed to update metadata.");
    }
    setIsSaving(false);
  }, [media._id, altText, description, tags, onUpdate]);

  // ─── AI Suggestion generation ────────────────────────────────────────────────
  const handleAIGenerate = useCallback(async () => {
    const imageUrl = media.urls.webp || media.urls.original;
    const result = await generateMetadata(imageUrl);
    if (result) {
      if (result.altText) setAltText(result.altText);
      if (result.description) setDescription(result.description);
      if (result.tags?.length) setTags((prev) => [...new Set([...prev, ...result.tags!])]);

      await mediaLibraryApi.saveAIMetadata(media._id, {
        altText: result.altText || "",
        description: result.description || "",
        tags: result.tags || [],
        model: "gemini-2.0-flash",
      });
      toast.success("AI Metadata generated.");
    }
  }, [media, generateMetadata]);

  // ─── External Import ─────────────────────────────────────────────────────────
  const handleImport = useCallback(async () => {
    setIsImporting(true);
    const loadToast = toast.loading("Downloading and optimizing external asset...");
    try {
      const response = await mediaLibraryApi.importAsset(media._id);
      if (response.success && response.data) {
        toast.success("Imported to library successfully!", { id: loadToast });
        onUpdate(media._id, response.data);
      } else {
        toast.error(response.message || "Failed to import image.", { id: loadToast });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to import image.", { id: loadToast });
    } finally {
      setIsImporting(false);
    }
  }, [media, onUpdate]);

  // ─── AI Metadata Regenerate ─────────────────────────────────────────────────
  const handleAIRegenerate = useCallback(async () => {
    setIsRegenerating(true);
    try {
      const hasEdits = media.userEditedFields && media.userEditedFields.length > 0;
      let forceOverwrite = false;

      if (hasEdits) {
        forceOverwrite = confirm(
          "You have manually edited altText, description, or tags.\n\nOverwrite manually edited fields with new AI analysis?"
        );
      }

      onUpdate(media._id, { aiStatus: "pending", aiError: null });
      const result = await mediaLibraryApi.regenerateAI(media._id, forceOverwrite);

      if (result.success) {
        toast.success("AI Metadata regeneration scheduled.");
      } else {
        toast.error(result.message || "Failed to trigger AI regeneration.");
        onUpdate(media._id, { aiStatus: "failed", aiError: result.message });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger AI regeneration.");
      onUpdate(media._id, { aiStatus: "failed", aiError: err.message });
    } finally {
      setIsRegenerating(false);
    }
  }, [media, onUpdate]);

  // ─── Helper: Clipboard copy with animation ───────────────────────────────────
  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ─── Tag operations ──────────────────────────────────────────────────────────
  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setTagInput("");
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const previewUrl = media.urls.thumbnail_lg || media.urls.webp || media.urls.original;

  return (
    <div className="w-[360px] flex-shrink-0 border-l border-border flex flex-col bg-background h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {isExternal ? (
          <button
            type="button"
            onClick={handleImport}
            disabled={isImporting}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isImporting ? "Importing…" : "Import"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onInsert(media)}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer"
          >
            Insert
          </button>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border text-xs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 py-3 text-center font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "overview"
              ? "border-[var(--color-editor-accent)] text-[var(--color-editor-accent)] font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("ai-ocr")}
          className={`flex-1 py-3 text-center font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "ai-ocr"
              ? "border-[var(--color-editor-accent)] text-[var(--color-editor-accent)] font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          AI & OCR
        </button>
        <button
          onClick={() => setActiveTab("context")}
          className={`flex-1 py-3 text-center font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "context"
              ? "border-[var(--color-editor-accent)] text-[var(--color-editor-accent)] font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Context
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Preview Image */}
          <div className="rounded-xl overflow-hidden bg-muted/30 border border-border relative group">
            <img
              src={previewUrl}
              alt={altText || media.originalFilename}
              className="w-full object-contain max-h-56 mx-auto"
            />
          </div>

          {/* ════════ OVERVIEW TAB ════════ */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-[fade-in_0.15s_ease-out]">
              {/* File details card */}
              <div className="space-y-2 p-3 bg-muted/20 border border-border rounded-xl">
                <p className="text-xs font-semibold text-foreground break-all" title={media.originalFilename}>
                  {media.originalFilename}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60">Dimensions</span>
                    <span className="font-medium text-foreground">{media.dimensions ? `${media.dimensions.width} × ${media.dimensions.height}px` : "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60">File size</span>
                    <span className="font-medium text-foreground">{formatBytes(media.fileSize)}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60">Provider</span>
                    <span className="font-medium text-violet-500 uppercase">{isExternal ? (media._id.split("_")[0] || "external") : (media.provider || "cloudinary")}</span>
                  </div>
                  {media.folder && (
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60">Folder</span>
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <FolderOpen size={10} className="text-amber-500" />
                        {(media.folder as any).name || "Folder"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Editable Alt Text */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Alt Text
                </label>
                <Textarea
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe this image for accessibility…"
                  className="resize-none text-sm min-h-[64px]"
                  maxLength={250}
                  disabled={isExternal}
                />
                <p className="text-[10px] text-muted-foreground/60 text-right">
                  {altText.length}/250
                </p>
              </div>

              {/* Editable Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this image for? Context tags..."
                  className="resize-none text-sm min-h-[56px]"
                  disabled={isExternal}
                />
              </div>

              {/* Editable Tags */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto border border-border rounded-lg p-2 bg-[var(--color-editor-surface)]/20">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className={`text-[10px] py-0.5 px-1.5 ${isExternal ? "" : "cursor-pointer hover:bg-destructive/20 hover:text-destructive"} transition-colors`}
                        onClick={() => !isExternal && removeTag(tag)}
                      >
                        {tag} {!isExternal && "×"}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground/60 italic p-0.5">No tags added yet</span>
                  )}
                </div>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder={isExternal ? "Import to edit tags…" : "Add tag and press Enter…"}
                  className="text-xs h-8"
                  disabled={isExternal}
                />
              </div>

              {/* Save changes button */}
              {!isExternal && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="
                    flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold
                    bg-primary text-primary-foreground hover:bg-primary/90
                    transition-all disabled:opacity-50 cursor-pointer shadow-sm
                  "
                >
                  {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  Save Metadata Changes
                </button>
              )}

              {/* Upload History details */}
              <div className="pt-3 border-t border-border flex flex-col gap-1 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar size={10} />
                  <span>Imported: {new Date(media.createdAt).toLocaleString()}</span>
                </div>
                {media.updatedAt && media.updatedAt !== media.createdAt && (
                  <div className="flex items-center gap-1.5">
                    <Info size={10} />
                    <span>Last Updated: {new Date(media.updatedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════ AI & OCR TAB ════════ */}
          {activeTab === "ai-ocr" && (
            <div className="space-y-4 animate-[fade-in_0.15s_ease-out]">
              {/* Generated By provenance section */}
              {media.aiMetadata?.prompt && (
                <div className="p-3 bg-violet-500/5 border border-violet-500/15 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wide">AI Generation Provenance</span>
                    <button
                      onClick={() => handleCopy(media.aiMetadata!.prompt!, "prov-prompt")}
                      className="text-violet-500 hover:text-violet-600 cursor-pointer"
                      title="Copy generation prompt"
                    >
                      {copiedField === "prov-prompt" ? <Check size={10} /> : <Copy size={10} />}
                    </button>
                  </div>
                  <p className="text-[10px] leading-relaxed text-foreground font-medium bg-[var(--color-editor-surface)]/20 p-2 rounded border">
                    &ldquo;{media.aiMetadata.prompt}&rdquo;
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[9px] text-muted-foreground pt-1">
                    <div>
                      <span className="block text-[8px] text-muted-foreground/60 uppercase">Model</span>
                      <span className="font-semibold text-foreground">{media.aiMetadata.model || "gemini-imagen"}</span>
                    </div>
                    {media.aiMetadata.negativePrompt && (
                      <div>
                        <span className="block text-[8px] text-muted-foreground/60 uppercase">Negative Prompt</span>
                        <span className="font-semibold text-foreground truncate block" title={media.aiMetadata.negativePrompt}>
                          {media.aiMetadata.negativePrompt}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* OCR Text block */}
              {media.ocrText ? (
                <div className="border border-border rounded-xl overflow-hidden bg-muted/10">
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-b border-border">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <ImageIcon size={10} /> OCR Text Extract
                    </span>
                    <div className="flex items-center gap-2">
                      {media.ocrConfidence !== undefined && (
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">{media.ocrConfidence}% conf</span>
                      )}
                      <button
                        onClick={() => handleCopy(media.ocrText!, "ocr")}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {copiedField === "ocr" ? <Check size={10} /> : <Copy size={10} />}
                      </button>
                    </div>
                  </div>
                  <div className="p-3 text-[10px] leading-relaxed font-mono max-h-36 overflow-y-auto whitespace-pre-wrap bg-[var(--color-editor-surface)]/10 text-foreground">
                    {media.ocrText}
                  </div>
                </div>
              ) : !isExternal && (
                <div className="text-[10px] text-muted-foreground/60 italic text-center p-3 border border-dashed rounded-xl">
                  No OCR text extracted from this image
                </div>
              )}

              {/* AI Metadata Results card */}
              {media.aiStatus === "completed" && media.aiMetadata ? (
                <div className="border border-border rounded-xl overflow-hidden bg-violet-500/5 border-violet-500/10">
                  <div className="flex items-center justify-between px-3 py-2 bg-violet-500/10 border-b border-violet-500/15">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1">
                      <Sparkles size={10} /> AI Metadata Cache
                    </span>
                    {media.aiMetadata.confidence !== undefined && (
                      <span className="text-[9px] text-violet-500 font-semibold">{Math.round(media.aiMetadata.confidence * 100)}% confidence</span>
                    )}
                  </div>
                  <div className="p-3 space-y-3">
                    {media.aiMetadata.altText && (
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">AI Alt Text</span>
                        <p className="text-[10px] text-foreground leading-normal font-medium bg-[var(--color-editor-surface)]/20 p-1.5 rounded border">{media.aiMetadata.altText}</p>
                      </div>
                    )}
                    {media.aiMetadata.description && (
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">AI Description</span>
                        <p className="text-[10px] text-foreground leading-normal bg-[var(--color-editor-surface)]/20 p-1.5 rounded border">{media.aiMetadata.description}</p>
                      </div>
                    )}
                    {media.aiMetadata.tags && media.aiMetadata.tags.length > 0 && (
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60 mb-1">AI Suggestion Tags</span>
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                          {media.aiMetadata.tags.map((t) => (
                            <Badge key={t} variant="secondary" className="text-[9px] bg-violet-500/10 text-violet-600 dark:text-violet-400 border-none hover:bg-violet-500/15">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                !isExternal && (
                  <div className="flex flex-col items-center justify-center p-4 border border-dashed rounded-xl bg-muted/10 gap-2">
                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground/60 italic text-center">AI analysis job pending or processing...</p>
                  </div>
                )
              )}

              {/* Status / Regenerate actions */}
              {!isExternal && (
                <div className="space-y-2 pt-2">
                  {media.aiStatus === "failed" && (
                    <div className="space-y-2 p-3 rounded-lg text-xs bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertTriangle size={12} className="text-rose-500" />
                        <span>AI Generation Failed</span>
                      </div>
                      <p className="opacity-90 leading-relaxed font-mono text-[9px] break-all max-h-16 overflow-y-auto bg-rose-500/5 p-1 rounded border">
                        {media.aiError || "Unknown error occurred"}
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          onUpdate(media._id, { aiStatus: "pending", aiError: null });
                          try {
                            const res = await mediaLibraryApi.retryAI(media._id);
                            if (res.success) onUpdate(media._id, { aiStatus: "pending", aiError: null });
                          } catch (err: any) {
                            onUpdate(media._id, { aiStatus: "failed", aiError: err.message });
                          }
                        }}
                        className="flex items-center justify-center gap-1 w-full py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] hover:bg-rose-500/25 transition cursor-pointer"
                      >
                        Retry Background Job
                      </button>
                    </div>
                  )}

                  {media.aiStatus === "completed" || media.aiStatus === "failed" ? (
                    <button
                      type="button"
                      onClick={handleAIRegenerate}
                      disabled={isRegenerating}
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white cursor-pointer transition-all disabled:opacity-50 shadow-sm"
                    >
                      {isRegenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      Regenerate AI Metadata
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAIGenerate}
                      disabled={isGenerating}
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs border border-violet-500/30 hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      Analyze image with AI
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ════════ CONTEXT TAB ════════ */}
          {activeTab === "context" && (
            <div className="space-y-4 animate-[fade-in_0.15s_ease-out]">
              {/* Duplicate Status */}
              {!isExternal && (
                <div className="space-y-2 border border-border rounded-xl p-3 bg-[var(--color-editor-surface)]/10">
                  <div className="flex items-center justify-between border-b border-border pb-1.5 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <AlertTriangle size={10} /> Duplicate Detection
                    </span>
                    <span className="text-[9px] text-muted-foreground/60">Perceptual Hash check</span>
                  </div>

                  {isLoadingDuplicates ? (
                    <Skeleton className="h-10 w-full" />
                  ) : duplicates ? (
                    <div className="space-y-2 text-[10px]">
                      <div>
                        <span className="block text-[8px] text-muted-foreground/60 uppercase">SHA256 file hash</span>
                        <div className="flex items-center justify-between bg-muted/40 px-2 py-1 rounded font-mono text-[9px] text-foreground">
                          <span className="truncate w-44">{duplicates.fileHash}</span>
                          <button
                            onClick={() => handleCopy(duplicates.fileHash, "sha")}
                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            {copiedField === "sha" ? <Check size={10} /> : <Copy size={10} />}
                          </button>
                        </div>
                      </div>

                      {duplicates.pHash && (
                        <div>
                          <span className="block text-[8px] text-muted-foreground/60 uppercase">Perceptual Layout Hash (pHash)</span>
                          <div className="flex items-center justify-between bg-muted/40 px-2 py-1 rounded font-mono text-[9px] text-foreground">
                            <span>{duplicates.pHash}</span>
                            <button
                              onClick={() => handleCopy(duplicates.pHash, "phash")}
                              className="text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              {copiedField === "phash" ? <Check size={10} /> : <Copy size={10} />}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Matching suggestions */}
                      <div className="pt-1.5">
                        <span className="block text-[8px] text-muted-foreground/60 uppercase mb-1.5">Matching duplicates</span>
                        {duplicates.matches && duplicates.matches.length > 0 ? (
                          <div className="space-y-1.5">
                            <p className="text-[9px] text-amber-500 font-semibold flex items-center gap-1">
                              ⚠️ Found {duplicates.matches.length} matching identical/near layouts:
                            </p>
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {duplicates.matches.map((m) => (
                                <div
                                  key={m.mediaId}
                                  onClick={() => setDetailMedia(m)}
                                  className="flex items-center justify-between p-1.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded cursor-pointer transition-colors"
                                >
                                  <span className="truncate w-44 font-medium text-foreground">{m.originalFilename}</span>
                                  <Badge className={`text-[8px] uppercase font-bold border-none ${
                                    m.matchType === "exact"
                                      ? "bg-rose-500/20 text-rose-500"
                                      : "bg-amber-500/20 text-amber-500"
                                  }`}>
                                    {m.matchType} ({m.distance}d)
                                  </Badge>
                                </div>
                              ))}
                            </div>
                            <p className="text-[9px] text-muted-foreground italic leading-normal mt-1">
                              💡 suggestion: delete near-duplicates to optimize your library storage.
                            </p>
                          </div>
                        ) : (
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">✓ No duplicates detected in library.</span>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Similar Images grid */}
              <div className="space-y-2 border border-border rounded-xl p-3 bg-[var(--color-editor-surface)]/10">
                <div className="flex items-center justify-between border-b border-border pb-1.5 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <ImageIcon size={10} /> Similar Images
                  </span>
                  <span className="text-[9px] text-muted-foreground/60">Based on tags</span>
                </div>

                {isLoadingSimilar ? (
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="aspect-square rounded" />
                    <Skeleton className="aspect-square rounded" />
                    <Skeleton className="aspect-square rounded" />
                  </div>
                ) : similarImages && similarImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pt-1">
                    {similarImages.map((sim) => {
                      const simUrl = sim.urls?.thumbnail_sm || sim.urls?.webp || sim.urls?.original;
                      return (
                        <div
                          key={sim._id}
                          onClick={() => setDetailMedia(sim)}
                          className="aspect-square rounded border border-border overflow-hidden bg-muted/20 hover:border-[var(--color-editor-accent)] cursor-pointer transition-all relative group"
                        >
                          <img
                            src={simUrl}
                            alt={sim.originalFilename}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-[9px] text-muted-foreground/60 italic block text-center py-2">No similar tagged assets found</span>
                )}
              </div>

              {/* Usage stats and links */}
              <div className="space-y-2 border border-border rounded-xl p-3 bg-[var(--color-editor-surface)]/10">
                <div className="flex items-center justify-between border-b border-border pb-1.5 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <ExternalLink size={10} /> Document Usage
                  </span>
                  {usage && (
                    <span className="text-[10px] text-violet-500 font-bold">{usage.length} {usage.length === 1 ? "time" : "times"} used</span>
                  )}
                </div>

                {isLoadingUsage ? (
                  <div className="space-y-1.5">
                    <Skeleton className="h-7 w-full" />
                    <Skeleton className="h-7 w-full" />
                  </div>
                ) : usage && usage.length > 0 ? (
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {usage.map((u, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-muted/40 text-[11px] text-foreground font-medium"
                      >
                        <ExternalLink size={10} className="text-muted-foreground flex-shrink-0" />
                        <span className="truncate max-w-44">
                          {u.entity?.title || u.entityId}
                        </span>
                        {u.entity?.published !== undefined && (
                          <Badge
                            variant={u.entity.published ? "default" : "secondary"}
                            className="ml-auto text-[8px] px-1 py-0 border-none"
                          >
                            {u.entity.published ? "Published" : "Draft"}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground/60 italic text-center py-2">
                    This image has not been inserted into any articles yet
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Toolbar buttons */}
          <div className="flex gap-2 pt-3 border-t border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    onUpdate(media._id, { isFavorite: !media.isFavorite });
                    mediaLibraryApi.updateMetadata(media._id, {
                      isFavorite: !media.isFavorite,
                    });
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <Star
                    size={14}
                    className={media.isFavorite ? "fill-amber-400 text-amber-400" : ""}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>{media.isFavorite ? "Unfavorite" : "Favorite"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={media.urls.original}
                  download={media.originalFilename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  <Download size={14} />
                </a>
              </TooltipTrigger>
              <TooltipContent>Download original</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(media.urls.original);
                    toast.success("Link copied to clipboard!");
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <LinkIcon size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Copy image link</TooltipContent>
            </Tooltip>

            {!isExternal && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this image from library? Original placements in articles will not be broken.")) {
                        onDelete(media._id);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-rose-500/20 text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Delete asset</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Format Bytes helper ─────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
