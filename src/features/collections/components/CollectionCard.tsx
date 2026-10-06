"use client";

// =============================================================================
//  COLLECTION CARD
//  src/features/collections/components/CollectionCard.tsx
//
//  Design Decisions:
//  - Pinterest / Apple aesthetic for thematic technical collections.
//  - Dynamic thumbnail collage previewing up to 3 articles in the collection.
//  - Displays article count, visibility indicator, and title.
// =============================================================================

import React from "react";
import Link from "next/link";
import { Folder, Globe, Lock, Link2, Layers } from "lucide-react";
import type { CollectionData } from "../types/collection.types";

interface CollectionCardProps {
  collection: CollectionData;
  onDelete?: (id: string) => void;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  const { title, slug, _id, visibility, articleCount = 0, previewImages = [] } = collection;

  const validImages = previewImages.filter(Boolean) as string[];

  return (
    <Link
      href={`/collection/${slug || _id}`}
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-lg hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-300 overflow-hidden"
    >
      {/* ── Preview Collage / Cover Area ── */}
      <div className="relative aspect-16/10 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        {validImages.length >= 3 ? (
          /* 3-Image Mosaic Layout */
          <div className="grid grid-cols-2 gap-1 w-full h-full p-1">
            <div className="relative w-full h-full rounded-l-xl overflow-hidden bg-zinc-200 dark:bg-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={validImages[0]}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="grid grid-rows-2 gap-1 w-full h-full">
              <div className="relative w-full h-full rounded-tr-xl overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={validImages[1]}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative w-full h-full rounded-br-xl overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={validImages[2]}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        ) : validImages.length >= 1 ? (
          /* Single Image Cover */
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={validImages[0]}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          /* Placeholder Minimal Gradient */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-zinc-800 dark:to-zinc-850 text-indigo-500 dark:text-indigo-400">
            <Folder size={36} strokeWidth={1.5} className="opacity-80" />
          </div>
        )}

        {/* Visibility Badge Overlay */}
        <div className="absolute top-2.5 right-2.5 backdrop-blur-md bg-black/50 text-white text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
          {visibility === "PUBLIC" && <Globe size={11} />}
          {visibility === "PRIVATE" && <Lock size={11} />}
          {visibility === "UNLISTED" && <Link2 size={11} />}
          <span className="capitalize">{visibility.toLowerCase()}</span>
        </div>
      </div>

      {/* ── Collection Info ── */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
            {title}
          </h3>
          {collection.description ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
              {collection.description}
            </p>
          ) : (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 italic mt-1">
              No description added.
            </p>
          )}
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          <span className="flex items-center gap-1">
            <Layers size={13} />
            <span>
              {articleCount} {articleCount === 1 ? "article" : "articles"}
            </span>
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">
            View Collection &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
