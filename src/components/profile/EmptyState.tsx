'use client';
import React from 'react';
import Link from 'next/link';
import { Bookmark, BookOpen, BarChart3, FileText } from 'lucide-react';

interface EmptyStateProps {
    type: 'courses' | 'saved' | 'analytics' | 'posts' | 'general';
    title?: string;
    description?: string;
    ctaText?: string;
    ctaHref?: string;
}

const iconMap = {
    courses: BookOpen,
    saved: Bookmark,
    analytics: BarChart3,
    posts: FileText,
    general: BookOpen,
};

const EmptyState: React.FC<EmptyStateProps> = ({
    type,
    title,
    description,
    ctaText,
    ctaHref,
}) => {
    const Icon = iconMap[type];

    const defaults: Record<string, { title: string; description: string; ctaText: string; ctaHref: string }> = {
        courses: {
            title: 'No courses yet',
            description: 'You haven\'t enrolled in any courses. Start exploring to find something you love!',
            ctaText: 'Browse Courses',
            ctaHref: '/courses',
        },
        saved: {
            title: 'Nothing saved yet',
            description: 'Bookmark posts, series, or courses to easily find them later.',
            ctaText: 'Explore Content',
            ctaHref: '/',
        },
        analytics: {
            title: 'No data available',
            description: 'Create and publish courses to start seeing your analytics here.',
            ctaText: 'Create a Course',
            ctaHref: '/management/my-courses',
        },
        posts: {
            title: 'No posts yet',
            description: 'You haven\'t written any posts. Share your knowledge with the community!',
            ctaText: 'Write a Post',
            ctaHref: '/create',
        },
        general: {
            title: 'Nothing here yet',
            description: 'This section is empty. Check back later!',
            ctaText: 'Go Home',
            ctaHref: '/',
        },
    };

    const d = defaults[type];

    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mb-6 shadow-inner">
                <Icon className="text-gray-400 dark:text-gray-500" size={36} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {title || d.title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6 text-sm leading-relaxed">
                {description || d.description}
            </p>
            {(ctaHref || d.ctaHref) && (
                <Link
                    href={ctaHref || d.ctaHref}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors duration-200 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30"
                >
                    {ctaText || d.ctaText}
                </Link>
            )}
        </div>
    );
};

export default EmptyState;
