'use client';

import React, { use, useEffect } from "react";
import {
  Clock,
  Bookmark,
  User,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "@/app/hook/useTranslation";
import axios from "axios";
import convertDate from "@/common/datetime";
import Image from "next/image";

interface Post {
  _id: number;
  title: string;
  image: any;
  readtime: string;
  author: any;
  likes?: [any];
  slug: string;
  createdAt: string;
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
                    const res = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getHotPostsWeek?limit=10&page=1`);
                    if (res.status === 200) {
                      console.log('res.data.hotpost: ', res.data.posts);
                      setArticles(res.data.posts);
                    }
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchHotPost();
    }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-xl text-gray-800 mr-6">
          {t("component.hotPost.title")}
        </h2>
        <div className="border-b-4 border-blue-500 w-12 absolute mt-10"></div>
        <button className="text-gray-600 hover:text-gray-900 text-sm cursor-pointer hover:underline">
          {t("component.hotPost.moreDes")}
        </button>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {articles.slice(0, 4).map((article) => (
          <div
            key={article._id}
            className="flex flex-col bg-white rounded-lg overflow-hidden h-full"
          >
            <div className="relative h-40 w-full">
              {/* Next.js Image component would be used here with actual images */}
              <a href={`/post/${article.slug}`} className="block h-full">
                <div className="absolute inset-0 bg-gray-200 ">
                  <Image src={article.image?.url} alt={article.title} fill sizes="23vw" style={{ objectFit: "cover" }} />
                </div>
              </a>
            </div>

            <div className="flex flex-1 flex-col p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock size={14} className="mr-1" />
                  {article.readtime ? article.readtime + " min read" : "5 min read"}
                </span>
                <button className="text-gray-400 hover:text-gray-700 transition-colors focus:outline-none cursor-pointer">
                  <Bookmark size={18} />
                </button>
              </div>

              <a className="font-medium text-base mb-4 line-clamp-2 cursor-pointer hover:underline" href={`/post/${article.slug}`}>
                {article.title}
              </a>


              <div className="flex items-center mt-auto">
                <div className="h-8 w-8 rounded-full bg-gray-200 mr-2" />
                <div className="flex-1 justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium cursor-pointer hover:underline">
                      {article.author.name}
                    </span>
                    {article.author.verified && (
                      <CheckCircle size={14} className="ml-1 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{article.author.postedTime}</span>
                    <span className="flex items-center">
                      {convertDate(article.createdAt)} 
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotPost;
