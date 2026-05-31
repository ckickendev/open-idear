import { Suspense } from "react";
import axios from "axios";
import PostInCategory from "./PostInCategory";
import PostInAnotherCategory from "./PostInAnotherCategory";

export default async function CategoryList({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  console.log(
    `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category/getCategoryBySlug/${slug}`,
  );

  const getCategory = async (slug: string) => {
    try {
      // Using native fetch with Next.js optimizations
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category/getCategoryBySlug/${slug}`,
      );
      const bgImg = `${process.env.NEXT_PUBLIC_ROOT_FRONTEND}/background/category/${res.data.category._id}.png`;
      return { ...res.data, bgImg };
    } catch (error) {
      console.error("Error fetching category:", error);
      throw new Error(`Failed to fetch category with slug: ${slug}`);
    }
  };

  const getAllCategory = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category`,
        {
          next: { revalidate: 3600 },
        },
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      return data.categories;
    } catch (error) {
      console.error("Error fetching all categories:", error);
      throw new Error("Failed to fetch all categories");
    }
  };

  const categoryData = await getCategory(slug);
  const allCategory = await getAllCategory();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div
        className="relative h-96 bg-cover bg-center"
        style={{ backgroundImage: `url(${categoryData?.bgImg})` }}
      >
        <div className="absolute inset-0 bg-background/30" />
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {categoryData?.category?.name}
          </h1>
          <p className="text-white text-lg max-w-2xl">
            {categoryData?.category?.description}
          </p>
        </div>
      </div>
      {/* Climate Change Section */}
      <div className="bg-muted/30 py-12">
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <PostInCategory
            allCategory={allCategory}
            slug={slug}
            totalPage={Math.ceil(categoryData?.category?.countData / 6)}
          />
        </Suspense>
      </div>
      <PostInAnotherCategory slug={slug} />
    </div>
  );
}
