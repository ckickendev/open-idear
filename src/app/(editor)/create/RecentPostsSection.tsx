// =============================================================================
//  RECENT POSTS SECTION — QUICK ACCESS IN CREATE PAGE (OPTIMIZED & MINIMIZABLE)
//  src/app/(editor)/create/RecentPostsSection.tsx
//
//  Design Decisions:
//  - Starts in a sleek, minimized compact bar (~38px) by default so the editor
//    canvas is immediately visible without distraction.
//  - Allows 1-click resume directly from the minimized bar for the most recent post.
//  - When expanded, displays compact, sleek mini-cards rather than oversized cards.
//  - Persists expand/collapse preference in localStorage.
//  - Uses OpenIdear brand palette (Sky/Cyan/Blue) with glassmorphism.
// =============================================================================

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Plus,
  Layers,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { postApi } from "@/features/ideas/api/post.api";
import { useTranslation } from "@/app/hook/useTranslation";

export interface PostItem {
  _id: string;
  title?: string;
  description?: string;
  published?: boolean;
  updatedAt?: string;
  createdAt?: string;
  category?: string | { _id?: string; name?: string };
}

interface RecentPostsSectionProps {
  activePostId?: string | null;
  onSelectPost: (postId: string | null) => void;
  onOpenSidebar: () => void;
  locale?: "en" | "vi";
}

const STORAGE_KEY = "openidear_create_recent_posts_expanded";

