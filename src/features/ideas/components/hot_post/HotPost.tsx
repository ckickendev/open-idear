"use client";

import { ENV } from "@/api/const";
import React, { useEffect } from "react";
import { useTranslation } from "@/app/hook/useTranslation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { UserLinkCustom } from "@/components/common/LinkCustom";
import { PostCardSkeleton } from "@/components/ui/Skeletons";

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
}

const HotPost: React.FC = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = React.useState<Post[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    // Fetch all posts from the server
    const fetchHotPost = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `${ENV.ROOT_API}/post/getHotPostsWeek?limit=10&page=1`,
        );
        if (res.status === 200) {
          console.log("res.data.hotpost: ", res.data.posts);
          setArticles(res.data.posts || []);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotPost();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
        <h2 className="font-bold text-lg text-foreground tracking-tight">
          {t("component.hotPost.title")}
        </h2>
        <Link
          href={"/top10ideas"}
          className="inline-flex items-center text-muted-foreground hover:text-foreground text-xs font-semibold cursor-pointer transition-colors"
        >
          {t("component.hotPost.moreDes")}
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <PostCardSkeleton key={idx} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.length > 0 ? (
            articles.slice(0, 4).map((article) => {
              const minutesRead = article.readtime
                ? (typeof article.readtime === "string" ? parseInt(article.readtime, 10) : article.readtime)
                : Math.max(1, Math.ceil((article.text || "").split(/\s+/).length / 200)) || 5;

              return (
                <div
                  key={article._id}
                  className="flex flex-col bg-card border border-border/50 hover:border-border rounded-xl p-3 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 ease-in-out group cursor-pointer h-full"
                >
                  <Link
                    href={`/post/${article.slug}`}
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
                    <Link href={`/post/${article.slug}`} className="block">
                      <h3 className="font-bold text-xs leading-snug text-foreground hover:text-primary transition-colors line-clamp-2 mb-1.5 hover:underline tracking-tight">
                        {article.title}
                      </h3>
                    </Link>

                    {article.text && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                        {article.text}
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
                        {minutesRead}{" "}
                        {t("component.lastest_feature.minRead") !== "component.lastest_feature.minRead"
                          ? t("component.lastest_feature.minRead")
                          : "min read"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground text-sm bg-card/10 border border-border/60 rounded-xl">
              {t("component.hotPost.noPosts") !== "component.hotPost.noPosts" ? t("component.hotPost.noPosts") : "No featured posts this week."}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HotPost;
