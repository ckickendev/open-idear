"use client";

import React from "react";
import { ImageOff, Check, Trash2, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Asset } from "../api/asset.api";

interface AssetGridProps {
  readonly assets: readonly Asset[];
  readonly selectedAsset: Asset | null;
  readonly isLoading: boolean;
  readonly onSelectAsset: (asset: Asset) => void;
  readonly onDoubleClickAsset: (asset: Asset) => void;
  readonly onDeleteAsset?: (id: string) => void;
}

export function AssetGrid({
  assets,
  selectedAsset,
  isLoading,
  onSelectAsset,
  onDoubleClickAsset,
  onDeleteAsset,
}: AssetGridProps) {
  // ─── Loading Skeletons ───────────────────────────────────────────
  if (isLoading && assets.length === 0) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 15 }).map((_, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg border border-border overflow-hidden">
              <Skeleton className="w-full h-full bg-muted/65 animate-pulse" />
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }

  // ─── Empty state ─────────────────────────────────────────────────
  if (assets.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-3">
        <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 text-muted-foreground/50">
          <ImageOff className="w-8 h-8" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">No assets found</p>
          <p className="text-xs text-muted-foreground max-w-xs mt-1">
            Upload your first image asset, or try a different search filter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {assets.map((asset) => {
          const isSelected = selectedAsset?._id === asset._id;
          
          return (
            <div
              key={asset._id}
              onClick={() => onSelectAsset(asset)}
              onDoubleClick={() => onDoubleClickAsset(asset)}
              className={`group relative aspect-square rounded-lg border bg-background overflow-hidden cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20 scale-[0.98]"
                  : "border-border hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-md"
              }`}
            >
              {/* Image Thumbnail */}
              <img
                src={asset.thumbnailUrl || asset.url}
                alt={asset.alt || ""}
                className="w-full h-full object-cover select-none"
                loading="lazy"
              />

              {/* Selected Checkmark Overlay */}
              {isSelected && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none">
                  <div className="bg-primary text-primary-foreground p-1 rounded-full shadow-md">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Quick Delete Trash Button (shown on card hover) */}
              {onDeleteAsset && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAsset(asset._id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-background/85 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground border border-border shadow opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
                  title="Delete image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Resolution metrics info banner (shown on card hover) */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-2 text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200">
                <p className="text-[10px] font-semibold truncate leading-normal">{asset.originalName}</p>
                <p className="text-[9px] opacity-75 mt-0.5 leading-none">
                  {asset.width}×{asset.height} px
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
export type AssetGridType = typeof AssetGrid;
