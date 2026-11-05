// =============================================================================
//  COVER IMAGE PICKER — INTERNET SEARCH, DEVICE UPLOAD & AI GENERATION
//  src/app/(editor)/create/CoverImagePicker.tsx
//
//  Design Decisions:
//  - Multi-tab cover selector allowing authors to pick authentic, high-res photos
//    from the internet (Unsplash, Stock, Wikimedia) instead of synthetic AI.
//  - Context-aware keyword suggestions derived from article title and topic.
//  - Direct URL input with instant image preview & HTTP verification.
//  - Transparent photographer attribution and provider licensing.
//  - 1-click apply as article cover image.
// =============================================================================

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Globe,
  Upload,
  Sparkles,
  Search,
  Check,
  RotateCw,
  X,
  Link as LinkIcon,
  ExternalLink,
  ImageIcon,
  Trash2,
  Camera,
  Layers,
  AlertCircle,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { aiVisualApi, type ImageSearchResult } from "@/features/ai-visual";
import ImageUpload from "./ImageUpload";
import { useTranslation } from "@/app/hook/useTranslation";

export interface SelectedCoverData {
  url: string;
  alt?: string;
  source?: string;
  author?: string;
  attributionUrl?: string;
  createdByAI?: boolean;
}

export interface CoverImagePickerProps {
  currentCoverUrl: string | null;
  coverMetadata?: {
    source?: string;
    author?: string;
    attributionUrl?: string;
    alt?: string;
    createdByAI?: boolean;
  } | null;
  initialTopic?: string;
  onSelectCover: (cover: SelectedCoverData) => void;
  onRemoveCover: () => void;
  onRegenerateAI: () => Promise<void>;
  isRegeneratingAI?: boolean;
}

