"use client";

import React, { useEffect, useState } from "react";
import loadingStore from "@/store/LoadingStore";
import { LoadingOverlay } from "@/components/composed/loading-overlay";

export default function HomePageClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoadingStore = loadingStore((state) => state.isLoading);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const showLoader = isInitialLoad || isLoadingStore;

  return (
    <div className="relative min-h-screen">
      <LoadingOverlay isLoading={showLoader} mode="fullscreen" />
      {children}
    </div>
  );
}
