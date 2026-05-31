import Banner from "@/components/Banner";
import HotSeries from "@/features/series/components/hot_series/HotSeries";
import HotPost from "@/features/ideas/components/hot_post/HotPost";
import LastestFeature from "@/features/ideas/components/recently_post/LastestFeature";
import RecentCourses from "@/features/series/components/recent_courses/RecentCourses";
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
      <div className="flex items-center justify-items-center font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col flex-nowrap items-center gap-4 max-w-screen-xl mx-auto w-full row-start-2 items-center sm:items-start">
          <LastestFeature />
          <HotPost />
          <RecentCourses />
          <HotSeries />
        </main>
      </div>
    </HomePageClient>
  );
}
