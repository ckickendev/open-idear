"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  User,
  Plus,
  Bookmark,
  Check,
} from "lucide-react";
import authenticationStore from "@/store/AuthenticationStore";
import { getHeadersToken } from "@/lib/api/axios";
import axios from "axios";
import { REACT_APP_ROOT_BACKEND } from "@/features/auth/components/authentication";
import { toast } from "sonner";
import Link from "next/link";
import { ArticleVersionAction } from "@/features/article/versioning";
import { SaveToCollectionModal } from "@/features/collections";
import { useTranslation } from "@/app/hook/useTranslation";

export interface PostSidebarActionsProps {
  postData: any;
  variant?: "floating" | "inline" | "both";
}

export default function PostSidebarActions({
  postData,
  variant = "both",
}: PostSidebarActionsProps) {
  const { t } = useTranslation();
  const currentUser = authenticationStore((state) => state.currentUser);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [likeCount, setLikeCount] = useState(postData?.likes?.length || 0);
  const [commentCount, setCommentCount] = useState(postData?.comments?.length || 0);
  const [displayFloating, setDisplayFloating] = useState(false);

  const handleLike = async () => {
    if (!currentUser?._id) {
      toast.info(t("component.article.signInToLike", "Please sign in to like this post"));
      return;
    }
    try {
      const res = await axios.post(
        `${REACT_APP_ROOT_BACKEND}/comments/voteLike/${postData._id}`,
        { headers: getHeadersToken() },
      );

      if (res.status !== 200) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const { postLike } = res.data;
      if (postLike) {
        setIsLiked(true);
        setLikeCount((prev: number) => prev + 1);
      } else {
        setIsLiked(false);
        setLikeCount((prev: number) => Math.max(0, prev - 1));
      }
    } catch {
      toast.error("Error when liking post");
    }
  };

  const handleBookmark = () => {
    if (!currentUser?._id) {
      toast.info(t("component.article.signInToSave", "Please sign in to save articles to collections"));
      return;
    }
    setIsSaveModalOpen(true);
  };

  const handleFollow = async () => {
    if (!currentUser?._id) {
      toast.info(t("component.article.signInToFollow", "Please sign in to follow authors"));
      return;
    }
    try {
      const res = await axios.patch(
        `${REACT_APP_ROOT_BACKEND}/post/followUser?postId=${postData._id}`,
        { headers: getHeadersToken() },
      );

      if (res.status !== 200) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const { isFollowed: followed } = res.data;
      if (followed) {
        toast.success(t("component.article.authorFollowed", "Author followed successfully"));
      } else {
        toast.info(t("component.article.authorUnfollowed", "Author unfollowed successfully"));
      }
      setIsFollowed(followed);
    } catch {
      toast.error("Error when following author");
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: postData?.title || "Article on OpenIdear",
          url,
        });
        return;
      } catch {
        // User cancelled or share dismissed, fall back to clipboard copy
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success(t("component.article.shareCopied", "Article link copied to clipboard!"));
      } catch {
        toast.info(url);
      }
    }
  };

  const handleCommentScroll = () => {
    const el =
      document.getElementById("comments") ||
      document.getElementById("comment-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const getStatus = async () => {
      try {
        const res = await axios.get(
          `${REACT_APP_ROOT_BACKEND}/post/getSideInformation?postId=${postData._id}`,
          { headers: getHeadersToken() },
        );

        if (res.status === 200) {
          const { isLiked: liked, isBookmarked: marked, isFollowed: followed } = res.data;
          setIsLiked(Boolean(liked));
          setIsBookmarked(Boolean(marked));
          setIsFollowed(Boolean(followed));
        }
      } catch {
        // Silently continue if unauthenticated or offline
      }
    };

    if (postData?._id) {
      getStatus();
    }
  }, [postData?._id]);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setDisplayFloating(scrollY > 500 && scrollY < 3200);
  }, []);

  useEffect(() => {
    if (variant === "inline") return;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll, variant]);

  const renderInlineActions = () => (
    <div className="flex items-center flex-wrap gap-2 text-muted-foreground">
      {/* Like Button */}
      <button
        type="button"
        onClick={handleLike}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer shadow-xs ${
          isLiked
            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-semibold"
            : "bg-muted/60 hover:bg-muted text-foreground/80 hover:text-foreground border border-border/60"
        }`}
        title="Like article"
      >
        <Heart size={14} className={isLiked ? "fill-rose-500 text-rose-500" : ""} />
        <span>{likeCount}</span>
      </button>

      {/* Save to Collection Button */}
      <button
        type="button"
        onClick={handleBookmark}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer shadow-xs ${
          isBookmarked
            ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
            : "bg-muted/60 hover:bg-muted text-foreground/80 hover:text-foreground border border-border/60"
        }`}
        title="Save to Collection"
      >
        <Bookmark size={14} className={isBookmarked ? "fill-primary text-primary" : ""} />
        <span>Save</span>
      </button>

      {/* Comments Button */}
      <button
        type="button"
        onClick={handleCommentScroll}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted/60 hover:bg-muted text-foreground/80 hover:text-foreground border border-border/60 transition-all duration-200 cursor-pointer shadow-xs"
        title="Jump to Comments"
      >
        <MessageCircle size={14} />
        <span>{commentCount}</span>
      </button>

      {/* Share Button */}
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted/60 hover:bg-muted text-foreground/80 hover:text-foreground border border-border/60 transition-all duration-200 cursor-pointer shadow-xs"
        title={t("component.article.share", "Share article")}
      >
        <Share2 size={14} />
        <span>{t("component.article.share", "Share")}</span>
      </button>
    </div>
  );

  const renderFloatingSidebar = () => {
    if (!displayFloating) return null;

    return (
      <div className="hidden xl:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col items-center gap-4 z-30 p-2.5 rounded-full bg-background/80 backdrop-blur-md border border-border/60 shadow-lg shadow-black/5 dark:shadow-black/40 animate-in fade-in slide-in-from-left-4 duration-300">
        {/* Like Button */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleLike}
            className={`p-2.5 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer ${
              isLiked
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
            title="Like article"
          >
            <Heart size={18} className={isLiked ? "fill-current" : ""} />
          </button>
          <span className="text-[11px] font-mono font-medium text-muted-foreground mt-0.5">
            {likeCount}
          </span>
        </div>

        {/* Author Avatar with Follow pill */}
        {postData?.author && (
          <div className="relative group">
            <Link
              href={`/profile/${postData.author.username || postData.author.name}`}
              className="block w-9 h-9 rounded-full overflow-hidden ring-2 ring-border hover:ring-primary transition-all cursor-pointer shadow-xs"
              title={`View ${postData.author.name || postData.author.username}'s profile`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={postData.author.avatar || postData.author.avatarUrl || "/avatar.png"}
                alt="Author"
                className="w-full h-full object-cover"
              />
            </Link>
            <button
              type="button"
              onClick={handleFollow}
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 cursor-pointer ${
                isFollowed ? "bg-emerald-500 hover:bg-emerald-600" : "bg-primary hover:bg-primary/90"
              }`}
              title={isFollowed ? "Unfollow" : "Follow"}
            >
              {isFollowed ? <Check size={10} /> : <Plus size={10} />}
            </button>
          </div>
        )}

        {/* Save to Collection Button */}
        <button
          type="button"
          onClick={handleBookmark}
          title="Save to Collection"
          className={`p-2.5 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer ${
            isBookmarked
              ? "bg-primary/15 text-primary"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bookmark size={18} className={isBookmarked ? "fill-current" : ""} />
        </button>

        {/* Comments Button */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleCommentScroll}
            className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 cursor-pointer"
            title="Comments"
          >
            <MessageCircle size={18} />
          </button>
          <span className="text-[11px] font-mono font-medium text-muted-foreground mt-0.5">
            {commentCount}
          </span>
        </div>

        {/* Version History Button */}
        {postData?.slug && (
          <ArticleVersionAction
            slug={postData.slug}
            postId={postData._id}
            currentVersion={postData.latestVersion || postData.currentVersionId?.version || "1.0"}
            currentContent={postData.content || postData.text || ""}
            authorId={postData.author?._id || postData.author}
            variant="sidebar"
          />
        )}

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 cursor-pointer"
          title="Share article"
        >
          <Share2 size={18} />
        </button>
      </div>
    );
  };

  return (
    <>
      {variant !== "floating" && renderInlineActions()}
      {variant !== "inline" && renderFloatingSidebar()}

      {/* ── Save To Collection Modal ── */}
      <SaveToCollectionModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        articleId={postData._id}
        articleTitle={postData.title}
        onSaveStateChange={(isSavedInAny) => setIsBookmarked(isSavedInAny)}
      />
    </>
  );
}
