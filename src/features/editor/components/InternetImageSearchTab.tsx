// =============================================================================
//  INTERNET IMAGE SEARCH TAB — AI VISUAL ASSISTANT
//  src/features/editor/components/InternetImageSearchTab.tsx
//
//  Design Decisions:
//  - Multi-provider web image discovery (Unsplash, Wikimedia Commons, Pexels, Asset Library).
//  - Allows picking authentic photos and illustrations from the internet instead of AI generation.
//  - One-click context chips tailored to the current article section topic.
//  - Direct Web URL input mode with instant live image preview validation.
//  - Editable accessible Alt Text & Caption before insertion.
// =============================================================================

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Globe,
  Link as LinkIcon,
  ExternalLink,
  Check,
  RotateCw,
  AlertCircle,
  ImageIcon,
  Sparkles,
  Camera,
  Layers,
  Library,
  Tag,
  Eye,
  Info,
} from "lucide-react";
import { aiVisualApi, type ImageSearchResult } from "@/features/ai-visual";
import { sanitizeHeadingSubject } from "../utils/aiAssistContext";

export interface InternetImageSearchTabProps {
  initialQuery?: string;
  heading?: string;
  articleTitle?: string;
  selectedAsset: ImageSearchResult | null;
  onSelectAsset: (asset: ImageSearchResult | null) => void;
  altText: string;
  onAltTextChange: (val: string) => void;
  caption: string;
  onCaptionChange: (val: string) => void;
  directUrl: string;
  onDirectUrlChange: (val: string) => void;
  subMode: "search" | "direct_url";
  onSubModeChange: (mode: "search" | "direct_url") => void;
}

