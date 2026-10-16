// =============================================================================
//  RECENT POSTS SECTION — QUICK ACCESS IN CREATE PAGE
//  src/app/(editor)/create/RecentPostsSection.tsx
//
//  Design Decisions:
//  - Displays author's previous posts & drafts directly on the /create page.
//  - 1-click navigation to resume editing any past article.
//  - Shows status badges (Draft vs Published), last updated date, and category.
//  - Collapsible to keep writing distraction-free.
//  - "Browse All Posts" button connects directly to the full sidebar.
// =============================================================================

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ExternalLink,
  Plus,
  Sparkles,
  Layers,
  RotateCw,
} from "lucide-react";
import { postApi } from "@/features/ideas/api/post.api";

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
}

export function RecentPostsSection({
  activePostId,
  onSelectPost,
  onOpenSidebar,
}: RecentPostsSectionProps) {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(!activePostId);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchRecentPosts = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await postApi.getPostsByAuthor();
      if (res?.data?.posts) {
        const list: PostItem[] = [...res.data.posts];
        // Sort newest first
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
  }, []);

  useEffect(() => {
    fetchRecentPosts();
  }, [fetchRecentPosts]);

  // If user opens a post, automatically collapse section to keep editor clean
  useEffect(() => {
    if (activePostId) {
      setIsExpanded(false);
    }
  }, [activePostId]);

  if (!hasLoaded && posts.length === 0) {
    return null;
  }

  if (hasLoaded && posts.length === 0) {
    return null;
  }

  const recentPosts = posts.slice(0, 6);
  const activePost = posts.find((p) => p._id === activePostId);

  return (
    <div className="mb-8 rounded-2xl border border-[var(--color-editor-border)] bg-[var(--color-editor-surface)]/70 backdrop-blur-md shadow-xs overflow-hidden transition-all duration-200">
      {/* ── Section Header / Toggle Bar ── */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[var(--color-editor-elevated)]/40 border-b border-[var(--color-editor-border)]/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-[var(--color-editor-accent)]/12 text-[var(--color-editor-accent)] shrink-0">
            <Clock size={15} />
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-[var(--color-editor-text)] truncate">
              Your Previous Posts
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-editor-elevated)] text-[var(--color-editor-secondary)] border border-[var(--color-editor-border)] shrink-0">
              {posts.length} {posts.length === 1 ? "article" : "articles"}
            </span>
            {activePost && !isExpanded && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-[var(--color-editor-muted)] truncate max-w-xs">
                • Editing: <strong className="text-[var(--color-editor-text)] font-semibold truncate">&ldquo;{activePost.title || "Untitled"}&rdquo;</strong>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={fetchRecentPosts}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] transition-colors cursor-pointer"
            title="Refresh posts"
          >
            <RotateCw size={13} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={onOpenSidebar}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[var(--color-editor-accent)] hover:bg-[var(--color-editor-accent)]/10 transition-colors cursor-pointer"
          >
            <Layers size={13} />
            <span>View All in Sidebar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] transition-colors cursor-pointer"
          >
            <span>{isExpanded ? "Hide" : "Show"}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* ── Expanded Content Grid ── */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-3 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between text-xs text-[var(--color-editor-muted)] mb-1">
            <span>Recent Drafts & Published Articles</span>
            <span className="text-[11px]">Click any post to resume editing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentPosts.map((post) => {
              const isActive = activePostId === post._id;
              const dateStr = post.updatedAt || post.createdAt;
              const formattedDate = dateStr
                ? new Date(dateStr).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent";

              const categoryName =
                typeof post.category === "object"
                  ? post.category?.name
                  : post.category;

              return (
                <div
                  key={post._id}
                  onClick={() => onSelectPost(post._id)}
                  className={`group relative p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between select-none ${
                    isActive
                      ? "bg-[var(--color-editor-accent)]/10 border-[var(--color-editor-accent)] ring-1 ring-[var(--color-editor-accent)]/30 shadow-xs"
                      : "bg-[var(--color-editor-elevated)]/40 hover:bg-[var(--color-editor-elevated)] border-[var(--color-editor-border)] hover:border-[var(--color-editor-accent)]/50 hover:shadow-md"
                  }`}
                >
                  <div className="space-y-1.5">
                    {/* Status & Date */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          post.published
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            post.published ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                        {post.published ? "Published" : "Draft"}
                      </span>

                      <span className="text-[10px] text-[var(--color-editor-muted)]">
                        {formattedDate}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-bold text-[var(--color-editor-text)] line-clamp-2 leading-snug group-hover:text-[var(--color-editor-accent)] transition-colors">
                      {post.title || "Untitled Article"}
                    </h4>

                    {/* Description snippet */}
                    {post.description && (
                      <p className="text-[11px] text-[var(--color-editor-muted)] line-clamp-1">
                        {post.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom Meta */}
                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[var(--color-editor-border)]/40 text-[10px]">
                    <span className="text-[var(--color-editor-muted)] truncate max-w-[120px]">
                      {categoryName || "General"}
                    </span>

                    <span className="text-[var(--color-editor-accent)] font-semibold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      {isActive ? "Currently Editing" : "Open Post"}
                      <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            {activePostId && (
              <button
                type="button"
                onClick={() => onSelectPost(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-editor-text)] hover:text-[var(--color-editor-accent)] transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Start New Blank Article</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSidebar}
              className="text-xs font-semibold text-[var(--color-editor-accent)] hover:underline ml-auto flex items-center gap-1 cursor-pointer"
            >
              <span>See all {posts.length} posts & search in sidebar</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecentPostsSection;
