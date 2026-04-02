'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    SquarePen,
    BookOpen,
    Bookmark,
    TrendingUp,
    Clock,
    ArrowRight,
    Zap,
} from 'lucide-react';
import authenticationStore from '@/store/AuthenticationStore';
import { courseApi } from '@/features/series/api/course.api';
import StatCard from '@/components/profile/StatCard';
import SkeletonCard from '@/components/profile/SkeletonCard';
import axios from 'axios';
import { getHeadersToken } from '@/lib/api/axios';

interface QuickAction {
    label: string;
    description: string;
    href: string;
    icon: React.ReactNode;
    color: string;
}

const quickActions: QuickAction[] = [
    {
        label: 'Write a Post',
        description: 'Share your ideas',
        href: '/create',
        icon: <SquarePen size={20} />,
        color: 'from-indigo-500 to-blue-500',
    },
    {
        label: 'Browse Courses',
        description: 'Discover new skills',
        href: '/courses',
        icon: <BookOpen size={20} />,
        color: 'from-purple-500 to-pink-500',
    },
    {
        label: 'My Bookmarks',
        description: 'View saved content',
        href: '/profile/saved',
        icon: <Bookmark size={20} />,
        color: 'from-amber-500 to-orange-500',
    },
];

export default function ProfileOverviewPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPosts: 0,
        enrolledCourses: 0,
        createdCourses: 0,
        bookmarks: 0,
    });
    const [recentCourses, setRecentCourses] = useState<any[]>([]);

    const currentUser = authenticationStore((state) => state.currentUser);

    useEffect(() => {
        const fetchOverview = async () => {
            setLoading(true);
            try {
                const headers = getHeadersToken();

                // Fetch posts count
                const postsRes = await axios.get(
                    `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getPostByAuthor?profileId=${currentUser._id}`,
                    { headers }
                );
                const totalPosts = postsRes.data?.posts?.length || 0;

                // Fetch bookmarks count
                const bookmarksRes = await axios.get(
                    `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getMarkedByUser?profileId=${currentUser._id}`,
                    { headers }
                );
                const bookmarks = bookmarksRes.data?.markedPost?.length || 0;

                // Fetch courses
                const [createdRes, enrolledRes] = await Promise.all([
                    courseApi.getCoursesByUser(),
                    courseApi.getEnrolledCourses(),
                ]);

                const createdCourses = createdRes.data?.courses?.length || 0;
                const enrolledCourses = enrolledRes.data?.courses?.length || 0;
                const recent = (enrolledRes.data?.courses || []).slice(0, 4);

                setStats({ totalPosts, enrolledCourses, createdCourses, bookmarks });
                setRecentCourses(recent);
            } catch (error) {
                console.error('Error fetching overview:', error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser._id) {
            fetchOverview();
        }
    }, [currentUser._id]);

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {currentUser.name || String(currentUser.username) || 'there'}! 👋
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Here&apos;s what&apos;s happening with your account today.
                </p>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <SkeletonCard key={i} variant="stat" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={<SquarePen size={20} />}
                        value={stats.totalPosts}
                        label="Total Posts"
                        accentColor="from-indigo-500 to-blue-500"
                    />
                    <StatCard
                        icon={<BookOpen size={20} />}
                        value={stats.enrolledCourses}
                        label="Enrolled Courses"
                        accentColor="from-emerald-500 to-teal-500"
                    />
                    <StatCard
                        icon={<TrendingUp size={20} />}
                        value={stats.createdCourses}
                        label="Courses Created"
                        accentColor="from-purple-500 to-pink-500"
                    />
                    <StatCard
                        icon={<Bookmark size={20} />}
                        value={stats.bookmarks}
                        label="Bookmarks"
                        accentColor="from-amber-500 to-orange-500"
                    />
                </div>
            )}

            {/* Recent Enrolled Courses */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Recently Enrolled
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Continue where you left off
                        </p>
                    </div>
                    <Link
                        href="/profile/courses"
                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                        View all <ArrowRight size={14} />
                    </Link>
                </div>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(2)].map((_, i) => (
                            <SkeletonCard key={i} variant="course" />
                        ))}
                    </div>
                ) : recentCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recentCourses.map((course: any) => (
                            <Link
                                key={course._id}
                                href={`/courses/${course._id}`}
                                className="group flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                            >
                                <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                                    {course.thumbnail?.url ? (
                                        <img
                                            src={course.thumbnail.url}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen
                                                size={20}
                                                className="text-gray-300 dark:text-gray-600"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {course.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock size={12} className="text-gray-400" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            In Progress
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1 mt-2">
                                        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-1 rounded-full w-0" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <BookOpen
                            size={36}
                            className="text-gray-300 dark:text-gray-600 mx-auto mb-3"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No enrolled courses yet.{' '}
                            <Link href="/courses" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                                Explore courses
                            </Link>
                        </p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-amber-500" /> Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.label}
                            href={action.href}
                            className="group flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <div
                                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}
                            >
                                {action.icon}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {action.label}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {action.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
