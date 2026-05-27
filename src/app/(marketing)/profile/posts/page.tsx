'use client';
import React, { useEffect, useState } from 'react';
import { SquarePen, FileText, Layers } from 'lucide-react';
import axios from 'axios';
import authenticationStore from '@/store/AuthenticationStore';
import { getHeadersToken } from '@/lib/api/axios';
import alertStore from '@/store/AlertStore';
import PostElement from '../PostElement';
import SeriesElement from '../SeriesElement';
import { PostInterface } from '../[username]/page';
import SkeletonCard from '@/components/profile/SkeletonCard';
import EmptyState from '@/components/profile/EmptyState';

type TabKey = 'posts' | 'series';

export default function ProfilePostsPage() {
    const [activeTab, setActiveTab] = useState<TabKey>('posts');
    const [posts, setPosts] = useState<PostInterface[]>([]);
    const [series, setSeries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [transitioning, setTransitioning] = useState(false);
    const [onDeleteSeriesing, setOnDeleteSeriesing] = useState(false);

    const currentUser = authenticationStore((state) => state.currentUser);
    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const headers = getHeadersToken();

                const [postsRes, seriesRes] = await Promise.all([
                    axios.get(
                        `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getPostByAuthor?profileId=${currentUser._id}`,
                        { headers }
                    ),
                    axios.get(
                        `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/series/getSeriesByAuthorId?profileId=${currentUser._id}`
                    ),
                ]);

                if (postsRes.status === 200) setPosts(postsRes.data.posts || []);
                if (seriesRes.status === 200) setSeries(seriesRes.data.series || []);
            } catch (error: any) {
                setType('error');
                setMessage(error?.response?.data?.message || 'Failed to load posts');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser._id) fetchData();
    }, [currentUser._id]);

    const handleTabChange = (tab: TabKey) => {
        if (tab === activeTab) return;
        setTransitioning(true);
        setTimeout(() => {
            setActiveTab(tab);
            setTransitioning(false);
        }, 150);
    };

    const deleteSeries = async (id: string) => {
        try {
            const response = await axios.delete(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/series/delete`, {
                data: { seriesId: id },
                headers: getHeadersToken()
            });

            if (response.status === 200) {
                setSeries(prev => prev.filter(s => s._id !== id));
                setType('success');
                setMessage('Series deleted successfully.');
                setOnDeleteSeriesing(false);
            } else {
                setType('error');
                setMessage('Failed to delete the series.');
            }
        } catch (error: any) {
            setType('error');
            setMessage(error?.response?.data?.message || 'An error occurred while deleting the series.');
        }
    };

    const tabs: { key: TabKey; label: string; count: number; icon: React.ReactNode }[] = [
        { key: 'posts', label: 'Posts', count: posts.length, icon: <FileText size={16} /> },
        { key: 'series', label: 'Series', count: series.length, icon: <Layers size={16} /> },
    ];

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <SquarePen size={24} className="text-indigo-600 dark:text-indigo-400" />
                    My Posts & Series
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    View and manage all your published content
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-1.5 inline-flex gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                            activeTab === tab.key
                                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                        <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                                activeTab === tab.key
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className={`transition-opacity duration-150 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <SkeletonCard key={i} variant="post" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeTab === 'posts' ? (
                            posts.length > 0 ? (
                                posts.map((post) => <PostElement key={post._id} post={post} />)
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <EmptyState type="posts" title="No posts yet" description="Start writing to share your ideas with the world" />
                                </div>
                            )
                        ) : series.length > 0 ? (
                            series.map((s) => (
                                <SeriesElement
                                    key={s._id}
                                    series={s}
                                    onDeleteSeriesing={onDeleteSeriesing}
                                    setOnDeleteSeriesing={setOnDeleteSeriesing}
                                    deleteSeries={deleteSeries}
                                />
                            ))
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <EmptyState type="series" title="No series yet" description="Create a series to organize your content" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
