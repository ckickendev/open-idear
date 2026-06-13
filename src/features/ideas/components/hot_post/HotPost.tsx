"use client";

import { ENV } from "@/api/const";
import React, { use, useEffect } from "react";
import { Clock, Bookmark, User, CheckCircle } from "lucide-react";
import { useTranslation } from "@/app/hook/useTranslation";
import axios from "axios";
import convertDate from "@/common/datetime";
import Image from "next/image";
import Link from "next/link";
import { UserLinkCustom } from "@/components/common/LinkCustom";

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

  useEffect(() => {
    // Fetch all posts from the server
    const fetchHotPost = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          const res = await axios.get(
            `${ENV.ROOT_API}/post/getHotPostsWeek?limit=10&page=1`,
          );
          if (res.status === 200) {
            console.log("res.data.hotpost: ", res.data.posts);
            setArticles(res.data.posts);
          }
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchHotPost();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-xl text-foreground mr-6">
          {t("component.hotPost.title")}
        </h2>
        <div className="border-b-4 border-blue-500 w-12 absolute mt-10"></div>
        <Link
          href={"/top10ideas"}
          className="text-muted-foreground hover:text-foreground text-sm cursor-pointer hover:underline"
        >
          {t("component.hotPost.moreDes")}
        </Link>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {articles.slice(0, 4).map((article) => {
          const minutesRead = article.readtime
            ? (typeof article.readtime === "string" ? parseInt(article.readtime, 10) : article.readtime)
            : Math.max(1, Math.ceil((article.text || "").split(/\s+/).length / 200)) || 5;

          return (
            <div
              key={article._id}
              className="flex flex-col bg-background rounded-xl overflow-hidden h-full group border border-border/50 pb-4 hover:shadow-md transition-all duration-300"
            >
              <Link
                href={`/post/${article.slug}`}
                className="block relative aspect-[16/10] w-full bg-muted rounded-t-xl overflow-hidden mb-3"
              >
                <Image
                  src={article.image?.url || "/banner/banner_standard.png"}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>

              <div className="flex flex-1 flex-col px-3">
                <Link href={`/post/${article.slug}`} className="block">
                  <h3 className="font-bold text-sm leading-snug text-foreground hover:text-blue-600 transition-colors line-clamp-2 mb-1 hover:underline">
                    {article.title}
                  </h3>
                </Link>

                {article.text && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                    {article.text}
                  </p>
                )}

                <div className="flex items-center text-[11px] text-muted-foreground/80 mt-auto font-medium">
                  <UserLinkCustom
                    className="hover:underline text-muted-foreground hover:text-foreground cursor-pointer"
                    username={article.author?.username}
                    name={article.author?.username || article.author?.name || "Unknown"}
                  />
                  <span className="mx-1.5 text-muted-foreground/50">•</span>
                  <span>{minutesRead} phút đọc</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HotPost;
