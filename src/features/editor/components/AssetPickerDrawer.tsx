// =============================================================================
//  ASSET PICKER DRAWER (SPRINT 2 UPGRADE)
//  src/features/editor/components/AssetPickerDrawer.tsx
//
//  Changes from Sprint 1:
//  - Inline alt text confirmation card before insertion.
//  - License & attribution badge for stock images.
//  - Pagination: "Load more" appends next page results.
//  - Import flow: stock images are saved to Asset Library via importStockImage().
//  - Failure state with retry CTA.
//  - Zero-duplicate guarantee: importStockImage() deduplicates server-side.
// =============================================================================

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search, X, ImageIcon, Library, Sparkles, Check, Loader2,
  ExternalLink, AlertTriangle, ChevronDown, User, Scale,
} from "lucide-react";
import { toast } from "sonner";
import { aiVisualApi, type ImageSearchResult } from "@/features/ai-visual";
import type { ImportedAssetRecord } from "@/features/ai-visual/types/aiVisual.types";

// ─── Props ───────────────────────────────────────────────────────────────────

interface AssetPickerDrawerProps {
  readonly context: {
    heading?: string;
    searchQuery?: string;
    imagePrompt?: string;
    alt?: string;
    placeholderPos?: number;
  } | null;
  readonly onClose: () => void;
  /**
   * Called after the user confirms insertion.
   * For stock images, `importedAsset` is provided (Asset Library record).
   * For library assets, `importedAsset` is undefined.
   */
  readonly onSelectAsset: (
    asset: ImageSearchResult,
    altText: string,
    importedAsset?: ImportedAssetRecord
  ) => void;
}

// ─── License display helpers ─────────────────────────────────────────────────

function getLicenseLabel(license?: string): string {
  if (!license) return "";
  switch (license.toLowerCase()) {
    case "unsplash": return "Unsplash License";
    case "pexels":   return "Pexels License";
    case "cc0":      return "CC0 Public Domain";
    default:         return license;
  }
}

// ─── Inline Confirmation Card ─────────────────────────────────────────────────

interface ConfirmCardProps {
  asset: ImageSearchResult;
  defaultAlt: string;
  onConfirm: (altText: string) => void;
  onCancel: () => void;
  importing: boolean;
}

