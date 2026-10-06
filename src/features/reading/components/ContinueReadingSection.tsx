"use client";

// =============================================================================
//  CONTINUE READING SECTION
//  src/features/reading/components/ContinueReadingSection.tsx
//
//  Design Decisions:
//  - Displays a dedicated "Continue Reading" shelf on the Home Page.
//  - Shows thumbnail, title, category, progress bar, and remaining minutes.
//  - Seamlessly integrates with OpenIdear's design system.
//  - Gracefully hides when user is unauthenticated or has no in-progress articles.
// =============================================================================

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import authenticationStore from "@/store/AuthenticationStore";
import { readingApi } from "../api/reading.api";
import type { ContinueReadingItem } from "../types/reading.types";

export default function ContinueReadingSection() {
  const [items, setItems] = useState<ContinueReadingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = authenticationStore((state) => state.currentUser);

  useEffect(() => {
    if (!currentUser?._id) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    readingApi
      .getContinueReading(4)
      .then((data) => {
        if (isMounted) {
          setItems(data);
        }
      })
      .catch((err) => {
        console.error("Error loading continue reading:", err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser?._id]);

  if (!currentUser?._id || (!isLoading && items.length === 0)) {
    return null;
  }

  return (
    <section aria-labelledby="continue-reading-heading" className="w-full">
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <BookOpen size={18} />
          </div>
          <div>
            <h2
              id="continue-reading-heading"
              className="text-lg font-bold text-zinc-900 dark:text-white"
            >
              Continue Reading
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Pick up right where you left off
            </p>
          </div>
        </div>
      </div>

      {/* ── Cards Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 animate-pulse border border-zinc-200/50 dark:border-zinc-800"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/post/${item.slug}`}
              className="group relative flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-indigo-500/50 dark:hover:border-indigo-500/40 transition-all duration-200 overflow-hidden"
            >
              <div className="flex gap-4 items-start">
                {/* Thumbnail */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50">
                  {item.thumbnail ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                      <BookOpen size={24} />
                    </div>
                  )}
                </div>

                {/* Article Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    {item.category && (
                      <span className="inline-block text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                        {item.category.name}
                      </span>
                    )}
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  {/* Reading Time Meta */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                    <Clock size={12} />
                    <span>{item.remainingMinutes} min remaining</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-zinc-600 dark:text-zinc-400">
                    {item.progress}% completed
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Resume</span>
                    <ArrowRight size={11} />
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
