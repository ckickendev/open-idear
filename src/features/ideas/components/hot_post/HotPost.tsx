"use client";

import { ENV } from "@/api/const";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "@/app/hook/useTranslation";
import { usePathname } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { UserLinkCustom } from "@/components/common/LinkCustom";
import { PostCardSkeleton, FeedLoadingCue } from "@/components/ui/Skeletons";
import { getCachedFeed, setCachedFeed } from "@/lib/cache/feedCache";
import {
  FeedConnectionState,
  FeedCachedNotice,
  FeedConnectionStatus,
} from "@/components/common/FeedConnectionState";

interface Post {
  _id: number;
  title: string;
  image: any;
  readtime: string | number;
  author: any;
  likes?: [any];
  slug: string;
  createdAt: string;
  text?: string;
  description?: string;
}

const HotPost: React.FC = () => {
  const { t, lang } = useTranslation();
  const pathname = usePathname();
  const activeLocale = pathname?.startsWith("/vi") ? "vi" : (lang || "en");
  const [articles, setArticles] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [feedStatus, setFeedStatus] = useState<FeedConnectionStatus>("connecting");
  const [isCached, setIsCached] = useState(false);
  const [hasRevalidationError, setHasRevalidationError] = useState(false);

  const cacheKey = `open_idear_feed_hot_${activeLocale}`;
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchHotPost = useCallback(
    async (isManualRetry = false) => {
      const rootApi = ENV?.ROOT_API || "http://localhost:5001";

      if (isManualRetry) {
        setIsRetrying(true);
      }

      // Read from cache for instant 0ms perceived load time
      const cached = getCachedFeed<Post[]>(cacheKey);
      if (cached && !isManualRetry) {
        if (Array.isArray(cached) && cached.length > 0) {
          setArticles(cached);
          setIsCached(true);
          setIsLoading(false);
        }
      } else if (!cached) {
        setIsLoading(true);
      }

      const executeRequest = async (attempt = 1): Promise<any> => {
        try {
          return await axios.get(
            `${rootApi}/post/getHotPostsWeek?limit=10&page=1&locale=${activeLocale}`,
            { timeout: 10000 }
          );
        } catch (err: any) {
          const isTimeoutOrNetwork =
            err?.code === "ECONNABORTED" ||
            err?.message?.includes("timeout") ||
            !err?.response;

          // Transparent 1x retry
          if (attempt === 1 && isTimeoutOrNetwork) {
            await new Promise((res) => setTimeout(res, 1200));
            return executeRequest(2);
          }
          throw err;
        }
      };

      try {
        const res = await executeRequest();

        if (!isMountedRef.current) return;

        if (res.status === 200) {
          const fetchedPosts = res.data?.posts || [];
          setArticles(fetchedPosts);
          setFeedStatus(fetchedPosts.length > 0 ? "empty" : "empty");
          setIsCached(false);
          setHasRevalidationError(false);

          if (fetchedPosts.length > 0) {
            setCachedFeed<Post[]>(cacheKey, fetchedPosts);
          }
        }
      } catch (error: any) {
        if (!isMountedRef.current) return;

        console.warn("Could not fetch hot posts:", error?.message || error);

        const isTimeout =
          error?.code === "ECONNABORTED" ||
          error?.message?.includes("timeout") ||
          error?.code === "ERR_NETWORK";

        const resolvedStatus: FeedConnectionStatus = isTimeout ? "timeout" : "error";
        setFeedStatus(resolvedStatus);

        setArticles((currentArticles) => {
          if (currentArticles.length > 0) {
            setIsCached(true);
            setHasRevalidationError(true);
          }
          return currentArticles;
        });
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRetrying(false);
        }
      }
    },
    [activeLocale, cacheKey]
  );

  useEffect(() => {
    fetchHotPost();
  }, [fetchHotPost]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-lg text-foreground tracking-tight">
            {t("component.hotPost.title")}
          </h2>
          {isCached && hasRevalidationError && (
            <FeedCachedNotice
              activeLocale={activeLocale}
              isRetrying={isRetrying}
              onRetry={() => fetchHotPost(true)}
            />
          )}
        </div>
        <Link
          href={"/top10ideas"}
          className="inline-flex items-center text-muted-foreground hover:text-foreground text-xs font-semibold cursor-pointer transition-colors"
        >
          {t("component.hotPost.moreDes")}
        </Link>
      </div>

      {isLoading && articles.length === 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <PostCardSkeleton key={idx} />
            ))}
          </div>
          <FeedLoadingCue activeLocale={activeLocale} />
        </>
      ) : articles.length === 0 ? (
        /* Graceful degraded / reconnecting UI instead of blank box */
        <FeedConnectionState
          status={feedStatus}
          onRetry={() => fetchHotPost(true)}
          isRetrying={isRetrying}
          activeLocale={activeLocale}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.slice(0, 4).map((article) => {
            const minutesRead = article.readtime
              ? typeof article.readtime === "string"
                ? parseInt(article.readtime, 10)
                : article.readtime
              : Math.max(1, Math.ceil((article.text || "").split(/\s+/).length / 200)) || 5;

            const postUrl =
              activeLocale === "vi" ? `/vi/post/${article.slug}` : `/post/${article.slug}`;

            return (
              <div
                key={article._id}
                className="flex flex-col bg-card border border-border/50 hover:border-border rounded-xl p-3 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 ease-in-out group cursor-pointer h-full"
              >
                <Link
                  href={postUrl}
                  className="block relative aspect-[16/10] w-full bg-muted rounded-lg overflow-hidden mb-3"
                >
                  <Image
                    src={article.image?.url || "/banner/banner_standard.png"}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                <div className="flex flex-1 flex-col">
                  <Link href={postUrl} className="block">
                    <h3 className="font-bold text-xs leading-snug text-foreground hover:text-primary transition-colors line-clamp-2 mb-1.5 hover:underline tracking-tight">
                      {article.title}
                    </h3>
                  </Link>

                  {(article.description || article.text) && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                      {article.description || article.text}
                    </p>
                  )}

                  <div className="flex items-center text-[10px] text-muted-foreground/80 mt-auto pt-2.5 border-t border-border/40 font-medium">
                    <UserLinkCustom
                      className="hover:underline text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                      username={article.author?.username}
                      name={article.author?.username || article.author?.name || "Unknown"}
                    />
                    <span className="mx-1 text-muted-foreground/50">•</span>
                    <span>
                      {minutesRead} {activeLocale === "vi" ? "phút đọc" : "min read"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HotPost;
