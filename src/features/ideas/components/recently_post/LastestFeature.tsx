"use client";
import { ENV } from "@/api/const";
import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import Article from "./Article";
import { useTranslation } from "@/app/hook/useTranslation";
import axios from "axios";
import { MainFeatureSkeleton, PostCardSkeleton } from "@/components/ui/Skeletons";
import MainFeature from "./MainFeature";
import { PostInterface } from "@/app/(marketing)/profile/[username]/page";
import ArticleRightSide from "./ArticleRightSide";
import Link from "next/link";

const LastestFeature = () => {
  const { t } = useTranslation();
  const [selectFeature, setSelectFeature] = useState(0);
  const [allCategory, setAllCategory] = useState<any[]>([
    { name: "Tất cả", slug: "all" },
  ]);
  const [allPosts, setAllPosts] = useState<PostInterface[]>([]);
  const [isLocalLoading, setIsLocalLoading] = useState(true);

  useEffect(() => {
    const fetchRecentlyData = async () => {
      try {
        setIsLocalLoading(true);
        const response = await axios.get(
          `${ENV.ROOT_API}/post/getRecentlyData`,
        );
        console.log("recently data:", response.data);

        if (response.status === 200) {
          setAllCategory((old) => [
            { name: "Tất cả", slug: "all" },
            ...response.data.recentlyData.categories,
          ]);
          setAllPosts(response.data.recentlyData.posts);
        }
      } catch (error: any) {
        console.error("Error fetching recently posts:", error);
      } finally {
        setIsLocalLoading(false);
      }
    };
    fetchRecentlyData();
  }, []);

  const onSelectFeature = async (index: number) => {
    setSelectFeature(index);

    try {
      setIsLocalLoading(true);
      const response = await axios.get(
        `${ENV.ROOT_API}/post/getRecentlyDataByFeatures?feature=${allCategory[index].slug}`,
      );
      if (response.status === 200) {
        console.log(
          "recently data onSelectFeature:",
          response.data.recentlyData.posts,
        );
        setAllPosts(response.data.recentlyData.posts);
      }
    } catch (error: any) {
      console.error("Error selecting feature category:", error);
    } finally {
      setIsLocalLoading(false);
    }
  };

  const renderFeature = () => {
    return allCategory.slice(0, 6).map((category, index) => {
      const displayName = category.slug === "all"
        ? (t("component.lastest_feature.all") !== "component.lastest_feature.all" ? t("component.lastest_feature.all") : "All")
        : category.name;
      return (
        <button
          key={index}
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

  return (
    <>
      <div className="max-w-6xl mx-auto p-6 border border-border bg-card/15 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h2 className="font-bold text-lg text-foreground tracking-tight whitespace-nowrap">
              {t("component.lastest_feature.last")}
            </h2>
            <div className="flex flex-wrap gap-1.5 items-center">
              {renderFeature()}
            </div>
          </div>

          <div className="flex items-center">
            <Link
              href="/recently-post"
              className="inline-flex items-center text-muted-foreground hover:text-foreground text-xs font-semibold cursor-pointer group transition-colors"
            >
              <span>
                {t("component.lastest_feature.more")}
              </span>
              <ChevronRight className="ml-0.5 group-hover:translate-x-0.5 transition-transform" size={14} />
            </Link>
          </div>
        </div>

        {/* Main Featured Content */}
        {isLocalLoading ? (
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <MainFeatureSkeleton />
            <div className="w-full lg:w-1/5">
              <PostCardSkeleton />
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {allPosts.length > 0 && <MainFeature postData={allPosts[0]} />}
            <div className="w-full lg:w-1/5">
              {allPosts.length > 1 && <ArticleRightSide postData={allPosts[1]} />}
            </div>
          </div>
        )}

        {isLocalLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, idx) => (
              <PostCardSkeleton key={idx} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {allPosts.length > 2 ? (
              allPosts.slice(2, 7).map((data: PostInterface, index: number) => {
                return <Article key={index} postData={data} />;
              })
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
                {t("component.lastest_feature.noPosts") !== "component.lastest_feature.noPosts" ? t("component.lastest_feature.noPosts") : "No posts found."}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default LastestFeature;
