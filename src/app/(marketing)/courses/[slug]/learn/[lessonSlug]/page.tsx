"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import loadingStore from "@/store/LoadingStore";
import authenticationStore from "@/store/AuthenticationStore";
import { courseApi } from "@/features/series/api/course.api";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  CheckCircle,
  Lock,
  Play,
  FileText,
  Download,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Stream } from "@cloudflare/stream-react";
import { toast } from "sonner";

type Lesson = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  type: "video" | "file" | "text";
  isFreePreview: boolean;
  order: number;
  media?: { url: string; type: string; uid?: string };
};

type Chapter = {
  _id: string;
  title: string;
  order: number;
  lessons: Lesson[];
};

type Course = {
  _id: string;
  title: string;
  slug: string;
  chapters: Chapter[];
};

const WatchPage = () => {
  const { slug, lessonSlug } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null); // null = loading
  const changeLoad = loadingStore((state) => state.changeLoad);
  const currentUser = authenticationStore((state) => state.currentUser);

  useEffect(() => {
    const fetchData = async () => {
      try {
        changeLoad();
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/getBySlug?slug=${slug}`,
        );
        const courseData = response.data.data;
        setCourse(courseData);

        // Flatten lessons from chapters
        const lessons =
          courseData.chapters?.flatMap((ch: Chapter) => ch.lessons || []) || [];
        setAllLessons(lessons);

        // Find current lesson
        const lesson =
          lessons.find((l: Lesson) => l.slug === lessonSlug) || lessons[0];
        setCurrentLesson(lesson);

        // Expand the chapter containing the current lesson
        if (lesson && courseData.chapters) {
          const parentChapter = courseData.chapters.find((ch: Chapter) =>
            ch.lessons?.some((l: Lesson) => l._id === lesson._id),
          );
          if (parentChapter) {
            setExpandedChapters([parentChapter._id]);
          }
        }

        // Redirect if no lessonSlug in URL
        if (!lessonSlug && lessons[0]) {
          router.replace(`/courses/${slug}/learn/${lessons[0].slug}`);
        }

        // Check enrollment and load progress
        if (currentUser?._id && courseData._id) {
          const enrollRes = await courseApi.checkEnrollment(courseData._id);
          if (enrollRes.success) {
            const data = (enrollRes.data as any)?.data;
            setIsEnrolled(data?.enrolled || false);
            if (data?.enrollment) {
              setCompletedLessons(data.enrollment.completedLessons || []);
              setProgress(data.enrollment.progress || 0);
            }
          }
        } else {
          setIsEnrolled(false);
        }
      } catch (error) {
        console.error(error);
        router.push(`/courses/${slug}`);
      } finally {
        changeLoad();
      }
    };
    fetchData();
  }, [slug, lessonSlug]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId],
    );
  };

  const handleLessonComplete = useCallback(
    async (lessonId: string) => {
      if (!course?._id || !currentUser?._id) return;

      // Check if already completed
      if (completedLessons.includes(lessonId)) return;

      // Optimistic update
      setCompletedLessons((prev) => [...prev, lessonId]);

      try {
        const res = await courseApi.completeLesson(course._id, lessonId);
        if (res.success) {
          const data = (res.data as any)?.data;
          setCompletedLessons(data?.completedLessons || []);
          setProgress(data?.progress || 0);
          toast.success("Đã hoàn thành bài học!");
        }
      } catch (error) {
        // Revert optimistic update
        setCompletedLessons((prev) => prev.filter((id) => id !== lessonId));
        console.error("Failed to mark lesson complete:", error);
      }
    },
    [course?._id, currentUser?._id, completedLessons],
  );

  // Access control: redirect if not enrolled
  if (isEnrolled === false) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={36} className="text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Bạn chưa đăng ký khóa học này
          </h2>
          <p className="text-muted-foreground mb-6">
            Vui lòng mua khóa học để truy cập nội dung học tập.
          </p>
          <button
            onClick={() => router.push(`/courses/${slug}`)}
            className="bg-[var(--color-admin-primary)] text-white font-bold px-8 py-3 rounded-xl hover:bg-[var(--color-admin-primary-hover)] transition-all shadow-lg"
          >
            Quay lại trang khóa học
          </button>
        </div>
      </div>
    );
  }

  if (!course || !currentLesson || isEnrolled === null) {
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

  const currentIndex = allLessons.findIndex((l) => l._id === currentLesson._id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const goToPrev = () => {
    if (prevLesson) router.push(`/courses/${slug}/learn/${prevLesson.slug}`);
  };

  const goToNext = () => {
    if (nextLesson) router.push(`/courses/${slug}/learn/${nextLesson.slug}`);
  };

  // Calculate total progress
  const totalLessonsCount = allLessons.length;
  const completedLessonsCount = completedLessons.length;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Main Player Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#1c1d1f] text-white p-3 flex items-center justify-between border-b border-border shadow-md z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/courses/${slug}`)}
              className="text-white hover:text-muted-foreground/70 transition-colors flex items-center gap-2 text-sm font-bold"
            >
              <ChevronLeft size={20} /> Quay lại khóa học
            </button>
            <div className="h-6 w-px bg-accent"></div>
            <h1 className="font-bold line-clamp-1">{course.title}</h1>
          </div>
          <div className="flex items-center gap-6">
            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-xs text-muted-foreground/70">
                <Play size={12} className="ml-0.5" />
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">
                  Tiến trình của bạn
                </span>
                <div className="font-bold">
                  {completedLessonsCount} / {totalLessonsCount} bài ({progress}
                  %)
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background flex flex-col">
          {/* Player Container */}
          <div className="w-full bg-background aspect-video flex-shrink-0 relative overflow-hidden">
            {currentLesson.type === "video" && currentLesson.media?.url && (
              <div className="absolute inset-0 [&>iframe]:!w-full [&>iframe]:!h-full">
                <Stream
                  src={currentLesson.media.url}
                  controls
                  autoplay
                  width="100%"
                  height="100%"
                  onEnded={() => {
                    handleLessonComplete(currentLesson._id);
                    goToNext();
                  }}
                />
              </div>
            )}
            {currentLesson.type === "text" && (
              <div className="w-full h-full bg-background p-12 overflow-auto">
                <h2 className="text-3xl font-bold mb-6">
                  {currentLesson.title}
                </h2>
                <div
                  className="prose max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                ></div>
              </div>
            )}
            {currentLesson.type === "file" && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-background text-white p-8">
                <FileText size={64} className="text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  {currentLesson.title}
                </h2>
                <p className="text-muted-foreground mb-6">
                  Tài liệu đính kèm:{" "}
                  {currentLesson.media?.url?.split("/").pop() || "Tài liệu"}
                </p>
                <a
                  href={currentLesson.media?.url}
                  download
                  className="bg-[var(--color-admin-primary)] text-white px-6 py-3 rounded-md flex items-center gap-2 hover:bg-[var(--color-admin-primary-hover)] transition-colors shadow-lg font-bold"
                >
                  <Download size={20} /> Tải xuống tài liệu
                </a>
              </div>
            )}

            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="absolute right-0 top-6 bg-background bg-opacity-75 text-white p-2 rounded-l-md hover:bg-opacity-100 transition-all z-20"
              >
                <ChevronLeft size={24} />
              </button>
            )}
          </div>

          {/* Lesson Info Tab View */}
          <div className="p-8 max-w-5xl mx-auto w-full flex-1">
            <div className="flex border-b border-border mb-6">
              <button className="px-6 py-4 border-b-2 border-black font-bold text-sm text-foreground">
                Tổng quan
              </button>
              <button className="px-6 py-4 text-muted-foreground text-sm hover:text-foreground font-bold transition-colors">
                Q&A
              </button>
              <button className="px-6 py-4 text-muted-foreground text-sm hover:text-foreground font-bold transition-colors">
                Ghi chú
              </button>
              <button className="px-6 py-4 text-muted-foreground text-sm hover:text-foreground font-bold transition-colors">
                Đánh giá
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-4">{currentLesson.title}</h1>
              <div className="text-foreground/80 leading-relaxed text-sm max-w-3xl">
                {currentLesson.description || "Không có mô tả cho bài học này."}
              </div>
            </div>
          </div>

          {/* Fixed Footer Navigation */}
          <footer className="bg-background border-t p-3 flex items-center justify-between shadow-sm sticky bottom-0">
            <button
              onClick={goToPrev}
              disabled={!prevLesson}
              className={`flex items-center gap-1 font-bold px-4 py-2 border border-black rounded hover:bg-muted transition-colors ${!prevLesson ? "opacity-50 cursor-not-allowed border-border text-muted-foreground" : "text-foreground"}`}
            >
              <ChevronLeft size={18} /> Bài trước
            </button>
            <button
              onClick={goToNext}
              disabled={!nextLesson}
              className={`flex items-center gap-1 font-bold px-6 py-2 rounded transition-colors ${!nextLesson ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground" : "bg-[var(--color-admin-primary)] text-white hover:bg-[var(--color-admin-primary-hover)]"}`}
            >
              Bài tiếp theo <ChevronRight size={18} />
            </button>
          </footer>
        </main>
      </div>

      {/* Curriculum Sidebar */}
      <div
        className={`${sidebarOpen ? "w-[360px]" : "w-0"} border-l flex-shrink-0 flex flex-col transition-all duration-300 overflow-hidden bg-background shadow-xl z-20`}
      >
        <div className="p-4 border-b flex items-center justify-between text-foreground flex-shrink-0">
          <span className="font-bold text-lg">Nội dung khóa học</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {course.chapters?.map((chapter, chapterIdx) => {
            const chapterCompletedCount =
              chapter.lessons?.filter((l) => completedLessons.includes(l._id))
                .length || 0;

            return (
              <div key={chapter._id} className="border-b border-border">
                {/* Chapter Header */}
                <button
                  onClick={() => toggleChapter(chapter._id)}
                  className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted transition-colors text-left"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-sm">
                      Phần {chapterIdx + 1}: {chapter.title}
                    </h3>
                    <div className="text-xs text-muted-foreground mt-1">
                      {chapterCompletedCount} / {chapter.lessons?.length || 0} |
                      10min
                    </div>
                  </div>
                  {expandedChapters.includes(chapter._id) ? (
                    <ChevronUp
                      size={16}
                      className="text-muted-foreground ml-2"
                    />
                  ) : (
                    <ChevronDown
                      size={16}
                      className="text-muted-foreground ml-2"
                    />
                  )}
                </button>

                {/* Lessons List */}
                {expandedChapters.includes(chapter._id) && (
                  <div className="bg-background py-1">
                    {chapter.lessons?.map((lesson, lessonIdx) => {
                      const isCurrent = currentLesson._id === lesson._id;
                      const isCompleted = completedLessons.includes(lesson._id);

                      return (
                        <div
                          key={lesson._id}
                          onClick={() =>
                            router.push(`/courses/${slug}/learn/${lesson.slug}`)
                          }
                          className={`px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors flex gap-3 group ${isCurrent ? "bg-blue-50/50" : ""}`}
                        >
                          <div className="mt-1 flex-shrink-0">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-border text-[var(--color-admin-primary)] focus:ring-[var(--color-admin-primary)] cursor-pointer"
                              checked={isCompleted}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (!isCompleted) {
                                  handleLessonComplete(lesson._id);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-sm leading-tight ${isCurrent ? "font-bold text-foreground" : isCompleted ? "text-muted-foreground" : "text-foreground"}`}
                            >
                              {lessonIdx + 1}. {lesson.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1.5">
                              {lesson.type === "video" ? (
                                <Play
                                  size={12}
                                  className="text-muted-foreground"
                                />
                              ) : (
                                <FileText
                                  size={12}
                                  className="text-muted-foreground"
                                />
                              )}
                              <span className="text-xs text-muted-foreground">
                                05:20
                              </span>
                              {isCompleted && (
                                <CheckCircle
                                  size={12}
                                  className="text-emerald-500"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {(!chapter.lessons || chapter.lessons.length === 0) && (
                      <div className="px-4 py-3 text-sm text-muted-foreground italic">
                        Chưa có bài giảng
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
