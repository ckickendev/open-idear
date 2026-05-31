"use client";
import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  BookOpen,
  X,
  ArrowLeft,
  Search,
  Video,
  Loader2,
  LayoutDashboard,
  Pencil,
  Trash2,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { courseApi } from "@/features/series/api/course.api";
import { categoryApi } from "@/features/categories/api/category.api";
import { topicApi } from "@/features/topics/api/topic.api";
import { toast } from "sonner";
import loadingStore from "@/store/LoadingStore";
import LoadingComponent from "@/components/common/Loading";
import HoverNote from "@/components/common/HoverNote";

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
  categoryIds?: string[];
  categories?: { _id: string; name: string }[];
  topicIds?: string[];
  topics?: { _id: string; name: string }[];
};

// ─── Modal ─────────────────────────────────────────────────────────────────

type CourseModalProps = {
  course: Course | null;
  onClose: () => void;
  onSaved: (course: Course) => void;
};

const CourseModal = ({ course, onClose, onSaved }: CourseModalProps) => {
  const [categoriesList, setCategoriesList] = useState<
    { _id: string; name: string }[]
  >([]);
  const [topicsList, setTopicsList] = useState<{ _id: string; name: string }[]>(
    [],
  );
  const [formData, setFormData] = useState({
    title: course?.title ?? "",
    description: course?.description ?? "",
    price: course?.price ?? 0,
    discountPrice: course?.discountPrice ?? 0,
    categoryIds: course?.categoryIds ?? [],
    topicIds: course?.topicIds ?? (course?.topics?.map((t) => t._id) || []),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategoriesAndTopics = async () => {
      try {
        const [catRes, topRes] = await Promise.all([
          categoryApi.getCategories() as any,
          topicApi.getTopics() as any,
        ]);
        const catData = catRes.data || catRes;
        if (catData.categories) setCategoriesList(catData.categories);

        const topData = topRes.data || topRes;
        if (topData.data) setTopicsList(topData.data);
      } catch (err) {
        console.error("Failed to fetch categories or topics", err);
      }
    };
    fetchCategoriesAndTopics();
  }, []);
  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError("Vui lòng nhập tiêu đề");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let res;
      if (course) {
        res = await courseApi.updateCourse({
          courseId: course._id,
          ...formData,
        });
      } else {
        res = await courseApi.createCourse({
          title: formData.title,
          categoryIds: formData.categoryIds,
          topicIds: formData.topicIds,
        });
      }
      if (!res.success) throw new Error(res.message);

      toast.success(course ? "Cập nhật thành công" : "Tạo khóa học thành công");
      onSaved(res.data.data);
    } catch (e: any) {
      setError(e.message || "Đã xảy ra lỗi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-background shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-lg overflow-hidden border border-border">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h3 className="text-xl font-bold text-foreground">
            {course ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Tiêu đề khóa học
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Vd: Lập trình ReactJS từ số 0..."
              className="w-full px-4 py-3 border border-border rounded-none text-base focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>
          {course && (
            <>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Mô tả ngắn
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  placeholder="Tóm tắt về khóa học của bạn..."
                  className="w-full px-4 py-3 border border-border rounded-none text-base focus:ring-2 focus:ring-ring focus:border-transparent outline-none resize-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Giá gốc (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 border border-border rounded-none text-base focus:ring-2 focus:ring-ring focus:border-transparent outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Giá sau ưu đãi (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPrice: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 border border-border rounded-none text-base focus:ring-2 focus:ring-ring focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Danh mục khóa học
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto border border-border p-3">
                  {categoriesList.map((category) => (
                    <label
                      key={category._id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={formData.categoryIds.includes(category._id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData((prev) => ({
                            ...prev,
                            categoryIds: checked
                              ? [...prev.categoryIds, category._id]
                              : prev.categoryIds.filter(
                                  (id) => id !== category._id,
                                ),
                          }));
                        }}
                        className="rounded text-foreground focus:ring-ring"
                      />
                      <span className="text-sm text-foreground/80">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Chủ đề (Topic)
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto border border-border p-3">
                  {topicsList.map((topic) => (
                    <label
                      key={topic._id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={formData.topicIds.includes(topic._id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData((prev) => ({
                            ...prev,
                            topicIds: checked
                              ? [...prev.topicIds, topic._id]
                              : prev.topicIds.filter((id) => id !== topic._id),
                          }));
                        }}
                        className="rounded text-foreground focus:ring-ring"
                      />
                      <span className="text-sm text-foreground/80">
                        {topic.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-border text-foreground font-bold hover:bg-muted/30 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-background text-white font-bold hover:bg-card disabled:opacity-50 flex items-center justify-center gap-2 transition-colors min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Đang lưu…
                </>
              ) : course ? (
                "Lưu thay đổi"
              ) : (
                "Tạo khóa học"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Status badge ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  return (
    <span
      className={`inline-flex items-center text-xs font-bold px-2 py-1 uppercase tracking-wider ${status === "published" ? "bg-[#d1d7dc] text-foreground" : "bg-[#fff] border border-border text-foreground"}`}
    >
      {status === "published" ? "Đã xuất bản" : "Bản nháp"}
    </span>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

const MyCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState<{ open: boolean; course: Course | null }>({
    open: false,
    course: null,
  });

  const isLoading = loadingStore((s) => s.isLoading);
  const changeLoad = loadingStore((s) => s.changeLoad);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    changeLoad();
    const res = await courseApi.getCoursesByUser();
    changeLoad();
    if (res.success) {
      setCourses(res.data.courses ?? []);
    } else {
      toast.success(res.message || "Không thể tải danh sách khóa học");
    }
  };

  const handleSaved = (saved: Course) => {
    setCourses((prev) => {
      const idx = prev.findIndex((c) => c._id === saved._id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
    setModal({ open: false, course: null });
  };

  const handleDelete = async (courseId: string) => {
    if (
      !confirm(
        "Bạn có chắc muốn xóa khóa học này? Hành động này không thể hoàn tác.",
      )
    )
      return;
    changeLoad();
    const res = await courseApi.deleteCourse(courseId);
    changeLoad();
    if (res.success) {
      setCourses((prev) => prev.filter((c) => c._id !== courseId));

      toast.success("Đã xóa khóa học");
    } else {
      toast.success(res.message || "Không thể xóa khóa học");
    }
  };

  const handleTogglePublish = async (
    courseId: string,
    currentStatus: string,
  ) => {
    changeLoad();
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const res = await courseApi.updateCourse({ courseId, status: newStatus });
    changeLoad();
    if (res.success) {
      setCourses((prev) =>
        prev.map((c) => (c._id === courseId ? { ...c, status: newStatus } : c)),
      );

      toast.success(
        newStatus === "published"
          ? "Đã xuất bản khóa học"
          : "Đã đưa khóa học về bản nháp",
      );
    } else {
      toast.success(res.message || "Lỗi khi cập nhật trạng thái khóa học");
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <LoadingComponent isLoading={isLoading} />

      {/* Top Navigation */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/courses"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
              Khóa học của tôi
            </h1>
          </div>
          <div>
            <button
              onClick={() => setModal({ open: true, course: null })}
              className="bg-[#1c1d1f] hover:bg-background text-white font-bold px-6 py-3 transition-colors shadow-sm"
            >
              Tạo khóa học mới
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Nav (Static for visually mimicking Udemy) */}
          <div className="hidden lg:block lg:col-span-1">
            <nav className="flex flex-col space-y-1">
              <Link
                href="#"
                className="border-l-4 border-border pl-4 py-2 font-bold text-foreground bg-muted/30"
              >
                Khóa học
              </Link>
              <Link
                href="#"
                className="border-l-4 border-transparent pl-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                Giao tiếp
              </Link>
              <Link
                href="#"
                className="border-l-4 border-transparent pl-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                Hiệu suất
              </Link>
              <Link
                href="#"
                className="border-l-4 border-transparent pl-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                Công cụ
              </Link>
            </nav>
          </div>

          {/* Main Content Pane */}
          <div className="lg:col-span-3">
            {courses.length === 0 && !isLoading ? (
              <div className="border border-border p-12 text-center flex flex-col items-center justify-center bg-muted/30">
                <div className="w-48 h-32 bg-muted mb-6 flex items-center justify-center text-muted-foreground">
                  <BookOpen size={48} />
                </div>
                <h2 className="text-2xl font-bold mb-3">
                  Bắt tay vào khóa học của bạn
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Biết đâu khóa học của bạn sẽ thay đổi cuộc đời ai đó. Bắt đầu
                  ngay hôm nay để mang kiến thức đến với mọi người.
                </p>
                <button
                  onClick={() => setModal({ open: true, course: null })}
                  className="bg-[#1c1d1f] hover:bg-background text-white font-bold px-8 py-4 transition-colors text-lg"
                >
                  Tạo khóa học ngay
                </button>
              </div>
            ) : (
              <div>
                {/* Tools / Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                  <div className="relative w-full sm:w-96">
                    <input
                      type="text"
                      placeholder="Tìm khóa học của bạn"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 border border-border rounded-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                    />
                    <button className="absolute right-0 top-0 h-full px-4 bg-background text-white hover:bg-card transition-colors">
                      <Search size={18} />
                    </button>
                  </div>
                  <div className="text-muted-foreground font-bold hidden sm:block">
                    {filteredCourses.length} khóa học
                  </div>
                </div>

                {/* List View */}
                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <div
                      key={course._id}
                      className="group border border-border hover:border-border bg-background flex flex-col sm:flex-row cursor-pointer transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="w-full sm:w-[260px] aspect-[16/9] bg-muted flex-shrink-0 relative">
                        {course.thumbnail?.url ? (
                          <img
                            src={course.thumbnail.url}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <BookOpen size={32} />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 pb-1">
                          <StatusBadge status={course.status} />
                        </div>
                      </div>

                      {/* Middle Details */}
                      <div className="p-4 flex flex-col flex-1 pl-6">
                        <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-[#5624d0] transition-colors leading-tight">
                          {course.title}
                        </h3>
                        <div className="text-sm text-muted-foreground mb-3 line-clamp-2 pr-4">
                          {course.description || "Chưa có mô tả khóa học"}
                        </div>

                        <div className="mt-auto">
                          {course.price === 0 ? (
                            <span className="font-bold text-foreground">
                              Miễn phí
                            </span>
                          ) : course.discountPrice &&
                            course.discountPrice > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground text-lg">
                                {course.discountPrice.toLocaleString()} VNĐ
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                {course.price.toLocaleString()} VNĐ
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-foreground text-lg">
                              {course.price.toLocaleString()} VNĐ
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="w-full sm:w-64 p-4 flex flex-row sm:flex-col justify-end sm:justify-center items-center sm:items-end gap-2 border-t sm:border-t-0 sm:border-l border-border">
                        <Link
                          href={`/management/course/${course._id}/curriculum`}
                          className="w-full text-center border border-border hover:bg-muted/30 text-foreground font-bold px-4 py-2 transition-colors"
                        >
                          Quản lý chương trình
                        </Link>
                        <button
                          onClick={() =>
                            handleTogglePublish(course._id, course.status)
                          }
                          className={`w-full text-center border font-bold px-4 py-2 transition-colors ${course.status === "published" ? "border-border bg-background text-foreground hover:bg-muted/30" : "border-border bg-background text-white hover:bg-card"}`}
                        >
                          {course.status === "published"
                            ? "Hủy bản nháp"
                            : "Xuất bản khóa học"}
                        </button>
                        <div className="flex w-full gap-2 mt-1">
                          <button
                            onClick={() => setModal({ open: true, course })}
                            className="flex-1 border border-border hover:border-border text-foreground text-sm font-bold py-1.5 transition-colors flex justify-center items-center"
                            title="Chỉnh sửa chung"
                          >
                            Cài đặt
                          </button>
                          <button
                            onClick={() => handleDelete(course._id)}
                            className="flex-1 border border-border hover:border-red-600 hover:text-red-600 text-foreground text-sm font-bold py-1.5 transition-colors flex justify-center items-center"
                            title="Xóa khóa học"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredCourses.length === 0 && courses.length > 0 && (
                    <div className="py-12 text-center text-muted-foreground">
                      Không tìm thấy khóa học nào khớp với từ khóa"{searchTerm}
                      ".
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Rendering */}
      {modal.open && (
        <CourseModal
          course={modal.course}
          onClose={() => setModal({ open: false, course: null })}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default MyCourses;
