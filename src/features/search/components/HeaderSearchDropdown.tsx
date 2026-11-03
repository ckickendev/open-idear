"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchApi } from "../api/search.api";
import { GlobalSearchResult } from "../types/search.types";
import {
  BookOpen,
  FileText,
  ArrowRight,
  Loader2,
  GraduationCap,
  Star,
  Clock,
  Search,
} from "lucide-react";
import { HighlightedText } from "./HighlightedText";

interface HeaderSearchDropdownProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: () => void;
}

export const HeaderSearchDropdown: React.FC<HeaderSearchDropdownProps> = ({
  query,
  isOpen,
  onClose,
  onSelect,
}) => {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<GlobalSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search when query changes
  useEffect(() => {
    const trimmed = query.trim();
    if (!isOpen || trimmed.length < 2) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchApi.globalSearch({
          q: trimmed,
          limit: 6,
        });
        if (res.success && res.data) {
          const payload = (res.data as any).data || res.data;
          setData(payload);
        }
      } catch (err) {
        console.error("Header live search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || query.trim().length < 2) return null;

  const courses = data?.courses?.slice(0, 3) || [];
  const posts = data?.posts?.slice(0, 3) || [];
  const totalCount = data?.counts?.all || 0;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-[320px] sm:w-[400px] md:w-[440px] max-w-[90vw] bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col text-left transition-all animate-in fade-in-50 zoom-in-95 duration-150"
    >
      {/* Loading Shimmer */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
          <Loader2 size={16} className="animate-spin text-primary" />
          <span>Đang tìm kiếm khóa học & bài viết…</span>
        </div>
      ) : totalCount === 0 ? (
        /* Empty State */
        <div className="p-6 text-center">
          <p className="text-xs font-semibold text-foreground mb-1">
            Không tìm thấy kết quả
          </p>
          <p className="text-[11px] text-muted-foreground mb-3">
            Không có khóa học hoặc bài viết nào khớp với &ldquo;{query}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              onSelect();
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors cursor-pointer"
          >
            <Search size={12} />
            <span>Xem trang tìm kiếm chi tiết</span>
          </button>
        </div>
      ) : (
        /* Results Content */
        <div className="max-h-[70vh] overflow-y-auto divide-y divide-border/60">
          {/* Section 1: Courses */}
          {courses.length > 0 && (
            <div className="p-2.5">
              <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={12} className="text-primary" />
                  <span>Khóa học</span>
                </span>
                <span>{data?.counts?.courses || courses.length}</span>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    onClick={onSelect}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/70 transition-colors group cursor-pointer"
                  >
                    <div className="relative w-12 h-12 rounded-lg bg-muted shrink-0 overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                          <GraduationCap size={18} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        <HighlightedText text={course.title} query={query} />
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span className="truncate max-w-[120px]">
                          <HighlightedText text={course.instructor.name} query={query} />
                        </span>
                        {course.rating > 0 && (
                          <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                            <Star size={10} className="fill-current" />
                            {course.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold ${
                          course.isFree || course.price === 0
                            ? "text-emerald-500"
                            : "text-foreground"
                        }`}
                      >
                        {course.isFree || course.price === 0
                          ? "Miễn phí"
                          : new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(course.discountPrice || course.price)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Articles */}
          {posts.length > 0 && (
            <div className="p-2.5">
              <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <FileText size={12} className="text-amber-500" />
                  <span>Bài viết</span>
                </span>
                <span>{data?.counts?.posts || posts.length}</span>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.slug}`}
                    onClick={onSelect}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/70 transition-colors group cursor-pointer"
                  >
                    <div className="relative w-12 h-12 rounded-lg bg-muted shrink-0 overflow-hidden">
                      {post.thumbnail ? (
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-amber-500/10 text-amber-500">
                          <FileText size={18} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        <HighlightedText text={post.title} query={query} />
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        {post.category && (
                          <span className="truncate max-w-[100px] text-secondary-foreground font-medium">
                            <HighlightedText text={post.category.name} query={query} />
                          </span>
                        )}
                        <span className="flex items-center gap-0.5">
                          <Clock size={9} />
                          {post.readtime}m
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action: View all */}
          <div className="p-2 bg-muted/30">
            <button
              type="button"
              onClick={() => {
                onSelect();
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-card hover:bg-primary hover:text-primary-foreground border border-border text-xs font-bold text-foreground transition-all group cursor-pointer shadow-sm"
            >
              <span>
                Xem tất cả {totalCount} kết quả cho &ldquo;{query}&rdquo;
              </span>
              <div className="flex items-center gap-1 text-[11px] opacity-75 group-hover:opacity-100">
                <span className="hidden sm:inline">Enter</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
