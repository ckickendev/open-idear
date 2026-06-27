"use client";

import React, { useState, useCallback } from "react";
import {
  ArrowLeft,
  Download,
  Trash2,
  Replace,
  Sparkles,
  ExternalLink,
  Star,
  Loader2,
  Save,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useMediaAI } from "../hooks/useMediaAI";
import { mediaLibraryApi } from "../api/mediaLibrary.api";
import type { MediaAsset, MediaUsageEntry } from "../types/mediaLibrary.types";

// ═══════════════════════════════════════════════════════════════════
//  MediaDetailPanel — right-side detail view for a selected image
// ═══════════════════════════════════════════════════════════════════

interface MediaDetailPanelProps {
  media: MediaAsset;
  onClose: () => void;
  onInsert: (media: MediaAsset) => void;
  onUpdate: (id: string, updates: Partial<MediaAsset>) => void;
  onDelete: (id: string) => void;
}

export function MediaDetailPanel({
  media,
  onClose,
  onInsert,
  onUpdate,
  onDelete,
}: MediaDetailPanelProps) {
  // Local form state
  const [altText, setAltText] = useState(media.altText || "");
  const [description, setDescription] = useState(media.description || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(media.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [usage, setUsage] = useState<MediaUsageEntry[] | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);

  const { generateMetadata, isGenerating } = useMediaAI();

  // ─── Load usage on mount ──────────────────────────────────────
  React.useEffect(() => {
    setIsLoadingUsage(true);
    mediaLibraryApi
      .getUsage(media._id)
      .then((res) => {
        if (res.success) {
          setUsage(res.data.usedIn || []);
        }
      })
      .finally(() => setIsLoadingUsage(false));
  }, [media._id]);

  // ─── Reset form on media change ───────────────────────────────
  React.useEffect(() => {
    setAltText(media.altText || "");
    setDescription(media.description || "");
    setTags(media.tags || []);
  }, [media._id]);

  // ─── Save metadata ───────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const result = await mediaLibraryApi.updateMetadata(media._id, {
      altText,
      description,
      tags,
    });
    if (result.success) {
      onUpdate(media._id, { altText, description, tags });
    }
    setIsSaving(false);
  }, [media._id, altText, description, tags, onUpdate]);

  // ─── AI generate ──────────────────────────────────────────────
  const handleAIGenerate = useCallback(async () => {
    const imageUrl = media.urls.webp || media.urls.original;
    const result = await generateMetadata(imageUrl);
    if (result) {
      if (result.altText) setAltText(result.altText);
      if (result.description) setDescription(result.description);
      if (result.tags?.length) setTags((prev) => [...new Set([...prev, ...result.tags!])]);

      // Also save to AI metadata on the server
      await mediaLibraryApi.saveAIMetadata(media._id, {
        altText: result.altText || "",
        description: result.description || "",
        tags: result.tags || [],
        model: "gemini-2.0-flash",
      });
    }
  }, [media, generateMetadata]);

  // ─── Tag management ───────────────────────────────────────────
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
    <div className="w-[360px] flex-shrink-0 border-l border-border flex flex-col bg-background">
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
        <button
          type="button"
          onClick={() => onInsert(media)}
          className="px-4 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Insert
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Preview */}
          <div className="rounded-xl overflow-hidden bg-muted/30 border border-border">
            <img
              src={previewUrl}
              alt={altText || media.originalFilename}
              className="w-full object-contain max-h-56"
            />
          </div>

          {/* File info */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground truncate">
              {media.originalFilename}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {media.dimensions && (
                <span>{media.dimensions.width} × {media.dimensions.height}</span>
              )}
              <span>{formatBytes(media.fileSize)}</span>
              {media.fileSizeWebp && (
                <span className="text-emerald-600 dark:text-emerald-400">
                  WebP: {formatBytes(media.fileSizeWebp)}
                </span>
              )}
              <span>{new Date(media.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* AI Generate All button */}
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="
              flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm
              bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10
              border border-violet-500/20 hover:border-violet-500/40
              text-violet-700 dark:text-violet-300
              transition-all duration-200 cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isGenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {isGenerating ? "Generating with AI…" : "Generate metadata with AI"}
          </button>

          {/* Alt Text */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Alt Text
            </label>
            <Textarea
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe this image for accessibility…"
              className="resize-none text-sm min-h-[64px]"
              maxLength={250}
            />
            <p className="text-[10px] text-muted-foreground/60 mt-1 text-right">
              {altText.length}/250
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this image for? Where was it used?"
              className="resize-none text-sm min-h-[56px]"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-colors"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
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
              placeholder="Add tag and press Enter…"
              className="text-sm"
            />
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="
              flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium
              bg-primary text-primary-foreground hover:bg-primary/90
              transition-colors disabled:opacity-50 cursor-pointer
            "
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save changes
          </button>

          {/* Usage */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Used in
            </label>
            {isLoadingUsage ? (
              <div className="space-y-2">
                <Skeleton className="h-8 rounded-lg" />
                <Skeleton className="h-8 rounded-lg" />
              </div>
            ) : usage && usage.length > 0 ? (
              <div className="space-y-1">
                {usage.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 text-sm"
                  >
                    <ExternalLink size={12} className="text-muted-foreground flex-shrink-0" />
                    <span className="truncate">
                      {u.entity?.title || u.entityId}
                    </span>
                    {u.entity?.published !== undefined && (
                      <Badge
                        variant={u.entity.published ? "default" : "secondary"}
                        className="ml-auto text-[10px] flex-shrink-0"
                      >
                        {u.entity.published ? "Published" : "Draft"}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 px-3 py-4 text-center">
                Not used in any posts yet
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border">
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
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
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
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
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
                    if (confirm("Delete this image? It won't be removed from existing posts.")) {
                      onDelete(media._id);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-sm text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
