"use client";

import React from "react";
import type { Asset } from "../api/asset.api";

interface RecentUploadsProps {
  readonly recentAssets: readonly Asset[];
  readonly selectedAsset: Asset | null;
  readonly onSelect: (asset: Asset) => void;
}

export function RecentUploads({
  recentAssets,
  selectedAsset,
  onSelect,
}: RecentUploadsProps) {
  if (recentAssets.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 flex-shrink-0 animate-[fade-in_0.15s_ease-out]">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Recent Uploads
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {recentAssets.map((asset) => (
          <button
            key={asset._id}
            type="button"
            onClick={() => onSelect(asset)}
            className={`relative w-20 h-20 rounded-lg border flex-shrink-0 overflow-hidden cursor-pointer transition-all ${
              selectedAsset?._id === asset._id
                ? "border-primary ring-2 ring-primary/20 scale-95"
                : "border-border hover:border-foreground/30"
            }`}
          >
            <img
              src={asset.thumbnailUrl || asset.url}
              alt={asset.alt || ""}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