export const CoverImagePicker: React.FC<CoverImagePickerProps> = ({
  currentCoverUrl,
  coverMetadata,
  initialTopic = "",
  onSelectCover,
  onRemoveCover,
  onRegenerateAI,
  isRegeneratingAI = false,
}) => {
  const { t } = useTranslation();

  // Mode: "preview" (active cover displayed) vs "picker" (tabs to pick/replace)
  const [isReplacing, setIsReplacing] = useState(!currentCoverUrl);

  // Picker tab: "internet" (default/recommended), "upload", or "ai"
  const [activeTab, setActiveTab] = useState<"internet" | "upload" | "ai">("internet");

  // Internet Search States
  const [searchQuery, setSearchQuery] = useState(initialTopic.trim() || "");
  const [searchResults, setSearchResults] = useState<ImageSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Internet Submode: "search" vs "direct_url"
  const [internetSubMode, setInternetSubMode] = useState<"search" | "direct_url">("search");
  const [directUrl, setDirectUrl] = useState("");
  const [directUrlStatus, setDirectUrlStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [directUrlAlt, setDirectUrlAlt] = useState("");

  // Whenever currentCoverUrl changes from null to a string, switch to preview
  useEffect(() => {
    if (currentCoverUrl) {
      setIsReplacing(false);
    } else {
      setIsReplacing(true);
    }
  }, [currentCoverUrl]);

  // Update search query when initialTopic arrives and query is empty
  useEffect(() => {
    if (initialTopic && !searchQuery) {
      setSearchQuery(initialTopic);
    }
  }, [initialTopic, searchQuery]);

  // Extract clean context tags from topic
  const suggestedChips = useMemo(() => {
    const chips: string[] = [];
    const raw = initialTopic.trim();
    if (raw) {
      // Clean leading prefixes like "Computex 2024 Recap:"
      const clean = raw.replace(/^[^:]+:\s*/, "").slice(0, 35);
      if (clean.length > 3) chips.push(clean);
    }

    const lower = `${initialTopic} ${searchQuery}`.toLowerCase();
    if (lower.includes("computex") || lower.includes("pc") || lower.includes("build") || lower.includes("hardware")) {
      chips.push("PC Build", "Computer Hardware", "Tech Workspace", "Motherboard Setup");
    } else if (lower.includes("gpu") || lower.includes("graphics") || lower.includes("rtx")) {
      chips.push("NVIDIA RTX", "Graphics Card", "Gaming Rig", "VRAM");
    } else if (lower.includes("ai") || lower.includes("llm") || lower.includes("model")) {
      chips.push("Artificial Intelligence", "Neural Network", "Data Center", "Server Rack");
    } else if (lower.includes("code") || lower.includes("react") || lower.includes("software")) {
      chips.push("Coding Workspace", "Software Development", "Minimalist Desk", "Source Code");
    } else {
      chips.push("Technology", "Modern Hardware", "Minimalist Workspace", "Developer Setup");
    }

    return Array.from(new Set(chips)).slice(0, 5);
  }, [initialTopic, searchQuery]);

  // Execute Internet Stock Photo Search
  const performSearch = useCallback(
    async (termToSearch: string) => {
      const q = termToSearch.trim();
      if (!q) return;

      setIsSearching(true);
      setSearchError(null);
      setHasSearched(true);

      try {
        const results = await aiVisualApi.searchImages(
          {
            query: q,
            limit: 12,
            orientation: "landscape",
          },
          12,
          1
        );

        setSearchResults(results || []);
        if (!results || results.length === 0) {
          setSearchError("No images found for this query. Try one of the topic chips below.");
        }
      } catch (err: any) {
        console.warn("[CoverImagePicker] Search fallback error:", err);
        setSearchError("Could not retrieve web images. You can paste a direct URL or upload a file.");
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Auto-search on first load if we have a topic and haven't searched yet
  useEffect(() => {
    if (isReplacing && activeTab === "internet" && !hasSearched && (initialTopic || searchQuery)) {
      performSearch(searchQuery || initialTopic);
    }
  }, [isReplacing, activeTab, hasSearched, initialTopic, searchQuery, performSearch]);

  // Validate direct image URL
  const handleValidateDirectUrl = useCallback((urlToTest: string) => {
    const trimmed = urlToTest.trim();
    if (!trimmed) {
      setDirectUrlStatus("idle");
      return;
    }

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setDirectUrlStatus("invalid");
      return;
    }

    setDirectUrlStatus("validating");
    const img = new Image();
    img.onload = () => setDirectUrlStatus("valid");
    img.onerror = () => setDirectUrlStatus("invalid");
    img.src = trimmed;
  }, []);

  const handleApplyDirectUrl = () => {
    if (directUrlStatus !== "valid" || !directUrl.trim()) return;

    onSelectCover({
      url: directUrl.trim(),
      alt: directUrlAlt.trim() || initialTopic || "Article Cover",
      source: "web_url",
      createdByAI: false,
    });
    setIsReplacing(false);
    toast.success("Cover image applied from Web URL!");
  };

  // Determine provider info for active cover
  const isUnsplash =
    coverMetadata?.source === "unsplash" ||
    (currentCoverUrl && currentCoverUrl.includes("unsplash.com"));
  const isAIGenerated =
    coverMetadata?.createdByAI ||
    (currentCoverUrl && currentCoverUrl.includes("pollinations.ai"));

  return (
    <div className="space-y-3">
      {/* ── 1. ACTIVE COVER IMAGE PREVIEW ─────────────────────────────────── */}
      {currentCoverUrl && !isReplacing && (
        <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-card group shadow-xs">
          {/* Cover Image Element */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentCoverUrl}
            alt={coverMetadata?.alt || "Article Cover"}
            className="w-full h-48 sm:h-52 object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-[1.01]"
          />

          {/* Source Attribution Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white shadow-md">
            {isUnsplash ? (
              <>
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Internet Stock (Unsplash)</span>
                {coverMetadata?.author && (
                  <span className="text-white/70 font-normal">
                    · by {coverMetadata.author}
                  </span>
                )}
              </>
            ) : isAIGenerated ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Generated</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Active Cover</span>
              </>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="p-3 bg-muted/20 border-t border-border/70 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("internet");
                  setIsReplacing(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:brightness-105 transition-all shadow-xs cursor-pointer"
                title="Search authentic photography from the internet"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Find on Internet</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("upload");
                  setIsReplacing(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-background hover:bg-muted text-foreground border border-border/80 transition-colors cursor-pointer"
                title="Upload image file from device"
              >
                <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Upload</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onRegenerateAI}
                disabled={isRegeneratingAI}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition-colors cursor-pointer disabled:opacity-50"
                title="Regenerate with AI illustration"
              >
                {isRegeneratingAI ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">AI Art</span>
              </button>

              <button
                type="button"
                onClick={onRemoveCover}
                className="p-1.5 text-xs font-medium rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-colors cursor-pointer"
                title="Remove cover image"
                aria-label="Remove Cover"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. COVER PICKER / SELECTOR (When replacing or no cover) ────────── */}
      {isReplacing && (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs space-y-3.5 p-4 transition-all">
          {/* Header Segmented Tabs */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60 gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/60">
              {/* Tab 1: Internet Search */}
              <button
                type="button"
                onClick={() => setActiveTab("internet")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "internet"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>Internet Stock</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 hidden sm:inline-block">
                  Photos
                </span>
              </button>

              {/* Tab 2: Upload */}
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "upload"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-blue-500" />
                <span>Upload</span>
              </button>

              {/* Tab 3: AI Generate */}
              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "ai"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>AI Art</span>
              </button>
            </div>

            {/* Cancel replacing button (if an active cover already exists) */}
            {currentCoverUrl && (
              <button
                type="button"
                onClick={() => setIsReplacing(false)}
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                {t("editor.publish_drawer.cancel") || "Keep Current"}
              </button>
            )}
          </div>

          {/* ── TAB 1: FIND ON INTERNET (UNSPLASH & STOCK) ────────────────── */}
          {activeTab === "internet" && (
            <div className="space-y-3.5 animate-[fade-in_0.15s_ease-out]">
              {/* Submode Switcher: Search vs Paste URL */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setInternetSubMode("search")}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      internetSubMode === "search"
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:text-foreground"
                    }`}
                  >
                    Search Stock Imagery
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setInternetSubMode("direct_url")}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      internetSubMode === "direct_url"
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:text-foreground"
                    }`}
                  >
                    Paste Web URL
                  </button>
                </div>

                <span className="text-[11px] text-muted-foreground hidden sm:flex items-center gap-1">
                  <Camera className="w-3 h-3 text-emerald-500" />
                  Royalty-free photos
                </span>
              </div>

              {/* Mode A: Keyword Search */}
              {internetSubMode === "search" && (
                <div className="space-y-3">
                  {/* Search Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      performSearch(searchQuery);
                    }}
                    className="flex gap-2"
                  >
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search photos (e.g. PC Build, Dedicated GPU, Computex)..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-border/80 bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearching || !searchQuery.trim()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:brightness-105 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {isSearching ? (
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Search className="w-3.5 h-3.5" />
                      )}
                      <span>Search</span>
                    </button>
                  </form>

                  {/* Context Inspiration Chips */}
                  {suggestedChips.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                        Suggested:
                      </span>
                      {suggestedChips.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            setSearchQuery(chip);
                            performSearch(chip);
                          }}
                          className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-muted/60 hover:bg-muted text-foreground border border-border/60 transition-colors cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Loading State */}
                  {isSearching && (
                    <div className="py-8 text-center space-y-2">
                      <RotateCw className="w-5 h-5 text-primary animate-spin mx-auto" />
                      <p className="text-xs text-muted-foreground">
                        Searching high-resolution photography on Unsplash & Stock...
                      </p>
                    </div>
                  )}

                  {/* Error State */}
                  {!isSearching && searchError && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>{searchError}</p>
                    </div>
                  )}

                  {/* Results Grid (2 Columns, 16:9 Landscape) */}
                  {!isSearching && searchResults.length > 0 && (
                    <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                      {searchResults.map((item) => (
                        <div
                          key={item.id || item.url}
                          onClick={() => {
                            onSelectCover({
                              url: item.url,
                              alt: item.alt || item.title || searchQuery,
                              source: item.sourceProvider || "unsplash",
                              author: item.author,
                              attributionUrl: item.attributionUrl,
                              createdByAI: false,
                            });
                            setIsReplacing(false);
                            toast.success(
                              `Cover image set from ${
                                item.sourceProvider === "unsplash" ? "Unsplash" : "Stock"
                              }!`
                            );
                          }}
                          className="group relative rounded-xl overflow-hidden border border-border/70 hover:border-primary/80 bg-muted/20 transition-all cursor-pointer hover:shadow-md aspect-[16/10]"
                        >
                          {/* Image */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.thumbnailUrl || item.url}
                            alt={item.title || item.alt || "Cover photo"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />

                          {/* Gradient Vignette */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                          {/* Top Provider Tag */}
                          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[9px] font-semibold text-white">
                            <Globe className="w-2.5 h-2.5 text-emerald-400" />
                            <span>{item.sourceProvider === "unsplash" ? "Unsplash" : "Stock"}</span>
                          </div>

                          {/* Bottom Info & Hover Select CTA */}
                          <div className="absolute bottom-1.5 left-2 right-2 flex items-end justify-between gap-1">
                            <div className="min-w-0">
                              <p className="text-[10px] font-medium text-white line-clamp-1">
                                {item.title || item.alt}
                              </p>
                              {item.author && (
                                <p className="text-[9px] text-white/70 line-clamp-1">
                                  by {item.author}
                                </p>
                              )}
                            </div>

                            <span className="shrink-0 p-1 rounded-lg bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                              <Check className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Mode B: Direct Web Image URL */}
              {internetSubMode === "direct_url" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 text-primary" />
                      <span>Direct Image URL</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={directUrl}
                        onChange={(e) => {
                          setDirectUrl(e.target.value);
                          handleValidateDirectUrl(e.target.value);
                        }}
                        placeholder="https://images.unsplash.com/photo-... or https://..."
                        className="flex-1 px-3 py-2 rounded-xl border border-border/80 bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground">
                      Accessible Alt Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={directUrlAlt}
                      onChange={(e) => setDirectUrlAlt(e.target.value)}
                      placeholder="Describe the image content..."
                      className="w-full px-3 py-2 rounded-xl border border-border/80 bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  {/* URL Live Validation Preview */}
                  {directUrlStatus === "valid" && (
                    <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 bg-muted/20 aspect-video">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={directUrl}
                        alt="URL Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-semibold">
                        <Check className="w-3 h-3" /> Valid Image Link
                      </div>
                    </div>
                  )}

                  {directUrlStatus === "invalid" && (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Please provide a direct, reachable image URL (JPEG, PNG, WebP).
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleApplyDirectUrl}
                    disabled={directUrlStatus !== "valid"}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:brightness-105 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply as Cover Image</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: DEVICE FILE UPLOAD / MEDIA LIBRARY ──────────────────── */}
          {activeTab === "upload" && (
            <div className="animate-[fade-in_0.15s_ease-out]">
              <ImageUpload
                onImageUploaded={(img) => {
                  const url = img.url || img.imageUrl || (typeof img === "string" ? img : "");
                  onSelectCover({
                    url,
                    alt: img.alt || img.description || initialTopic || "Uploaded Cover",
                    source: "upload",
                    createdByAI: false,
                  });
                  setIsReplacing(false);
                  toast.success("Cover image uploaded from device!");
                }}
                onClose={() => {
                  if (currentCoverUrl) setIsReplacing(false);
                }}
                isTitleDisplay={false}
              />
            </div>
          )}

          {/* ── TAB 3: GENERATE WITH AI (OPTIONAL FALLBACK) ────────────────── */}
          {activeTab === "ai" && (
            <div className="space-y-3.5 animate-[fade-in_0.15s_ease-out] p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground">
                  Generate Synthetic Illustration with AI
                </h4>
                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                  Creates a stylized 16:9 digital banner using generative AI for &ldquo;{initialTopic || "Your Article"}&rdquo;.
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await onRegenerateAI();
                  setIsReplacing(false);
                }}
                disabled={isRegeneratingAI}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isRegeneratingAI ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating AI Art...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Generate AI Cover Image</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoverImagePicker;
