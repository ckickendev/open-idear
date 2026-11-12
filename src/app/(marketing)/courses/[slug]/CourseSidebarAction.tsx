"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Play,
  ShoppingCart,
  CheckCircle,
  Loader2,
  Clock,
  Smartphone,
  Infinity as InfinityIcon,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import authenticationStore from "@/store/AuthenticationStore";
import cartStore from "@/store/CartStore";
import { courseApi } from "@/features/series/api/course.api";
import BunnyPlayer from "@/components/video/BunnyPlayer";
import { Course } from "./types";

interface CourseSidebarActionProps {
  course: Course;
}

const formatTotalHours = (seconds: number) => {
  if (!seconds || seconds <= 0) return "7.5";
  const hours = seconds / 3600;
  return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
};

export const CourseSidebarAction: React.FC<CourseSidebarActionProps> = ({
  course,
}) => {
  const router = useRouter();
  const currentUser = authenticationStore((state) => state.currentUser);
  const { items: cartItems, addToCart, fetchCart } = cartStore();

  const [isPlayingSidebarFirstVideo, setIsPlayingSidebarFirstVideo] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isEnrollingFree, setIsEnrollingFree] = useState(false);

  // First video lesson of the course (used for the sidebar preview section)
  const firstVideoLesson = course.chapters
    ?.flatMap((ch) => ch.lessons || [])
    .find(
      (l) =>
        (l.type === "video" || l.media?.url || l.media?.cloudflareId || l.media?.bunnyVideoId) &&
        (l.media?.bunnyVideoId || l.media?.cloudflareId || l.media?.url)
    );

  const defaultFirstVideoId =
    firstVideoLesson?.media?.bunnyVideoId ||
    firstVideoLesson?.media?.cloudflareId ||
    firstVideoLesson?.media?.url ||
    "";

  const firstVideoPosterUrl =
    firstVideoLesson?.media?.thumbnail || course.thumbnail?.url || "";

  const totalDurationSecs =
    course.totalDuration ||
    course.chapters?.reduce(
      (acc, chap) =>
        acc +
        (chap.lessons?.reduce(
          (lAcc, lesson) =>
            lAcc + (lesson.media?.duration || lesson.duration || 0),
          0
        ) || 0),
      0
    ) ||
    0;

  // Check enrollment status when user is logged in
  useEffect(() => {
    let isMounted = true;
    const checkEnrollmentStatus = async () => {
      if (!currentUser?._id || !course._id) return;
      try {
        const res = await courseApi.checkEnrollment(course._id);
        if (res.success && isMounted) {
          setIsEnrolled((res.data as any)?.data?.enrolled || false);
        }
      } catch (error) {
        console.error("Failed to check enrollment:", error);
      }
    };
    checkEnrollmentStatus();
    return () => {
      isMounted = false;
    };
  }, [currentUser?._id, course._id]);

  // Check if course is in cart
  useEffect(() => {
    if (course._id && cartItems.length > 0) {
      setIsInCart(cartItems.some((item) => item._id === course._id));
    } else {
      setIsInCart(false);
    }
  }, [cartItems, course._id]);

  // Fetch cart on mount when user is authenticated
  useEffect(() => {
    if (currentUser?._id) {
      fetchCart();
    }
  }, [currentUser?._id, fetchCart]);

  const handleAddToCart = async () => {
    if (!currentUser?._id) {
      toast.warning("Please sign in to add to cart");
      return;
    }
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

  const handleEnrollFree = async () => {
    if (!currentUser?._id) {
      toast.warning("Please sign in to enroll in course");
      return;
    }

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

  return (
    <div className="sticky top-8 bg-background border border-border shadow-xl rounded-xl overflow-hidden">
      {/* Preview Video Player */}
      <div
        id="course-preview-player"
        className="aspect-video relative overflow-hidden bg-slate-950 group"
      >
        {isPlayingSidebarFirstVideo && firstVideoLesson ? (
          <BunnyPlayer
            lessonId={firstVideoLesson._id}
            title={firstVideoLesson.title || course.title}
            posterUrl={firstVideoPosterUrl}
            autoplay={true}
          />
        ) : (
          <div
            className="w-full h-full relative cursor-pointer"
            onClick={() => {
              if (defaultFirstVideoId) {
                setIsPlayingSidebarFirstVideo(true);
              } else {
                toast.info("No video preview available for this course");
              }
            }}
          >
            <img
              src={firstVideoPosterUrl || "/default-avatar.png"}
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
                <Play fill="currentColor" size={26} className="text-slate-900 ml-1" />
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
          {course.price === 0 || course.isFree ? (
            <span className="text-3xl font-bold">FREE</span>
          ) : course.discountPrice && course.discountPrice > 0 ? (
            <>
              <span className="text-3xl font-bold">
                {course.discountPrice.toLocaleString()} VND
              </span>
              <span className="text-muted-foreground line-through text-lg">
                {course.price.toLocaleString()} VND
              </span>
              <span className="text-red-500 text-xs font-bold">
                {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% Off
              </span>
            </>
          ) : (
            <span className="text-3xl font-bold">
              {course.price.toLocaleString()} VND
            </span>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-6">
          {isEnrolled ? (
            <Link
              href={`/courses/${course.slug}/learn`}
              className="w-full block text-center bg-primary text-primary-foreground font-bold py-3.5 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              Go to Course
            </Link>
          ) : course.price === 0 || course.isFree ? (
            <button
              type="button"
              onClick={handleEnrollFree}
              disabled={isEnrollingFree}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isEnrollingFree ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Enrolling...</span>
                </>
              ) : (
                <span>Enroll for Free</span>
              )}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAddingToCart || isInCart}
                className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-lg transition-colors cursor-pointer border ${
                  isInCart
                    ? "bg-muted text-muted-foreground border-border cursor-default"
                    : "bg-background hover:bg-muted/50 text-foreground border-border"
                }`}
              >
                {isAddingToCart ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : isInCart ? (
                  <>
                    <CheckCircle size={18} className="text-emerald-500" />
                    <span>In Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isAddingToCart}
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                Buy Now
              </button>
            </>
          )}
        </div>

        {isEnrolled && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={16} />
            <span className="font-medium">You are enrolled in this course</span>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground mb-6">
          30-Day Money-Back Guarantee
        </div>

        {/* Course Features */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="font-bold text-sm">This course includes:</div>
          <div className="flex items-center gap-3 text-sm text-foreground/80">
            <Clock size={16} className="text-muted-foreground" />
            <span>{formatTotalHours(totalDurationSecs)} hours on-demand video</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground/80">
            <Smartphone size={16} className="text-muted-foreground" />
            <span>Access on mobile and TV</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground/80">
            <InfinityIcon size={16} className="text-muted-foreground" />
            <span>Full lifetime access</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground/80">
            <Award size={16} className="text-muted-foreground" />
            <span>Certificate of completion</span>
          </div>
        </div>
      </div>
    </div>
  );
};

