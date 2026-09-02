"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Check,
  X,
  Video,
  FileText,
  ChevronDown,
  ChevronRight,
  Globe,
  EyeOff,
  Loader2,
  BookOpen,
  Settings,
  Image as ImageIcon,
  Upload,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { courseApi } from "@/features/series/api/course.api";
import VideoUpload from "@/app/(editor)/create/VideoUpload";
import ImageUpload from "@/app/(editor)/create/ImageUpload";

// ─── Types ──────────────────────────────────────────────────────────────────

type LessonMedia = { url: string; type: string; cloudflareId?: string };

type Lesson = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: "video" | "text" | "file";
  isFreePreview: boolean;
  order: number;
  media?: LessonMedia | string;
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
  description: string;
  status: "draft" | "published";
  thumbnail?: { url: string };
  chapters: Chapter[];
  instructor: { name: string };
  price?: number;
  discountPrice?: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LESSON_TYPE_ICONS: Record<string, React.ReactNode> = {
  video: <Video size={14} className="text-blue-500" />,
  text: <FileText size={14} className="text-emerald-500" />,
  file: <FileText size={14} className="text-orange-500" />,
};

// ─── Inline editable text ─────────────────────────────────────────────────────

function InlineEdit({
  value,
  onSave,
  placeholder = "Enter title…",
  className = "",
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const start = () => {
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commit = () => {
    if (draft.trim() && draft.trim() !== value) onSave(draft.trim());
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 w-full">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          className={`flex-1 bg-background border border-primary rounded-md px-2 py-1 text-sm outline-none ring-1 ring-primary/40 ${className}`}
          autoFocus
        />
        <button
          onClick={commit}
          className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
        >
          <Check size={14} />
        </button>
        <button
          onClick={() => setEditing(false)}
          className="p-1 text-muted-foreground hover:bg-muted rounded transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={start}
      className={`text-left hover:text-primary transition-colors group ${className}`}
    >
      {value || <span className="text-muted-foreground">{placeholder}</span>}
      <Pencil
        size={12}
        className="inline ml-1.5 opacity-0 group-hover:opacity-60 transition-opacity"
      />
    </button>
  );
}

// ─── Lesson Row ──────────────────────────────────────────────────────────────

function LessonRow({
  lesson,
  chapterId,
  onUpdate,
  onDelete,
  onVideoAttach,
}: {
  lesson: Lesson;
  chapterId: string;
  onUpdate: (lessonId: string, data: Partial<Lesson>) => Promise<void>;
  onDelete: (lessonId: string, chapterId: string) => Promise<void>;
  onVideoAttach: (lessonId: string, mediaId: string) => void;
}) {
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hasVideo = lesson.media != null;

  const handleRename = async (title: string) => {
    setSaving(true);
    try {
      await onUpdate(lesson._id, { title });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    setDeleting(true);
    await onDelete(lesson._id, chapterId);
  };

  const handleVideoUploaded = (mediaId: string, title: string) => {
    setShowVideoUpload(false);
    onVideoAttach(lesson._id, mediaId);
    toast.success("Video attached to lesson!");
  };

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/40 group transition-colors border border-transparent hover:border-border">
        <div className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors flex-shrink-0">
          <GripVertical size={14} />
        </div>

        <span className="flex-shrink-0">{LESSON_TYPE_ICONS[lesson.type]}</span>

        <div className="flex-1 min-w-0 text-sm">
          <InlineEdit
            value={lesson.title}
            onSave={handleRename}
            placeholder="Lesson title…"
          />
        </div>

        <button
          onClick={() =>
            onUpdate(lesson._id, { isFreePreview: !lesson.isFreePreview })
          }
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors flex-shrink-0 ${
            lesson.isFreePreview
              ? "border-emerald-200 text-emerald-700 bg-emerald-50"
              : "border-border text-muted-foreground hover:border-border hover:bg-muted"
          }`}
          title="Toggle free preview"
        >
          {lesson.isFreePreview ? "Free" : "Paid"}
        </button>

        {lesson.type === "video" && (
          <button
            onClick={() => setShowVideoUpload(true)}
            title={hasVideo ? "Replace video" : "Attach video"}
            className={`flex-shrink-0 flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
              hasVideo
                ? "border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100"
                : "border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            <Video size={11} />
            {hasVideo ? "Video ✓" : "Add video"}
          </button>
        )}

        {saving && (
          <Loader2
            size={13}
            className="animate-spin text-muted-foreground flex-shrink-0"
          />
        )}

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive rounded transition-all flex-shrink-0"
        >
          {deleting ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Trash2 size={13} />
          )}
        </button>
      </div>

      {showVideoUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <VideoUpload
            onVideoUploaded={handleVideoUploaded}
            onClose={() => setShowVideoUpload(false)}
            isTitleDisplay={true}
          />
        </div>
      )}
    </>
  );
}

