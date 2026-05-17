'use client';

import React, { useEffect, useState } from 'react';
import loadingStore from '@/store/LoadingStore';
import LoadingComponent from '@/components/common/Loading';

export default function HomePageClient({ children }: { children: React.ReactNode }) {
    const isLoadingStore = loadingStore(state => state.isLoading);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        // Show the loading animation globally when the main page first mounts.
        // It hides after a brief delay to ensure components finish rendering/fetching.
        const timer = setTimeout(() => {
            setIsInitialLoad(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    // Combine local initial load with global zustand load
    const showLoader = isInitialLoad || isLoadingStore;

    return (
        <div className="relative min-h-screen">
            {/* The global loading component covering the entire screen */}
            <LoadingComponent isLoading={showLoader} isFullScreen={true} />
            
            {/* Page content */}
            {children}
        </div>
    );
}
