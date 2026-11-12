import Banner from "@/components/Banner";
import HotSeries from "@/features/series/components/hot_series/HotSeries";
import HotPost from "@/features/ideas/components/hot_post/HotPost";
import LastestFeature from "@/features/ideas/components/recently_post/LastestFeature";
import RecentCourses from "@/features/series/components/recent_courses/RecentCourses";
import DiscoverySidebar from "@/components/DiscoverySidebar";
import { ContinueReadingSection } from "@/features/reading";
import { Metadata } from "next";
import HomePageClient from "../HomePageClient";
import ArticleLocaleSync from "@/components/ArticleLocaleSync";
import { getSiteUrl } from "@/features/seo/metadata/buildPostMetadata";
import { serverFetch } from "@/lib/api/serverFetch";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  return {
    title: "OpenIdeaR — Nền tảng chia sẻ và khám phá ý tưởng công nghệ",
    description: "OpenIdear — Nền tảng công nghệ chia sẻ ý tưởng, khóa học, và tri thức.",
    alternates: {
      canonical: `${siteUrl}/vi`,
      languages: {
        en: siteUrl,
        vi: `${siteUrl}/vi`,
        "x-default": siteUrl,
      },
    },
    openGraph: {
      title: "OpenIdeaR — Nền tảng chia sẻ và khám phá ý tưởng công nghệ",
      description: "OpenIdear — Nền tảng công nghệ chia sẻ ý tưởng, khóa học, và tri thức.",
      url: `${siteUrl}/vi`,
      locale: "vi_VN",
      alternateLocale: ["en_US"],
    },
  };
}

export default async function ViHome() {
  const [recentlyRes, hotPostsRes, recentCoursesRes, hotSeriesRes, discoveryRes] =
    await Promise.allSettled([
      serverFetch<any>("/post/getRecentlyData?locale=vi", {
        tags: ["feed-home", "posts", "categories"],
        revalidate: 1800,
        timeoutMs: 8000,
      }),
      serverFetch<any>("/post/getHotPostsWeek?limit=10&page=1&locale=vi", {
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
      serverFetch<any>("/post/getDiscoverySidebar?locale=vi", {
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
      <ArticleLocaleSync activeLocale="vi" />
      <Banner />
      <div className="max-w-screen-xl mx-auto w-full px-4 py-6">
        <div className="flex gap-8 items-start">
          <main className="flex-1 min-w-0 flex flex-col gap-6">
            <ContinueReadingSection />
            <LastestFeature initialData={recentlyData} />
            <HotPost initialArticles={hotPosts} />
            <RecentCourses initialCourses={recentCourses} />
            <HotSeries initialSeries={hotSeries} />
          </main>
          <DiscoverySidebar initialData={discoveryData} />
        </div>
      </div>
    </HomePageClient>
  );
}
