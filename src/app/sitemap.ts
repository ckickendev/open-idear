import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/features/seo/metadata/buildPostMetadata";
import { ENV } from "@/api/const";

interface PostSummary {
  _id: string;
  slug: string;
  published: boolean;
  updatedAt?: string;
  createdAt?: string;
  availableLocales?: string[];
  alternateUrls?: Record<string, string>;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  // 1. Static Core Routes with reciprocal hreflang
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          en: siteUrl,
          vi: `${siteUrl}/vi`,
          "x-default": siteUrl,
        },
      },
    },
    {
      url: `${siteUrl}/vi`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          en: siteUrl,
          vi: `${siteUrl}/vi`,
          "x-default": siteUrl,
        },
      },
    },
  ];

  // 2. Published Articles (drafts strictly excluded)
  const articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${ENV.ROOT_API}/post/getAllPosts?limit=100&page=1`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      const posts: PostSummary[] = data.posts || [];

      for (const post of posts) {
        // Exclude drafts and unpublished content
        if (!post.published || !post.slug) continue;

        const lastModified = post.updatedAt
          ? new Date(post.updatedAt)
          : post.createdAt
          ? new Date(post.createdAt)
          : new Date();

        // Build reciprocal alternate languages
        const alternates: Record<string, string> = {
          en: `${siteUrl}/post/${post.slug}`,
        };
        if (post.alternateUrls?.vi) {
          alternates.vi = `${siteUrl}${post.alternateUrls.vi}`;
        }
        alternates["x-default"] = `${siteUrl}/post/${post.slug}`;

        // English Article entry
        articleRoutes.push({
          url: `${siteUrl}/post/${post.slug}`,
          lastModified,
          changeFrequency: "weekly",
          priority: 0.8,
          alternates: {
            languages: alternates,
          },
        });

        // Vietnamese Article entry ONLY if a valid translated alternate exists
        if (post.alternateUrls?.vi) {
          articleRoutes.push({
            url: `${siteUrl}${post.alternateUrls.vi}`,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.8,
            alternates: {
              languages: alternates,
            },
          });
        }
      }
    }
  } catch (err) {
    console.error("Error generating dynamic sitemap:", err);
  }

  return [...staticRoutes, ...articleRoutes];
}
