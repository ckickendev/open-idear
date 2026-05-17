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

    // Dynamic greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {greeting}, {currentUser.name || String(currentUser.username) || 'there'}! 👋
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
                </div>
            )}

            {/* Activity Heatmap */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Activity Heatmap</h2>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {/* Mock 30-day heatmap data */}
                    {Array.from({ length: 30 }).map((_, i) => {
                        // Mock random intensity
                        const intensity = [
                            'bg-gray-100 dark:bg-gray-700',
                            'bg-indigo-200 dark:bg-indigo-900/40',
                            'bg-indigo-400 dark:bg-indigo-700',
                            'bg-indigo-600 dark:bg-indigo-500',
                        ][Math.floor(Math.random() * 4)];
                        
                        return (
                            <div 
                                key={i} 
                                className={`w-6 h-6 rounded-md flex-shrink-0 transition-all hover:scale-110 cursor-pointer ${intensity}`}
                                title={`Day ${i + 1}`}
                            />
                        );
                    })}
                </div>
            </div>

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
                                className="relative group flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-800 overflow-hidden"
                            >
                                {/* Ambient Glass Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                                
                                <div className="w-24 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 shadow-inner">
                                    {course.thumbnail?.url ? (
                                        <img
                                            src={course.thumbnail.url}
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen
                                                size={20}
                                                className="text-gray-300 dark:text-gray-600 transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {course.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">
                                            <Clock size={12} className="text-gray-500" />
                                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                In Progress
                                            </span>
                                        </div>
                                        {/* Mock Circular Progress Indicator using conic-gradient */}
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'conic-gradient(#6366f1 60%, #e5e7eb 0)' }}>
                                                <div className="w-3 h-3 bg-white dark:bg-gray-800 rounded-full" />
                                            </div>
                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">60%</span>
                                        </div>
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
                            className="group relative flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-indigo-900/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                            {/* Subtle background glow on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                            
                            <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                            >
                                {action.icon}
                            </div>
                            <div className="relative z-10">
                                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-blue-600 dark:group-hover:from-indigo-400 dark:group-hover:to-blue-400 transition-all duration-300">
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
