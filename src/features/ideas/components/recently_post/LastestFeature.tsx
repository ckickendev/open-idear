"use client";

import { ENV } from "@/api/const";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { ChevronRight } from "lucide-react";
import Article from "./Article";
import { useTranslation } from "@/app/hook/useTranslation";
import { usePathname } from "next/navigation";
import axios from "axios";
import {
  MainFeatureSkeleton,
  PostCardSkeleton,
  FeedLoadingCue,
} from "@/components/ui/Skeletons";
import MainFeature from "./MainFeature";
import { PostInterface } from "@/app/(marketing)/profile/[username]/page";
import ArticleRightSide from "./ArticleRightSide";
import Link from "next/link";
import { getCachedFeed, setCachedFeed } from "@/lib/cache/feedCache";
import {
  FeedConnectionState,
  FeedCachedNotice,
  FeedFloatingStatus,
  FeedConnectionStatus,
} from "@/components/common/FeedConnectionState";

export interface RecentlyPayload {
  categories: any[];
  posts: PostInterface[];
}

export interface LastestFeatureProps {
  initialData?: RecentlyPayload;
}

const LastestFeature: React.FC<LastestFeatureProps> = ({ initialData }) => {
  const { t, lang } = useTranslation();
  const pathname = usePathname();
  const activeLocale = pathname?.startsWith("/vi") ? "vi" : (lang || "en");
  const [selectFeature, setSelectFeature] = useState(0);
  const [allCategory, setAllCategory] = useState<any[]>(
    initialData?.categories && initialData.categories.length > 0
      ? [{ name: "All", slug: "all" }, ...initialData.categories]
      : [{ name: "All", slug: "all" }]
  );
  const [allPosts, setAllPosts] = useState<PostInterface[]>(initialData?.posts || []);
  const [isLocalLoading, setIsLocalLoading] = useState(
    !initialData || !initialData.posts || initialData.posts.length === 0
  );
  const [isRetrying, setIsRetrying] = useState(false);
  const [feedStatus, setFeedStatus] = useState<FeedConnectionStatus>(
    initialData && initialData.posts && initialData.posts.length > 0 ? "empty" : "connecting"
  );
  const [isCached, setIsCached] = useState(false);
  const [hasRevalidationError, setHasRevalidationError] = useState(false);

  const cacheKey = `open_idear_feed_recently_${activeLocale}`;
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchRecentlyData = useCallback(
    async (isManualRetry = false) => {
      const rootApi = ENV?.ROOT_API || "http://localhost:5001";

      if (isManualRetry) {
        setIsRetrying(true);
      }

      // Check cache first for instant UX if not manual retry
      const cached = getCachedFeed<RecentlyPayload>(cacheKey);
      if (cached && !isManualRetry) {
        if (Array.isArray(cached.categories) && cached.categories.length > 0) {
          setAllCategory([{ name: "All", slug: "all" }, ...cached.categories]);
        }
        if (Array.isArray(cached.posts) && cached.posts.length > 0) {
          setAllPosts(cached.posts);
          setIsCached(true);
          setIsLocalLoading(false);
        }
      } else if (!cached) {
        setIsLocalLoading(true);
      }

      const executeRequest = async (attempt = 1): Promise<any> => {
        try {
          const res = await fetch(
            `${rootApi}/post/getRecentlyData?locale=${activeLocale}`,
            { signal: AbortSignal.timeout(10000) }
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          return { data, status: res.status };
        } catch (err: any) {
          const isTimeoutOrNetwork =
            err?.name === "TimeoutError" ||
            err?.message?.includes("timeout") ||
            !err?.response;

          // Transparent 1x retry on cold start timeout or transient network drop
          if (attempt === 1 && isTimeoutOrNetwork) {
            await new Promise((res) => setTimeout(res, 1200));
            return executeRequest(2);
          }
          throw err;
        }
      };

      try {
        const response = await executeRequest();

        if (!isMountedRef.current) return;

        if (response.status === 200 && response.data?.recentlyData) {
          const { categories, posts } = response.data.recentlyData;

          const updatedCats = Array.isArray(categories)
            ? [{ name: "All", slug: "all" }, ...categories]
            : [{ name: "All", slug: "all" }];

          const updatedPosts = Array.isArray(posts) ? posts : [];

          setAllCategory(updatedCats);
          setAllPosts(updatedPosts);
          setFeedStatus(updatedPosts.length > 0 ? "empty" : "empty"); // will show posts if len > 0
          setIsCached(false);
          setHasRevalidationError(false);

          // Update cache with fresh payload
          if (updatedPosts.length > 0) {
            setCachedFeed<RecentlyPayload>(cacheKey, {
              categories: categories || [],
              posts: updatedPosts,
            });
          }
        }
      } catch (error: any) {
        if (!isMountedRef.current) return;

        console.warn("Could not fetch recently posts:", error?.message || error);

        const isTimeout =
          error?.code === "ECONNABORTED" ||
          error?.message?.includes("timeout") ||
          error?.code === "ERR_NETWORK";

        const resolvedStatus: FeedConnectionStatus = isTimeout ? "timeout" : "error";
        setFeedStatus(resolvedStatus);

        // If we already have posts in state (e.g. from cache), keep showing them!
        setAllPosts((currentPosts) => {
          if (currentPosts.length > 0) {
            setIsCached(true);
            setHasRevalidationError(true);
          }
          return currentPosts;
        });
      } finally {
        if (isMountedRef.current) {
          setIsLocalLoading(false);
          setIsRetrying(false);
        }
      }
    },
    [activeLocale, cacheKey]
  );

  useEffect(() => {
    if (initialData && initialData.posts && initialData.posts.length > 0) {
      return;
    }
    fetchRecentlyData();
  }, [fetchRecentlyData, initialData]);

  const onSelectFeature = async (index: number) => {
    setSelectFeature(index);

    const rootApi = ENV?.ROOT_API || "http://localhost:5001";
    if (!rootApi || !allCategory[index]) return;

    try {
      setIsLocalLoading(true);
      const isAll = allCategory[index].slug === "all";
      const endpoint = isAll
        ? `${rootApi}/post/getRecentlyData?locale=${activeLocale}`
        : `${rootApi}/post/getRecentlyDataByFeatures?feature=${allCategory[index].slug}&locale=${activeLocale}`;

      const response = await axios.get(endpoint, { timeout: 10000 });
      if (response.status === 200 && response.data?.recentlyData?.posts) {
        setAllPosts(response.data.recentlyData.posts);
        setHasRevalidationError(false);
      }
    } catch (error: any) {
      console.warn("Could not filter posts by feature:", error);
    } finally {
      setIsLocalLoading(false);
    }
  };

  const renderFeature = () => {
    return allCategory.slice(0, 6).map((category, index) => {
      const displayName =
        category.slug === "all"
          ? t("component.lastest_feature.all") !== "component.lastest_feature.all"
            ? t("component.lastest_feature.all")
            : "All"
          : category.name;
      return (
        <button
          key={category.slug || index}
          type="button"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            index === selectFeature
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/40 border border-transparent"
          }`}
          onClick={() => onSelectFeature(index)}
        >
          {displayName}
        </button>
      );
    });
  };

  const moreHref = activeLocale === "vi" ? "/vi/recently-post" : "/recently-post";

  return (
    <>
      <div className="max-w-6xl mx-auto p-6 border border-border bg-card/15 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-lg text-foreground tracking-tight whitespace-nowrap">
                {t("component.lastest_feature.last")}
              </h2>
              {/* Subtle status notice when showing cached feed during reconnect */}
              {isCached && hasRevalidationError && (
                <FeedCachedNotice
                  activeLocale={activeLocale}
                  isRetrying={isRetrying}
                  onRetry={() => fetchRecentlyData(true)}
                />
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              {renderFeature()}
            </div>
          </div>

          <div className="flex items-center">
            <Link
              href={moreHref}
              className="inline-flex items-center text-muted-foreground hover:text-foreground text-xs font-semibold cursor-pointer group transition-colors"
            >
              <span>{t("component.lastest_feature.more")}</span>
              <ChevronRight
                className="ml-0.5 group-hover:translate-x-0.5 transition-transform"
                size={14}
              />
            </Link>
          </div>
        </div>

        {/* Content area */}
        {allPosts.length > 0 ? (
          <>
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              {allPosts[0] && <MainFeature postData={allPosts[0]} />}
              {allPosts.length > 1 && (
                <div className="w-full lg:w-1/5">
                  <ArticleRightSide postData={allPosts[1]} />
                </div>
              )}
            </div>

            {allPosts.length > 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {allPosts.slice(2, 8).map((data: PostInterface, index: number) => {
                  return <Article key={data._id || index} postData={data} />;
                })}
              </div>
            )}
          </>
        ) : feedStatus === "empty" && !isLocalLoading ? (
          /* Legitimate empty state (0 posts in database) */
          <FeedConnectionState
            status="empty"
            onRetry={() => fetchRecentlyData(true)}
            isRetrying={isRetrying}
            activeLocale={activeLocale}
          />
        ) : (
          /* Active Shimmer Skeletons with floating live status while connecting, cold-starting, or revalidating */
          <div className="relative">
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              <MainFeatureSkeleton />
              <div className="w-full lg:w-1/5">
                <PostCardSkeleton />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <PostCardSkeleton key={idx} />
              ))}
            </div>
            <FeedFloatingStatus
              status={feedStatus}
              isRetrying={isRetrying}
              onRetry={() => fetchRecentlyData(true)}
              activeLocale={activeLocale}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default LastestFeature;
