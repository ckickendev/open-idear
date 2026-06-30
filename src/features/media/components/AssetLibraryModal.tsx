"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, Search, Upload, Loader2, Image as ImageIcon, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAssets, useUploadAsset, useDeleteAsset } from "../hooks/useAssetHooks";
import { useDebounce } from "../hooks/useDebounce";
import type { Asset } from "../api/asset.api";

// Subcomponents import
import { RecentUploads } from "./RecentUploads";
import { AssetGrid } from "./AssetGrid";
import { AssetDetailsSidebar } from "./AssetDetailsSidebar";

interface AssetLibraryModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSelect: (asset: Asset) => void;
}

export function AssetLibraryModal({
  isOpen,
  onClose,
  onSelect,
}: AssetLibraryModalProps) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shared debounce hook — eliminates the inline setTimeout pattern
  const debouncedQ = useDebounce(q, 300);

  // Reset to page 1 whenever the search query changes
  useEffect(() => { setPage(1); }, [debouncedQ]);

  // useAssets auto-fetches when primitive params change (no extra refetch effect needed)
  const { assets, pagination, isLoading, error: browseError, refetch } = useAssets({
    q: debouncedQ,
    page,
    limit: 20,
    sort: "-createdAt",
  });

  const { uploadFile, isUploading, error: uploadError } = useUploadAsset();
  const { deleteAsset, isDeleting } = useDeleteAsset();

  const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
  useEffect(() => {
    if (assets.length > 0 && !debouncedQ) {
      setRecentAssets(assets.slice(0, 8));
    }
  }, [assets, debouncedQ]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const asset = await uploadFile(file);
      if (asset) {
        toast.success("Image uploaded successfully!");
        setSelectedAsset(asset);
        setRecentAssets((prev) => [asset, ...prev.slice(0, 7)]);
        refetch();
      } else {
        toast.error("Failed to upload image.");
      }
      e.target.value = "";
    }
  };

  const handleDelete = async (assetId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this image?");
    if (!confirmed) return;

    const success = await deleteAsset(assetId);
    if (success) {
      toast.success("Image deleted successfully.");
      setSelectedAsset(null);
      setRecentAssets((prev) => prev.filter((a) => a._id !== assetId));
      refetch();
    } else {
      toast.error("Failed to delete image.");
    }
  };

  const handleConfirmSelect = useCallback(() => {
    if (selectedAsset) {
      onSelect(selectedAsset);
      onClose();
    }
  }, [selectedAsset, onSelect, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-[95vw] h-[85vh] p-0 flex flex-col overflow-hidden bg-background border border-border rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <ImageIcon className="w-5 h-5 text-primary" />
            Asset Library
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout container split */}
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 flex flex-col min-w-0 p-6 gap-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 flex-shrink-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search assets by tag, alt, or filename..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/95 disabled:opacity-50 cursor-pointer transition-all shadow-sm"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload Image
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Recents Carousel */}
            <RecentUploads recentAssets={recentAssets} selectedAsset={selectedAsset} onSelect={setSelectedAsset} />

            {/* Photo Grid container */}
            <div className="flex-1 min-h-0 border border-border rounded-xl bg-accent/5">
              <AssetGrid
                assets={assets}
                selectedAsset={selectedAsset}
                isLoading={isLoading}
                onSelectAsset={setSelectedAsset}
                onDoubleClickAsset={onSelect}
              />
            </div>

            {/* Pagination footer */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4 flex-shrink-0">
                <span className="text-xs text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                    disabled={!pagination.hasMore}
                    className="p-1.5 rounded-lg border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Details Sidebar panel */}
          {selectedAsset && (
            <AssetDetailsSidebar
              asset={selectedAsset}
              isDeleting={isDeleting}
              onDelete={handleDelete}
              onConfirmSelect={handleConfirmSelect}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
