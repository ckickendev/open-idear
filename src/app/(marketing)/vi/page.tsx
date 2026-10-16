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

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  return {
    title: "OpenIdear — Nền tảng chia sẻ và khám phá ý tưởng công nghệ",
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
      title: "OpenIdear — Nền tảng chia sẻ và khám phá ý tưởng công nghệ",
      description: "OpenIdear — Nền tảng công nghệ chia sẻ ý tưởng, khóa học, và tri thức.",
      url: `${siteUrl}/vi`,
      locale: "vi_VN",
      alternateLocale: ["en_US"],
    },
  };
}

export default function ViHome() {
  return (
    <HomePageClient>
      <ArticleLocaleSync activeLocale="vi" />
      <Banner />
      <div className="max-w-screen-xl mx-auto w-full px-4 py-6">
        <div className="flex gap-8 items-start">
          <main className="flex-1 min-w-0 flex flex-col gap-6">
            <ContinueReadingSection />
            <LastestFeature />
            <HotPost />
            <RecentCourses />
            <HotSeries />
          </main>
          <DiscoverySidebar />
        </div>
      </div>
    </HomePageClient>
  );
}
