import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { serverFetch } from "@/lib/api/serverFetch";
import PostInCategory from "./PostInCategory";
import PostInAnotherCategory from "./PostInAnotherCategory";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

// ─── Route Segment Config ───────────────────────────────────────────────────
// Fallback to on-demand generation for newly created categories
export const dynamicParams = true;

// ─── Pre-render Categories at Build Time ─────────────────────────────────────

export async function generateStaticParams() {
  try {
    const { data } = await serverFetch<{ categories: Array<{ slug: string }> }>(
      "/category",
      {
        tags: ["categories"],
        revalidate: 86400,
        timeoutMs: 5000, // 5s build-time timeout
      }
    );

    if (!data?.categories || !Array.isArray(data.categories)) {
      return [];
    }

    return data.categories
      .filter((cat) => Boolean(cat.slug))
      .map((cat) => ({ slug: cat.slug }));
  } catch (err) {
    console.warn("[generateStaticParams:category] Fallback to on-demand generation:", err);
    return [];
  }
}

// ─── Dynamic Metadata ────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await serverFetch<{ category: any }>(
    `/category/getCategoryBySlug/${slug}`,
    {
      tags: ["categories", `category-${slug}`],
      revalidate: 3600,
      timeoutMs: 8000,
    }
  );

  if (!data?.category) {
    return {
      title: "Category Not Found | OpenIdear",
      robots: { index: false, follow: false },
    };
  }

  const { name, description } = data.category;
  return {
    title: `${name} | OpenIdear Categories`,
    description: description || `Browse all articles, insights, and guides in ${name} on OpenIdear.`,
    openGraph: {
      title: `${name} | OpenIdear`,
      description: description || `Browse all articles in ${name}.`,
    },
  };
}

// ─── Category Page (Server Component) ────────────────────────────────────────

export default async function CategoryList({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Concurrently fetch Category metadata, Categories list, and initial posts
  const [categoryResult, allCategoriesResult, initialPostsResult, anotherCategoryResult] =
    await Promise.allSettled([
      serverFetch<{ category: any }>(`/category/getCategoryBySlug/${slug}`, {
        tags: ["categories", `category-${slug}`],
        revalidate: 3600,
        timeoutMs: 8000,
      }),
      serverFetch<{ categories: any[] }>("/category", {
        tags: ["categories"],
        revalidate: 86400,
        timeoutMs: 8000,
      }),
      serverFetch<{ posts: any[] }>(`/category/getPostsByCategorySlug/${slug}/1?locale=en`, {
        tags: [`category-${slug}`, "posts"],
        revalidate: 3600,
        timeoutMs: 8000,
      }),
      serverFetch<{ posts: any[] }>(`/category/getPostsInAnotherCategorySlug/${slug}/4?locale=en`, {
        tags: [`category-${slug}`, "posts"],
        revalidate: 3600,
        timeoutMs: 8000,
      }),
    ]);

  const categoryPayload =
    categoryResult.status === "fulfilled" ? categoryResult.value.data : null;

  if (!categoryPayload || !categoryPayload.category) {
    notFound();
  }

  const allCategories =
    allCategoriesResult.status === "fulfilled" && allCategoriesResult.value.data?.categories
      ? allCategoriesResult.value.data.categories
      : [];

  const initialPosts =
    initialPostsResult.status === "fulfilled" && initialPostsResult.value.data?.posts
      ? initialPostsResult.value.data.posts
      : [];

  const anotherPosts =
    anotherCategoryResult.status === "fulfilled" && anotherCategoryResult.value.data?.posts
      ? anotherCategoryResult.value.data.posts
      : [];

  const category = categoryPayload.category;
  const bgImg = `${process.env.NEXT_PUBLIC_APP_URL || ""}/background/category/${category._id}.png`;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div
        className="relative h-96 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImg})` }}
      >
        <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px]" />
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow">
            {category.name}
          </h1>
          <p className="text-white text-lg max-w-2xl drop-shadow-sm">
            {category.description}
          </p>
        </div>
      </div>

      {/* Main Category Posts Section */}
      <div className="bg-muted/30 py-12">
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <PostInCategory
            allCategory={allCategories}
            slug={slug}
            totalPage={Math.max(1, Math.ceil((category.countData || initialPosts.length) / 6))}
            initialPosts={initialPosts}
          />
        </Suspense>
      </div>

      {/* Cross-Category Recommendations */}
      <PostInAnotherCategory slug={slug} initialPosts={anotherPosts} />
    </div>
  );
}
