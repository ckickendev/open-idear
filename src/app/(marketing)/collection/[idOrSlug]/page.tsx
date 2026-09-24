"use client";

// =============================================================================
//  PUBLIC / SHARED KNOWLEDGE COLLECTION PAGE
//  src/app/(marketing)/collection/[idOrSlug]/page.tsx
//
//  Design Decisions:
//  - Modern Apple / Notion aesthetic: minimalist typography, rich cards, subtle borders.
//  - Displays collection hero: title, description, owner, article count, and follower architecture.
//  - Renders curated article list with reading time and curator notes.
//  - Supports owner actions (removing articles, sharing clean link).
//  - Enforces access control gracefully.
// =============================================================================

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Layers,
  Globe,
  Lock,
  Link2,
  Share2,
  Users,
  Clock,
  ArrowLeft,
  Trash2,
  Loader2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import authenticationStore from "@/store/AuthenticationStore";
import {
  collectionApi,
  type CollectionDetailResponse,
} from "@/features/collections";

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ idOrSlug: string }>;
}) {
  const resolvedParams = use(params);
  const idOrSlug = resolvedParams.idOrSlug;

  const [data, setData] = useState<CollectionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const currentUser = authenticationStore((state) => state.currentUser);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    collectionApi
      .getCollection(idOrSlug)
      .then((res) => {
        if (!isMounted) return;
        if (!res) {
          setError("Collection not found or access is restricted.");
          return;
        }
        setData(res);
        setFollowersCount(res.collection.followersCount || 0);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || "Failed to load collection.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [idOrSlug]);

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Collection link copied to clipboard!");
      } catch {
        toast.error("Failed to copy link.");
      }
    }
  };

  // Follow collection (placeholder architecture as requested)
  const handleToggleFollow = () => {
    if (!currentUser?._id) {
      toast.info("Please sign in to follow collections.");
      return;
    }
    const next = !isFollowing;
    setIsFollowing(next);
    setFollowersCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
    toast.success(
      next
        ? "Following collection (preview)"
        : "Unfollowed collection (preview)"
    );
  };

  const handleRemoveArticle = async (articleId: string, articleTitle: string) => {
    if (!data?.collection._id) return;

    try {
      const ok = await collectionApi.removeArticle(data.collection._id, articleId);
      if (ok) {
        toast.success(`Removed "${articleTitle}" from collection.`);
        setData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            items: prev.items.filter((item) => item.article._id !== articleId),
          };
        });
      }
    } catch {
      toast.error("Failed to remove article.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-zinc-400">
        <Loader2 size={24} className="animate-spin text-indigo-600" />
        <p className="text-sm">Loading collection...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 w-14 h-14 mx-auto mb-4 flex items-center justify-center">
          <Lock size={24} />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Collection Unavailable
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          {error || "This collection is private or does not exist."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  const { collection, owner, items, isOwner } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* ── Breadcrumb Navigation ── */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/profile/collections"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Collections</span>
        </Link>
      </nav>

      {/* ── Collection Hero Section ── */}
      <header className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-indigo-50/50 to-white dark:from-zinc-900/80 dark:to-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5">
        {/* Title & Visibility Pill */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                {collection.visibility === "PUBLIC" && <Globe size={11} />}
                {collection.visibility === "PRIVATE" && <Lock size={11} />}
                {collection.visibility === "UNLISTED" && <Link2 size={11} />}
                <span>{collection.visibility}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {collection.title}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>

            {!isOwner && (
              <button
                type="button"
                onClick={handleToggleFollow}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer ${
                  isFollowing
                    ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
              >
                <span>{isFollowing ? "Following" : "Follow"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {collection.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
            {collection.description}
          </p>
        )}

        {/* Metadata Row: Owner, Article Count, Followers */}
        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 pt-4 border-t border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
          {/* Owner */}
          {owner && (
            <Link
              href={`/profile/${owner.username || owner._id}`}
              className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 shrink-0">
                {owner.avatar || owner.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={owner.avatar || owner.avatarUrl}
                    alt={owner.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-zinc-600">
                    {owner.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {owner.name || owner.username}
              </span>
            </Link>
          )}

          {/* Article Count */}
          <div className="flex items-center gap-1.5">
            <Layers size={14} className="text-zinc-400" />
            <span className="font-medium">
              {items.length} {items.length === 1 ? "article" : "articles"}
            </span>
          </div>

          {/* Followers (Architecture Ready) */}
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-zinc-400" />
            <span className="font-medium">
              {followersCount} {followersCount === 1 ? "follower" : "followers"}
            </span>
          </div>
        </div>
      </header>

      {/* ── Curated Articles List ── */}
      <main className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <BookOpen size={18} className="text-indigo-600 dark:text-indigo-400" />
          <span>Curated Articles ({items.length})</span>
        </h2>

        {items.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30">
            <BookOpen size={32} className="mx-auto text-zinc-400 mb-2 opacity-50" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              No articles added to this collection yet.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Browse articles on OpenIdear and click &ldquo;Save&rdquo; to add them here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const art = item.article;
              if (!art) return null;

              // Estimate reading time from text or word count
              const wordCount = (art.text || art.content || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
              const readTime = Math.max(1, Math.ceil(wordCount / 200));

              return (
                <article
                  key={item.id}
                  className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:shadow-md hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-200"
                >
                  <div className="flex gap-4 items-start min-w-0 flex-1">
                    {/* Position Number */}
                    <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 w-5 pt-1 text-center shrink-0">
                      #{index + 1}
                    </span>

                    {/* Article Thumbnail */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/50 dark:border-zinc-700/50">
                      {art.image?.url || art.image?.thumbnail ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={art.image.url || art.image.thumbnail || ""}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <BookOpen size={20} />
                        </div>
                      )}
                    </div>

                    {/* Article Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {art.category?.name && (
                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          {art.category.name}
                        </span>
                      )}

                      <Link
                        href={`/post/${art.slug}`}
                        className="block font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
                      >
                        {art.title}
                      </Link>

                      {art.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                          {art.description}
                        </p>
                      )}

                      {/* Curator Note (if added) */}
                      {item.note && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[11px] text-indigo-800 dark:text-indigo-300 font-medium mt-1 border border-indigo-100 dark:border-indigo-900/50">
                          <Sparkles size={11} className="text-indigo-500" />
                          <span>Note: {item.note}</span>
                        </div>
                      )}

                      {/* Reading Time */}
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 pt-0.5">
                        <Clock size={12} />
                        <span>{readTime} min read</span>
                        {art.author?.name && (
                          <span>• by {art.author.name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Owner Controls */}
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleRemoveArticle(art._id, art.title)}
                      title="Remove from collection"
                      className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors self-end sm:self-center shrink-0 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
