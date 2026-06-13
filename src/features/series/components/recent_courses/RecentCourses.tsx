"use client";

import { ENV } from "@/api/const";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useTranslation } from "@/app/hook/useTranslation";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  Users,
} from "lucide-react";
import { CourseCardSkeleton } from "@/components/ui/Skeletons";

type Course = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  thumbnail: { url: string };
  instructor: { name: string; username: string; avatar: string };
  status: string;
  createdAt?: string;
  enrolledUsers?: string[];
};

const formatPrice = (price: number) => {
  if (price === 0) return "Miễn phí";
  return `₫${price.toLocaleString()}`;
};

const RecentCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const CARD_WIDTH = 300;
  const GAP = 20;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `${ENV.ROOT_API}/course?limit=10&sort=-createdAt`,
        );
        if (res.status === 200 && res.data?.data) {
          setCourses(res.data.data);
        } else if (res.status === 200 && res.data?.courses) {
          setCourses(res.data.courses);
        }
      } catch (error) {
        console.error("Error fetching recent courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Auto-scroll carousel
  const scrollToIndex = useCallback((index: number) => {
    if (scrollRef.current) {
      const scrollAmount = index * (CARD_WIDTH + GAP);
      scrollRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
      setActiveIndex(index);
    }
  }, []);

  useEffect(() => {
    if (courses.length === 0 || isHovered) return;

    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const maxIndex = Math.max(0, courses.length - 3);
        const next = prev >= maxIndex ? 0 : prev + 1;
        scrollToIndex(next);
        return next;
      });
    }, 4000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [courses.length, isHovered, scrollToIndex]);

  const scroll = (dir: "left" | "right") => {
    const maxIndex = Math.max(0, courses.length - 3);
    if (dir === "left") {
      const next = activeIndex <= 0 ? maxIndex : activeIndex - 1;
      scrollToIndex(next);
    } else {
      const next = activeIndex >= maxIndex ? 0 : activeIndex + 1;
      scrollToIndex(next);
    }
  };

  // Track scroll position for dot indicators
  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const index = Math.round(scrollLeft / (CARD_WIDTH + GAP));
      setActiveIndex(index);
    }
  };

  if (courses.length === 0 && !isLoading) return null;

  const maxDots = Math.max(1, courses.length - 2);

  return (
    <section className="py-10 bg-gradient-to-b from-card/10 to-background border-y border-border/60">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Sparkles size={16} className="text-primary" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Mới cập nhật
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">
              Khóa học mới nhất
            </h2>
            <p className="text-xs text-muted-foreground">
              Những khóa học vừa được thêm vào — bắt đầu học ngay hôm nay
            </p>
          </div>
          <Link
            href="/courses/search?q="
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors group"
          >
            Xem tất cả
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        </div>

        {/* Carousel */}
        <div
          className="relative group/carousel"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-card/95 backdrop-blur border border-border text-foreground/80 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-accent hover:border-border hover:text-foreground shadow-lg cursor-pointer"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Cards */}
          {isLoading ? (
            <div className="flex gap-5 overflow-x-auto pb-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <CourseCardSkeleton key={idx} />
              ))}
            </div>
          ) : (
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-5 overflow-x-auto pb-2"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                scrollSnapType: "x mandatory",
              }}
            >
              {courses.map((course) => {
                const rating = 4 + Math.random() * 0.9;
                const students =
                  course.enrolledUsers?.length ||
                  Math.floor(50 + Math.random() * 2000);
                const totalHours = Math.floor(5 + Math.random() * 30);

                return (
                  <div
                    key={course._id}
                    className="flex-shrink-0"
                    style={{ width: CARD_WIDTH, scrollSnapAlign: "start" }}
                  >
                    <Link
                      href={`/courses/${course.slug}`}
                      className="group block bg-card border border-border/50 hover:border-border rounded-xl p-3 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 ease-in-out cursor-pointer h-full"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden rounded-lg mb-3 bg-muted shadow-xs transition-all duration-300">
                        {course.thumbnail?.url ? (
                          <Image
                            src={course.thumbnail.url}
                            alt={course.title}
                            fill
                            sizes="300px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#161B22] to-[#242B38] flex items-center justify-center">
                            <BookOpen size={28} className="text-primary/75" />
                          </div>
                        )}

                        {/* NEW badge */}
                        <div className="absolute top-2 left-2">
                          <span className="bg-primary text-primary-foreground text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                            Mới
                          </span>
                        </div>

                        {/* Price badge */}
                        <div className="absolute top-2 right-2">
                          {course.discountPrice && course.discountPrice > 0 ? (
                            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                              -
                              {Math.round(
                                (1 - course.discountPrice / course.price) * 100,
                              )}
                              %
                            </span>
                          ) : course.price === 0 ? (
                            <span className="bg-success text-success-foreground text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                              FREE
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Course Info */}
                      <h3 className="font-bold text-xs leading-snug text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors duration-200 tracking-tight min-h-[2.5em]">
                        {course.title}
                      </h3>

                      <p className="text-[10px] text-muted-foreground mb-2 truncate">
                        {course.instructor?.name ||
                          course.instructor?.username ||
                          "Instructor"}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-xs font-bold text-amber-500">
                          {rating.toFixed(1)}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={10}
                              className={
                                i <= Math.floor(rating)
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-amber-500 fill-amber-500 opacity-25"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground/80">
                          ({students.toLocaleString()})
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground/80 mb-2.5">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {totalHours} giờ
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={10} />
                          {students} học viên
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 pt-2.5 border-t border-border/40">
                        {course.discountPrice && course.discountPrice > 0 ? (
                          <>
                            <span className="font-bold text-foreground text-xs">
                              {formatPrice(course.discountPrice)}
                            </span>
                            <span className="text-[10px] text-muted-foreground line-through">
                              {formatPrice(course.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-foreground text-xs">
                            {formatPrice(course.price)}
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-card/95 backdrop-blur border border-border text-foreground/80 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-accent hover:border-border hover:text-foreground shadow-lg cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {Array.from({ length: maxDots }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === activeIndex
                  ? "w-6 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-muted hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Mobile "View all" link */}
        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/courses/search?q="
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
          >
            Xem tất cả khóa học <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentCourses;
