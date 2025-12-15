'use client';

import PostDisplayPageElement from "@/component/PostDisplayPageElement";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const RecentlyPost = () => {
    const [data, setData] = useState<any[]>([]);
    const [totalPage, setTotalPage] = useState<number>(1);
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get("page")) || 1;

    useEffect(() => {
        const fetchData = async () => {

            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getAllPosts?limit=6&page=${currentPage}`,
                );
                console.log('res data fetch data page', res.data);

                setData(res.data.posts);
                setTotalPage(Math.ceil(res.data.countData / 6));
            } catch (error) {
                console.error("Error fetching posts:", error);
                throw new Error(`Failed to fetch posts : ${error}`);
            }
        };
        fetchData();
    }, [currentPage]);

    return <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Recently posted</h2>
        <PostDisplayPageElement data={data} totalPage={totalPage} />
    </div>;
}

export default RecentlyPost;