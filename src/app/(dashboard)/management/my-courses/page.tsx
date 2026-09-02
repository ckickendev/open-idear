"use client";
import React, { useEffect, useState } from "react";
import {
  Plus,
  BookOpen,
  Pencil,
  Trash2,
  Globe,
  EyeOff,
  Clock,
  Users,
  Search,
  Loader2,
  RefreshCw,
  Star,
  ExternalLink,
  MoreVertical,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { courseApi } from "@/features/series/api/course.api";
import { toast } from "sonner";
import loadingStore from "@/store/LoadingStore";
import { categoryApi } from "@/features/categories/api/category.api";
import { topicApi } from "@/features/topics/api/topic.api";

// ─── Types ───────────────────────────────────────────────────────────────────

type Course = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  status: "draft" | "published";
  thumbnail?: { url: string };
  instructor: { username: string; name: string; avatar?: string };
  createdAt?: string;
  chapters?: { lessons?: any[] }[];
  studentsCount?: number;
  averageRating?: number;
};

// ─── Create modal ─────────────────────────────────────────────────────────────

function CreateCourseModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (course: Course) => void;
}) {
  const [categoriesList, setCategoriesList] = useState<
    { _id: string; name: string }[]
  >([]);
  const [topicsList, setTopicsList] = useState<
    { _id: string; name: string }[]
  >([]);
  const [title, setTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [catRes, topRes] = await Promise.all([
          categoryApi.getCategories() as any,
          topicApi.getTopics() as any,
        ]);
        const catData = catRes.data || catRes;
        if (catData.categories) setCategoriesList(catData.categories);
        const topData = topRes.data || topRes;
        if (topData.data) setTopicsList(topData.data);
      } catch {}
    })();
  }, []);

  const toggleItem = (
    id: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Please enter a course title.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await courseApi.createCourse({
        title: title.trim(),
        categoryIds: selectedCategories,
        topicIds: selectedTopics,
      });
      if (!res.success) throw new Error(res.message);
      toast.success("Course created! Opening builder…");
      onCreated((res.data as any).data);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            Create New Course
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            You can fill in details in the builder after creation.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Course Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g. React for Beginners"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              autoFocus
            />
          </div>

          {categoriesList.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Categories
              </label>
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                {categoriesList.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() =>
                      toggleItem(
                        cat._id,
                        selectedCategories,
                        setSelectedCategories
                      )
                    }
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                      selectedCategories.includes(cat._id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {topicsList.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Topics
              </label>
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                {topicsList.slice(0, 20).map((topic) => (
                  <button
                    key={topic._id}
                    onClick={() =>
                      toggleItem(
                        topic._id,
                        selectedTopics,
                        setSelectedTopics
                      )
                    }
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                      selectedTopics.includes(topic._id)
                        ? "bg-primary/10 text-primary border-primary"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving || !title.trim()}
            className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Plus size={14} />
                Create & Build
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({
  course,
  onDelete,
  onRestore,
  isTrash,
}: {
  course: Course;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  isTrash: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const totalLessons =
    course.chapters?.reduce((s, ch) => s + (ch.lessons?.length || 0), 0) || 0;
  const totalSections = course.chapters?.length || 0;
  const isPublished = course.status === "published";

  const handleDelete = async () => {
    if (!confirm(`Delete "${course.title}"? It will go to trash.`)) return;
    setDeleting(true);
    await onDelete(course._id);
    setDeleting(false);
  };

  const handleRestore = async () => {
    if (!onRestore) return;
    setRestoring(true);
    await onRestore(course._id);
    setRestoring(false);
  };

  return (
    <div className="group bg-background border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 flex flex-col">
      {/* Thumbnail */}
      <div className="aspect-video bg-muted relative overflow-hidden flex-shrink-0">
        {course.thumbnail?.url ? (
          <img
            src={course.thumbnail.url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={32} className="text-muted-foreground/40" />
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
              isPublished
                ? "bg-emerald-100 text-emerald-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {isPublished ? "Live" : "Draft"}
          </span>
        </div>
        {/* Menu button */}
        <div className="absolute top-2 right-2">
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 bg-background/80 backdrop-blur-sm rounded-lg text-muted-foreground hover:text-foreground transition-colors shadow-sm"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 bg-background border border-border rounded-xl shadow-xl py-1.5 min-w-[160px]">
                  {!isTrash && (
                    <>
                      <Link
                        href={`/courses/${course.slug}`}
                        target="_blank"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <ExternalLink size={13} />
                        Preview page
                      </Link>
                      <Link
                        href={`/management/course/${course._id}/curriculum`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Pencil size={13} />
                        Open builder
                      </Link>
                      <div className="h-px bg-border my-1" />
                    </>
                  )}
                  {isTrash ? (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleRestore();
                      }}
                      disabled={restoring}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                      <RefreshCw size={13} />
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleDelete();
                      }}
                      disabled={deleting}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={13} />
                      {deleting ? "Deleting…" : "Delete"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {course.description}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen size={11} />
            {totalSections} sections
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {totalLessons} lessons
          </span>
          {(course.studentsCount ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Users size={11} />
              {course.studentsCount}
            </span>
          )}
          {(course.averageRating ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-yellow-600">
              <Star size={11} fill="currentColor" />
              {course.averageRating?.toFixed(1)}
            </span>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-foreground">
            {course.price === 0 ? (
              <span className="text-emerald-600">Free</span>
            ) : (
              <span>{course.price?.toLocaleString("vi-VN")} ₫</span>
            )}
          </div>
        </div>

        {/* CTA */}
        {!isTrash && (
          <Link
            href={`/management/course/${course._id}/curriculum`}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-primary/5 text-primary border border-primary/20 text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Pencil size={12} />
            Open Builder
          </Link>
        )}
        {isTrash && (
          <button
            onClick={handleRestore}
            disabled={restoring}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-muted text-foreground text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {restoring ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RefreshCw size={12} />
            )}
            Restore Course
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <BookOpen size={36} className="text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        No courses yet
      </h2>
      <p className="text-muted-foreground mb-8 max-w-xs mx-auto text-sm">
        Create your first course and start sharing your knowledge with the
        world.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
      >
        <Plus size={18} />
        Create First Course
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const MyCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [listStatus, setListStatus] = useState<"all" | "trash">("all");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const changeLoad = loadingStore((s) => s.changeLoad);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseApi.getCoursesByUser(
        listStatus === "trash" ? "trash" : undefined
      );
      if (res.success) {
        setCourses((res.data as any).courses || []);
      }
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [listStatus]);

  const handleCreated = (course: Course) => {
    setShowCreateModal(false);
    // Navigate to the builder immediately
    window.location.href = `/management/course/${course._id}/curriculum`;
  };

  const handleDelete = async (courseId: string) => {
    try {
      const res = await courseApi.deleteCourse(courseId);
      if (!res.success) throw new Error(res.message);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
      toast.success("Course moved to trash");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
  };

  const handleRestore = async (courseId: string) => {
    try {
      const res = await courseApi.restoreCourse(courseId);
      if (!res.success) throw new Error(res.message);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
      toast.success("Course restored");
    } catch (e: any) {
      toast.error(e.message || "Failed to restore");
    }
  };

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const publishedCount = courses.filter(
    (c) => c.status === "published"
  ).length;
  const draftCount = courses.filter((c) => c.status === "draft").length;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold mb-1 flex items-center gap-3">
                <LayoutDashboard size={28} />
                My Courses
              </h1>
              <p className="text-primary-foreground/70 text-sm">
                Create, manage, and publish your courses.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-shrink-0 flex items-center gap-2 bg-white text-primary font-bold px-5 py-2.5 rounded-xl hover:bg-white/90 transition-all shadow-lg text-sm"
            >
              <Plus size={16} />
              New Course
            </button>
          </div>

          {/* Stats */}
          {courses.length > 0 && (
            <div className="flex gap-6 mt-7">
              {[
                { label: "Total", value: courses.length, icon: BookOpen },
                {
                  label: "Live",
                  value: publishedCount,
                  icon: Globe,
                  color: "text-emerald-300",
                },
                {
                  label: "Draft",
                  value: draftCount,
                  icon: EyeOff,
                  color: "text-yellow-300",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-2.5 border border-white/10"
                >
                  <div className="text-xl font-extrabold">{stat.value}</div>
                  <div
                    className={`text-xs font-medium mt-0.5 ${
                      stat.color || "text-white/60"
                    }`}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Tab filter */}
          <div className="flex gap-1 bg-muted rounded-xl p-1 flex-shrink-0">
            {(["all", "trash"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setListStatus(s)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  listStatus === s
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "all" ? "Active" : "Trash"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              placeholder="Search courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            onClick={fetchCourses}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted flex-shrink-0"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-background rounded-2xl border border-border overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-4/5" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 && courses.length === 0 ? (
          <EmptyState onCreate={() => setShowCreateModal(true)} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No courses match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onDelete={handleDelete}
                onRestore={handleRestore}
                isTrash={listStatus === "trash"}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <CreateCourseModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};

export default MyCoursesPage;
