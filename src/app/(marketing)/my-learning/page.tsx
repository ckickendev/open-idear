"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Play,
  ArrowRight,
  Clock,
  Award,
  Search,
  Filter,
  Lock,
} from "lucide-react";
import { courseApi } from "@/features/series/api/course.api";
import authenticationStore from "@/store/AuthenticationStore";
import loadingStore from "@/store/LoadingStore";

type EnrollmentItem = {
  _id: string;
  progress: number;
  completedLessons: string[];
  enrolledAt: string;
  lastAccessedAt: string;
  status: string;
  course: {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: { url: string };
    instructor: { name: string; avatar?: string };
    chapters: { _id: string; lessons: { _id: string }[] }[];
  };
};

// ─── Progress Bar ───────────────────────────────────────────────────────────

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-500 ${
        progress >= 100
          ? "bg-emerald-500"
          : progress > 50
            ? "bg-[var(--color-admin-primary)]"
            : "bg-indigo-400"
      }`}
      style={{ width: `${Math.min(progress, 100)}%` }}
    />
  </div>
);

// ─── Course Card ────────────────────────────────────────────────────────────

const EnrolledCourseCard = ({ enrollment }: { enrollment: EnrollmentItem }) => {
  const { course, progress, completedLessons, status } = enrollment;

  const totalLessons =
    course.chapters?.reduce(
      (total, ch) => total + (ch.lessons?.length || 0),
      0,
    ) || 0;

  return (
    <Link
      href={`/courses/${course.slug}/learn`}
      className="group bg-background rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 hover:border-indigo-100 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {course.thumbnail?.url ? (
          <img
            src={course.thumbnail.url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <BookOpen size={36} />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 bg-background/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-14 h-14 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <Play
              size={24}
              className="text-foreground ml-1"
              fill="currentColor"
            />
          </div>
        </div>
        {/* Status badge */}
        {status === "completed" && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Award size={12} /> Hoàn thành
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-[15px] text-foreground leading-tight line-clamp-2 mb-2 group-hover:text-[var(--color-admin-primary)] transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-4 font-medium">
          {course.instructor?.name || "Giảng viên"}
        </p>

        {/* Progress */}
        <div className="mb-3">
          <ProgressBar progress={progress} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            {completedLessons.length} / {totalLessons} bài học
          </span>
          <span
            className={`text-xs font-bold ${
              progress >= 100
                ? "text-emerald-600"
                : "text-[var(--color-admin-primary)]"
            }`}
          >
            {progress}%
          </span>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="px-5 pb-5">
        <div className="bg-muted/30 group-hover:bg-indigo-50 rounded-xl py-3 text-center transition-colors">
          <span className="text-sm font-bold text-foreground/80 group-hover:text-[var(--color-admin-primary)] flex items-center justify-center gap-2 transition-colors">
            {progress > 0 && progress < 100 ? (
              <>
                Tiếp tục học <ArrowRight size={16} />
              </>
            ) : progress >= 100 ? (
              <>
                Xem lại khóa học <ArrowRight size={16} />
              </>
            ) : (
              <>
                Bắt đầu học <Play size={16} />
              </>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
};

// ─── Skeleton ───────────────────────────────────────────────────────────────

const CourseSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="bg-background rounded-2xl border border-border overflow-hidden animate-pulse"
      >
        <div className="aspect-video bg-muted" />
        <div className="p-5 space-y-3">
          <div className="h-4 bg-muted rounded w-4/5" />
          <div className="h-3 bg-muted rounded w-1/3" />
          <div className="h-2 bg-muted rounded-full w-full" />
          <div className="h-3 bg-muted rounded w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Empty State ────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="text-center py-20">
    <div className="w-24 h-24 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <BookOpen size={40} className="text-[var(--color-admin-primary)]" />
    </div>
    <h2 className="text-2xl font-bold text-foreground mb-3">
      Chưa có khóa học nào
    </h2>
    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
      Bạn chưa đăng ký khóa học nào. Hãy khám phá và bắt đầu hành trình học tập!
    </p>
    <Link
      href="/courses"
      className="inline-flex items-center gap-2 bg-[var(--color-admin-primary)] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[var(--color-admin-primary-hover)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
    >
      Khám phá khóa học <ArrowRight size={18} />
    </Link>
  </div>
);

// ─── Main Page ──────────────────────────────────────────────────────────────

const MyLearningPage = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "completed"
  >("all");
  const currentUser = authenticationStore((state) => state.currentUser);
  const isLoading = loadingStore((s) => s.isLoading);
  const changeLoad = loadingStore((s) => s.changeLoad);

  useEffect(() => {
    if (!currentUser?._id) return;
    fetchEnrollments();
  }, [currentUser?._id]);

  const fetchEnrollments = async () => {
    changeLoad();
    try {
      const res = await courseApi.getMyEnrollments();
      if (res.success) {
        setEnrollments((res.data as any)?.enrollments || []);
      }
    } catch (error) {
      console.error("Failed to fetch enrollments:", error);
    } finally {
      changeLoad();
    }
  };

  // Auth check
  if (!currentUser?._id) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <Lock size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Vui lòng đăng nhập
        </h2>
        <p className="text-muted-foreground">
          Đăng nhập để xem các khóa học đã đăng ký.
        </p>
      </div>
    );
  }

  // Filter and search
  const filtered = enrollments.filter((e) => {
    if (!e.course) return false;
    const matchSearch = e.course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const inProgressCount = enrollments.filter(
    (e) => e.status === "active",
  ).length;
  const completedCount = enrollments.filter(
    (e) => e.status === "completed",
  ).length;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[var(--color-admin-primary)] via-indigo-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">
            Học tập của tôi
          </h1>
          <p className="text-indigo-200 font-medium">
            Theo dõi tiến trình và tiếp tục hành trình học tập.
          </p>

          {/* Stats */}
          {enrollments.length > 0 && (
            <div className="flex gap-8 mt-8">
              <div className="bg-background/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10">
                <div className="text-2xl font-extrabold">
                  {enrollments.length}
                </div>
                <div className="text-xs text-indigo-200 font-medium">
                  Tổng khóa học
                </div>
              </div>
              <div className="bg-background/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10">
                <div className="text-2xl font-extrabold">{inProgressCount}</div>
                <div className="text-xs text-indigo-200 font-medium">
                  Đang học
                </div>
              </div>
              <div className="bg-background/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10">
                <div className="text-2xl font-extrabold">{completedCount}</div>
                <div className="text-xs text-indigo-200 font-medium">
                  Đã hoàn thành
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls */}
        {enrollments.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex gap-2">
              {(["all", "active", "completed"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                    filterStatus === status
                      ? "bg-[var(--color-admin-primary)] text-white shadow-md"
                      : "bg-background border border-border text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  {status === "all"
                    ? "Tất cả"
                    : status === "active"
                      ? "Đang học"
                      : "Hoàn thành"}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-80">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent text-sm"
              />
            </div>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <CourseSkeleton />
        ) : filtered.length === 0 && enrollments.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Không tìm thấy khóa học nào khớp với bộ lọc.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((enrollment) => (
              <EnrolledCourseCard
                key={enrollment._id}
                enrollment={enrollment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearningPage;
