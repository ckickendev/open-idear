'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    BarChart3,
    BookOpen,
    Users,
    DollarSign,
    TrendingUp,
    Eye,
} from 'lucide-react';
import authenticationStore from '@/store/AuthenticationStore';
import { courseApi } from '@/features/series/api/course.api';
import StatCard from '@/components/profile/StatCard';
import SkeletonCard from '@/components/profile/SkeletonCard';
import EmptyState from '@/components/profile/EmptyState';

interface CourseAnalytics {
    _id: string;
    title: string;
    status: string;
    students?: number;
}

export default function ProfileAnalyticsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<CourseAnalytics[]>([]);
    const [stats, setStats] = useState({
        totalCourses: 0,
        publishedCourses: 0,
        totalStudents: 0,
        estimatedRevenue: 0,
    });

    const currentUser = authenticationStore((state) => state.currentUser);
    const userRole = Number(currentUser.role);

    // Role gate: only instructor (1) and admin (2)
    useEffect(() => {
        if (currentUser._id && userRole === 0) {
            router.push('/profile');
        }
    }, [currentUser._id, userRole, router]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const res = await courseApi.getCoursesByUser();
                if (res.success) {
                    const allCourses = res.data.courses || [];
                    setCourses(allCourses);

                    const published = allCourses.filter((c: any) => c.status === 'published');
                    const totalStudents = allCourses.reduce(
                        (acc: number, c: any) => acc + (c.enrolledStudents?.length || c.students || 0),
                        0
                    );

                    setStats({
                        totalCourses: allCourses.length,
                        publishedCourses: published.length,
                        totalStudents,
                        estimatedRevenue: totalStudents * 29, // Placeholder
                    });
                }
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser._id && userRole > 0) {
            fetchAnalytics();
        }
    }, [currentUser._id, userRole]);

    if (userRole === 0) return null;

    // Simple bar chart component (CSS-only)
    const BarChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
        const max = Math.max(...data.map((d) => d.value), 1);
        return (
            <div className="flex items-end gap-3 h-40 mt-4">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {d.value}
                        </span>
                        <div
                            className={`w-full rounded-t-lg transition-all duration-500 ${d.color}`}
                            style={{
                                height: `${(d.value / max) * 100}%`,
                                minHeight: d.value > 0 ? '8px' : '2px',
                            }}
                        />
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight">
                            {d.label}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 size={24} className="text-indigo-600 dark:text-indigo-400" />
                    Analytics
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Track your teaching performance and reach
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
                        icon={<BookOpen size={20} />}
                        value={stats.totalCourses}
                        label="Total Courses"
                        accentColor="from-indigo-500 to-blue-500"
                    />
                    <StatCard
                        icon={<Eye size={20} />}
                        value={stats.publishedCourses}
                        label="Published"
                        accentColor="from-emerald-500 to-teal-500"
                    />
                    <StatCard
                        icon={<Users size={20} />}
                        value={stats.totalStudents}
                        label="Total Students"
                        accentColor="from-purple-500 to-pink-500"
                    />
                    <StatCard
                        icon={<DollarSign size={20} />}
                        value={`$${stats.estimatedRevenue.toLocaleString()}`}
                        label="Est. Revenue"
                        trend={{ value: 12, positive: true }}
                        accentColor="from-amber-500 to-orange-500"
                    />
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Course Status Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                        Course Status
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Distribution of your courses by status
                    </p>
                    {loading ? (
                        <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
                    ) : (
                        <BarChart
                            data={[
                                {
                                    label: 'Published',
                                    value: stats.publishedCourses,
                                    color: 'bg-emerald-500',
                                },
                                {
                                    label: 'Draft',
                                    value: stats.totalCourses - stats.publishedCourses,
                                    color: 'bg-amber-500',
                                },
                            ]}
                        />
                    )}
                </div>

                {/* Student Growth (Placeholder) */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                        Student Growth
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Monthly enrollment trends
                    </p>
                    {loading ? (
                        <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
                    ) : (
                        <BarChart
                            data={[
                                { label: 'Oct', value: Math.floor(stats.totalStudents * 0.3), color: 'bg-indigo-400' },
                                { label: 'Nov', value: Math.floor(stats.totalStudents * 0.5), color: 'bg-indigo-500' },
                                { label: 'Dec', value: Math.floor(stats.totalStudents * 0.65), color: 'bg-indigo-500' },
                                { label: 'Jan', value: Math.floor(stats.totalStudents * 0.8), color: 'bg-indigo-600' },
                                { label: 'Feb', value: Math.floor(stats.totalStudents * 0.9), color: 'bg-indigo-600' },
                                { label: 'Mar', value: stats.totalStudents, color: 'bg-indigo-700' },
                            ]}
                        />
                    )}
                </div>
            </div>

            {/* Course Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                        Your Courses
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Individual course performance
                    </p>
                </div>
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : courses.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                                        Course
                                    </th>
                                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                                        Status
                                    </th>
                                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                                        Students
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {courses.map((course) => (
                                    <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {course.title}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                                                    course.status === 'published'
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                        : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                                }`}
                                            >
                                                {course.status === 'published' ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {course.students || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState type="analytics" />
                )}
            </div>
        </div>
    );
}
