"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  BookOpen,
  FileText,
  Clock,
  ArrowRight,
  GraduationCap,
  Star,
  Compass,
  ShoppingCart,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  Command,
  Loader2,
} from "lucide-react";
import { searchApi } from "../api/search.api";
import { GlobalSearchResult, SearchCourseItem, SearchPostItem } from "../types/search.types";
import { HighlightedText } from "./HighlightedText";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = "open_idear_recent_searches";
const MAX_RECENT_SEARCHES = 5;

const QUICK_ACTIONS = [
  {
    id: "action-courses",
    title: "Tất cả khóa học trực tuyến",
    description: "Khám phá danh sách các khóa học lập trình, đầu tư, AI",
    icon: GraduationCap,
    badge: "Khóa học",
    url: "/courses",
  },
  {
    id: "action-posts",
    title: "Bài viết & kiến thức công nghệ",
    description: "Các bài viết mới nhất từ cộng đồng OpenIdear",
    icon: FileText,
    badge: "Bài viết",
    url: "/recently-post",
  },
  {
    id: "action-shop",
    title: "Cửa hàng phụ kiện & công nghệ",
    description: "Khám phá thiết bị, linh kiện và phụ kiện chính hãng",
    icon: ShoppingBag,
    badge: "Shop",
    url: "/shop",
  },
  {
    id: "action-mylearning",
    title: "Tiến trình học tập của tôi",
    description: "Tiếp tục bài giảng đang học và xem chứng chỉ",
    icon: BookOpen,
    badge: "Học tập",
    url: "/my-learning",
  },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [data, setData] = useState<GlobalSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
      }
    } catch {
      // ignore JSON parse errors
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  // Remove a single recent search
  const removeRecentSearch = (e: React.MouseEvent, searchTerm: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const next = prev.filter((s) => s !== searchTerm);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Clear all recent searches
  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
      setData(null);
    }
  }, [isOpen]);

  // Debounced search when typing
  useEffect(() => {
    const trimmed = query.trim();
    if (!isOpen || !trimmed) {
      setData(null);
      setIsLoading(false);
      setSelectedIndex(0);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchApi.globalSearch({
          q: trimmed,
          limit: 8,
        });
        if (res.success && res.data) {
          const payload = (res.data as any).data || res.data;
          setData(payload);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error("Command palette search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Navigate to URL and record search
  const navigateTo = useCallback(
    (url: string, searchTermToSave?: string) => {
      if (searchTermToSave) saveRecentSearch(searchTermToSave);
      onClose();
      router.push(url);
    },
    [router, onClose, saveRecentSearch]
  );

  // Compute selectable item list for keyboard navigation
  const courses = data?.courses?.slice(0, 4) || [];
  const posts = data?.posts?.slice(0, 4) || [];
  const hasResults = courses.length > 0 || posts.length > 0;

  // Flattened list of interactive items
  const navigableItems = React.useMemo(() => {
    if (query.trim()) {
      const list: Array<{ id: string; url: string; action: () => void }> = [];
      courses.forEach((c) => {
        list.push({
          id: `course-${c.id}`,
          url: `/courses/${c.slug}`,
          action: () => navigateTo(`/courses/${c.slug}`, query),
        });
      });
      posts.forEach((p) => {
        list.push({
          id: `post-${p.id}`,
          url: `/post/${p.slug}`,
          action: () => navigateTo(`/post/${p.slug}`, query),
        });
      });
      // "View all results" option
      list.push({
        id: "view-all",
        url: `/search?q=${encodeURIComponent(query.trim())}`,
        action: () =>
          navigateTo(`/search?q=${encodeURIComponent(query.trim())}`, query),
      });
      return list;
    }

    // When query is empty: navigable actions
    return QUICK_ACTIONS.map((a) => ({
      id: a.id,
      url: a.url,
      action: () => navigateTo(a.url),
    }));
  }, [query, courses, posts, navigateTo]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          navigableItems.length > 0 ? (prev + 1) % navigableItems.length : 0
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          navigableItems.length > 0
            ? (prev - 1 + navigableItems.length) % navigableItems.length
            : 0
        );
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (navigableItems.length > 0 && navigableItems[selectedIndex]) {
          navigableItems[selectedIndex].action();
        } else if (query.trim()) {
          navigateTo(
            `/search?q=${encodeURIComponent(query.trim())}`,
            query
          );
        }
      }
    },
    [isOpen, onClose, navigableItems, selectedIndex, query, navigateTo]
  );

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Spotlight Command Palette"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in-50 duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-2xl bg-card border border-border/80 shadow-2xl rounded-2xl overflow-hidden flex flex-col transition-all animate-in zoom-in-95 duration-150"
      >
        {/* Top Input Header */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-border bg-card">
          <Search size={18} className="text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm khóa học, bài viết, hành động nhanh..."
            className="w-full bg-transparent text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
          />

          {isLoading ? (
            <Loader2 size={16} className="animate-spin text-primary shrink-0 mr-2" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors mr-2 cursor-pointer"
            >
              <X size={14} />
            </button>
          ) : null}

          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold text-muted-foreground bg-muted border border-border rounded">
            ESC
          </kbd>
        </div>

        {/* Modal Scrollable Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 text-left">
          {/* ── View 1: Empty Query (Recent Searches + Quick Actions) ── */}
          {!query.trim() && (
            <div className="flex flex-col gap-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 pb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>Tìm kiếm gần đây</span>
                    </span>
                    <button
                      type="button"
                      onClick={clearAllRecentSearches}
                      className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      Xóa tất cả
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 px-1">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => {
                          setQuery(term);
                        }}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer border border-border/50"
                      >
                        <Clock size={11} className="text-muted-foreground" />
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-card ml-1 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions Navigation */}
              <div>
                <div className="px-2 pb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Compass size={12} />
                    <span>Hành động nhanh</span>
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  {QUICK_ACTIONS.map((action, idx) => {
                    const isSelected = selectedIndex === idx;
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => navigateTo(action.url)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "hover:bg-muted/60 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Icon size={16} />
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs font-bold leading-snug">
                              {action.title}
                            </h4>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {action.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                            {action.badge}
                          </span>
                          <ArrowRight
                            size={13}
                            className={`transition-transform ${
                              isSelected
                                ? "translate-x-0.5 text-primary opacity-100"
                                : "opacity-0"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── View 2: Query Active (Results List) ── */}
          {query.trim() && (
            <div className="flex flex-col gap-3">
              {/* Courses Results */}
              {courses.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 pb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <GraduationCap size={12} className="text-primary" />
                      <span>Khóa học trực tuyến ({courses.length})</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    {courses.map((course, idx) => {
                      const itemIndex = idx;
                      const isSelected = selectedIndex === itemIndex;

                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => navigateTo(`/courses/${course.slug}`, query)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "hover:bg-muted/60 text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-11 h-11 rounded-lg bg-muted shrink-0 overflow-hidden">
                              {course.thumbnail ? (
                                <img
                                  src={course.thumbnail}
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                  <GraduationCap size={16} />
                                </div>
                              )}
                            </div>

                            <div className="truncate min-w-0">
                              <h4 className="text-xs font-bold truncate">
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
                          </div>

                          <div className="text-right shrink-0 ml-3">
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
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Articles Results */}
              {posts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <FileText size={12} className="text-amber-500" />
                      <span>Bài viết ({posts.length})</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    {posts.map((post, idx) => {
                      const itemIndex = courses.length + idx;
                      const isSelected = selectedIndex === itemIndex;

                      return (
                        <button
                          key={post.id}
                          type="button"
                          onClick={() => navigateTo(`/post/${post.slug}`, query)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "hover:bg-muted/60 text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-11 h-11 rounded-lg bg-muted shrink-0 overflow-hidden">
                              {post.thumbnail ? (
                                <img
                                  src={post.thumbnail}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-amber-500/10 text-amber-500">
                                  <FileText size={16} />
                                </div>
                              )}
                            </div>

                            <div className="truncate min-w-0">
                              <h4 className="text-xs font-bold truncate">
                                <HighlightedText text={post.title} query={query} />
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                {post.category && (
                                  <span className="text-secondary-foreground font-medium">
                                    <HighlightedText text={post.category.name} query={query} />
                                  </span>
                                )}
                                <span>{post.readtime}m đọc</span>
                              </div>
                            </div>
                          </div>

                          <ArrowRight
                            size={13}
                            className={`shrink-0 transition-opacity ${
                              isSelected ? "opacity-100 text-primary" : "opacity-0"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Results Fallback */}
              {!isLoading && !hasResults && (
                <div className="py-8 text-center text-muted-foreground">
                  <p className="text-xs font-semibold text-foreground mb-1">
                    Không tìm thấy kết quả nào
                  </p>
                  <p className="text-[11px]">
                    Thử tìm kiếm với từ khóa khác hoặc nhấn Enter để tìm kiếm toàn diện.
                  </p>
                </div>
              )}

              {/* Bottom Action: "Xem tất cả" */}
              {hasResults && (
                <button
                  type="button"
                  onClick={() =>
                    navigateTo(
                      `/search?q=${encodeURIComponent(query.trim())}`,
                      query
                    )
                  }
                  onMouseEnter={() => setSelectedIndex(navigableItems.length - 1)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer mt-1 ${
                    selectedIndex === navigableItems.length - 1
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/50 hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Search size={13} />
                    <span>
                      Xem tất cả {data?.counts?.all || courses.length + posts.length} kết quả
                      cho &ldquo;{query}&rdquo;
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] opacity-80">
                    <span>Enter</span>
                    <ArrowRight size={12} />
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/40 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[9px] font-mono">
                ↑↓
              </kbd>
              <span>Điều hướng</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[9px] font-mono">
                ↵
              </kbd>
              <span>Mở</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[9px] font-mono">
                ESC
              </kbd>
              <span>Thoát</span>
            </span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
            <Sparkles size={11} />
            <span>OpenIdear Spotlight</span>
          </div>
        </div>
      </div>
    </div>
  );
};
