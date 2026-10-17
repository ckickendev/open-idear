"use client";
import { ENV } from "@/api/const";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import loadingStore from "@/store/LoadingStore";
import authenticationStore from "@/store/AuthenticationStore";
import cartStore from "@/store/CartStore";
import {
  Play,
  Check,
  ChevronDown,
  ChevronUp,
  Globe,
  Info,
  Clock,
  Smartphone,
  Infinity,
  Award,
  ShoppingCart,
  CheckCircle,
  Loader2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api/axios";
import { courseApi } from "@/features/series/api/course.api";
import { toast } from "sonner";
import { Stream } from "@cloudflare/stream-react";

type Lesson = {
  _id: string;
  title: string;
  slug: string;
  type: string;
  url: string;
  isFreePreview: boolean;
  order: number;
  duration?: number;
  media?: {
    duration?: number;
    url?: string;
    cloudflareId?: string;
    type?: string;
  };
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
  price: number;
  discountPrice?: number;
  thumbnail: { url: string };
  category?: { name: string; slug: string };
  topics?: Array<{ name: string; slug: string }>;
  instructor: { name: string; avatar: string; bio: string; headline?: string };
  chapters: Chapter[];
  studentsCount?: number;
  averageRating?: number;
  ratingCount?: number;
  whatYouWillLearn?: string[];
  requirements?: string[];
  totalDuration?: number;
  level?: string;
};

const CourseDetail = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const changeLoad = loadingStore((state) => state.changeLoad);
  const currentUser = authenticationStore((state) => state.currentUser);
  const { items: cartItems, addToCart, fetchCart } = cartStore();

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId],
    );
  };

  const toggleAllChapters = () => {
    if (expandedChapters.length === (course?.chapters?.length || 0)) {
      setExpandedChapters([]);
    } else {
      setExpandedChapters(course?.chapters?.map((c) => c._id) || []);
    }
  };

  const totalLessons =
    course?.chapters?.reduce(
      (acc, chap) => acc + (chap.lessons?.length || 0),
      0,
    ) || 0;

  const totalDurationSecs =
    course?.totalDuration ||
    course?.chapters?.reduce(
      (acc, chap) =>
        acc +
        (chap.lessons?.reduce(
          (lAcc, lesson) =>
            lAcc + (lesson.media?.duration || lesson.duration || 0),
          0,
        ) || 0),
      0,
    ) ||
    0;

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

  // The preview video is always the first video of the course (or specifically selected preview)
  const firstVideoLesson = course?.chapters
    ?.flatMap((ch) => ch.lessons || [])
    .find(
      (l) =>
        (l.type === "video" || l.media?.url || l.media?.cloudflareId) &&
        (l.media?.cloudflareId || l.media?.url),
    );

  const defaultFirstVideoId =
    firstVideoLesson?.media?.cloudflareId || firstVideoLesson?.media?.url || "";

  const activePreviewVideoId = previewVideoId || defaultFirstVideoId;

  const posterUrl = activePreviewVideoId
    ? `https://videodelivery.net/${activePreviewVideoId}/thumbnails/thumbnail.jpg?height=500`
    : course?.thumbnail?.url || "";

  const formatTotalTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return "7h 30m total length";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m ` : ""}total length`;
    }
    return `${minutes}m total length`;
  };

  const formatTotalHours = (seconds: number) => {
    if (!seconds || seconds <= 0) return "7.5";
    const hours = seconds / 3600;
    return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
  };

  const formatLessonDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return "15:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        changeLoad();
        const response = await courseApi.getCourseBySlug(slug as string);
        if (response.success) {
          setCourse((response.data as any)?.data || (response as any)?.data);
        } else {
          toast.error("Course not found or not published");
        }
      } catch (error) {
        console.error(error);
        toast.error("Course not found or not published");
      } finally {
        changeLoad();
      }
    };
    if (slug) fetchCourse();
  }, [slug]);

  // Check enrollment status when user and course are available
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!currentUser?._id || !course?._id) return;

      try {
        const res = await courseApi.checkEnrollment(course._id);
        if (res.success) {
          setIsEnrolled((res.data as any)?.data?.enrolled || false);
        }
      } catch (error) {
        console.error("Failed to check enrollment:", error);
      }
    };
    checkEnrollmentStatus();
  }, [currentUser?._id, course?._id]);

  // Check if course is in cart
  useEffect(() => {
    if (course?._id && cartItems.length > 0) {
      setIsInCart(cartItems.some((item) => item._id === course._id));
    } else {
      setIsInCart(false);
    }
  }, [cartItems, course?._id]);

  // Fetch cart when user is logged in
  useEffect(() => {
    if (currentUser?._id) {
      fetchCart();
    }
  }, [currentUser?._id]);

  const handleAddToCart = async () => {
    if (!currentUser?._id) {
      toast.warning("Please sign in to add to cart");
      return;
    }
    if (!course) return;

    setIsAddingToCart(true);
    const result = await addToCart(course._id);
    if (result.success) {
      toast.success("Added to cart!");
      setIsInCart(true);
    } else {
      toast.error(result.message || "Failed to add to cart");
    }
    setIsAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (!currentUser?._id) {
      toast.warning("Please sign in to purchase course");
      return;
    }
    if (!course) return;

    // Add to cart first if not already in cart, then go to checkout
    if (!isInCart) {
      setIsAddingToCart(true);
      const result = await addToCart(course._id);
      setIsAddingToCart(false);
      if (!result.success) {
        toast.error(result.message || "Failed to add to cart");
        return;
      }
    }
    router.push("/checkout");
  };

  const [isEnrollingFree, setIsEnrollingFree] = useState(false);

  const handleEnrollFree = async () => {
    if (!currentUser?._id) {
      toast.warning("Please sign in to enroll in course");
      return;
    }
    if (!course) return;

    setIsEnrollingFree(true);
    try {
      const res = await courseApi.enrollCourse(course._id);
      if (res.success) {
        toast.success("Successfully enrolled in course!");
        setIsEnrolled(true);
        router.push(`/courses/${course.slug}/learn`);
      } else {
        toast.error(res.message || "Failed to enroll in course");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsEnrollingFree(false);
    }
  };

  if (!course) return null;

  return (
    <div className="bg-background min-h-screen relative pb-20">
      {/* Header / Intro */}
      <div className="bg-background text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:w-2/3">
            <div className="flex items-center gap-2 mb-4">
              <Link
                href="/courses"
                className="text-blue-400 font-bold hover:underline"
              >
                {course.category?.name || "Tài chính & Đầu tư"}
              </Link>
              <span className="text-muted-foreground">{">"}</span>
              <span className="text-muted-foreground/70">{course.title}</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-muted-foreground/70 mb-6 leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-1 text-yellow-400">
                <span className="font-bold underline">
                  {course.averageRating?.toFixed(1) || "4.9"}
                </span>
                <div className="flex">★★★★★</div>
                <span className="text-blue-400">
                  ({course.ratingCount || 128} ratings)
                </span>
              </div>
              <div>{(course.studentsCount || 1520).toLocaleString()} students</div>
              <div className="flex items-center gap-2">
                <span>Instructor:</span>
                <span className="text-blue-400 font-medium">
                  {course.instructor?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* What you'll learn */}
          <div className="border border-border p-6 rounded-lg mb-8 bg-muted/30">
            <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {(course.whatYouWillLearn && course.whatYouWillLearn.length > 0
                ? course.whatYouWillLearn
                : [
                    "Xây dựng tư duy tài chính cá nhân đúng đắn và kế hoạch hưu trí độc lập",
                    "Hiểu rõ cơ chế hoạt động của thị trường chứng khoán, cổ phiếu và trái phiếu",
                    "Làm chủ chiến lược đầu tư thụ động (Passive Investing) an toàn và hiệu quả",
                    "Tận dụng tối đa sức mạnh của lãi suất kép (Compound Effect) cho danh mục dài hạn",
                    "Phân biệt chi tiết giữa Quỹ tương hỗ (Mutual Funds), Quỹ chỉ số (Index Funds) và ETFs",
                    "Thực hành phân bổ danh mục đầu tư và lựa chọn quỹ uy tín tại thị trường Việt Nam",
                  ]
              ).map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <Check
                    size={18}
                    className="mt-1 flex-shrink-0 text-emerald-500"
                  />
                  <span className="text-foreground/80 text-sm leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Course Content</h2>
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
              <span>
                {course.chapters?.length || 0} sections • {totalLessons} lectures • {formatTotalTime(totalDurationSecs)}
              </span>
              <button
                onClick={toggleAllChapters}
                className="text-blue-600 font-bold hover:text-blue-800"
              >
                {expandedChapters.length === (course.chapters?.length || 0) &&
                  course.chapters?.length > 0
                  ? "Collapse all"
                  : "Expand all"}
              </button>
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              {course.chapters?.length > 0 ? (
                course.chapters.map((chapter) => (
                  <div
                    key={chapter._id}
                    className="border-b border-border last:border-0"
                  >
                    <button
                      onClick={() => toggleChapter(chapter._id)}
                      className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {expandedChapters.includes(chapter._id) ? (
                          <ChevronUp
                            size={18}
                            className="text-muted-foreground"
                          />
                        ) : (
                          <ChevronDown
                            size={18}
                            className="text-muted-foreground"
                          />
                        )}
                        <span className="font-bold text-foreground">
                          {chapter.title}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {chapter.lessons?.length || 0} lectures
                      </span>
                    </button>

                    {expandedChapters.includes(chapter._id) && (
                      <div className="bg-background">
                        {chapter.lessons?.length > 0 ? (
                          chapter.lessons.map((lesson) => {
                            const canPreview = lesson.isFreePreview || isEnrolled;
                            const lessonUrl = `/courses/${course.slug}/learn/${lesson.slug}`;

                            return (
                            <div
                              key={lesson._id}
                              className={`p-4 pl-10 flex items-center justify-between group border-t border-border first:border-0 ${
                                canPreview
                                    ? "hover:bg-muted/30 cursor-pointer"
                                    : "opacity-70"
                              }`}
                              onClick={() => {
                                if (canPreview) {
                                  router.push(lessonUrl);
                                } else {
                                  toast.info("You must enroll in this course to access this lecture");
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                {lesson.type === "video" ? (
                                  <Play
                                    size={14}
                                    className={canPreview ? "text-[var(--color-admin-primary)]" : "text-muted-foreground"}
                                  />
                                ) : (
                                  <Globe
                                    size={14}
                                    className="text-muted-foreground"
                                  />
                                )}
                                <span className={`text-sm ${
                                  canPreview
                                    ? "text-foreground hover:text-[var(--color-admin-primary)] transition-colors"
                                    : "text-foreground"
                                }`}>
                                  {lesson.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                {lesson.isFreePreview && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const vidId = lesson.media?.cloudflareId || lesson.media?.url;
                                      if (vidId) {
                                        setPreviewVideoId(vidId);
                                        setIsPlayingPreview(true);
                                        const previewEl = document.getElementById("course-preview-player");
                                        if (previewEl) {
                                          previewEl.scrollIntoView({ behavior: "smooth", block: "center" });
                                        }
                                      } else {
                                        router.push(lessonUrl);
                                      }
                                    }}
                                    className="text-blue-600 font-bold text-xs underline hover:text-blue-800 cursor-pointer"
                                  >
                                    Preview
                                  </button>
                                )}
                                {!canPreview && (
                                  <Lock size={14} className="text-muted-foreground" />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatLessonDuration(lesson.media?.duration || lesson.duration)}
                                </span>
                              </div>
                            </div>
                          );
                          })
                        ) : (
                          <div className="p-4 pl-10 text-sm text-muted-foreground italic">
                            No lectures available in this section.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  This course currently has no content.
                </div>
              )}
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-3">Requirements</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 text-sm">
              {(course.requirements && course.requirements.length > 0
                ? course.requirements
                : [
                    "Không yêu cầu kiến thức tài chính chuyên sâu trước đó",
                    "Tư duy cởi mở và mong muốn xây dựng lộ trình tài chính bền vững",
                    "Thiết bị có kết nối Internet để theo dõi các bài học video",
                  ]
              ).map((req, idx) => (
                <li key={idx} className="leading-relaxed">
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructor */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Instructor</h2>
            <div className="flex gap-4 items-center mb-4">
              <div className="w-16 h-16 bg-muted rounded-full flex-shrink-0 overflow-hidden">
                <img
                  src={course.instructor?.avatar || "/default-avatar.png"}
                  alt={course.instructor?.name || "Instructor"}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {course.instructor?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {course.instructor?.headline || "Cố vấn Quản lý Tài chính & Host Hieu.TV Podcast"}
                </p>
              </div>
            </div>
            <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-line">
              {course.instructor?.bio ||
                "Cố vấn tài chính cá nhân & Nhà đầu tư dài hạn với hơn 20 năm kinh nghiệm làm việc và tư vấn chiến lược cho các tập đoàn tài chính đa quốc gia. Host của chuỗi podcast Hieu.TV nổi tiếng lan tỏa tư duy tài chính lành mạnh và tự do tài chính bền vững."}
            </p>
          </div>
        </div>

        {/* Sidebar Purchase Card */}
        <div className="lg:relative">
          <div className="sticky top-8 bg-background border border-border shadow-xl rounded-xl overflow-hidden">
            {/* Preview Video Player - Always plays the first video of the course */}
            <div
              id="course-preview-player"
              className="aspect-video relative overflow-hidden bg-slate-950 group"
            >
              {isPlayingPreview && activePreviewVideoId ? (
                <div className="absolute inset-0 [&>div]:!absolute [&>div]:!inset-0 [&>div]:!p-0 [& iframe]:!absolute [& iframe]:!inset-0 [& iframe]:!w-full [& iframe]:!h-full">
                  <Stream
                    src={activePreviewVideoId}
                    controls
                    autoplay
                    responsive={false}
                    width="100%"
                    height="100%"
                  />
                </div>
              ) : (
                <div
                  className="w-full h-full relative cursor-pointer"
                  onClick={() => {
                    if (activePreviewVideoId) {
                      setIsPlayingPreview(true);
                    } else {
                      toast.info("No video preview available for this course");
                    }
                  }}
                >
                  <img
                    src={posterUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      if (course.thumbnail?.url && e.currentTarget.src !== course.thumbnail.url) {
                        e.currentTarget.src = course.thumbnail.url;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 bg-white/95 group-hover:bg-white text-slate-900 rounded-full flex items-center justify-center mb-2 shadow-2xl transform group-hover:scale-110 transition-transform">
                      <Play
                        fill="currentColor"
                        size={26}
                        className="text-slate-900 ml-1"
                      />
                    </div>
                    <span className="text-white font-bold text-sm tracking-wide drop-shadow-md">
                      Preview Course
                    </span>
                    {firstVideoLesson?.title && (
                      <span className="text-white/90 text-xs mt-1 max-w-[90%] truncate drop-shadow">
                        {firstVideoLesson.title}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              {/* Price Section */}
              <div className="flex items-center gap-3 mb-6">
                {course.price === 0 ? (
                  <span className="text-3xl font-bold">FREE</span>
                ) : course.discountPrice && course.discountPrice > 0 ? (
                  <>
                    <span className="text-3xl font-bold">
                      {course.discountPrice.toLocaleString()} VND
                    </span>
                    <span className="text-muted-foreground line-through text-lg">
                      {course.price.toLocaleString()} VND
                    </span>
                    <span className="text-red-500 text-xs font-bold text-sm">
                      {Math.round(
                        ((course.price - course.discountPrice) / course.price) *
                        100,
                      )}
                      % Off
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold">
                    {course.price.toLocaleString()} VND
                  </span>
                )}
              </div>

              {/* Action Buttons - Enrollment Aware */}
              <div className="flex flex-col gap-3 mb-6">
                {isEnrolled ? (
                  /* Enrolled: Show "Go to Learn" */
                  <button
                    onClick={() => router.push(`/courses/${course.slug}/learn`)}
                    className="w-full bg-emerald-600 text-white font-bold py-3 rounded hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play size={18} /> Start Learning
                  </button>
                ) : course.price === 0 ? (
                  /* Free Course: Direct 1-click enroll */
                  <button
                    onClick={handleEnrollFree}
                    disabled={isEnrollingFree}
                    className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isEnrollingFree ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Play size={18} />
                    )}
                    Enroll for Free
                  </button>
                ) : (
                  /* Paid: Show cart + buy buttons */
                  <>
                    <div className="flex gap-3">
                      {isInCart ? (
                        <button
                          onClick={() => router.push("/checkout")}
                          className="flex-1 bg-muted text-foreground/80 font-bold py-3 rounded transition-colors flex items-center justify-center gap-2 border border-border cursor-pointer"
                        >
                          <CheckCircle size={16} className="text-emerald-500" />{" "}
                          Added to Cart
                        </button>
                      ) : (
                        <button
                          onClick={handleAddToCart}
                          disabled={isAddingToCart}
                          className="flex-1 border border-border font-bold py-3 rounded hover:bg-muted/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isAddingToCart ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <ShoppingCart size={16} />
                          )}
                          Add to Cart
                        </button>
                      )}
                      <button
                        onClick={handleBuyNow}
                        disabled={isAddingToCart}
                        className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Buy Now
                      </button>
                    </div>
                  </>
                )}
              </div>

              {isEnrolled && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm text-emerald-700">
                  <CheckCircle size={16} />
                  <span className="font-medium">
                    You are enrolled in this course
                  </span>
                </div>
              )}

              <div className="text-center text-xs text-muted-foreground mb-6">
                30-Day Money-Back Guarantee
              </div>

              <div className="space-y-3">
                <div className="font-bold text-sm">This course includes:</div>
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <Clock size={16} /> <span>{formatTotalHours(totalDurationSecs)} hours on-demand video</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <Smartphone size={16} />{" "}
                  <span>Access on mobile and TV</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <Infinity size={16} />{" "}
                  <span>Full lifetime access</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <Award size={16} /> <span>Certificate of completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
