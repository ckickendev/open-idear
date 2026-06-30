"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Loader2, ImageOff, Check } from "lucide-react";
import { useInfiniteAssets } from "../hooks/useInfiniteAssets";
import { useDebounce } from "../hooks/useDebounce";
import type { Asset } from "../api/asset.api";

interface AssetSearchProps {
  readonly onSelectAsset: (asset: Asset) => void;
  readonly selectedAsset: Asset | null;
  readonly limit?: number;
}

export function AssetSearch({
  onSelectAsset,
  selectedAsset,
  limit = 20,
}: AssetSearchProps) {
  const [q, setQ] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Shared debounce hook — replaces the inline setTimeout pattern
  const debouncedQ = useDebounce(q, 350);

  const { assets, isLoading, hasMore, error, loadMore } = useInfiniteAssets({
    q: debouncedQ,
    limit,
    sort: "-createdAt",
  });

  // Infinite Scroll IntersectionObserver triggers
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  return (
    <div className="w-full flex flex-col gap-4 min-h-0 h-full">
      {/* Search Input Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by filename, tags, description, or alt..."
          className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg">
          {error}
        </p>
      )}

      {/* Grid Browser with Infinite Scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto border border-border rounded-xl bg-accent/5">
        {assets.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-2">
            <ImageOff className="w-10 h-10 text-muted-foreground/45" />
            <p className="text-sm font-semibold">No matches found</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Try search keywords related to description texts, alternative descriptions, or image tags.
            </p>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset._id}
                  onClick={() => onSelectAsset(asset)}
                  className={`group relative aspect-square rounded-lg border bg-background overflow-hidden cursor-pointer transition-all ${
                    selectedAsset?._id === asset._id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-foreground/30 hover:shadow-md"
                  }`}
                >
                  <img
                    src={asset.thumbnailUrl || asset.url}
                    alt={asset.alt || ""}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Selected Tick Overlay */}
                  {selectedAsset?._id === asset._id && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground p-1 rounded-full shadow-md">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  {/* Title & tags overlay info */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-semibold truncate">{asset.originalName}</p>
                    {asset.tags.length > 0 && (
                      <p className="text-[8px] opacity-80 mt-0.5 truncate">
                        {asset.tags.slice(0, 2).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="h-6 flex items-center justify-center">
              {isLoading && (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
