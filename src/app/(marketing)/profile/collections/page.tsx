"use client";

// =============================================================================
//  PROFILE COLLECTIONS PAGE
//  src/app/(marketing)/profile/collections/page.tsx
//
//  Design Decisions:
//  - Displays user's knowledge collections in a Pinterest-inspired grid.
//  - Header with creation action.
//  - Clean empty state with quick creation triggers.
// =============================================================================

import React, { useEffect, useState } from "react";
import { Plus, Layers, Loader2 } from "lucide-react";
import authenticationStore from "@/store/AuthenticationStore";
import {
  collectionApi,
  CollectionCard,
  CreateCollectionModal,
  type CollectionData,
} from "@/features/collections";

export default function ProfileCollectionsPage() {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const currentUser = authenticationStore((state) => state.currentUser);

  useEffect(() => {
    if (!currentUser?._id) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    collectionApi
      .getMyCollections()
      .then((data) => {
        if (isMounted) {
          setCollections(data);
        }
      })
      .catch((err) => {
        console.error("Error loading collections:", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser?._id]);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Layers size={24} className="text-indigo-600 dark:text-indigo-400" />
            <span>Knowledge Collections</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Curate, organize, and share technical articles, guides, and architectures.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>New Collection</span>
        </button>
      </div>

      {/* ── Collections Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-16/10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse border border-zinc-200/50 dark:border-zinc-700/50"
            />
          ))}
        </div>
      ) : collections.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-4">
            <Layers size={36} strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            No Collections Yet
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-6">
            Group your favorite technical deep dives into thematic binders like &ldquo;Backend Interview&rdquo;, &ldquo;AI Engineering&rdquo;, or &ldquo;System Design&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Your First Collection</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {collections.map((col) => (
            <CollectionCard key={col._id} collection={col} />
          ))}
        </div>
      )}

      {/* ── Create Modal ── */}
      <CreateCollectionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(newCol) => {
          setCollections((prev) => [newCol, ...prev]);
        }}
      />
    </div>
  );
}