export function RecentPostsSection({
  activePostId,
  onSelectPost,
  onOpenSidebar,
  locale,
}: RecentPostsSectionProps) {
  const { t, lang } = useTranslation();
  const activeLocale = (locale || lang || "en") as "en" | "vi";
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Default to minimized (false) to keep the editor clean and focused
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "true";
    } catch {
      return false;
    }
  });

  const fetchRecentPosts = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await postApi.getPostsByAuthor(activeLocale);
      if (res?.data?.posts) {
        const list: PostItem[] = [...res.data.posts];
        list.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        setPosts(list);
      }
    } catch (err) {
      console.warn("[RecentPostsSection] Could not load author posts:", err);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [activeLocale]);

  useEffect(() => {
    fetchRecentPosts();
  }, [fetchRecentPosts, activeLocale]);

  // If user opens a post, automatically collapse section to keep editor clean
  useEffect(() => {
    if (activePostId) {
      setIsExpanded(false);
    }
  }, [activePostId]);

  const toggleExpanded = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const recentPosts = useMemo(() => posts.slice(0, 6), [posts]);
  const latestPost = posts[0];
  const activePost = useMemo(
    () => posts.find((p) => p._id === activePostId),
    [posts, activePostId]
  );

  if (!hasLoaded && posts.length === 0) {
    return null;
  }

  if (hasLoaded && posts.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-xl border border-[var(--color-editor-border)] bg-[var(--color-editor-surface)]/80 backdrop-blur-md shadow-xs overflow-hidden transition-all duration-200">
      {/* ── Compact Header Bar ── */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[var(--color-editor-elevated)]/50 gap-2">
        {/* Left: Clock Icon + Title + Count + Quick Resume Pill */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          <div className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center shrink-0">
            <Clock size={13} />
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-xs font-bold text-[var(--color-editor-text)] whitespace-nowrap">
              {t("editor.recent_posts.title")}
            </h3>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-[var(--color-editor-elevated)] text-[var(--color-editor-secondary)] border border-[var(--color-editor-border)] shrink-0">
              {posts.length}
            </span>

            {/* Quick Resume Chip on minimized bar */}
            {!isExpanded && latestPost && !activePostId && (
              <button
                type="button"
                onClick={() => onSelectPost(latestPost._id)}
                className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--color-editor-surface)] hover:bg-sky-500/10 text-[11px] text-[var(--color-editor-secondary)] hover:text-sky-500 border border-[var(--color-editor-border)] hover:border-sky-500/30 transition-all max-w-[280px] truncate cursor-pointer group"
                title={`Resume: ${latestPost.title || t("editor.recent_posts.untitled")}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    latestPost.published ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span className="truncate">
                  {latestPost.title || t("editor.recent_posts.untitled")}
                </span>
                <ArrowRight size={10} className="shrink-0 text-sky-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Active post indicator */}
            {!isExpanded && activePost && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[var(--color-editor-muted)] truncate max-w-[220px]">
                • {t("editor.recent_posts.editing", { title: activePost.title || t("editor.recent_posts.untitled") })}
              </span>
            )}
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={fetchRecentPosts}
            disabled={isLoading}
            className="p-1 rounded-md text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-surface)] transition-colors cursor-pointer"
            title={t("editor.recent_posts.refresh")}
          >
            <RotateCw size={12} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={onOpenSidebar}
            className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer"
          >
            <Layers size={12} />
            <span>{t("editor.recent_posts.view_all_sidebar")}</span>
          </button>

          <button
            type="button"
            onClick={toggleExpanded}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-surface)] transition-colors cursor-pointer"
          >
            <span>{isExpanded ? t("editor.recent_posts.hide") : t("editor.recent_posts.show")}</span>
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* ── Compact Expanded Grid ── */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-3 border-t border-[var(--color-editor-border)] animate-in fade-in-50 duration-150">
          <div className="flex items-center justify-between text-[11px] text-[var(--color-editor-muted)]">
            <span>{t("editor.recent_posts.subtitle")}</span>
            <span>{t("editor.recent_posts.hint")}</span>
          </div>

          {/* Sleek, compact 3-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {recentPosts.map((post) => {
              const isActive = activePostId === post._id;
              const dateStr = post.updatedAt || post.createdAt;
              const formattedDate = dateStr
                ? new Date(dateStr).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                : t("editor.recent_posts.recent");

              const categoryName =
                typeof post.category === "object"
                  ? post.category?.name
                  : post.category;

              return (
                <div
                  key={post._id}
                  onClick={() => onSelectPost(post._id)}
                  className={`group relative p-2.5 rounded-lg border cursor-pointer transition-all duration-150 flex flex-col justify-between select-none ${
                    isActive
                      ? "bg-sky-500/10 border-sky-500/60 ring-1 ring-sky-500/30 shadow-xs"
                      : "bg-[var(--color-editor-elevated)]/40 hover:bg-[var(--color-editor-elevated)] border-[var(--color-editor-border)] hover:border-sky-500/40 hover:shadow-xs"
                  }`}
                >
                  <div className="space-y-1">
                    {/* Status & Date */}
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          post.published
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${
                            post.published ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                        {post.published ? t("editor.recent_posts.published") : t("editor.recent_posts.draft")}
                      </span>

                      <span className="text-[10px] text-[var(--color-editor-muted)]">
                        {formattedDate}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-semibold text-[var(--color-editor-text)] line-clamp-1 group-hover:text-sky-500 transition-colors">
                      {post.title || t("editor.recent_posts.untitled")}
                    </h4>
                  </div>

                  {/* Bottom Meta */}
                  <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-[var(--color-editor-border)]/40 text-[10px]">
                    <span className="text-[var(--color-editor-muted)] truncate max-w-[110px]">
                      {categoryName || t("editor.recent_posts.general_category")}
                    </span>

                    <span className="text-sky-500 font-semibold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[10px]">
                      {isActive ? t("editor.recent_posts.currently_editing") : t("editor.recent_posts.open_post")}
                      <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 text-xs">
            {activePostId ? (
              <button
                type="button"
                onClick={() => onSelectPost(null)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-editor-text)] hover:text-sky-500 transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>{t("editor.recent_posts.start_new_blank")}</span>
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={onOpenSidebar}
              className="text-[11px] font-semibold text-sky-500 hover:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t("editor.recent_posts.see_all_in_sidebar", { count: posts.length })}</span>
              <ArrowRight size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecentPostsSection;
