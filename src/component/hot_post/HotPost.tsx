'use client';

import React from "react";
import {
  Clock,
  Bookmark,
  User,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "@/app/hook/useTranslation";

interface Author {
  name: string;
  verified?: boolean;
  postedTime: string;
  avatar: string;
}

interface Article {
  id: number;
  title: string;
  image: string;
  readingTime: string;
  author: Author;
  likes?: number;
}

const articles: Article[] = [
  {
    id: 1,
    title: "Sự Hỗn Loạn Của Nước Mỹ Dưới Thời Trump 2.0",
    image:
      "https://images.spiderum.com/sp-thumbnails/06be8810142911f09324374faab789d8.png",
    readingTime: "26 phút đọc",
    author: {
      name: "Huskywannafly",
      verified: true,
      postedTime: "1 Th4",
      avatar: "/avatars/author1.jpg",
    },
    likes: 598,
  },
  {
    id: 2,
    title: "Cuộc thi viết Rốt cuộc chúng ta là... cái quái...",
    image:
      "https://images.spiderum.com/sp-thumbnails/06be8810142911f09324374faab789d8.png",
    readingTime: "4 phút đọc",
    author: {
      name: "Spiderum Team",
      postedTime: "3 Th4",
      avatar: "/avatars/author2.jpg",
    },
  },
  {
    id: 3,
    title: "Sự kết thúc của toàn cầu hóa",
    image:
      "https://images.spiderum.com/sp-thumbnails/06be8810142911f09324374faab789d8.png",
    readingTime: "16 phút đọc",
    author: {
      name: "Victor Pham",
      verified: true,
      postedTime: "7 Th4",
      avatar: "/avatars/author3.jpg",
    },
  },
  {
    id: 4,
    title: "TÍNH NAM ĐỘC HẠI TRÊN MẠNG XÃ HỘI - KHI THẾ",
    image:
      "https://images.spiderum.com/sp-thumbnails/06be8810142911f09324374faab789d8.png",
    readingTime: "15 phút đọc",
    author: {
      name: "phucnt",
      postedTime: "30 Th3",
      avatar: "/avatars/author4.jpg",
    },
  },
];

const HotPost: React.FC = () => {
  const { t } = useTranslation();
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
        {articles.map((article) => (
          <div
            key={article.id}
            className="flex flex-col bg-white rounded-lg overflow-hidden h-full"
          >
            <div className="relative h-40 w-full">
              {/* Next.js Image component would be used here with actual images */}
              <div className="absolute inset-0 bg-gray-200">
                <img src={article.image} className="w-full" />
              </div>
            </div>

            <div className="flex flex-1 flex-col p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock size={14} className="mr-1" />
                  {article.readingTime}
                </span>
                <button className="text-gray-400 hover:text-gray-700">
                  <Bookmark size={18} />
                </button>
              </div>

              <h3 className="font-medium text-base mb-4 line-clamp-2 cursor-pointer hover:underline">
                {article.title}
              </h3>

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
                    {article.likes && (
                      <>
                        <span className="mx-1">•</span>
                        <span className="flex items-center">
                          {article.likes}N
                        </span>
                      </>
                    )}
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
