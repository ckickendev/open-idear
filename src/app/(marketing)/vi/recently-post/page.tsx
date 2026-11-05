import { Suspense } from "react";
import RecentlyPost from "@/app/(marketing)/recently-post/RecentlyPost";
import HotSeries from "@/features/series/components/hot_series/HotSeries";
import DiscoverySidebar from "@/components/DiscoverySidebar";
import { SearchResultSkeleton } from "@/components/ui/Skeletons";
import ArticleLocaleSync from "@/components/ArticleLocaleSync";
import { Metadata } from "next";
import { getSiteUrl } from "@/features/seo/metadata/buildPostMetadata";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  return {
    title: "Bài viết mới nhất — OpenIdear",
    description: "Những ý tưởng công nghệ mới nhất từ cộng đồng OpenIdear. Khám phá các bài viết kỹ thuật chuyên sâu bằng tiếng Việt.",
    alternates: {
      canonical: `${siteUrl}/vi/recently-post`,
      languages: {
        en: `${siteUrl}/recently-post`,
        vi: `${siteUrl}/vi/recently-post`,
        "x-default": `${siteUrl}/recently-post`,
      },
    },
    openGraph: {
      title: "Bài viết mới nhất — OpenIdear",
      description: "Những ý tưởng công nghệ mới nhất từ cộng đồng OpenIdear.",
      url: `${siteUrl}/vi/recently-post`,
      locale: "vi_VN",
      alternateLocale: ["en_US"],
    },
  };
}

export default async function ViRecentlyPostPage() {
  return (
    <div className="min-h-screen bg-background">
      <ArticleLocaleSync activeLocale="vi" />
      {/* Hero Section */}
      <div
        className="relative h-100 bg-cover bg-center"
        style={{ backgroundImage: `url(/banner/recently-post-banner.jpg)` }}
      >
        <div className="absolute inset-0 bg-black/30 dark:bg-black/60 transition-colors duration-300" />
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Bài viết mới nhất
          </h1>
          <p className="text-white text-lg max-w-2xl">
            Những ý tưởng công nghệ mới nhất từ cộng đồng. Khám phá các đổi mới
            và góc nhìn chuyên sâu.
          </p>
        </div>
      </div>

      {/* Main Content + Sidebar */}
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex gap-8 items-start">
          {/* ── Main Content ─────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="bg-muted/30 py-8 rounded-2xl">
              <Suspense
                fallback={
                  <div className="max-w-7xl mx-auto px-4">
                    <div className="w-full md:w-4/5 space-y-4">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <SearchResultSkeleton key={idx} />
                      ))}
                    </div>
                  </div>
                }
              >
                <RecentlyPost locale="vi" />
              </Suspense>
            </div>
            <HotSeries />
          </div>

          {/* ── Discovery Sidebar ─────────────────────── */}
          <DiscoverySidebar />
        </div>
      </div>
    </div>
  );
}