function ConfirmCard({ asset, defaultAlt, onConfirm, onCancel, importing }: ConfirmCardProps) {
  const [altText, setAltText] = useState(defaultAlt);
  const isStock = asset.source === "stock";
  const licenseLabel = getLicenseLabel(asset.license);

  return (
    <div className="rounded-xl border border-violet-300 dark:border-violet-700/60 bg-violet-50/60 dark:bg-violet-950/30 overflow-hidden shadow-lg animate-[fade-in_0.15s_ease-out]">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        <img
          src={asset.thumbnailUrl || asset.url}
          alt={asset.alt || asset.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-[10px] font-medium text-white line-clamp-1">{asset.title}</p>
        </div>
      </div>

      {/* Alt Text Editor */}
      <div className="p-3 space-y-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
            Alt Text
          </label>
          <input
            autoFocus
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Describe this image for accessibility…"
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder:text-zinc-400"
          />
        </div>

        {/* Attribution info for stock images */}
        {isStock && (asset.author || asset.license) && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 p-2 space-y-1">
            <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Attribution</p>
            {asset.author && (
              <div className="flex items-center gap-1 text-[11px] text-amber-800 dark:text-amber-300">
                <User className="w-3 h-3 shrink-0" />
                <span>{asset.author}</span>
              </div>
            )}
            {licenseLabel && (
              <div className="flex items-center gap-1 text-[11px] text-amber-800 dark:text-amber-300">
                <Scale className="w-3 h-3 shrink-0" />
                <span>{licenseLabel}</span>
                {asset.attributionUrl && (
                  <a
                    href={asset.attributionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-[10px] text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View source <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onConfirm(altText)}
            disabled={importing}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-60"
          >
            {importing ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving to library…</>
            ) : (
              <><Check className="w-3.5 h-3.5" /> Insert Image</>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={importing}
            className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Drawer ─────────────────────────────────────────────────────────────

export function AssetPickerDrawer({
  context,
  onClose,
  onSelectAsset,
}: AssetPickerDrawerProps) {
  const [query, setQuery] = useState(context?.searchQuery || context?.heading || "");
  const [filter, setFilter] = useState<"all" | "ai_generated" | "asset_library" | "stock">("all");
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Confirmation card state
  const [pendingAsset, setPendingAsset] = useState<ImageSearchResult | null>(null);
  const [importing, setImporting] = useState(false);

  // Sync query when context changes
  useEffect(() => {
    const initialQuery = context?.searchQuery || context?.heading || "";
    setQuery(initialQuery);
    if (initialQuery.trim()) {
      doSearch(initialQuery.trim(), 1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  const doSearch = useCallback(async (searchQuery: string, pageNum: number, append: boolean) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    append ? setLoadingMore(true) : setLoading(true);
    setSearchError(null);

    try {
      const limit = 12;
      const items = await aiVisualApi.searchImages(searchQuery, limit, pageNum);
      setResults((prev) => append ? [...prev, ...items] : items);
      setPage(pageNum);
      setHasMore(items.length === limit);
    } catch (err) {
      console.error("[AssetPickerDrawer] Error loading images:", err);
      setSearchError("Search failed. Check your connection and try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingAsset(null);
    doSearch(query, 1, false);
  };

  const handleLoadMore = () => {
    doSearch(query, page + 1, true);
  };

  const filteredResults = results.filter((item) => {
    if (filter === "all") return true;
    if (filter === "ai_generated") return item.source === "ai_generated";
    if (filter === "asset_library") return item.source === "asset_library" || item.source === "upload";
    if (filter === "stock") return item.source === "stock";
    return true;
  });

  // User clicks a result — show confirmation card
  const handleItemClick = (item: ImageSearchResult) => {
    setPendingAsset(item);
  };

  // User cancels confirmation
  const handleCancelConfirm = () => {
    setPendingAsset(null);
  };

  // User confirms insertion
  const handleConfirmInsert = async (altText: string) => {
    if (!pendingAsset) return;
    const asset = pendingAsset;

    if (asset.source === "stock") {
      // Import stock image → Cloudinary → Asset Library
      setImporting(true);
      try {
        const importedAsset = await aiVisualApi.importStockImage(asset, altText);
        onSelectAsset(asset, altText, importedAsset);
        setPendingAsset(null);
        if (importedAsset.isExisting) {
          toast.info("Reused existing asset from your library.");
        } else {
          toast.success("Image saved to Asset Library and inserted!");
        }
      } catch (err: any) {
        console.error("[AssetPickerDrawer] Import failed:", err);
        // Graceful degradation — still insert using original URL
        toast.warning("Could not save to library — image inserted directly.");
        onSelectAsset(asset, altText, undefined);
        setPendingAsset(null);
      } finally {
        setImporting(false);
      }
    } else {
      // Library / AI-generated: insert directly, no import needed
      onSelectAsset(asset, altText, undefined);
      setPendingAsset(null);
    }
  };

  const filterCounts = {
    all:           results.length,
    ai_generated:  results.filter((r) => r.source === "ai_generated").length,
    asset_library: results.filter((r) => r.source === "asset_library" || r.source === "upload").length,
    stock:         results.filter((r) => r.source === "stock").length,
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-editor-bg)] text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-editor-border)] flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Library className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
            <h3 className="text-sm font-semibold truncate">Select Visual Asset</h3>
          </div>
          {context?.heading && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              For: <span className="font-medium text-zinc-700 dark:text-zinc-300">{context.heading}</span>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input Box */}
      <div className="p-4 pb-2 space-y-2.5">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search media library & stock..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 text-zinc-900 dark:text-zinc-100 transition-all placeholder:text-zinc-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setPendingAsset(null);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Suggested Query Chip */}
        {context?.searchQuery && context.searchQuery !== query && (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Suggested:</span>
            <button
              type="button"
              onClick={() => {
                setQuery(context.searchQuery!);
                setPendingAsset(null);
                doSearch(context.searchQuery!, 1, false);
              }}
              className="font-mono px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors truncate max-w-[200px]"
            >
              {context.searchQuery}
            </button>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex items-center gap-1 pt-1 flex-wrap">
          {(["all", "ai_generated", "asset_library", "stock"] as const).map((f) => {
            const labels: Record<typeof f, string> = {
              all:           `All (${filterCounts.all})`,
              ai_generated:  "AI Generated",
              asset_library: "Library",
              stock:         "Stock",
            };
            const isActive = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  isActive
                    ? f === "ai_generated"
                      ? "bg-violet-600 text-white shadow-xs"
                      : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {f === "ai_generated" && <Sparkles className="w-3 h-3" />}
                {labels[f]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Container */}
      <div className="flex-1 overflow-y-auto p-4 pt-2">
        {/* Confirmation card — shown inline above results when a result is clicked */}
        {pendingAsset && (
          <div className="mb-3">
            <ConfirmCard
              asset={pendingAsset}
              defaultAlt={pendingAsset.alt || context?.alt || pendingAsset.title || ""}
              onConfirm={handleConfirmInsert}
              onCancel={handleCancelConfirm}
              importing={importing}
            />
          </div>
        )}

        {/* Error state */}
        {searchError && !loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{searchError}</p>
            <button
              type="button"
              onClick={() => doSearch(query, 1, false)}
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium"
            >
              Retry search
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && !searchError && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
            <span className="text-xs">Searching visual assets...</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && !searchError && filteredResults.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 mx-auto flex items-center justify-center text-zinc-400 mb-3">
              <ImageIcon className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              No matching assets found
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Try broader keywords or browse stock categories.
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !searchError && filteredResults.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {filteredResults.map((item) => {
              const isPending = pendingAsset?.id === item.id;
              const licenseLabel = getLicenseLabel(item.license);

              return (
                <div
                  key={item.id}
                  onClick={() => !importing && handleItemClick(item)}
                  className={`group relative overflow-hidden rounded-xl border bg-zinc-50 dark:bg-zinc-900 cursor-pointer transition-all duration-150 hover:shadow-md ${
                    isPending
                      ? "border-violet-500 ring-2 ring-violet-500/40"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-violet-500 dark:hover:border-violet-500/80"
                  } ${importing ? "pointer-events-none opacity-50" : ""}`}
                >
                  {/* Image Preview */}
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.alt || item.title}
                      className="h-full w-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-200"
                      loading="lazy"
                    />

                    {/* Source Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium backdrop-blur-md border uppercase tracking-wider ${
                        item.source === "ai_generated"
                          ? "bg-violet-950/80 text-violet-200 border-violet-500/40"
                          : "bg-black/60 text-white border-white/10"
                      }`}>
                        {item.source === "ai_generated" ? "AI" : item.source === "asset_library" || item.source === "upload" ? "Library" : "Stock"}
                      </span>
                      {item.license && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium backdrop-blur-md bg-amber-900/60 text-amber-200 border border-amber-600/30 uppercase tracking-wider">
                          {item.license}
                        </span>
                      )}
                    </div>

                    {/* Hover overlay */}
                    {!isPending && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-zinc-900 shadow-lg scale-95 group-hover:scale-100 transition-transform">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Select Image
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="p-2.5">
                    <h4 className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate" title={item.title}>
                      {item.title}
                    </h4>
                    {item.author ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <User className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{item.author}</p>
                        {item.attributionUrl && (
                          <a
                            href={item.attributionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="ml-auto shrink-0"
                            title={licenseLabel || "View source"}
                          >
                            <ExternalLink className="w-2.5 h-2.5 text-zinc-400 hover:text-violet-500 transition-colors" />
                          </a>
                        )}
                      </div>
                    ) : item.prompt ? (
                      <p className="text-[11px] text-violet-600 dark:text-violet-400 line-clamp-1 mt-0.5">
                        Prompt: {item.prompt}
                      </p>
                    ) : item.alt ? (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                        {item.alt}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && !searchError && filteredResults.length > 0 && !pendingAsset && (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-violet-400 transition-colors disabled:opacity-60"
          >
            {loadingMore ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading more…</>
            ) : (
              <><ChevronDown className="w-3.5 h-3.5" /> Load more</>
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--color-editor-border)] bg-zinc-50/50 dark:bg-zinc-900/30">
        <p className="text-[11px] text-zinc-400 text-center">
          Stock images are saved to your Asset Library before insertion.
        </p>
      </div>
    </div>
  );
}
