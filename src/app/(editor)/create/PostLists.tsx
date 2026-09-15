"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  BadgePlus,
  FileText,
  Clock,
  X,
  Search,
  Trash2,
  Circle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Logo from "@/components/common/Logo";
import { postApi } from "@/features/ideas/api/post.api";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PostListItem {
  _id: string;
  title: string;
  description?: string;
  published?: boolean;
  createdAt: string;
  updatedAt?: string;
}

type StatusFilter = "all" | "draft" | "published";

interface PostListPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Currently active post ID (from URL ?id=) */
  activePostId?: string | null;
  /** Navigate to a post for editing (client-side) */
  onSelectPost: (postId: string | null) => void;
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────

function PostSkeleton() {
  return (
    <div className="p-3 rounded-xl animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-4 w-3/4 rounded bg-[var(--color-editor-elevated)]" />
        <div className="h-4 w-10 rounded-full bg-[var(--color-editor-elevated)]" />
      </div>
      <div className="h-3 w-1/2 rounded bg-[var(--color-editor-elevated)]" />
    </div>
  );
}

// ─── Delete Confirmation Dialog ─────────────────────────────────────────────

function DeleteConfirmDialog({
  postTitle,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  postTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-80 max-w-[90vw] bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-2xl shadow-2xl p-5 animate-[fade-in_0.15s_ease-out]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-editor-text)]">
              Delete Post?
            </h3>
            <p className="text-[11px] text-[var(--color-editor-muted)] mt-0.5 line-clamp-1">
              {postTitle || "Untitled"}
            </p>
          </div>
        </div>
        <p className="text-xs text-[var(--color-editor-secondary)] mb-4">
          This action will move the post to trash. You can restore it later.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-3 py-2 text-xs font-medium text-[var(--color-editor-secondary)] border border-[var(--color-editor-border)] rounded-lg hover:bg-[var(--color-editor-elevated)] transition-all duration-150 cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-60 active:scale-[0.97]"
          >
            {isDeleting ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={12} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PostListPanel — Enhanced sidebar for browsing & editing posts
// ═══════════════════════════════════════════════════════════════════════════

export default function PostListPanel({
  isOpen,
  onClose,
  activePostId,
  onSelectPost,
}: PostListPanelProps) {
  const [allPosts, setAllPosts] = useState<PostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<PostListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Fetch posts when panel opens ─────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    const fetchPosts = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      setIsLoading(true);
      try {
        const res = await postApi.getPostsByAuthor();
        if (res.success && res.data?.posts) {
          setAllPosts(res.data.posts);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [isOpen]);

  // ─── Escape key to close ──────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !deleteTarget) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose, deleteTarget]);

  // ─── Filtered posts ───────────────────────────────────────────────────

  const filteredPosts = useMemo(() => {
    let posts = allPosts;

    // Status filter
    if (statusFilter === "draft") {
      posts = posts.filter((p) => !p.published);
    } else if (statusFilter === "published") {
      posts = posts.filter((p) => p.published);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q),
      );
    }

    return posts;
  }, [allPosts, statusFilter, searchQuery]);

  // ─── Counts ───────────────────────────────────────────────────────────

  const counts = useMemo(() => {
    const drafts = allPosts.filter((p) => !p.published).length;
    const published = allPosts.filter((p) => p.published).length;
    return { all: allPosts.length, drafts, published };
  }, [allPosts]);

  // ─── Delete handler ───────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await postApi.deletePost(deleteTarget._id);
      if (res.success) {
        setAllPosts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
        toast.success("Post deleted successfully!");

        // If deleting the active post, navigate to blank editor
        if (activePostId === deleteTarget._id) {
          onSelectPost(null);
        }
      } else {
        toast.error(res.message || "Failed to delete post");
      }
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ─── Post click handler (client-side nav) ─────────────────────────────

  const handlePostClick = (postId: string) => {
    onSelectPost(postId);
    onClose();
  };

  const handleCreateNew = () => {
    onSelectPost(null);
    onClose();
  };

  if (!isOpen) return null;

  // ─── Filter tabs config ───────────────────────────────────────────────

  const tabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "draft", label: "Drafts", count: counts.drafts },
    { key: "published", label: "Published", count: counts.published },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/20 backdrop-blur-sm animate-[fade-in_0.15s_ease-out] lg:bg-background/10"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-[var(--color-editor-surface)] border-r border-[var(--color-editor-border)] shadow-2xl flex flex-col animate-slide-in-left"
        role="complementary"
        aria-label="Post list"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-editor-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-editor-accent)]/12 flex items-center justify-center">
              <FileText
                size={16}
                className="text-[var(--color-editor-accent)]"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-editor-text)]">
                My Posts
              </h2>
              <p className="text-[11px] text-[var(--color-editor-muted)]">
                {counts.all}{" "}
                {counts.all === 1 ? "document" : "documents"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] transition-all duration-150 cursor-pointer"
            aria-label="Close post list"
          >
            <X size={16} />
          </button>
        </div>

        {/* Create new */}
        <div className="px-4 py-3">
          <button
            onClick={handleCreateNew}
            className="group relative flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[var(--color-editor-accent)] hover:bg-[var(--color-editor-accent-hover)] text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-[var(--color-editor-accent)]/20 active:scale-[0.97] cursor-pointer overflow-hidden"
          >
            {/* Shimmer overlay */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer transition-opacity duration-300" />
            <BadgePlus size={16} className="relative z-10" />
            <span className="relative z-10">Create New Post</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-editor-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] rounded-xl text-[var(--color-editor-text)] placeholder:text-[var(--color-editor-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-editor-accent)]/30 focus:border-[var(--color-editor-accent)]/50 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-[var(--color-editor-muted)] hover:text-[var(--color-editor-text)] cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="px-4 pb-3">
          <div className="flex gap-1 p-0.5 bg-[var(--color-editor-elevated)] rounded-xl border border-[var(--color-editor-border)]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all duration-200 cursor-pointer ${
                  statusFilter === tab.key
                    ? "bg-[var(--color-editor-surface)] text-[var(--color-editor-text)] shadow-sm"
                    : "text-[var(--color-editor-muted)] hover:text-[var(--color-editor-secondary)]"
                }`}
              >
                {tab.label}
                <span
                  className={`tabular-nums ${
                    statusFilter === tab.key
                      ? "text-[var(--color-editor-accent)]"
                      : "text-[var(--color-editor-muted)]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Posts list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="flex items-center gap-2 px-2 mb-2">
            <Clock size={12} className="text-[var(--color-editor-muted)]" />
            <span className="text-[10px] font-semibold text-[var(--color-editor-muted)] uppercase tracking-wider">
              {statusFilter === "all"
                ? "Recent"
                : statusFilter === "draft"
                  ? "Drafts"
                  : "Published"}
            </span>
          </div>

          <div className="space-y-0.5">
            {isLoading ? (
              // Skeleton loaders
              <>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8">
                <FileText
                  size={24}
                  className="mx-auto text-[var(--color-editor-muted)] mb-2"
                />
                <p className="text-xs text-[var(--color-editor-muted)]">
                  {searchQuery
                    ? "No posts match your search."
                    : statusFilter !== "all"
                      ? `No ${statusFilter} posts yet.`
                      : "No posts yet. Start writing!"}
                </p>
              </div>
            ) : (
              filteredPosts.map((item) => {
                const isActive = activePostId === item._id;
                const displayDate = item.updatedAt || item.createdAt;

                return (
                  <div
                    key={item._id}
                    className={`relative group rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[var(--color-editor-accent)]/8 ring-1 ring-[var(--color-editor-accent)]/25 shadow-sm"
                        : "hover:bg-[var(--color-editor-elevated)] hover:shadow-sm"
                    }`}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[var(--color-editor-accent)] animate-[fade-in_0.2s_ease-out]" />
                    )}
                    <button
                      onClick={() => handlePostClick(item._id)}
                      className={`w-full p-3 text-left cursor-pointer ${isActive ? "pl-4" : ""}`}
                    >
                      {/* Title row */}
                      <div className="flex items-start gap-2">
                        <h4
                          className={`flex-1 text-sm font-medium truncate transition-colors duration-200 ${
                            isActive
                              ? "text-[var(--color-editor-accent)]"
                              : "text-[var(--color-editor-text)] group-hover:text-[var(--color-editor-accent)]"
                          }`}
                        >
                          {item.title || "Untitled"}
                        </h4>
                        {/* Status badge */}
                        <span
                          className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                            item.published
                              ? "bg-[var(--color-editor-success)]/12 text-[var(--color-editor-success)]"
                              : "bg-[var(--color-editor-warning)]/12 text-[var(--color-editor-warning)]"
                          }`}
                        >
                          {item.published ? (
                            <CheckCircle2 size={8} />
                          ) : (
                            <Circle size={8} />
                          )}
                          {item.published ? "Live" : "Draft"}
                        </span>
                      </div>

                      {/* Description preview */}
                      {item.description && (
                        <p className="text-[11px] text-[var(--color-editor-muted)] mt-1 line-clamp-1">
                          {item.description}
                        </p>
                      )}

                      {/* Date */}
                      <p className="text-[10px] text-[var(--color-editor-muted)] mt-1.5 flex items-center gap-1">
                        <Clock size={9} />
                        {new Date(displayDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {item.updatedAt && item.updatedAt !== item.createdAt && (
                          <span className="text-[var(--color-editor-muted)]/60">
                            · edited
                          </span>
                        )}
                      </p>
                    </button>

                    {/* Delete button (hover-revealed) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(item);
                      }}
                      className="absolute top-3 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-[var(--color-editor-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
                      aria-label={`Delete "${item.title || "Untitled"}"`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--color-editor-border)] px-4 py-3 flex items-center justify-between">
          <span className="text-[10px] text-[var(--color-editor-muted)] tabular-nums">
            {filteredPosts.length} of {counts.all} posts
          </span>
          <Logo className="h-6 opacity-30" />
        </div>
      </aside>

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <DeleteConfirmDialog
          postTitle={deleteTarget.title}
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
