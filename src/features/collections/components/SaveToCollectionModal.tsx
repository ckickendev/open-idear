"use client";

// =============================================================================
//  SAVE TO COLLECTION MODAL
//  src/features/collections/components/SaveToCollectionModal.tsx
//
//  Design Decisions:
//  - Modern Apple/Notion aesthetic: clean modal with crisp typography and subtle blur.
//  - Instant optimistic checkbox toggling (zero waiting spinner on individual clicks).
//  - Inline collection creation with title & visibility picker (PUBLIC, PRIVATE, UNLISTED).
//  - Toast feedback upon save/removal.
// =============================================================================

import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  Plus,
  Check,
  FolderPlus,
  Globe,
  Lock,
  Link2,
  Loader2,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";
import { collectionApi } from "../api/collection.api";
import type {
  CheckCollectionItem,
  CollectionVisibility,
} from "../types/collection.types";

interface SaveToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  articleTitle?: string;
  onSaveStateChange?: (isSavedInAny: boolean) => void;
}

export default function SaveToCollectionModal({
  isOpen,
  onClose,
  articleId,
  articleTitle,
  onSaveStateChange,
}: SaveToCollectionModalProps) {
  const [collections, setCollections] = useState<CheckCollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateInline, setShowCreateInline] = useState(false);

  // Inline creation form state
  const [newTitle, setNewTitle] = useState("");
  const [newVisibility, setNewVisibility] = useState<CollectionVisibility>("PUBLIC");
  const [isCreating, setIsCreating] = useState(false);

  const fetchCollections = useCallback(async () => {
    if (!articleId) return;
    setLoading(true);
    try {
      const data = await collectionApi.checkArticleCollections(articleId);
      setCollections(data);
      const isSavedInAny = data.some((c) => c.isSaved);
      onSaveStateChange?.(isSavedInAny);
    } catch (err) {
      console.error("Failed to load collections:", err);
    } finally {
      setLoading(false);
    }
  }, [articleId, onSaveStateChange]);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
      setShowCreateInline(false);
      setNewTitle("");
    }
  }, [isOpen, fetchCollections]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Toggle collection checkbox
  const handleToggle = async (collection: CheckCollectionItem) => {
    const nextSaved = !collection.isSaved;

    // Optimistic update
    setCollections((prev) =>
      prev.map((c) => (c._id === collection._id ? { ...c, isSaved: nextSaved } : c))
    );

    try {
      const success = await collectionApi.toggleArticleSave({
        collectionId: collection._id,
        articleId,
        save: nextSaved,
      });

      if (success) {
        toast.success(
          nextSaved
            ? `Saved to "${collection.title}"`
            : `Removed from "${collection.title}"`
        );
        const updatedSavedInAny = collections.some((c) =>
          c._id === collection._id ? nextSaved : c.isSaved
        );
        onSaveStateChange?.(updatedSavedInAny);
      } else {
        throw new Error();
      }
    } catch {
      // Revert on error
      setCollections((prev) =>
        prev.map((c) => (c._id === collection._id ? { ...c, isSaved: !nextSaved } : c))
      );
      toast.error("Failed to update collection.");
    }
  };

  // Create collection inline & immediately save article
  const handleCreateAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    setIsCreating(true);
    try {
      const newCol = await collectionApi.createCollection({
        title,
        visibility: newVisibility,
      });

      if (newCol) {
        // Immediately save article to this new collection
        await collectionApi.toggleArticleSave({
          collectionId: newCol._id,
          articleId,
          save: true,
        });

        toast.success(`Created and saved to "${title}"`);
        setNewTitle("");
        setShowCreateInline(false);
        onSaveStateChange?.(true);
        // Refresh list
        await fetchCollections();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to create collection.");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl shadow-zinc-950/20 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-save-title"
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Bookmark size={18} />
            </div>
            <div>
              <h3
                id="modal-save-title"
                className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Save to Collection
              </h3>
              {articleTitle && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[240px]">
                  {articleTitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Modal Content / Collections Checklist ── */}
        <div className="px-5 py-4 max-h-[300px] overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-zinc-400 text-sm gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span>Loading collections...</span>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-6 text-zinc-500 dark:text-zinc-400 text-sm">
              <FolderPlus size={32} className="mx-auto mb-2 opacity-40" />
              <p className="font-medium">No collections created yet</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Create your first collection below to start curating.
              </p>
            </div>
          ) : (
            collections.map((col) => (
              <label
                key={col._id}
                onClick={() => handleToggle(col)}
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-all duration-150 select-none group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {/* Custom Checkbox */}
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      col.isSaved
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                        : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 group-hover:border-zinc-400"
                    }`}
                  >
                    {col.isSaved && <Check size={13} strokeWidth={2.5} />}
                  </div>

                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {col.title}
                  </span>
                </div>

                {/* Visibility Badge */}
                <div className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium shrink-0">
                  {col.visibility === "PUBLIC" && <Globe size={12} />}
                  {col.visibility === "PRIVATE" && <Lock size={12} />}
                  {col.visibility === "UNLISTED" && <Link2 size={12} />}
                  <span>{col.visibility.toLowerCase()}</span>
                </div>
              </label>
            ))
          )}
        </div>

        {/* ── Modal Footer / Inline Create Section ── */}
        <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800">
          {!showCreateInline ? (
            <button
              type="button"
              onClick={() => setShowCreateInline(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-900/50 transition-colors"
            >
              <Plus size={15} />
              <span>Create New Collection</span>
            </button>
          ) : (
            <form onSubmit={handleCreateAndSave} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  New Collection
                </span>
                <button
                  type="button"
                  onClick={() => setShowCreateInline(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  Cancel
                </button>
              </div>

              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Backend Interview, System Design..."
                autoFocus
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />

              {/* Visibility Segmented Buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-200/60 dark:bg-zinc-800 rounded-lg text-xs font-medium">
                {(["PUBLIC", "PRIVATE", "UNLISTED"] as CollectionVisibility[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setNewVisibility(v)}
                    className={`flex-1 py-1 px-2 rounded-md text-[11px] capitalize transition-all ${
                      newVisibility === v
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold"
                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                    }`}
                  >
                    {v.toLowerCase()}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={!newTitle.trim() || isCreating}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isCreating ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create & Save</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
