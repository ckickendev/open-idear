"use client";
import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Settings,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";

export interface CourseCardData {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: { url: string };
  instructor?: { name: string; avatar?: string };
  status: string;
  progress?: number;
}

interface CourseCardProps {
  course: CourseCardData;
  variant: "enrolled" | "created";
}

const CourseCard: React.FC<CourseCardProps> = ({ course, variant }) => {
  const progress = course.progress || 0;
  const isCompleted = progress >= 100;

  return (
    <div className="group bg-background dark:bg-card rounded-2xl border border-border dark:border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-border/50 dark:hover:shadow-border/50 hover:-translate-y-0.5">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted dark:bg-accent overflow-hidden">
        {course.thumbnail?.url ? (
          <img
            src={course.thumbnail.url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen
              className="text-muted-foreground/70 dark:text-muted-foreground"
              size={40}
            />
          </div>
        )}

        {/* Status overlay */}
        {variant === "created" && (
          <div className="absolute top-3 right-3">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm ${
                course.status === "published"
                  ? "bg-emerald-500/90 text-white"
                  : "bg-amber-500/90 text-white"
              }`}
            >
              {course.status === "published" ? "Published" : "Draft"}
            </span>
          </div>
        )}

        {variant === "enrolled" && isCompleted && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white backdrop-blur-sm">
              <CheckCircle2 size={12} /> Completed
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-foreground dark:text-white mb-1.5 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {course.description || "No description available"}
        </p>

        {variant === "enrolled" ? (
          <div>
            {/* Progress bar */}
            <div className="flex justify-between text-xs text-muted-foreground dark:text-muted-foreground mb-1.5">
              <span>Progress</span>
              <span className="font-bold text-foreground dark:text-white">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-muted dark:bg-accent rounded-full h-1.5 mb-4">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  isCompleted
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-indigo-500 to-blue-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <Link
              href={`/courses/${course._id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <PlayCircle size={16} />
              {isCompleted ? "Review" : "Continue Learning"}
            </Link>
          </div>
        ) : (
          <div className="flex justify-between items-center pt-3 border-t border-border dark:border-border">
            {course.instructor && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted dark:bg-accent overflow-hidden">
                  {course.instructor.avatar && (
                    <img
                      src={course.instructor.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                  {course.instructor.name}
                </span>
              </div>
            )}
            <Link
              href={`/management/course/${course._id}/curriculum`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <Settings size={14} /> Manage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
