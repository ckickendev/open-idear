"use client";

// =============================================================================
//  READING STATS CARD (PROFILE PAGE)
//  src/features/reading/components/ReadingStatsCard.tsx
//
//  Design Decisions:
//  - Displays user's reading telemetry on the Profile Overview.
//  - Tracks:
//    * Articles Completed
//    * Hours Read
//    * Current Reading Streak (architected for daily engagement)
//  - Consistent with OpenIdear's StatCard aesthetics and Linear/Notion styling.
// =============================================================================

import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, Flame, BookOpen } from "lucide-react";
import authenticationStore from "@/store/AuthenticationStore";
import { readingApi } from "../api/reading.api";
import type { ReadingStats } from "../types/reading.types";
import StatCard from "@/components/profile/StatCard";
import SkeletonCard from "@/components/profile/SkeletonCard";

export default function ReadingStatsCard() {
  const [stats, setStats] = useState<ReadingStats>({
    completedArticles: 0,
    hoursRead: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = authenticationStore((state) => state.currentUser);

  useEffect(() => {
    if (!currentUser?._id) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    readingApi
      .getReadingStats()
      .then((data) => {
        if (isMounted) {
          setStats(data);
        }
      })
      .catch((err) => {
        console.error("Error loading reading stats:", err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser?._id]);

  if (!currentUser?._id) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <BookOpen size={16} />
          </div>
          <h2 className="text-lg font-bold text-foreground dark:text-white">
            Reading Activity & Insights
          </h2>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} variant="stat" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<CheckCircle2 size={20} />}
            value={stats.completedArticles}
            label="Articles Completed"
            accentColor="from-emerald-500 to-teal-500"
          />
          <StatCard
            icon={<Clock size={20} />}
            value={`${stats.hoursRead}h`}
            label="Hours Read"
            accentColor="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<Flame size={20} />}
            value={`${stats.currentStreak} ${stats.currentStreak === 1 ? "day" : "days"}`}
            label="Reading Streak"
            accentColor="from-amber-500 to-orange-500"
          />
        </div>
      )}
    </div>
  );
}
