"use client";

import { ENV } from "@/api/const";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Flame, BookOpen, Trophy, GraduationCap, Star, ArrowRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarPost {
  _id: string;
  title: string;
  slug: string;
  readtime?: number;
  createdAt: string;
  author?: { name?: string; username?: string; avatar?: string };
  image?: { url?: string };
}

interface SidebarSeries {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: { url?: string };
  user?: { name?: string; username?: string };
}

interface SidebarCourse {
  _id: string;
  title: string;
  slug: string;
  price?: number;
  averageRating?: number;
  ratingCount?: number;
  description?: string;
  instructor?: { name?: string; username?: string; avatar?: string };
  thumbnail?: { url?: string };
}

interface SidebarData {
  trending: SidebarPost[];
  latestPosts: SidebarPost[];
  popularSeries: SidebarSeries[];
  featuredCourses: SidebarCourse[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/40">
      <span className="text-sm leading-none">{icon}</span>
      <h3 className="font-extrabold text-[10px] text-foreground tracking-wider uppercase">{label}</h3>
    </div>
  );
}

function PostSkeletons({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-2.5 animate-pulse">
          <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-muted rounded w-11/12" />
            <div className="h-2.5 bg-muted rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniPostCard({ post }: { post: SidebarPost }) {
  return (
    <Link
      href={`/post/${post.slug}`}
      className="group flex gap-2.5 items-start hover:bg-accent/40 border border-transparent hover:border-border/30 rounded-xl p-1.5 -mx-1.5 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
        {post.image?.url ? (
          <Image src={post.image.url} alt={post.title} fill className="object-cover" sizes="44px" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#161B22] to-[#242B38]" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug tracking-tight">
          {post.title}
        </p>
        <p className="text-[9px] text-muted-foreground mt-1">
          {post.author?.name || post.author?.username || "Anonymous"} · {timeAgo(post.createdAt)}
        </p>
      </div>
    </Link>
  );
}

function MiniSeriesCard({ series }: { series: SidebarSeries }) {
  return (
    <Link
      href={`/series?slug=${series.slug}`}
      className="group flex gap-2.5 items-center hover:bg-accent/40 border border-transparent hover:border-border/30 rounded-xl p-1.5 -mx-1.5 transition-all duration-200"
    >
      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
        {series.image?.url ? (
          <Image src={series.image.url} alt={series.title} fill className="object-cover" sizes="40px" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#161B22] to-[#242B38] flex items-center justify-center">
            <Trophy size={14} className="text-primary" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
          {series.title}
        </p>
        <p className="text-[9px] text-muted-foreground mt-1">
          by {series.user?.name || series.user?.username || "Unknown"}
        </p>
      </div>
    </Link>
  );
}

function MiniCourseCard({ course }: { course: SidebarCourse }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block hover:bg-accent/40 border border-transparent hover:border-border/30 rounded-xl p-2 -mx-1.5 transition-all duration-200"
    >
      <div className="flex gap-2.5 items-start">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          {course.thumbnail?.url ? (
            <Image src={course.thumbnail.url} alt={course.title} fill className="object-cover" sizes="48px" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#161B22] to-[#242B38] flex items-center justify-center">
              <GraduationCap size={16} className="text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug tracking-tight">
            {course.title}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            {course.averageRating ? (
              <span className="flex items-center gap-0.5 text-[9px] text-amber-500 font-semibold">
                <Star size={9} fill="currentColor" /> {course.averageRating.toFixed(1)}
              </span>
            ) : null}
            <span className="text-[9px] font-bold text-primary">
              {course.price ? `${course.price.toLocaleString()}₫` : "Free"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function AffiliateCard() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-card border border-border/50 p-4 shadow-sm">
      {/* Decorative gradient radial accent */}
      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />

      <div className="relative z-10">
        <p className="text-[9px] font-extrabold uppercase tracking-widest text-primary mb-1.5">
          💰 Affiliate Program
        </p>
        <p className="text-xs font-bold leading-snug text-foreground mb-1.5 tracking-tight">
          Earn up to 30% commission sharing ideas!
        </p>
        <p className="text-[10px] text-muted-foreground mb-3.5 leading-relaxed">
          Share OpenIdear with your audience and earn passive income on every referral.
        </p>
        <a
          href="mailto:opentrashtech@gmail.com?subject=Affiliate Program Inquiry"
          className="inline-flex items-center gap-1 bg-[#161B22] border border-border text-foreground hover:bg-[#242B38] text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer"
        >
          Join now <ArrowRight size={10} className="ml-0.5" />
        </a>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DiscoverySidebar() {
  const [data, setData] = useState<SidebarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSidebar = async () => {
      try {
        const res = await axios.get(`${ENV.ROOT_API}/post/getDiscoverySidebar`);
        if (res.status === 200 && res.data.success) {
          setData({
            trending: res.data.trending || [],
            latestPosts: res.data.latestPosts || [],
            popularSeries: res.data.popularSeries || [],
            featuredCourses: res.data.featuredCourses || [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch discovery sidebar:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSidebar();
  }, []);

  return (
    <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
      <div className="sticky top-24 space-y-5">

        {/* ─── 🔥 Trending ─────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <SectionHeader icon={<Flame size={16} className="text-orange-500" />} label="Trending" />
          {isLoading ? (
            <PostSkeletons count={5} />
          ) : data?.trending && data.trending.length > 0 ? (
            <div className="space-y-1">
              {data.trending.map((post) => (
                <MiniPostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No trending posts yet.</p>
          )}
        </div>

        {/* ─── 📚 Latest Posts ─────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <SectionHeader icon={<BookOpen size={16} className="text-blue-500" />} label="Latest Posts" />
          {isLoading ? (
            <PostSkeletons count={5} />
          ) : data?.latestPosts && data.latestPosts.length > 0 ? (
            <div className="space-y-1">
              {data.latestPosts.map((post) => (
                <MiniPostCard key={post._id} post={post} />
              ))}
              <Link
                href="/recently-post"
                className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-primary hover:underline"
              >
                See all posts <ArrowRight size={11} />
              </Link>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No posts yet.</p>
          )}
        </div>

        {/* ─── 🏆 Popular Series ───────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <SectionHeader icon={<Trophy size={16} className="text-purple-500" />} label="Popular Series" />
          {isLoading ? (
            <PostSkeletons count={4} />
          ) : data?.popularSeries && data.popularSeries.length > 0 ? (
            <div className="space-y-1">
              {data.popularSeries.map((series) => (
                <MiniSeriesCard key={series._id} series={series} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No series yet.</p>
          )}
        </div>

        {/* ─── 💰 Affiliate Deals ──────────────────────── */}
        <AffiliateCard />

        {/* ─── 🎓 Courses ──────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <SectionHeader icon={<GraduationCap size={16} className="text-emerald-500" />} label="Courses" />
          {isLoading ? (
            <PostSkeletons count={3} />
          ) : data?.featuredCourses && data.featuredCourses.length > 0 ? (
            <div className="space-y-1">
              {data.featuredCourses.map((course) => (
                <MiniCourseCard key={course._id} course={course} />
              ))}
              <Link
                href="/courses"
                className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-primary hover:underline"
              >
                Browse all courses <ArrowRight size={11} />
              </Link>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No courses available yet.</p>
          )}
        </div>

      </div>
    </aside>
  );
}
