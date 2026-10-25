"use client";
import { toast } from "sonner";
import loadingStore from "@/store/LoadingStore";
import { courseApi } from "@/features/series/api/course.api";
import { Trash2, Edit, X, Plus, BookOpen, Sparkles } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useEffect, useState } from "react";
import { useTranslation } from "@/app/hook/useTranslation";
import HoverNote from "@/components/common/HoverNote";
import Link from "next/link";
import ImageUpload from "@/app/(editor)/create/ImageUpload";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";
import TableSkeleton from "@/components/admin/TableSkeleton";

type CourseType = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  thumbnail: string;
  status: "draft" | "published";
  instructor: { username: string; name: string };
  createdAt?: string;
};

const Courses = () => {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CourseType | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [listStatus, setListStatus] = useState<"all" | "trash">("all");
  const [confirmCleanTrash, setConfirmCleanTrash] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    title: "",
    slug: "",
    description: "",
    thumbnail: "",
    price: 0,
    discountPrice: 0,
  });

  const changeLoad = loadingStore((state) => state.changeLoad);
  const { t } = useTranslation();

  useEffect(() => {
    fetchCourses();
  }, [listStatus]);

  const fetchCourses = async () => {
    try {
      changeLoad();
      setIsDataLoading(true);
      const response = await courseApi.getCoursesByUser(listStatus);
      if (response.success) setCourses(response.data.courses);
      else throw new Error(response.message);
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      changeLoad();
      setIsDataLoading(false);
    }
  };

  const openModal = (item: CourseType | null = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        _id: item._id,
        title: item.title,
        slug: item.slug,
        description: item.description || "",
        price: item.price || 0,
        discountPrice: item.discountPrice || 0,
        thumbnail: item.thumbnail,
      });
    } else {
      setSelectedItem(null);
      setFormData({
        _id: "",
        title: "",
        slug: "",
        description: "",
        price: 0,
        discountPrice: 0,
        thumbnail: "",
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    changeLoad();
    try {
      if (selectedItem) {
        const response = await courseApi.updateCourse({
          courseId: formData._id,
          ...formData,
        });
        if (response.success) {
          setCourses(
            courses?.map((c) =>
              c._id === formData._id ? response.data.data : c,
            ),
          );
          toast.success("Course updated successfully");
        } else throw new Error(response.message);
      } else {
        const response = await courseApi.createCourse({
          title: formData.title,
        });
        if (response.success) {
          setCourses((prev) =>
            prev ? [...prev, response.data.data] : [response.data.data],
          );
          toast.success("Course added successfully");
        } else throw new Error(response.message);
      }
      setShowModal(false);
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      changeLoad();
    }
  };

  const handleDeleteCourse = async (id: string) => {
    changeLoad();
    try {
      const response = await courseApi.deleteCourse(id);
      if (response.success) {
        setCourses(courses.filter((c) => c._id !== id));
        toast.success("Course deleted successfully");
      } else throw new Error(response.message);
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      changeLoad();
    }
  };

  const handleRestoreCourse = async (id: string) => {
    changeLoad();
    try {
      const response = await courseApi.restoreCourse(id);
      if (response.success) {
        setCourses(courses.filter((c) => c._id !== id));
        toast.success("Course restored successfully");
      } else throw new Error(response.message);
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      changeLoad();
    }
  };

  const handleCleanTrash = () => {
    changeLoad();
    courseApi
      .cleanTrash()
      .then((response: any) => {
        if (response.success || response.status === 200) {
          const deleted = response.data?.deleted ?? 0;
          toast.success(`Trash cleaned! ${deleted} course(s) permanently deleted.`);
          setCourses([]);
        } else throw new Error(response.message || "Failed to clean trash");
      })
      .catch((error: any) => {
        toast.error(error?.message || "Failed to clean trash");
      })
      .finally(() => {
        changeLoad();
        setConfirmCleanTrash(false);
      });
  };

  const handleImageUploadSuccess = (media: any) => {
    setFormData((prev) => ({ ...prev, thumbnail: media._id }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Course Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage courses
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-admin-primary rounded-lg hover:bg-admin-primary-hover transition-colors"
        >
          <Plus size={16} /> Add Course
        </button>
      </div>

      <div className="flex items-center justify-between border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setListStatus("all")}
            className={`pb-2.5 px-1 text-sm font-medium border-b-2 transition-colors ${
              listStatus === "all"
                ? "border-admin-primary text-admin-primary"
                : "border-transparent text-muted-foreground hover:text-foreground/80 hover:border-border"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setListStatus("trash")}
            className={`pb-2.5 px-1 text-sm font-medium border-b-2 transition-colors ${
              listStatus === "trash"
                ? "border-admin-primary text-admin-primary"
                : "border-transparent text-muted-foreground hover:text-foreground/80 hover:border-border"
            }`}
          >
            Trash
          </button>
        </div>
        {listStatus === "trash" && courses.length > 0 && (
          <button
            onClick={() => setConfirmCleanTrash(true)}
            className="mb-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-colors font-medium text-xs whitespace-nowrap border border-red-200 dark:border-red-800"
            title="Permanently delete all courses in trash"
          >
            <Sparkles size={13} />
            <span>Clean Trash</span>
          </button>
        )}
      </div>

      <div className="bg-background rounded-xl border border-border shadow-admin-sm overflow-hidden">
        {isDataLoading ? (
          <TableSkeleton columns={5} rows={4} />
        ) : !courses || courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            description="Start by creating your first course"
            actionLabel="Add Course"
            onAction={() => openModal()}
          />
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30/80 border-b border-border">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {courses.map((course) => (
                    <tr
                      key={course._id}
                      className="hover:bg-muted/30/50 transition-colors duration-100"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/management/course/${course._id}/curriculum`}
                          className="text-sm font-medium text-foreground hover:text-admin-primary transition-colors"
                        >
                          {course.title}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {course.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {course.discountPrice && course.discountPrice > 0 ? (
                          <div>
                            <span className="text-foreground font-semibold">
                              {course.discountPrice.toLocaleString()} VND
                            </span>
                            <div className="text-xs line-through text-muted-foreground">
                              {course.price.toLocaleString()} VND
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            {course.price.toLocaleString()} VND
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          variant={
                            course.status === "published"
                              ? "success"
                              : "neutral"
                          }
                          dot
                        >
                          {course.status === "published"
                            ? "Published"
                            : "Draft"}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {listStatus === "trash" ? (
                            <button
                              onClick={() => handleRestoreCourse(course._id)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-admin-primary hover:bg-admin-primary hover:text-white transition-colors font-medium text-xs whitespace-nowrap"
                            >
                              Restore
                            </button>
                          ) : (
                            <>
                              <HoverNote note="Edit information">
                                <button
                                  onClick={() => openModal(course)}
                                  className="p-2 rounded-lg text-admin-primary hover:bg-admin-primary-light transition-colors"
                                >
                                  <Edit size={16} />
                                </button>
                              </HoverNote>
                              <HoverNote note="Manage curriculum">
                                <Link
                                  href={`/management/course/${course._id}/curriculum`}
                                  className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors inline-flex"
                                >
                                  <BookOpen size={16} />
                                </Link>
                              </HoverNote>
                              <HoverNote note="Delete course">
                                <button
                                  onClick={() => handleDeleteCourse(course._id)}
                                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors inline-flex"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </HoverNote>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden divide-y divide-border">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="p-4 hover:bg-muted/30/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/management/course/${course._id}/curriculum`}
                        className="text-sm font-medium text-foreground hover:text-admin-primary transition-colors"
                      >
                        {course.title}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-1">
                        {course.price.toLocaleString()} VND
                      </div>
                      <div className="mt-2">
                        <StatusBadge
                          variant={
                            course.status === "published"
                              ? "success"
                              : "neutral"
                          }
                          dot
                        >
                          {course.status === "published"
                            ? "Published"
                            : "Draft"}
                        </StatusBadge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {listStatus === "trash" ? (
                        <button
                          onClick={() => handleRestoreCourse(course._id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 text-admin-primary hover:bg-admin-primary hover:text-white transition-colors font-medium text-xs whitespace-nowrap"
                          title="Restore"
                        >
                          Restore
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => openModal(course)}
                            className="p-2 rounded-lg text-admin-primary hover:bg-admin-primary-light"
                          >
                            <Edit size={16} />
                          </button>
                          <Link
                            href={`/management/course/${course._id}/curriculum`}
                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 inline-flex"
                          >
                            <BookOpen size={16} />
                          </Link>
                          <button
                            onClick={() => handleDeleteCourse(course._id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 inline-flex"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-background rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background rounded-t-xl z-10">
              <h3 className="text-lg font-semibold text-foreground">
                {selectedItem ? "Edit course" : "Add new course"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring transition-all"
                />
              </div>
              <ImageUpload onImageUploaded={handleImageUploadSuccess} />
              {selectedItem && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring transition-all"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                      Price (VND)
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
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                      Discount Price (VND)
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
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring transition-all"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 rounded-b-xl border-t border-border sticky bottom-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-foreground/80 bg-background border border-border rounded-lg hover:bg-muted/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-admin-primary rounded-lg hover:bg-admin-primary-hover transition-colors"
              >
                {selectedItem ? "Save changes" : "Create course"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmCleanTrash}
        onClose={() => setConfirmCleanTrash(false)}
        onConfirm={handleCleanTrash}
        title="Clean Trash"
        message={`Are you sure you want to permanently delete ALL ${courses.length} course(s) in the trash? This will remove every course along with all their chapters, lessons, reviews, and enrollments. This action cannot be undone.`}
        confirmText="Clean Trash"
        variant="danger"
      />
    </div>
  );
};

export default Courses;
