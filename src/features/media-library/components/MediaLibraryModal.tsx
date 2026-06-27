"use client";

import React, { useCallback, useState } from "react";
import { X, Images } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";

import { MediaGrid } from "./MediaGrid";
import { MediaSidebar } from "./MediaSidebar";
import { MediaSearchBar } from "./MediaSearchBar";
import { MediaDetailPanel } from "./MediaDetailPanel";
import { MediaUploadZone } from "./MediaUploadZone";
import { MediaToolbar } from "./MediaToolbar";
import { useMediaLibrary } from "../hooks/useMediaLibrary";
import { mediaLibraryApi } from "../api/mediaLibrary.api";
import type {
  MediaAsset,
  MediaLibraryModalProps,
} from "../types/mediaLibrary.types";

// ═══════════════════════════════════════════════════════════════════
//  MediaLibraryModal — root container for the Media Library feature
//
//  Layout:
//  ┌─────────┬──────────────────────────┬──────────────┐
//  │         │  Search + Sort + Upload  │              │
//  │ Sidebar │──────────────────────────│ Detail Panel │
//  │         │       Media Grid         │  (optional)  │
//  │         │                          │              │
//  │         │──────────────────────────│              │
//  │         │  Bulk Toolbar            │              │
//  └─────────┴──────────────────────────┴──────────────┘
// ═══════════════════════════════════════════════════════════════════

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  allowDrag = false,
  typeFilter,
  multiSelect = false,
}: MediaLibraryModalProps) {
  const {
    media,
    folders,
    selectedIds,
    detailMedia,
    viewMode,
    sortBy,
    activeFilter,
    currentFolder,
    searchQuery,
    pagination,
    isLoading,
    setViewMode,
    setSortBy,
    setActiveFilter,
    setCurrentFolder,
    setSearchQuery,
    toggleSelect,
    selectAll,
    clearSelection,
    setDetailMedia,
    updateMediaItem,
    removeMediaItem,
    loadMore,
    toggleFavorite,
    deleteMedia,
    bulkDelete,
    bulkFavorite,
    fetchFolders,
  } = useMediaLibrary();

  const [showUploadZone, setShowUploadZone] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // ─── Handle item selection ────────────────────────────────────

  const handleSelect = useCallback(
    (item: MediaAsset) => {
      if (multiSelect) {
        toggleSelect(item._id);
      } else {
        // In single-select mode, show detail panel
        setDetailMedia(item);
      }
    },
    [multiSelect, toggleSelect, setDetailMedia]
  );

  // ─── Handle double-click → insert immediately ────────────────

  const handleDoubleClick = useCallback(
    (item: MediaAsset) => {
      onSelect(item);
      onClose();
    },
    [onSelect, onClose]
  );

  // ─── Handle context menu ──────────────────────────────────────

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, item: MediaAsset) => {
      e.preventDefault();
      setDetailMedia(item);
    },
    [setDetailMedia]
  );

  // ─── Handle insert from detail panel ──────────────────────────

  const handleInsert = useCallback(
    (item: MediaAsset) => {
      onSelect(item);
      onClose();
    },
    [onSelect, onClose]
  );

  // ─── Handle delete ────────────────────────────────────────────

  const handleDelete = useCallback(
    async (mediaId: string) => {
      await deleteMedia(mediaId);
      setDetailMedia(null);
      toast.success("Image deleted");
    },
    [deleteMedia, setDetailMedia]
  );

  // ─── Handle create folder ────────────────────────────────────

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(false);

    const result = await mediaLibraryApi.createFolder({
      name: newFolderName.trim(),
      parent: currentFolder,
    });

    if (result.success) {
      fetchFolders();
      setNewFolderName("");
      toast.success("Folder created");
    } else {
      toast.error(result.message || "Failed to create folder");
    }
  }, [newFolderName, currentFolder, fetchFolders]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="
          max-w-6xl w-[95vw] h-[85vh] p-0
          flex flex-col overflow-hidden
          gap-0
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Images size={18} className="text-primary" />
            Media Library
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <TooltipProvider>
          <div className="flex flex-1 min-h-0">
            {/* Left sidebar — hidden on mobile */}
            <div className="hidden md:block">
              <MediaSidebar
                folders={folders}
                activeFilter={activeFilter}
                currentFolder={currentFolder}
                onFilterChange={setActiveFilter}
                onFolderChange={setCurrentFolder}
                onCreateFolder={() => setIsCreatingFolder(true)}
              />
            </div>

            {/* Center content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Search + controls */}
              <MediaSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />

              {/* Upload zone (collapsible) */}
              {showUploadZone && (
                <div className="px-4 pt-3">
                  <MediaUploadZone
                    onUploaded={(asset) => {
                      setShowUploadZone(false);
                    }}
                  />
                </div>
              )}

              {/* New folder inline input */}
              {isCreatingFolder && (
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name…"
                    className="h-8 text-sm max-w-xs"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateFolder();
                      if (e.key === "Escape") {
                        setIsCreatingFolder(false);
                        setNewFolderName("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateFolder}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingFolder(false);
                      setNewFolderName("");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Media grid */}
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <MediaGrid
                    media={media}
                    selectedIds={selectedIds}
                    viewMode={viewMode}
                    isLoading={isLoading}
                    hasMore={pagination?.hasMore ?? false}
                    onSelect={handleSelect}
                    onDoubleClick={handleDoubleClick}
                    onContextMenu={handleContextMenu}
                    onLoadMore={loadMore}
                    allowDrag={allowDrag}
                  />
                </div>
              </ScrollArea>

              {/* Bulk action toolbar */}
              <MediaToolbar
                selectedCount={selectedIds.size}
                onClearSelection={clearSelection}
                onBulkDelete={() => {
                  bulkDelete();
                  toast.success("Images deleted");
                }}
                onBulkFavorite={() => bulkFavorite(true)}
                onSelectAll={selectAll}
              />
            </div>

            {/* Right detail panel */}
            {detailMedia && (
              <MediaDetailPanel
                media={detailMedia}
                onClose={() => setDetailMedia(null)}
                onInsert={handleInsert}
                onUpdate={(id, updates) => updateMediaItem(id, updates)}
                onDelete={handleDelete}
              />
            )}
          </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}
