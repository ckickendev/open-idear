import Banner from "@/components/Banner";
import HotSeries from "@/features/series/components/hot_series/HotSeries";
import HotPost from "@/features/ideas/components/hot_post/HotPost";
import LastestFeature from "@/features/ideas/components/recently_post/LastestFeature";
import RecentCourses from "@/features/series/components/recent_courses/RecentCourses";
import DiscoverySidebar from "@/components/DiscoverySidebar";
import { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "OpenIdeaR",
  description: "openidear - a platform to share and explore ideas",
};

export default function Home() {
  return (
    <HomePageClient>
      <Banner />
      <div className="max-w-screen-xl mx-auto w-full px-4 py-6">
        <div className="flex gap-8 items-start">
          {/* ── Main Content ─────────────────────────── */}
          <main className="flex-1 min-w-0 flex flex-col gap-6">
            <LastestFeature />
            <HotPost />
            <RecentCourses />
            <HotSeries />
          </main>

          {/* ── Discovery Sidebar ─────────────────────── */}
          <DiscoverySidebar />
        </div>
      </div>
    </HomePageClient>
  );
}