export function InternetImageSearchTab({
  initialQuery = "",
  heading,
  articleTitle,
  selectedAsset,
  onSelectAsset,
  altText,
  onAltTextChange,
  caption,
  onCaptionChange,
  directUrl,
  onDirectUrlChange,
  subMode,
  onSubModeChange,
}: InternetImageSearchTabProps) {
  const [query, setQuery] = useState(
    initialQuery.trim() ||
      sanitizeHeadingSubject(heading) ||
      sanitizeHeadingSubject(articleTitle) ||
      ""
  );
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "stock" | "wikimedia" | "library"
  >("all");
  const [directUrlValid, setDirectUrlValid] = useState<boolean | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Context-aware suggested search chips
  const suggestedChips = useMemo(() => {
    const chips: string[] = [];
    const cleanHeading = sanitizeHeadingSubject(heading);
    const cleanTitle = sanitizeHeadingSubject(articleTitle);

    if (cleanHeading && cleanHeading.length > 2) chips.push(cleanHeading);
    if (cleanTitle && cleanTitle.length > 2 && cleanTitle !== cleanHeading) {
      chips.push(cleanTitle);
    }

    // Technology hardware keywords
    const lower = `${cleanHeading} ${cleanTitle}`.toLowerCase();
    if (lower.includes("gpu") || lower.includes("graphics") || lower.includes("card")) {
      chips.push("GPU", "Graphics Card", "NVIDIA RTX", "VRAM Architecture");
    } else if (lower.includes("cpu") || lower.includes("processor")) {
      chips.push("CPU Processor", "Silicon Chip", "Motherboard Socket");
    } else if (lower.includes("ram") || lower.includes("memory")) {
      chips.push("DDR5 RAM", "Memory Module", "Memory Bandwidth");
    } else if (lower.includes("bottleneck")) {
      chips.push("GPU Bottleneck", "Hardware Architecture", "PC Components");
    } else if (lower.includes("cloud") || lower.includes("server") || lower.includes("docker")) {
      chips.push("Data Center", "Server Rack", "Cloud Infrastructure");
    } else {
      chips.push("Computer Hardware", "Modern Tech", "Circuit Board", "Data Architecture");
    }

    return Array.from(new Set(chips)).slice(0, 6);
  }, [heading, articleTitle]);

  // Execute search API call
  const performSearch = useCallback(
    async (searchTerm: string) => {
      const q = searchTerm.trim();
      if (!q) return;

      setIsLoading(true);
      setSearchError(null);
      setHasSearched(true);

      try {
        const items = await aiVisualApi.searchImages(q, 16, 1);
        setResults(items);
        if (items.length === 0) {
          setSearchError("No images found for this query. Try a broader keyword.");
        }
      } catch (err: any) {
        console.error("[InternetImageSearchTab] search failed:", err);
        setSearchError("Could not retrieve web images. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Auto-search once on mount if a valid query exists
  useEffect(() => {
    const defaultSearch =
      initialQuery.trim() ||
      sanitizeHeadingSubject(heading) ||
      sanitizeHeadingSubject(articleTitle) ||
      "";
    if (defaultSearch && results.length === 0 && !hasSearched) {
      setQuery(defaultSearch);
      performSearch(defaultSearch);
    }
  }, [initialQuery, heading, articleTitle, results.length, hasSearched, performSearch]);

  const handleChipClick = (chip: string) => {
    setQuery(chip);
    performSearch(chip);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleCardSelect = (asset: ImageSearchResult) => {
    if (selectedAsset?.id === asset.id) {
      // Toggle off if already selected
      onSelectAsset(null);
    } else {
      onSelectAsset(asset);
      // Auto-populate Alt text & caption if empty or default
      if (!altText || altText === heading) {
        onAltTextChange(asset.alt || asset.title || query);
      }
      if (!caption) {
        onCaptionChange(asset.title || "");
      }
    }
  };

  // Filtered results
  const filteredResults = useMemo(() => {
    if (activeFilter === "all") return results;
    if (activeFilter === "stock") {
      return results.filter(
        (r) =>
          r.sourceProvider === "unsplash" ||
          r.sourceProvider === "pexels" ||
          r.source === "stock"
      );
    }
    if (activeFilter === "wikimedia") {
      return results.filter((r) => r.sourceProvider === "wikimedia");
    }
    if (activeFilter === "library") {
      return results.filter(
        (r) => r.source === "asset_library" || r.source === "ai_generated"
      );
    }
    return results;
  }, [results, activeFilter]);

  return (
    <div className="space-y-4">
      {/* ── Submode Toggle (Search Web vs Direct URL) ───────────────────────── */}
      <div className="flex items-center justify-between gap-3 pb-1 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80">
          <button
            type="button"
            onClick={() => onSubModeChange("search")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subMode === "search"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-violet-500" />
            <span>Search Internet & Stock</span>
          </button>
          <button
            type="button"
            onClick={() => onSubModeChange("direct_url")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subMode === "direct_url"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Paste Direct Image URL</span>
          </button>
        </div>

        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:inline-flex items-center gap-1">
          <Camera className="w-3 h-3 text-emerald-500" /> High-res royalty-free imagery
        </span>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* MODE A: INTERNET SEARCH & STOCK DISCOVERY                              */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {subMode === "search" && (
        <div className="space-y-3.5">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search web images (e.g. Dedicated GPU, Microprocessor, Server Rack)..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/60 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer shrink-0"
            >
              {isLoading ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>Search</span>
            </button>
          </form>

          {/* Quick Context Topic Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-zinc-400 font-medium shrink-0 flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" /> Quick Topics:
            </span>
            {suggestedChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip)}
                className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer truncate max-w-[190px] ${
                  query.toLowerCase() === chip.toLowerCase()
                    ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-700/60 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-300"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Source Filter Badges */}
          {results.length > 0 && (
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { id: "all", label: `All Results (${results.length})` },
                    { id: "stock", label: "Unsplash & Stock" },
                    { id: "wikimedia", label: "Wikimedia Commons" },
                    { id: "library", label: "My Library" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors cursor-pointer ${
                      activeFilter === f.id
                        ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-200"
                        : "bg-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 border-transparent"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {selectedAsset && (
                <span className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> 1 Image Selected
                </span>
              )}
            </div>
          )}

          {/* Results Grid Container */}
          <div className="min-h-[240px] max-h-[360px] overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/40 p-2 sm:p-3">
            {/* Loading Skeleton */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400 space-y-2">
                <RotateCw className="w-6 h-6 animate-spin text-violet-500" />
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Searching images across Unsplash, Wikimedia Commons & Stock...
                </p>
              </div>
            )}

            {/* Error or Empty State */}
            {!isLoading && searchError && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400 space-y-1.5">
                <AlertCircle className="w-6 h-6 text-amber-500" />
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {searchError}
                </p>
                <p className="text-[11px] text-zinc-500">
                  Try searching for a simpler term or click one of the quick topics above.
                </p>
              </div>
            )}

            {/* Empty State before any search */}
            {!isLoading && !searchError && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400 space-y-2">
                <Globe className="w-8 h-8 text-zinc-400/60" />
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Discover millions of free technical & hardware photos from the web
                </p>
                <p className="text-[11px] text-zinc-500">
                  Type a keyword above or select a topic to begin searching.
                </p>
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && filteredResults.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filteredResults.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  const isWikimedia = asset.sourceProvider === "wikimedia";
                  const isUnsplash = asset.sourceProvider === "unsplash";
                  const isPexels = asset.sourceProvider === "pexels";

                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleCardSelect(asset)}
                      className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 select-none bg-zinc-900 ${
                        isSelected
                          ? "ring-2 ring-violet-500 border-violet-500 shadow-md shadow-violet-500/20 scale-[0.98]"
                          : "border-zinc-200/80 dark:border-zinc-800 hover:border-violet-400 hover:shadow-md"
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                        <img
                          src={asset.thumbnailUrl || asset.url}
                          alt={asset.alt || asset.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            // Fallback if thumbnail fails to load
                            (e.currentTarget as HTMLImageElement).src = asset.url;
                          }}
                        />

                        {/* Top Provider Badge */}
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10">
                          {isUnsplash && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-teal-900/90 text-teal-200 border border-teal-700/60 shadow-xs backdrop-blur-xs">
                              Unsplash
                            </span>
                          )}
                          {isWikimedia && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-sky-900/90 text-sky-200 border border-sky-700/60 shadow-xs backdrop-blur-xs">
                              Wikimedia
                            </span>
                          )}
                          {isPexels && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-900/90 text-amber-200 border border-amber-700/60 shadow-xs backdrop-blur-xs">
                              Pexels
                            </span>
                          )}
                          {asset.source === "asset_library" && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-900/90 text-purple-200 border border-purple-700/60 shadow-xs backdrop-blur-xs">
                              Library
                            </span>
                          )}
                        </div>

                        {/* Selected Indicator Badge */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-violet-600 text-white shadow-md z-10 animate-in zoom-in-75">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white">
                          <p className="text-[11px] font-semibold line-clamp-1">
                            {asset.title}
                          </p>
                          <div className="flex items-center justify-between text-[9px] text-zinc-300 mt-0.5">
                            <span className="truncate max-w-[110px]">
                              {asset.author || "Open Access"}
                            </span>
                            <span className="text-violet-300 font-medium">Click to pick</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Meta */}
                      <div className="p-2 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800/80">
                        <p className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200 line-clamp-1">
                          {asset.title}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-0.5">
                          <span className="truncate">{asset.author || "Web Source"}</span>
                          {asset.attributionUrl && (
                            <a
                              href={asset.attributionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5 ml-1"
                              title="View original attribution"
                            >
                              Source <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* MODE B: DIRECT WEB IMAGE URL INPUT                                     */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {subMode === "direct_url" && (
        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
              <span>Image Web URL</span>
              <span className="text-[10px] text-zinc-400">Direct HTTPS link to PNG, JPG, or WEBP</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="url"
                value={directUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  onDirectUrlChange(val);
                  setDirectUrlValid(null);
                }}
                placeholder="https://images.unsplash.com/photo-... or https://..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/60 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Direct URL Live Image Preview Tester */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950/90 min-h-[180px] max-h-[260px] overflow-hidden flex items-center justify-center p-3 relative">
            {directUrl.trim() ? (
              <img
                src={directUrl.trim()}
                alt="Direct web preview"
                className="max-h-[230px] w-auto max-w-full rounded-lg object-contain shadow-lg"
                onLoad={() => setDirectUrlValid(true)}
                onError={() => setDirectUrlValid(false)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-400 space-y-1.5">
                <ImageIcon className="w-8 h-8 text-zinc-600 mb-1 opacity-60" />
                <p className="text-xs font-medium text-zinc-400">
                  Paste any public image URL above to preview
                </p>
                <p className="text-[10px] text-zinc-500">
                  Supports Wikimedia, Unsplash, GitHub CDN, Imgur, or direct website links
                </p>
              </div>
            )}

            {directUrlValid === true && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-semibold flex items-center gap-1 backdrop-blur-xs">
                <Check className="w-3 h-3 text-emerald-400" /> Image verified & ready
              </div>
            )}
            {directUrlValid === false && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-red-950/80 border border-red-700/60 text-red-300 text-[10px] font-semibold flex items-center gap-1 backdrop-blur-xs">
                <AlertCircle className="w-3 h-3 text-red-400" /> Cannot load image from URL
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SELECTED IMAGE INSPECTOR & ALT TEXT / CAPTION EDITING                    */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {(selectedAsset || (subMode === "direct_url" && directUrl.trim())) && (
        <div className="p-3.5 rounded-xl border border-violet-500/30 bg-violet-50/50 dark:bg-violet-950/30 space-y-3 animate-in fade-in-50">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            <span className="flex items-center gap-1.5 text-violet-700 dark:text-violet-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Image Metadata & Insertion Settings</span>
            </span>
            {selectedAsset && (
              <button
                type="button"
                onClick={() => onSelectAsset(null)}
                className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline cursor-pointer"
              >
                Change Selection
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Alt Text Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <span>Alt Text (Accessibility & SEO)</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => onAltTextChange(e.target.value)}
                placeholder="Accessible description of the image content..."
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/30"
              />
            </div>

            {/* Caption Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                Figure Caption (Optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => onCaptionChange(e.target.value)}
                placeholder="Figure 1: High-performance GPU cooling architecture..."
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/30"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InternetImageSearchTab;
