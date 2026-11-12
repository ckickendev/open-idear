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
import { serverFetch } from "@/lib/api/serverFetch";

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

export default async function Home() {
  const [recentlyRes, hotPostsRes, recentCoursesRes, hotSeriesRes, discoveryRes] =
    await Promise.allSettled([
      serverFetch<any>("/post/getRecentlyData?locale=en", {
        tags: ["feed-home", "posts", "categories"],
        revalidate: 1800,
        timeoutMs: 8000,
      }),
      serverFetch<any>("/post/getHotPostsWeek?limit=10&page=1&locale=en", {
        tags: ["feed-home", "posts"],
        revalidate: 1800,
        timeoutMs: 8000,
      }),
      serverFetch<any>("/course?limit=10&sort=-createdAt", {
        tags: ["feed-home", "courses"],
        revalidate: 1800,
        timeoutMs: 8000,
      }),
      serverFetch<any>("/series/getHotSeries", {
        tags: ["feed-home", "series"],
        revalidate: 1800,
        timeoutMs: 8000,
      }),
      serverFetch<any>("/post/getDiscoverySidebar?locale=en", {
        tags: ["feed-home", "discovery"],
        revalidate: 1800,
        timeoutMs: 8000,
      }),
    ]);

  const recentlyData =
    recentlyRes.status === "fulfilled" && recentlyRes.value.data
      ? recentlyRes.value.data
      : undefined;

  const hotPosts =
    hotPostsRes.status === "fulfilled" && hotPostsRes.value.data
      ? (hotPostsRes.value.data.posts || (Array.isArray(hotPostsRes.value.data) ? hotPostsRes.value.data : undefined))
      : undefined;

  const recentCourses =
    recentCoursesRes.status === "fulfilled" && recentCoursesRes.value.data
      ? (recentCoursesRes.value.data.data || recentCoursesRes.value.data.courses)
      : undefined;

  const hotSeries =
    hotSeriesRes.status === "fulfilled" && hotSeriesRes.value.data?.series
      ? hotSeriesRes.value.data.series
      : undefined;

  const discoveryData =
    discoveryRes.status === "fulfilled" && discoveryRes.value.data?.success
      ? {
          trending: discoveryRes.value.data.trending || [],
          latestPosts: discoveryRes.value.data.latestPosts || [],
          popularSeries: discoveryRes.value.data.popularSeries || [],
          featuredCourses: discoveryRes.value.data.featuredCourses || [],
        }
      : undefined;

  return (
    <HomePageClient>
      <ArticleLocaleSync activeLocale="en" />
      <Banner />
      <div className="max-w-screen-xl mx-auto w-full px-4 py-6">
        <div className="flex gap-8 items-start">
          {/* ── Main Content ─────────────────────────── */}
          <main className="flex-1 min-w-0 flex flex-col gap-6">
            <ContinueReadingSection />
            <LastestFeature initialData={recentlyData} />
            <HotPost initialArticles={hotPosts} />
            <RecentCourses initialCourses={recentCourses} />
            <HotSeries initialSeries={hotSeries} />
          </main>

          {/* ── Discovery Sidebar ─────────────────────── */}
          <DiscoverySidebar initialData={discoveryData} />
        </div>
      </div>
    </HomePageClient>
  );
}
