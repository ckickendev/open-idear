"use client";

// =============================================================================
//  CREATE COLLECTION MODAL
//  src/features/collections/components/CreateCollectionModal.tsx
//
//  Design Decisions:
//  - Dedicated creation dialog for Profile Collections page.
//  - Title, description, and visibility radio selector with Apple-like cards.
// =============================================================================

import React, { useState } from "react";
import { X, Globe, Lock, Link2, Loader2, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { collectionApi } from "../api/collection.api";
import type { CollectionData, CollectionVisibility } from "../types/collection.types";

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCollection: CollectionData) => void;
}

export default function CreateCollectionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCollectionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CollectionVisibility>("PUBLIC");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    setIsSubmitting(true);
    try {
      const created = await collectionApi.createCollection({
        title: cleanTitle,
        description: description.trim(),
        visibility,
      });

      if (created) {
        toast.success(`Created collection "${cleanTitle}"`);
        onSuccess(created);
        onClose();
        setTitle("");
        setDescription("");
      } else {
        throw new Error();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to create collection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <FolderPlus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                New Knowledge Collection
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Organize technical articles, guides, and architectures.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Backend Interview, AI Engineering, System Design..."
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this collection about? (e.g. Curated papers, deep dives, and patterns)"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Visibility
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: "PUBLIC" as CollectionVisibility,
                  label: "Public",
                  desc: "Visible to everyone",
                  icon: <Globe size={16} />,
                },
                {
                  id: "PRIVATE" as CollectionVisibility,
                  label: "Private",
                  desc: "Only you can see",
                  icon: <Lock size={16} />,
                },
                {
                  id: "UNLISTED" as CollectionVisibility,
                  label: "Unlisted",
                  desc: "Anyone with link",
                  icon: <Link2 size={16} />,
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setVisibility(opt.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    visibility === opt.id
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-xs"
                      : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <div
                    className={
                      visibility === opt.id
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-zinc-400"
                    }
                  >
                    {opt.icon}
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Collection</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
