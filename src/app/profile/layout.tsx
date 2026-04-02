'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileHeader from '@/components/profile/ProfileHeader';
import Sidebar from '@/components/profile/Sidebar';
import authenticationStore from '@/store/AuthenticationStore';
import Notification from '@/components/common/Notification';
import LoadingComponent from '@/components/common/Loading';
import loadingStore from '@/store/LoadingStore';

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const currentUser = authenticationStore((state) => state.currentUser);
    const isLoading = loadingStore((state) => state.isLoading);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/');
        }
    }, [router]);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!currentUser?._id) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <LoadingComponent isLoading={isLoading} isFullScreen={true} />
            <Notification />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Profile Header (cover + avatar) */}
                <ProfileHeader />

                {/* Main Content Area */}
                <div className="flex gap-6 mt-2">
                    {/* Sidebar Navigation */}
                    <Sidebar />

                    {/* Page Content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
