"use client";
import { ENV } from "@/api/const";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import loadingStore from "@/store/LoadingStore";

export default function LearnIndexPage() {
  const { slug } = useParams();
  const router = useRouter();
  const changeLoad = loadingStore((state) => state.changeLoad);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        changeLoad();
        const response = await axios.get(
          `${ENV.ROOT_API}/course/getBySlug?slug=${slug}`,
        );
        const courseData = response.data.data;

        if (courseData?.chapters?.length > 0) {
          // Find first chapter with lessons
          const firstChapterWithLessons = courseData.chapters.find(
            (ch: any) => ch.lessons && ch.lessons.length > 0,
          );
          if (
            firstChapterWithLessons &&
            firstChapterWithLessons.lessons.length > 0
          ) {
            const firstLesson = firstChapterWithLessons.lessons[0];
            router.replace(`/courses/${slug}/learn/${firstLesson.slug}`);
            return;
          }
        }

        // If no lessons found, redirect back to course page
        router.replace(`/courses/${slug}`);
      } catch (error) {
        console.error("Error fetching course for learn redirect:", error);
        router.replace(`/courses/${slug}`);
      } finally {
        changeLoad();
      }
    };

    if (slug) {
      fetchCourse();
    }
  }, [slug, router, changeLoad]);

  return (
    <div className="flex h-screen items-center justify-center bg-muted/30">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 border-4 border-[var(--color-admin-primary)] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">
          Đang tải khóa học...
        </p>
      </div>
    </div>
  );
}
