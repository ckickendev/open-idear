"use client";

import { ENV } from "@/api/const";
import PostDisplayPageElement from "@/components/PostDisplayPageElement";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchResultSkeleton } from "@/components/ui/Skeletons";

const RecentlyPost = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `${ENV.ROOT_API}/post/getAllPosts?limit=6&page=${currentPage}`,
        );
        console.log("res data fetch data page", res.data);

        setData(res.data.posts);
        setTotalPage(Math.ceil(res.data.countData / 6));
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Recently posted</h2>
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
      <h2 className="text-3xl font-bold text-center mb-10">Recently posted</h2>
      <PostDisplayPageElement data={data} totalPage={totalPage} />
    </div>
  );
};

export default RecentlyPost;
