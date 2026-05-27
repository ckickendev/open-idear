'use client';
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { SquarePen, BookOpen, Clock } from 'lucide-react';
import axios from 'axios';
import { getHeadersToken } from '@/lib/api/axios';
import PostElement from '../PostElement';
import StatCard from '@/components/profile/StatCard';
import SkeletonCard from '@/components/profile/SkeletonCard';

// Define types
export interface PostInterface {
    _id: string;
    title: string;
    slug?: string;
    content?: string;
    text?: string;
    author: any;
    category: {
        name: string;
        slug: string;
    };
    published?: boolean;
    readtime: string;
    image: any;
    marked: [any];
    createdAt: string;
}

export default function PublicProfileOverview({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = use(params);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<PostInterface[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        const fetchPublicData = async () => {
            setLoading(true);
            try {
                const headers = getHeadersToken();

                // Fetch user profile by username
                const profileRes = await axios.get(
                    `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/auth/getProfileByUsername?username=${username}`,
                    { headers }
                );

                if (profileRes.status === 200) {
                    const user = profileRes.data.userInfo;
                    setUserProfile(user);

                    // Fetch published posts by this author using the _id
                    const postsRes = await axios.get(
                        `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getPostByAuthor?profileId=${user._id}`,
                        { headers }
                    );

                    if (postsRes.status === 200) {
                        const allPosts = postsRes.data.posts || [];
                        // Only show published posts publicly
                        const publishedPosts = allPosts.filter((p: PostInterface) => p.published !== false);
                        setPosts(publishedPosts);
                    }
                }
            } catch (error) {
                console.error('Error fetching public profile details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchPublicData();
        }
    }, [username]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userProfile?.name || username}&apos;s Profile
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Check out what they have been sharing.
                </p>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                    <SkeletonCard variant="stat" />
                    <SkeletonCard variant="stat" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                    <StatCard
                        icon={<SquarePen size={20} />}
                        value={posts.length}
                        label="Published Posts"
                        accentColor="from-indigo-500 to-blue-500"
                    />
                    <StatCard
                        icon={<BookOpen size={20} />}
                        value={userProfile?.followers || 0}
                        label="Followers"
                        accentColor="from-emerald-500 to-teal-500"
                    />
                </div>
            )}

            {/* Posts Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Recent Posts
                        </h2>
                    </div>
                </div>
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {posts.map((post) => (
                            <PostElement post={post} key={post._id} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <SquarePen
                            size={36}
                            className="text-gray-300 dark:text-gray-600 mx-auto mb-3"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No posts published yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}