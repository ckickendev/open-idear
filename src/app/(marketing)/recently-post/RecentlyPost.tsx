"use client";

import { ENV } from "@/api/const";
import PostDisplayPageElement from "@/components/PostDisplayPageElement";
import axios from "axios";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchResultSkeleton } from "@/components/ui/Skeletons";
import { useLanguageStore } from "@/store/useLanguage";

interface RecentlyPostProps {
  locale?: "en" | "vi";
}

const RecentlyPost: React.FC<RecentlyPostProps> = ({ locale }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const storeLang = useLanguageStore((state) => state.lang);

  const activeLocale: "en" | "vi" = locale || (pathname?.startsWith("/vi") ? "vi" : (storeLang === "vi" ? "vi" : "en"));
  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `${ENV.ROOT_API}/post/getAllPosts?limit=6&page=${currentPage}&locale=${activeLocale}`,
        );

        if (!isMounted) return;
        setData(res.data?.posts || []);
        setTotalPage(Math.ceil((res.data?.countData || 0) / 6) || 1);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [currentPage, activeLocale]);

  const heading = activeLocale === "vi" ? "Bài viết mới nhất" : "Recently posted";

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">{heading}</h2>
        <div className="w-full md:w-4/5 space-y-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SearchResultSkeleton key={idx} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-10">{heading}</h2>
      <PostDisplayPageElement data={data} totalPage={totalPage} locale={activeLocale} />
    </div>
  );
};

export default RecentlyPost;
