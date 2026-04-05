'use client';
import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { courseApi } from '@/features/series/api/course.api';
import CourseCard, { CourseCardData } from '@/components/profile/CourseCard';
import SkeletonCard from '@/components/profile/SkeletonCard';
import EmptyState from '@/components/profile/EmptyState';

type TabKey = 'enrolled' | 'created';

export default function ProfileCoursesPage() {
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get('tab') as TabKey) || 'enrolled';
    const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
    const [createdCourses, setCreatedCourses] = useState<CourseCardData[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<CourseCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [transitioning, setTransitioning] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const [createdRes, enrolledRes] = await Promise.all([
                    courseApi.getCoursesByUser(),
                    courseApi.getEnrolledCourses(),
                ]);
                if (createdRes.success) setCreatedCourses(createdRes.data.courses || []);
                if (enrolledRes.success) setEnrolledCourses(enrolledRes.data.courses || []);
            } catch (error) {
                console.error('Failed to fetch courses', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleTabChange = (tab: TabKey) => {
        if (tab === activeTab) return;
        setTransitioning(true);
        setTimeout(() => {
            setActiveTab(tab);
            setTransitioning(false);
        }, 150);
    };

    const currentCourses = activeTab === 'enrolled' ? enrolledCourses : createdCourses;

    const tabs: { key: TabKey; label: string; count: number }[] = [
        { key: 'enrolled', label: 'Enrolled', count: enrolledCourses.length },
        { key: 'created', label: 'Created', count: createdCourses.length },
    ];

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen size={24} className="text-indigo-600 dark:text-indigo-400" />
                    My Courses
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage your enrolled and created courses
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, i) => (
                            <SkeletonCard key={i} variant="course" />
                        ))}
                    </div>
                ) : currentCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {currentCourses.map((course) => (
                            <CourseCard
                                key={course._id}
                                course={course}
                                variant={activeTab}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <EmptyState type="courses" />
                    </div>
                )}
            </div>
        </div>
    );
}
