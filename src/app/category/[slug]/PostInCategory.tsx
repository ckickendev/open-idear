'use client';

import { PaginationComponent } from "@/component/common/PaginationComponent";
import axios from "axios";
import { Menu } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PostInCategory = ({ allCategory, slug, totalPage }: { allCategory: any[], slug: string, totalPage: number }) => {
    const ArticleCard = ({ image, title, size = 'normal', category = 'ANIMALS' }: { image: string; title: string; size?: string; category?: string }) => {
        return (
            <div className={`relative overflow-hidden rounded-lg group cursor-pointer ${size === 'large' ? 'col-span-2 row-span-2' : ''
                }`}>
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <p className="text-xs font-semibold tracking-widest mb-3">{category}</p>
                        <h2 className={`font-bold leading-tight mb-4 ${size === 'large' ? 'text-4xl' : 'text-2xl'
                            }`}>
                            {title}
                        </h2>
                        <button className="flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all">
                            <Menu size={16} />
                            READ
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const [data, setData] = useState<any[]>([]);
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get("page")) || 1;

    useEffect(() => {
        const fetchData = async () => {

            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category/getPostsByCategorySlug/${slug}/${currentPage}`
                );
                setData(res.data.posts);
            } catch (error) {
                console.error("Error fetching posts:", error);
                throw new Error(`Failed to fetch posts for category slug: ${slug}`);
            }
        };
        fetchData();
    }, [currentPage]);

    return <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">ON CATEGORY</h2>
        <div className="space-y-8 flex flex-col justify-between md:flex-row md:space-y-0 md:space-x-8">
            <div className='w-4/5 space-y-4'>
                {data.map((article, idx) => (
                    <div key={idx} className={'grid md:grid-cols-5 gap-y-4 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow'}>
                        <a href={`/post/${article.slug}`} className={'md:col-span-2'}>
                            <img
                                src={article?.image?.url}
                                alt={article?.image?.description || article.title}
                                className="w-full h-full max-h-60 object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </a>
                        <div className={`p-6 flex flex-col justify-center md:col-span-3`}>
                            <span className="text-yellow-600 text-xs font-semibold mb-2">{article?.category?.name}</span>
                            <a href={`/post/${article.slug}`}>
                                <h3 className="text-2xl font-bold mb-3">{article?.title}</h3>
                            </a>
                            <p className="text-gray-600 line-clamp-2 ">{article?.description}</p>
                        </div>
                    </div>
                ))}
                <PaginationComponent pageCount={totalPage} />
            </div>
            <div className='w-1/5'>
                <h2 className="text-sm font-bold text-left mb-10">KEYWORDS</h2>
                {allCategory.map((cat: any, idx: number) => (
                    <div key={idx} className="mb-6">
                        <a href={`/category/${cat.slug}`} className="text-heading bg-gradient-to-r from-gray-200 to-green-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-base text-sm px-4 py-2.5 leading-5 mb-2 mr-2">
                            {cat.name}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    </div>;
}

export default PostInCategory;