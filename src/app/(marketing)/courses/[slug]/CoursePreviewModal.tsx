"use client";

import React, { useEffect } from "react";
import { X, Play } from "lucide-react";
import BunnyPlayer from "@/components/video/BunnyPlayer";
import { Lesson } from "./types";

interface CoursePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  courseThumbnailUrl?: string;
  activeLesson: Lesson | null;
  previewableLessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
}

const formatLessonDuration = (seconds?: number) => {
  if (!seconds || seconds <= 0) return "15:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export const CoursePreviewModal: React.FC<CoursePreviewModalProps> = ({
  isOpen,
  onClose,
  courseTitle,
  courseThumbnailUrl,
  activeLesson,
  previewableLessons,
  onSelectLesson,
}) => {
  // ESC key and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#1c1d1f] text-white rounded-xl shadow-2xl max-w-3xl w-full border border-white/10 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 flex items-start justify-between border-b border-white/10 bg-[#1c1d1f]">
          <div className="pr-4">
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-0.5">
              Course Preview
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
              {courseTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="aspect-video relative bg-black w-full overflow-hidden flex-shrink-0">
          {activeLesson ? (
            <BunnyPlayer
              key={activeLesson._id}
              lessonId={activeLesson._id}
              title={activeLesson.title || courseTitle}
              posterUrl={activeLesson.media?.thumbnail || courseThumbnailUrl}
              autoplay={true}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
              No video stream available for this lecture.
            </div>
          )}
        </div>

        {/* Free Sample Videos List */}
        <div className="p-4 sm:p-5 overflow-y-auto bg-[#1c1d1f] flex-1">
          <h4 className="text-sm font-bold text-white mb-3">
            Free Sample Videos:
          </h4>
          <div className="space-y-2">
            {previewableLessons.map((sampleLesson) => {
              const isCurrent = sampleLesson._id === activeLesson?._id;
              const samplePoster =
                sampleLesson.media?.thumbnail || courseThumbnailUrl;

              return (
                <div
                  key={sampleLesson._id}
                  onClick={() => onSelectLesson(sampleLesson)}
                  className={`flex items-center gap-3.5 p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-white/15 border-white/20 shadow-sm ring-1 ring-white/25"
                      : "bg-white/5 border-white/5 hover:bg-white/10"
                  }`}
                >
                  {/* Thumbnail with play icon */}
                  <div className="w-20 h-12 bg-black rounded overflow-hidden flex-shrink-0 relative group/thumb">
                    <img
                      src={samplePoster || "/default-avatar.png"}
                      alt={sampleLesson.title}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute inset-0 flex items-center justify-center ${
                        isCurrent
                          ? "bg-black/30"
                          : "bg-black/40 group-hover/thumb:bg-black/20"
                      }`}
                    >
                      <Play
                        fill="currentColor"
                        size={16}
                        className={isCurrent ? "text-emerald-400" : "text-white"}
                      />
                    </div>
                  </div>

                  {/* Lesson title */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm line-clamp-1 ${
                        isCurrent ? "text-white font-bold" : "text-white/80"
                      }`}
                    >
                      {sampleLesson.title}
                    </p>
                  </div>

                  {/* Duration */}
                  <span className="text-xs text-white/60 flex-shrink-0 font-mono ml-2">
                    {formatLessonDuration(
                      sampleLesson.media?.duration || sampleLesson.duration
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

