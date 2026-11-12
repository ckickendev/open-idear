"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Play, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { Chapter, Lesson } from "./types";
import { CoursePreviewModal } from "./CoursePreviewModal";

interface CourseCurriculumProps {
  chapters: Chapter[];
  courseSlug: string;
  courseTitle: string;
  courseThumbnailUrl?: string;
  isEnrolled?: boolean;
}

const formatLessonDuration = (seconds?: number) => {
  if (!seconds || seconds <= 0) return "15:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const formatTotalTime = (seconds: number) => {
  if (!seconds || seconds <= 0) return "7h 30m total length";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m ` : ""}total length`;
  }
  return `${minutes}m total length`;
};

export const CourseCurriculum: React.FC<CourseCurriculumProps> = ({
  chapters,
  courseSlug,
  courseTitle,
  courseThumbnailUrl,
  isEnrolled = false,
}) => {
  const router = useRouter();
  const [expandedChapters, setExpandedChapters] = useState<string[]>(
    chapters.length > 0 ? [chapters[0]._id] : []
  );
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedPreviewLesson, setSelectedPreviewLesson] = useState<Lesson | null>(null);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const toggleAllChapters = () => {
    if (expandedChapters.length === chapters.length) {
      setExpandedChapters([]);
    } else {
      setExpandedChapters(chapters.map((c) => c._id));
    }
  };

  const totalLessons = chapters.reduce(
    (acc, chap) => acc + (chap.lessons?.length || 0),
    0
  );

  const totalDurationSecs = chapters.reduce(
    (acc, chap) =>
      acc +
      (chap.lessons?.reduce(
        (lAcc, lesson) =>
          lAcc + (lesson.media?.duration || lesson.duration || 0),
        0
      ) || 0),
    0
  );

  // All free sample preview lessons
  const previewableLessons = chapters
    .flatMap((ch) => ch.lessons || [])
    .filter(
      (l) =>
        l.isFreePreview &&
        (l.media?.bunnyVideoId || l.media?.cloudflareId || l.media?.url || l.type === "video")
    );

  const handleOpenPreview = (lesson: Lesson) => {
    setSelectedPreviewLesson(lesson);
    setPreviewModalOpen(true);
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Course Content</h2>
      <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
        <span>
          {chapters.length} sections • {totalLessons} lectures • {formatTotalTime(totalDurationSecs)}
        </span>
        <button
          type="button"
          onClick={toggleAllChapters}
          className="text-blue-600 font-bold hover:text-blue-800 cursor-pointer"
        >
          {expandedChapters.length === chapters.length && chapters.length > 0
            ? "Collapse all"
            : "Expand all"}
        </button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        {chapters.length > 0 ? (
          chapters.map((chapter) => (
            <div key={chapter._id} className="border-b border-border last:border-0">
              <button
                type="button"
                onClick={() => toggleChapter(chapter._id)}
                className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {expandedChapters.includes(chapter._id) ? (
                    <ChevronUp size={18} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={18} className="text-muted-foreground" />
                  )}
                  <span className="font-bold text-foreground">
                    {chapter.title}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {chapter.lessons?.length || 0} lectures
                </span>
              </button>

              {expandedChapters.includes(chapter._id) && (
                <div className="bg-background">
                  {chapter.lessons?.length > 0 ? (
                    chapter.lessons.map((lesson) => {
                      const canPreview = lesson.isFreePreview || isEnrolled;
                      const lessonUrl = `/courses/${courseSlug}/learn/${lesson.slug}`;

                      return (
                        <div
                          key={lesson._id}
                          className={`p-4 pl-10 flex items-center justify-between group border-t border-border first:border-0 ${
                            canPreview
                              ? "hover:bg-muted/30 cursor-pointer"
                              : "opacity-70"
                          }`}
                          onClick={() => {
                            if (canPreview) {
                              router.push(lessonUrl);
                            } else {
                              toast.info("You must enroll in this course to access this lecture");
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {lesson.type === "video" ? (
                              <Play
                                size={14}
                                className={canPreview ? "text-primary" : "text-muted-foreground"}
                              />
                            ) : (
                              <Globe size={14} className="text-muted-foreground" />
                            )}
                            <span
                              className={`text-sm ${
                                canPreview
                                  ? "text-foreground hover:text-primary transition-colors"
                                  : "text-foreground"
                              }`}
                            >
                              {lesson.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            {lesson.isFreePreview && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPreview(lesson);
                                }}
                                className="text-blue-600 font-bold text-xs underline hover:text-blue-800 cursor-pointer"
                              >
                                Preview
                              </button>
                            )}
                            {!canPreview && (
                              <Lock size={14} className="text-muted-foreground" />
                            )}
                            <span className="text-xs text-muted-foreground font-mono">
                              {formatLessonDuration(
                                lesson.media?.duration || lesson.duration
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 pl-10 text-sm text-muted-foreground italic">
                      No lectures available in this section.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            This course currently has no content.
          </div>
        )}
      </div>

      {/* Udemy-style Preview Modal */}
      <CoursePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        courseTitle={courseTitle}
        courseThumbnailUrl={courseThumbnailUrl}
        activeLesson={selectedPreviewLesson || previewableLessons[0] || null}
        previewableLessons={previewableLessons}
        onSelectLesson={(lesson) => setSelectedPreviewLesson(lesson)}
      />
    </div>
  );
};

