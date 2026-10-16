import Banner from "@/components/Banner";
import HotSeries from "@/features/series/components/hot_series/HotSeries";
import HotPost from "@/features/ideas/components/hot_post/HotPost";
import LastestFeature from "@/features/ideas/components/recently_post/LastestFeature";
import RecentCourses from "@/features/series/components/recent_courses/RecentCourses";
import DiscoverySidebar from "@/components/DiscoverySidebar";
import { ContinueReadingSection } from "@/features/reading";
import { Metadata } from "next";
import HomePageClient from "./HomePageClient";
import ArticleLocaleSync from "@/components/ArticleLocaleSync";
import { getSiteUrl } from "@/features/seo/metadata/buildPostMetadata";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  return {
    title: "OpenIdeaR",
    description: "openidear - a platform to share and explore ideas",
    alternates: {
      canonical: siteUrl,
      languages: {
        en: siteUrl,
        vi: `${siteUrl}/vi`,
        "x-default": siteUrl,
      },
    },
    openGraph: {
      title: "OpenIdeaR",
      description: "openidear - a platform to share and explore ideas",
      url: siteUrl,
      locale: "en_US",
      alternateLocale: ["vi_VN"],
    },
  };
}

export default function Home() {
  return (
    <HomePageClient>
      <ArticleLocaleSync activeLocale="en" />
      <Banner />
      <div className="max-w-screen-xl mx-auto w-full px-4 py-6">
        <div className="flex gap-8 items-start">
          {/* ── Main Content ─────────────────────────── */}
          <main className="flex-1 min-w-0 flex flex-col gap-6">
            <ContinueReadingSection />
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

