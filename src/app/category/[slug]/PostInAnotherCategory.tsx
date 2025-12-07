'use client';

import axios from "axios";
import { useEffect, useState } from "react";

const PostInAnotherCategory = ({ slug }: { slug: string }) => {

    const moreArticles = [
        {
            category: 'ENVIRONMENT',
            title: 'Farmers in Brazil are restoring biodiversity to grow more resilient crops',
            image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=500&fit=crop'
        },
        {
            category: 'ENVIRONMENT',
            title: 'The ten states obesities—and how to fight them',
            image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=500&fit=crop'
        },
        {
            category: 'ENVIRONMENT',
            title: "Why are Alaska's rivers turning bright orange?",
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop'
        },
        {
            category: 'ENVIRONMENT',
            title: "Why hurricanes are getting more powerful—even deadly",
            image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop'
        },
    ];

    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {

            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category/getPostsInAnotherCategorySlug/${slug}/4`
                );
                console.log("Fetched posts another data:", res.data);
                setData(res.data.posts);
            } catch (error) {
                console.error("Error fetching posts:", error);
                throw new Error(`Failed to fetch posts for category slug: ${slug}`);
            }
        };
        fetchData();
    }, []);

    return <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">ANOTHER</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((article, idx) => (
                <a key={idx} className="group cursor-pointer" href={`/post/${article.slug}`}>
                    <div className="relative overflow-hidden rounded-lg mb-3">
                        <img
                            src={article?.image?.url || "idea.jpg"}
                            alt={article?.image?.description || article.title}
                            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <span className="text-yellow-400 text-xs font-semibold">{article?.category?.name || "UNKNOWN"}</span>
                            <h3 className="text-white text-xl font-bold mt-2">{article?.title || "No Title"}</h3>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    </div>
}

export default PostInAnotherCategory;