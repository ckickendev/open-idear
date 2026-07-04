"use client";

import React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Asset } from "../api/asset.api";

interface AssetDetailsSidebarProps {
  readonly asset: Asset;
  readonly isDeleting: boolean;
  readonly onDelete: (id: string) => void;
  readonly onConfirmSelect: () => void;
}

export function AssetDetailsSidebar({
  asset,
  isDeleting,
  onDelete,
  onConfirmSelect,
}: AssetDetailsSidebarProps) {
  return (
    <div className="w-80 border-l border-border bg-accent/5 flex flex-col flex-shrink-0 animate-[slide-left_0.2s_ease-out]">
      <ScrollArea className="flex-1">
        <div className="p-6 flex flex-col gap-6">
          {/* Aspect Preview */}
          <div className="aspect-video w-full rounded-lg border border-border overflow-hidden bg-background shadow-inner">
            <img
              src={asset.url}
              alt={asset.alt || ""}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Metadata Fields */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Asset Details
            </h4>
            
            <div className="grid grid-cols-3 gap-y-2 text-xs border-b border-border/50 pb-3">
              <span className="text-muted-foreground">Name:</span>
              <span className="col-span-2 text-foreground font-medium truncate" title={asset.originalName}>
                {asset.originalName}
              </span>

              <span className="text-muted-foreground">Size:</span>
              <span className="col-span-2 text-foreground font-medium">
                {(asset.size / 1024).toFixed(1)} KB
              </span>

              <span className="text-muted-foreground">Ratio:</span>
              <span className="col-span-2 text-foreground font-medium">
                {asset.width} × {asset.height} px
              </span>

              <span className="text-muted-foreground">Type:</span>
              <span className="col-span-2 text-foreground font-medium uppercase text-[10px] tracking-wider mt-0.5">
                {asset.mimeType.split("/")[1]}
              </span>
            </div>
          </div>

          {/* Metadata fields descriptors */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Alternative Text (Alt)
              </label>
              <input
                type="text"
                readOnly
                value={asset.alt || "No alt text provided"}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-input bg-background/50 text-muted-foreground focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Description
              </label>
              <textarea
                rows={3}
                readOnly
                value={asset.description || "No description provided"}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-input bg-background/50 text-muted-foreground focus:outline-none resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Keywords / Tags
              </label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {asset.tags.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">No tags added</span>
                ) : (
                  asset.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] bg-accent border border-border text-foreground px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Sidebar Action Footer */}
      <div className="p-6 border-t border-border flex flex-col gap-2 flex-shrink-0 bg-background">
        <button
          type="button"
          onClick={onConfirmSelect}
          className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/95 shadow cursor-pointer transition-all"
        >
          Select Image
        </button>
        <button
          type="button"
          onClick={() => onDelete(asset._id)}
          disabled={isDeleting}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg border border-destructive/20 text-destructive text-sm font-semibold hover:bg-destructive/5 disabled:opacity-50 cursor-pointer transition-all"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Delete Asset
        </button>
      </div>
    </div>
  );
}
