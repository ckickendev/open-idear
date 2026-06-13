"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import Sidebar from "@/components/profile/Sidebar";
import authenticationStore from "@/store/AuthenticationStore";
import { LoadingOverlay } from "@/components/composed/loading-overlay";
import loadingStore from "@/store/LoadingStore";

import { ProfileSkeleton, SidebarSkeleton } from "@/components/ui/Skeletons";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const isPublicProfile = !!params?.username;
  const [mounted, setMounted] = useState(false);

  const currentUser = authenticationStore((state) => state.currentUser);
  const isLoading = loadingStore((state) => state.isLoading);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("access_token");
    // If not logged in and trying to access a private dashboard route
    if (!token && !isPublicProfile) {
      router.push("/");
    }
  }, [router, isPublicProfile]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <ProfileSkeleton />
          <div className="flex gap-6 mt-2">
            <div className="w-64 flex-shrink-0">
              <SidebarSkeleton />
            </div>
            <div className="flex-1 space-y-6">
              <div className="h-10 bg-muted/40 rounded w-1/4 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 bg-card border border-border/40 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only block and show infinite loading if it's a private route and currentUser isn't loaded
  if (!currentUser?._id && !isPublicProfile) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <ProfileSkeleton />
          <div className="flex gap-6 mt-2">
            <div className="w-64 flex-shrink-0">
              <SidebarSkeleton />
            </div>
            <div className="flex-1 space-y-6">
              <div className="h-10 bg-muted/40 rounded w-1/4 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 bg-card border border-border/40 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <LoadingOverlay isLoading={isLoading} mode="fullscreen" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header (cover + avatar) */}
        <ProfileHeader />

        {/* Main Content Area */}
        <div className="flex gap-6 mt-2">
          {/* Sidebar Navigation */}
          <Sidebar />

          {/* Page Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