// ─── Chapter Card ─────────────────────────────────────────────────────────────

function ChapterCard({
  chapter,
  onUpdateChapter,
  onDeleteChapter,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onVideoAttach,
}: {
  chapter: Chapter;
  onUpdateChapter: (id: string, data: Partial<Chapter>) => Promise<void>;
  onDeleteChapter: (id: string) => Promise<void>;
  onAddLesson: (chapterId: string, type: Lesson["type"]) => Promise<void>;
  onUpdateLesson: (lessonId: string, data: Partial<Lesson>) => Promise<void>;
  onDeleteLesson: (lessonId: string, chapterId: string) => Promise<void>;
  onVideoAttach: (lessonId: string, mediaId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [addingLesson, setAddingLesson] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `Delete section "${chapter.title}" and all its lessons? This cannot be undone.`
      )
    )
      return;
    setDeleting(true);
    await onDeleteChapter(chapter._id);
  };

  const handleAddLesson = async (type: Lesson["type"]) => {
    setAddingLesson(true);
    await onAddLesson(chapter._id, type);
    setAddingLesson(false);
  };

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
        <div className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors flex-shrink-0">
          <GripVertical size={16} />
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex-1 min-w-0 font-semibold text-sm">
          <InlineEdit
            value={chapter.title}
            onSave={(title) => onUpdateChapter(chapter._id, { title })}
            placeholder="Section title…"
          />
        </div>

        <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block">
          {chapter.lessons.length} lesson
          {chapter.lessons.length !== 1 ? "s" : ""}
        </span>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors flex-shrink-0"
        >
          {deleting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>

      {expanded && (
        <div className="px-3 py-2 space-y-0.5">
          {chapter.lessons.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No lessons yet. Add one below.
            </p>
          )}
          {chapter.lessons.map((lesson) => (
            <LessonRow
              key={lesson._id}
              lesson={lesson}
              chapterId={chapter._id}
              onUpdate={onUpdateLesson}
              onDelete={onDeleteLesson}
              onVideoAttach={onVideoAttach}
            />
          ))}

          <div className="flex gap-2 pt-2 pb-1">
            <button
              onClick={() => handleAddLesson("video")}
              disabled={addingLesson}
              className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-blue-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-blue-50"
            >
              {addingLesson ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Video size={12} />
              )}
              + Video lesson
            </button>
            <button
              onClick={() => handleAddLesson("text")}
              disabled={addingLesson}
              className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-emerald-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-emerald-50"
            >
              <FileText size={12} />+ Text lesson
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CourseBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"curriculum" | "settings">(
    "curriculum"
  );

  const [settingsForm, setSettingsForm] = useState({
    title: "",
    description: "",
    price: 0,
    discountPrice: 0,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [showThumbnailUpload, setShowThumbnailUpload] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // ── Load course ────────────────────────────────────────────────────────────

  const fetchCourse = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await courseApi.getCourseForEdit(id as string);
      if (res.success) {
        const data = (res.data as any).data;
        setCourse(data);
        setSettingsForm({
          title: data.title || "",
          description: data.description || "",
          price: data.price || 0,
          discountPrice: data.discountPrice || 0,
        });
      } else {
        toast.error(res.message || "Failed to load course");
        router.replace("/management/my-courses");
      }
    } catch {
      toast.error("Could not load course");
      router.replace("/management/my-courses");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // ── Chapter operations ─────────────────────────────────────────────────────

  const handleAddChapter = async () => {
    if (!course) return;
    const order = course.chapters.length;
    try {
      const res = await courseApi.addChapter({
        courseId: course._id,
        title: `Section ${order + 1}`,
        order,
      });
      if (!res.success) throw new Error(res.message);
      const newChapter: Chapter = { ...(res.data as any).data, lessons: [] };
      setCourse((prev) =>
        prev ? { ...prev, chapters: [...prev.chapters, newChapter] } : prev
      );
    } catch (e: any) {
      toast.error(e.message || "Failed to add section");
    }
  };

  const handleUpdateChapter = async (
    chapterId: string,
    data: Partial<Chapter>
  ) => {
    try {
      const res = await courseApi.updateChapter({ chapterId, ...data });
      if (!res.success) throw new Error(res.message);
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              chapters: prev.chapters.map((ch) =>
                ch._id === chapterId ? { ...ch, ...data } : ch
              ),
            }
          : prev
      );
    } catch (e: any) {
      toast.error(e.message || "Failed to update section");
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      const res = await courseApi.deleteChapter({ chapterId });
      if (!res.success) throw new Error(res.message);
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              chapters: prev.chapters.filter((ch) => ch._id !== chapterId),
            }
          : prev
      );
      toast.success("Section deleted");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete section");
    }
  };

  // ── Lesson operations ──────────────────────────────────────────────────────

  const handleAddLesson = async (chapterId: string, type: Lesson["type"]) => {
    if (!course) return;
    const chapter = course.chapters.find((ch) => ch._id === chapterId);
    const order = chapter?.lessons.length ?? 0;
    try {
      const res = await courseApi.addLesson({
        chapterId,
        title: `Lesson ${order + 1}`,
        type,
        order,
      });
      if (!res.success) throw new Error(res.message);
      const newLesson: Lesson = (res.data as any).data;
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              chapters: prev.chapters.map((ch) =>
                ch._id === chapterId
                  ? { ...ch, lessons: [...ch.lessons, newLesson] }
                  : ch
              ),
            }
          : prev
      );
    } catch (e: any) {
      toast.error(e.message || "Failed to add lesson");
    }
  };

  const handleUpdateLesson = async (
    lessonId: string,
    data: Partial<Lesson>
  ) => {
    try {
      const res = await courseApi.updateLesson({ lessonId, ...data });
      if (!res.success) throw new Error(res.message);
      const updated = (res.data as any).data;
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              chapters: prev.chapters.map((ch) => ({
                ...ch,
                lessons: ch.lessons.map((l) =>
                  l._id === lessonId ? { ...l, ...updated } : l
                ),
              })),
            }
          : prev
      );
    } catch (e: any) {
      toast.error(e.message || "Failed to update lesson");
    }
  };

  const handleDeleteLesson = async (lessonId: string, chapterId: string) => {
    try {
      const res = await courseApi.deleteLesson({ lessonId });
      if (!res.success) throw new Error(res.message);
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              chapters: prev.chapters.map((ch) =>
                ch._id === chapterId
                  ? {
                      ...ch,
                      lessons: ch.lessons.filter((l) => l._id !== lessonId),
                    }
                  : ch
              ),
            }
          : prev
      );
      toast.success("Lesson deleted");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete lesson");
    }
  };

  const handleVideoAttach = (lessonId: string, mediaId: string) => {
    handleUpdateLesson(lessonId, { media: mediaId as any, type: "video" });
  };

  // ── Settings ───────────────────────────────────────────────────────────────

  const handleSaveSettings = async () => {
    if (!course) return;
    setSettingsSaving(true);
    try {
      const res = await courseApi.updateCourse({
        courseId: course._id,
        ...settingsForm,
      });
      if (!res.success) throw new Error(res.message);
      const updated = (res.data as any).data;
      setCourse((prev) => (prev ? { ...prev, ...updated } : prev));
      toast.success("Course info saved!");
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleThumbnailUploaded = async (image: any) => {
    if (!course) return;
    setShowThumbnailUpload(false);
    try {
      const res = await courseApi.updateCourse({
        courseId: course._id,
        thumbnail: image._id,
      });
      if (!res.success) throw new Error(res.message);
      setCourse((prev) =>
        prev ? { ...prev, thumbnail: { url: image.url } } : prev
      );
      toast.success("Thumbnail updated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update thumbnail");
    }
  };

  // ── Publish / Unpublish ────────────────────────────────────────────────────

  const handlePublish = async () => {
    if (!course) return;
    setPublishing(true);
    try {
      const res = await courseApi.publishCourse(course._id);
      if (!res.success) throw new Error(res.message);
      setCourse((prev) => (prev ? { ...prev, status: "published" } : prev));
      toast.success("🎉 Course is now live!");
    } catch (e: any) {
      toast.error(e.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!course) return;
    if (
      !confirm(
        "Take this course offline? Learners won't be able to access it."
      )
    )
      return;
    setPublishing(true);
    try {
      const res = await courseApi.unpublishCourse(course._id);
      if (!res.success) throw new Error(res.message);
      setCourse((prev) => (prev ? { ...prev, status: "draft" } : prev));
      toast.success("Course moved to draft.");
    } catch (e: any) {
      toast.error(e.message || "Failed to unpublish");
    } finally {
      setPublishing(false);
    }
  };

  // ── Loading / missing ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">
            Loading course builder…
          </p>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const totalLessons = course.chapters.reduce(
    (sum, ch) => sum + ch.lessons.length,
    0
  );
  const isPublished = course.status === "published";

  const checks = [
    { ok: course.title.trim().length > 0, text: "Course has a title" },
    {
      ok: (course.description?.trim()?.length || 0) > 0,
      text: "Course has a description",
    },
    { ok: course.thumbnail != null, text: "Course has a thumbnail" },
    {
      ok: course.chapters.some((ch) => ch.lessons.length > 0),
      text: "At least one section with a lesson",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-background border-b border-border h-14 flex items-center justify-between px-4 lg:px-6 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/management/my-courses"
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-foreground truncate leading-tight">
              {course.title}
            </h1>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Course Builder
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              isPublished
                ? "bg-emerald-100 text-emerald-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {isPublished ? "Live" : "Draft"}
          </span>

          <Link
            href={`/courses/${course.slug}`}
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
          >
            Preview
          </Link>

          {isPublished ? (
            <button
              onClick={handleUnpublish}
              disabled={publishing}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              {publishing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <EyeOff size={14} />
              )}
              Unpublish
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {publishing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Globe size={14} />
              )}
              Publish
            </button>
          )}
        </div>
      </header>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="bg-background border-b border-border px-4 lg:px-6">
        <div className="flex">
          {(
            [
              { id: "curriculum", label: "Curriculum", icon: BookOpen },
              { id: "settings", label: "Settings", icon: Settings },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 lg:px-6 py-6">
        {/* ── Curriculum ── */}
        {activeTab === "curriculum" && (
          <div className="space-y-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground pb-2">
              <span>
                <strong className="text-foreground">
                  {course.chapters.length}
                </strong>{" "}
                sections
              </span>
              <span>
                <strong className="text-foreground">{totalLessons}</strong>{" "}
                lessons
              </span>
            </div>

            {course.chapters.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={26} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Start building your curriculum
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                  Add sections to organize your course content, then add lessons
                  to each section.
                </p>
                <button
                  onClick={handleAddChapter}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  Add First Section
                </button>
              </div>
            )}

            <div className="space-y-3">
              {course.chapters.map((chapter) => (
                <ChapterCard
                  key={chapter._id}
                  chapter={chapter}
                  onUpdateChapter={handleUpdateChapter}
                  onDeleteChapter={handleDeleteChapter}
                  onAddLesson={handleAddLesson}
                  onUpdateLesson={handleUpdateLesson}
                  onDeleteLesson={handleDeleteLesson}
                  onVideoAttach={handleVideoAttach}
                />
              ))}
            </div>

            {course.chapters.length > 0 && (
              <button
                onClick={handleAddChapter}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-3.5 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
              >
                <Plus size={16} />
                Add Section
              </button>
            )}

            {!isPublished && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <AlertTriangle size={15} />
                  Before publishing, make sure:
                </h4>
                <ul className="space-y-1.5">
                  {checks.map((item) => (
                    <li
                      key={item.text}
                      className={`flex items-center gap-2 text-xs font-medium ${
                        item.ok ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {item.ok ? (
                        <CheckCircle
                          size={13}
                          className="text-emerald-500 flex-shrink-0"
                        />
                      ) : (
                        <X size={13} className="text-amber-500 flex-shrink-0" />
                      )}
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── Settings ── */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl">
            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Course Thumbnail
              </label>
              <div className="flex items-start gap-4">
                <div className="w-40 h-24 rounded-xl overflow-hidden border border-border bg-muted flex-shrink-0">
                  {course.thumbnail?.url ? (
                    <img
                      src={course.thumbnail.url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon size={28} />
                    </div>
                  )}
                </div>
                <div>
                  <button
                    onClick={() => setShowThumbnailUpload(true)}
                    className="flex items-center gap-2 text-sm font-medium text-primary border border-primary/30 rounded-lg px-3 py-2 hover:bg-primary/5 transition-colors"
                  >
                    <Upload size={14} />
                    {course.thumbnail ? "Replace Thumbnail" : "Upload Thumbnail"}
                  </button>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Recommended: 1280×720 px (16:9)
                  </p>
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="course-title"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                Title <span className="text-destructive">*</span>
              </label>
              <input
                id="course-title"
                type="text"
                value={settingsForm.title}
                onChange={(e) =>
                  setSettingsForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="What will students learn?"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="course-desc"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                id="course-desc"
                rows={5}
                value={settingsForm.description}
                onChange={(e) =>
                  setSettingsForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your course, who it's for, and what students will achieve…"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="course-price"
                  className="block text-sm font-semibold text-foreground mb-1.5"
                >
                  Price (VNĐ)
                </label>
                <input
                  id="course-price"
                  type="number"
                  min={0}
                  value={settingsForm.price}
                  onChange={(e) =>
                    setSettingsForm((f) => ({
                      ...f,
                      price: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Set to 0 for a free course
                </p>
              </div>
              <div>
                <label
                  htmlFor="course-discount"
                  className="block text-sm font-semibold text-foreground mb-1.5"
                >
                  Discount Price (VNĐ)
                </label>
                <input
                  id="course-discount"
                  type="number"
                  min={0}
                  value={settingsForm.discountPrice}
                  onChange={(e) =>
                    setSettingsForm((f) => ({
                      ...f,
                      discountPrice: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-border">
              <button
                onClick={handleSaveSettings}
                disabled={settingsSaving}
                className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
              >
                {settingsSaving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Thumbnail upload modal ─────────────────────────────────────── */}
      {showThumbnailUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl border border-border shadow-2xl overflow-hidden max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-bold">Upload Thumbnail</h2>
              <button
                onClick={() => setShowThumbnailUpload(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <ImageUpload
              onImageUploaded={handleThumbnailUploaded}
              onClose={() => setShowThumbnailUpload(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
