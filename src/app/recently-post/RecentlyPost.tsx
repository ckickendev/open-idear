'use client';

import Category from "@/app/management/Category";
import { CategoryLinkCustom, PostLinkCustom } from "@/component/common/LinkCustom";
import { PaginationComponent } from "@/component/common/PaginationComponent";
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
        <div className="space-y-8 flex flex-col justify-between md:flex-row md:space-y-0 md:space-x-8">
            <div className='w-4/5 space-y-4'>
                {data.map((article, idx) => (
                    <div key={idx} className={'grid md:grid-cols-5 gap-y-4 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow'}>
                        <a href={`/post/${article?.slug}`} className={'md:col-span-2'}>
                            <img
                                src={article?.image?.url || '/default-post-image.jpg'}
                                alt={article?.image?.description || article.title}
                                className="w-full h-full max-h-60 object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </a>
                        <div className={`p-6 flex flex-col justify-center md:col-span-3`}>
                            <CategoryLinkCustom className="text-yellow-600 text-xs font-semibold mb-2"
                                slug={article?.category?.slug}
                                name={article?.category?.name || 'Uncategorized'}
                            />
                            <PostLinkCustom className={'text-2xl font-bold mb-4 hover:underline line-clamp-2'}
                                slug={article?.slug}
                                name={article?.title}
                            />
                            <p className="text-gray-600 line-clamp-2 ">{article?.description}</p>
                        </div>
                    </div>
                ))}

                <PaginationComponent pageCount={totalPage} />
            </div>
        </div>
    </div>;
}

export default RecentlyPost;