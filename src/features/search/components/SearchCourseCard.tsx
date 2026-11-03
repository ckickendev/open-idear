"use client";

import React from "react";
import Link from "next/link";
import { SearchCourseItem } from "../types/search.types";
import { Star, Clock, Users, BookOpen, GraduationCap } from "lucide-react";
import { HighlightedText } from "./HighlightedText";

interface SearchCourseCardProps {
  course: SearchCourseItem;
  viewMode?: "grid" | "list";
  searchQuery?: string;
}

export const SearchCourseCard: React.FC<SearchCourseCardProps> = ({
  course,
  viewMode = "grid",
  searchQuery,
}) => {
  const formattedPrice =
    course.isFree || course.price === 0
      ? "Miễn phí"
      : new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(course.discountPrice || course.price);

  const formattedOriginalPrice =
    course.discountPrice && course.discountPrice < course.price
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(course.price)
      : null;

  const durationHours = course.totalDuration
    ? Math.round((course.totalDuration / 3600) * 10) / 10
    : null;

  if (viewMode === "list") {
    return (
      <Link
        href={`/courses/${course.slug}`}
        className="group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 overflow-hidden"
      >
        <div className="relative w-full sm:w-56 aspect-video rounded-xl overflow-hidden bg-muted shrink-0">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-zinc-900 text-muted-foreground">
              <GraduationCap className="w-10 h-10 opacity-50" />
            </div>
          )}
          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-primary text-primary-foreground shadow-sm">
            Khóa học
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {course.category && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary text-secondary-foreground">
                  {course.category.name}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground">
                {course.level}
              </span>
            </div>

            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
              <HighlightedText text={course.title} query={searchQuery} />
            </h3>

            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              <HighlightedText
                text={course.description}
                query={searchQuery}
                asSnippet
                maxLength={160}
              />
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/60 flex-wrap">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                {course.instructor.avatar ? (
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                    {course.instructor.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="truncate max-w-[120px] font-medium">
                  <HighlightedText text={course.instructor.name} query={searchQuery} />
                </span>
              </div>

              {course.rating > 0 && (
                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star size={13} className="fill-current" />
                  <span>{course.rating.toFixed(1)}</span>
                </div>
              )}

              {durationHours && (
                <div className="hidden md:flex items-center gap-1">
                  <Clock size={13} />
                  <span>{durationHours} giờ</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              {formattedOriginalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formattedOriginalPrice}
                </span>
              )}
              <span
                className={`font-bold text-sm ${
                  course.isFree || course.price === 0
                    ? "text-emerald-500 font-extrabold"
                    : "text-foreground"
                }`}
              >
                {formattedPrice}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid Card View
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-zinc-900 text-muted-foreground">
            <GraduationCap className="w-12 h-12 opacity-50" />
          </div>
        )}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-bold bg-primary text-primary-foreground shadow-md backdrop-blur-sm">
          Khóa học
        </span>
        <span
          className={`absolute bottom-3 right-3 px-2.5 py-0.5 rounded-md text-xs font-bold shadow-md backdrop-blur-md ${
            course.isFree || course.price === 0
              ? "bg-emerald-500/90 text-white"
              : "bg-black/80 text-white"
          }`}
        >
          {formattedPrice}
        </span>
      </div>

      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {course.category && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-secondary text-secondary-foreground">
                {course.category.name}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground">
              {course.level}
            </span>
          </div>

          <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 leading-snug">
            <HighlightedText text={course.title} query={searchQuery} />
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            <HighlightedText
              text={course.description}
              query={searchQuery}
              asSnippet
              maxLength={160}
            />
          </p>
        </div>

        <div className="pt-3 border-t border-border/60">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 truncate max-w-[150px]">
              {course.instructor.avatar ? (
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                  {course.instructor.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="truncate font-medium">
                <HighlightedText text={course.instructor.name} query={searchQuery} />
              </span>
            </div>

            {course.rating > 0 ? (
              <div className="flex items-center gap-1 text-amber-500 font-semibold shrink-0">
                <Star size={13} className="fill-current" />
                <span>{course.rating.toFixed(1)}</span>
              </div>
            ) : course.studentsCount > 0 ? (
              <div className="flex items-center gap-1 shrink-0">
                <Users size={12} />
                <span>{course.studentsCount} học viên</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
};
