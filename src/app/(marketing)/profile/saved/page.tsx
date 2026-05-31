"use client";
import React, { useEffect, useState } from "react";
import { Bookmark, FileText, Layers } from "lucide-react";
import axios from "axios";
import authenticationStore from "@/store/AuthenticationStore";
import { toast } from "sonner";
import PostElement from "../PostElement";
import SeriesElement from "../SeriesElement";
import { PostInterface } from "../[username]/page";
import SkeletonCard from "@/components/profile/SkeletonCard";
import EmptyState from "@/components/profile/EmptyState";

type TabKey = "posts" | "series";

export default function ProfileSavedPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("posts");
  const [markedPosts, setMarkedPosts] = useState<PostInterface[]>([]);
  const [markedSeries, setMarkedSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  const currentUser = authenticationStore((state) => state.currentUser);

  useEffect(() => {
    const fetchSaved = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const [postsRes, seriesRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getMarkedByUser?profileId=${currentUser._id}`,
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/series/getMarkedByUser?profileId=${currentUser._id}`,
          ),
        ]);

        if (postsRes.status === 200)
          setMarkedPosts(postsRes.data.markedPost || []);
        if (seriesRes.status === 200)
          setMarkedSeries(seriesRes.data.markedSeries || []);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to load saved items",
        );
      } finally {
        setLoading(false);
      }
    };

    if (currentUser._id) fetchSaved();
  }, [currentUser._id]);

  const handleTabChange = (tab: TabKey) => {
    if (tab === activeTab) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTransitioning(false);
    }, 150);
  };

  const tabs: {
    key: TabKey;
    label: string;
    count: number;
    icon: React.ReactNode;
  }[] = [
    {
      key: "posts",
      label: "Posts",
      count: markedPosts.length,
      icon: <FileText size={16} />,
    },
    {
      key: "series",
      label: "Series",
      count: markedSeries.length,
      icon: <Layers size={16} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground dark:text-white flex items-center gap-2">
          <Bookmark
            size={24}
            className="text-indigo-600 dark:text-indigo-400"
          />
          Saved Items
        </h1>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
          Your bookmarked posts and series
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-background dark:bg-card rounded-2xl border border-border dark:border-border p-1.5 inline-flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30"
                : "text-muted-foreground dark:text-muted-foreground hover:bg-muted/30 dark:hover:bg-accent/50 hover:text-foreground/80 dark:hover:text-muted-foreground/70"
            }`}
          >
            {tab.icon}
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key
                  ? "bg-indigo-500 text-white"
                  : "bg-muted dark:bg-accent text-muted-foreground dark:text-muted-foreground"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        className={`transition-opacity duration-150 ${transitioning ? "opacity-0" : "opacity-100"}`}
      >
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} variant="post" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "posts" ? (
              markedPosts.length > 0 ? (
                markedPosts.map((post) => (
                  <PostElement key={post._id} post={post} />
                ))
              ) : (
                <div className="bg-background dark:bg-card rounded-2xl border border-border dark:border-border">
                  <EmptyState
                    type="saved"
                    title="No saved posts"
                    description="Bookmark posts you want to read later"
                  />
                </div>
              )
            ) : markedSeries.length > 0 ? (
              markedSeries.map((series) => (
                <SeriesElement key={series._id} series={series} />
              ))
            ) : (
              <div className="bg-background dark:bg-card rounded-2xl border border-border dark:border-border">
                <EmptyState
                  type="saved"
                  title="No saved series"
                  description="Bookmark series you want to follow"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
