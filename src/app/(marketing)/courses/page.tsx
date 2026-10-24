"use client";
import { ENV } from "@/api/const";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RecentCourses from "@/features/series/components/recent_courses/RecentCourses";
import { CourseCardSkeleton } from "@/components/ui/Skeletons";
import {
  Search,
  Star,
  ChevronLeft,
  ChevronRight,
  Users,
  Award,
  BookOpen,
  LayoutDashboard,
  Clock,
  PlayCircle,
  Code,
  Brain,
  Database,
  Smartphone,
  Sparkles,
  Bot,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

type Course = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  thumbnail: { url: string };
  instructor: { name: string; avatar: string };
  status: string;
  averageRating?: number;
  ratingCount?: number;
  studentsCount?: number;
};

// ─── Dummy / Fallback Data ───────────────────────────────────────────────────

const TOPICS = [
  { label: "Python", learners: "47.4M" },
  { label: "Web Development", learners: "12.8M" },
  { label: "Machine Learning", learners: "8.1M" },
  { label: "Data Science", learners: "7.9M" },
  { label: "JavaScript", learners: "19.5M" },
  { label: "React", learners: "13.2M" },
  { label: "Java", learners: "16.3M" },
  { label: "C#", learners: "10.5M" },
  { label: "AWS", learners: "6.3M" },
  { label: "SQL", learners: "11.1M" },
];

const POPULAR_SEARCH_TAGS = [
  "Web Development",
  "Python",
  "React & Next.js",
  "Machine Learning",
  "Docker",
  "Data Science",
];

const FEATURED_TOPICS = [
  {
    icon: Code,
    label: "Web Development",
    count: "1,200+",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    glow: "group-hover:border-sky-500/40 group-hover:shadow-sky-500/10",
  },
  {
    icon: Brain,
    label: "Artificial Intelligence",
    count: "800+",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    glow: "group-hover:border-blue-500/40 group-hover:shadow-blue-500/10",
  },
  {
    icon: Database,
    label: "Data Science",
    count: "650+",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    glow: "group-hover:border-cyan-500/40 group-hover:shadow-cyan-500/10",
  },
  {
    icon: Smartphone,
    label: "Mobile Development",
    count: "450+",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    glow: "group-hover:border-teal-500/40 group-hover:shadow-teal-500/10",
  },
];

const DUMMY_COURSES: Course[] = [
  {
    _id: "1",
    title: "Python Programming: Beginner to Advanced Masterclass",
    slug: "python-co-ban-nang-cao",
    description: "Master Python with 100+ practical coding exercises and projects",
    price: 1499000,
    discountPrice: 399000,
    thumbnail: {
      url: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=600&q=80",
    },
    instructor: { name: "Alex Johnson", avatar: "" },
    status: "published",
    averageRating: 4.9,
    studentsCount: 14200,
  },
  {
    _id: "2",
    title: "React & Next.js 15 - Build Modern Full-Stack Applications",
    slug: "react-nextjs",
    description: "Learn React from scratch to real-world production projects",
    price: 1899000,
    discountPrice: 499000,
    thumbnail: {
      url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80",
    },
    instructor: { name: "Sarah Miller", avatar: "" },
    status: "published",
    averageRating: 4.8,
    studentsCount: 18500,
  },
  {
    _id: "3",
    title: "Machine Learning A-Z: Artificial Intelligence with Python",
    slug: "machine-learning-az",
    description: "Explore AI, Machine Learning & Deep Learning architectures",
    price: 2199000,
    discountPrice: 599000,
    thumbnail: {
      url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=600&q=80",
    },
    instructor: { name: "David Chen", avatar: "" },
    status: "published",
    averageRating: 4.9,
    studentsCount: 9800,
  },
  {
    _id: "4",
    title: "Node.js & Express Architecture - Production Ready Backend",
    slug: "nodejs-express",
    description: "RESTful APIs, MongoDB, Authentication & Cloud Deployment",
    price: 1299000,
    discountPrice: 349000,
    thumbnail: {
      url: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=600&q=80",
    },
    instructor: { name: "Michael Roberts", avatar: "" },
    status: "published",
    averageRating: 4.7,
    studentsCount: 11200,
  },
  {
    _id: "5",
    title: "Docker & Kubernetes for Cloud & DevOps Engineers",
    slug: "docker-kubernetes",
    description: "Containerization, CI/CD, Orchestration & Production Scaling",
    price: 1699000,
    discountPrice: 449000,
    thumbnail: {
      url: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=600&q=80",
    },
    instructor: { name: "Emily Watson", avatar: "" },
    status: "published",
    averageRating: 4.9,
    studentsCount: 15300,
  },
];

// ─── Rating Stars ────────────────────────────────────────────────────────────

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={
            i <= Math.floor(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-amber-400/30 fill-amber-400/30"
          }
        />
      ))}
    </div>
  );
};

// ─── Course Card (OpenIdear Brand Styled) ───────────────────────────────────

const CourseCard = ({ course }: { course: Course }) => {
  // Deterministic values derived from course id to prevent hydration mismatch
  const hash = (course._id || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rating = course.averageRating || 4.5 + (hash % 5) * 0.1;
  const students = course.studentsCount || 1200 + (hash % 80) * 140;
  const totalHours = 12 + (hash % 15) * 2;
  const totalLectures = 42 + (hash % 20) * 3;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group relative flex flex-col w-[290px] flex-shrink-0 bg-card rounded-2xl overflow-hidden border border-border/80 hover:border-sky-500/40 shadow-xs hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1.5"
    >
      {/* Subtle brand ambient glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-sky-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 pointer-events-none" />

      {/* Course Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={
            course.thumbnail?.url ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80"
          }
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500 text-white text-[11px] font-bold shadow-md">
            <PlayCircle size={13} /> View Course
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col bg-card relative z-10">
        <h3 className="font-bold text-[15px] leading-snug text-foreground mb-1.5 line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          {course.title}
        </h3>

        <p className="text-xs text-muted-foreground mb-3 truncate font-medium">
          By {course.instructor?.name || "OpenIdear Instructor"}
        </p>

        {/* Rating and Students */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm font-extrabold text-amber-500">
            {rating.toFixed(1)}
          </span>
          <RatingStars rating={rating} />
          <span className="text-[11px] text-muted-foreground font-medium ml-1">
            ({students.toLocaleString()} students)
          </span>
        </div>

        {/* Course Meta Info */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-4 font-medium">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-sky-500" /> {totalHours}h
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={12} className="text-blue-500" /> {totalLectures} lessons
          </span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/80">
          <div className="flex items-baseline gap-2">
            {course.discountPrice && course.discountPrice > 0 ? (
              <>
                <span className="font-black text-foreground text-lg">
                  ₫{course.discountPrice.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  ₫{course.price.toLocaleString()}
                </span>
              </>
            ) : course.price === 0 ? (
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg">
                Free
              </span>
            ) : (
              <span className="font-black text-foreground text-lg">
                ₫{course.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

// ─── Scrollable Row ─────────────────────────────────────────────────────────

const CourseRow = ({ courses }: { courses: Course[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 300 * 2;
      scrollRef.current.scrollBy({
        left: dir === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative group/row">
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-card/95 backdrop-blur-md text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all hover:bg-sky-50 dark:hover:bg-slate-800 hover:scale-110 shadow-lg border border-border cursor-pointer"
      >
        <ChevronLeft size={22} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-6 pt-2 px-1 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {courses.map((c) => (
          <CourseCard key={c._id} course={c} />
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-card/95 backdrop-blur-md text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all hover:bg-sky-50 dark:hover:bg-slate-800 hover:scale-110 shadow-lg border border-border cursor-pointer"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
};

// ─── Main Page Component ───────────────────────────────────────────────────

const CourseListing = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Python");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${ENV.ROOT_API}/course`);
        const courseList = response.data?.courses || response.data?.data || [];
        setCourses(Array.isArray(courseList) ? courseList : []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/courses/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push("/courses/search");
    }
  };

  const displayCourses = courses?.length > 0 ? courses : DUMMY_COURSES;

  return (
    <div className="bg-background min-h-screen font-sans text-foreground">
      {/* ═══════ 1. Premium Brand Hero Banner ═══════ */}
      <section className="relative bg-[#070B14] text-white overflow-hidden py-16 lg:py-24 border-b border-sky-950/40">
        {/* Ambient atmospheric glows matching OpenIdear cyan/blue brand */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:28px_28px] opacity-25 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          {/* Left Column: Headline, Search, & Value proposition */}
          <div className="flex-1 text-left max-w-2xl">
            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/25 text-sky-300 text-xs font-semibold backdrop-blur-md mb-6 shadow-xs">
              <Sparkles size={14} className="text-sky-400 animate-pulse" />
              <span>OpenIdear Academy • Expert-Led Courses</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.12] tracking-tight mb-6">
              Learn In-Demand Skills.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-300">
                Build Your Future.
              </span>
            </h1>

            {/* High-contrast subtitle */}
            <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-xl leading-relaxed font-normal">
              Fresh knowledge every day — from software architecture and cloud computing to cutting-edge AI. Learn directly from leading industry practitioners.
            </p>

            {/* Search Bar */}
            <div className="flex items-center max-w-xl bg-slate-900/90 rounded-2xl p-2 shadow-2xl shadow-sky-950/60 backdrop-blur-md border border-slate-700/80 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/25 transition-all duration-300">
              <div className="flex-1 flex items-center pl-3">
                <Search className="text-slate-400 flex-shrink-0" size={20} />
                <input
                  type="text"
                  placeholder="What do you want to learn today?"
                  className="w-full py-2.5 px-3 text-white focus:outline-none text-sm sm:text-base bg-transparent placeholder-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-7 py-3 font-bold rounded-xl text-sm transition-all duration-300 flex-shrink-0 shadow-lg shadow-sky-600/30 hover:shadow-sky-500/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Search
              </button>
            </div>

            {/* Popular trending quick tags */}
            <div className="flex items-center gap-2 mt-4 text-xs text-slate-400 flex-wrap">
              <span className="font-semibold text-slate-500">Popular:</span>
              {POPULAR_SEARCH_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchTerm(tag);
                    router.push(`/courses/search?q=${encodeURIComponent(tag)}`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/70 border border-slate-700/60 hover:border-sky-500/50 hover:text-sky-300 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase with Floating Badges */}
          <div className="hidden lg:block flex-1 max-w-lg relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-sky-950/70 border border-slate-700/80 group">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=700&q=80"
                alt="Students collaborating and learning tech skills"
                className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            </div>

            {/* Floating Badge 1: Student Rating */}
            <div className="absolute -bottom-5 -left-6 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                <Star size={18} className="fill-current" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white">4.8 / 5.0</p>
                <p className="text-[11px] text-slate-400 font-medium">Student Satisfaction</p>
              </div>
            </div>

            {/* Floating Badge 2: Active Learners */}
            <div className="absolute -top-5 -right-5 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-center text-sky-400">
                <Users size={18} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white">25,000+</p>
                <p className="text-[11px] text-slate-400 font-medium">Active Learners</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 2. Trusted By Partner Ribbon ═══════ */}
      <section className="bg-card border-b border-border/80 relative overflow-hidden py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-8">
          <span className="text-xs text-muted-foreground font-bold whitespace-nowrap uppercase tracking-widest">
            Trusted by developers from
          </span>
          <div className="flex justify-around items-center gap-10 opacity-50 grayscale hover:grayscale-0 hover:opacity-90 transition-all duration-300 overflow-x-auto scrollbar-hide py-1">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
              alt="Google"
              className="h-5 object-contain hover:scale-105 transition-transform"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"
              alt="Microsoft"
              className="h-5 object-contain hover:scale-105 transition-transform"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
              alt="Amazon"
              className="h-5 object-contain hover:scale-105 transition-transform"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg"
              alt="Meta"
              className="h-5 object-contain hover:scale-105 transition-transform"
            />
          </div>
        </div>
      </section>

      {/* ═══════ 3. Instructor Banner (Brand Ribbon) ═══════ */}
      <section className="bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-cyan-500/10 border-b border-sky-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 flex-shrink-0">
              <Award size={18} />
            </div>
            <p className="text-sm text-foreground">
              <span className="font-bold">Are you an instructor?</span> Create courses, reach students globally, and grow your creator revenue.
            </p>
          </div>
          <Link
            href="/management/my-courses"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all hover:-translate-y-0.5 flex-shrink-0 cursor-pointer"
          >
            <LayoutDashboard size={14} />
            Instructor Dashboard
          </Link>
        </div>
      </section>

      {/* ═══════ 4. Latest Courses Carousel ═══════ */}
      <RecentCourses />

      {/* ═══════ 5. Popular Courses by Topic ═══════ */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp size={13} />
              Curated Curriculum
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Popular Courses by Topic
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Explore handpicked video courses across the most sought-after technologies.
            </p>
          </div>

          <Link
            href={`/courses/search?q=${encodeURIComponent(activeTab)}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 transition-colors group"
          >
            Explore all {activeTab} courses
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Topic Selector Tabs */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {TOPICS.slice(0, 6).map((topic) => (
            <button
              key={topic.label}
              onClick={() => setActiveTab(topic.label)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === topic.label
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 -translate-y-0.5"
                  : "bg-card border border-border/80 text-muted-foreground hover:border-sky-500/40 hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {topic.label}
            </button>
          ))}
        </div>

        {/* Active Tab Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground">
            Top courses in {activeTab}
          </h3>
          <p className="text-xs text-muted-foreground">
            Over {TOPICS.find((t) => t.label === activeTab)?.learners || "10M+"} students enrolled across OpenIdear learning series.
          </p>
        </div>

        {isLoading ? (
          <div className="flex gap-6 overflow-x-auto pb-8 pt-4 px-1">
            {Array.from({ length: 4 }).map((_, idx) => (
              <CourseCardSkeleton key={idx} />
            ))}
          </div>
        ) : (
          <CourseRow courses={displayCourses} />
        )}
      </section>

      {/* ═══════ 6. Featured Topics by Category Grid ═══════ */}
      <section className="bg-muted/40 py-20 border-y border-border/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-3">
              Featured Skill Paths
            </h2>
            <p className="text-sm text-muted-foreground">
              Master the technical disciplines powering modern cloud computing, generative AI, and high-scale software.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_TOPICS.map((topic) => (
              <div
                key={topic.label}
                onClick={() => router.push(`/courses/search?q=${encodeURIComponent(topic.label)}`)}
                className={`bg-card border border-border/80 rounded-2xl p-6 hover:shadow-xl ${topic.glow} hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group relative overflow-hidden`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${topic.bg} ${topic.color} ${topic.border} border group-hover:scale-110 transition-transform duration-300 shadow-xs`}>
                  <topic.icon size={26} />
                </div>
                <h3 className="font-bold text-base mb-1.5 text-foreground group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {topic.label}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  {topic.count} comprehensive courses
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 7. Why Learn with OpenIdear Section ═══════ */}
      <section className="bg-[#070B14] text-white py-24 relative overflow-hidden border-b border-sky-950/40">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/25 text-sky-300 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck size={14} className="text-sky-400" />
              The OpenIdear Advantage
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Why Learn with OpenIdear?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 hover:border-sky-500/40 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 mb-6 flex items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform">
                <PlayCircle size={28} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">
                Learn at Your Own Pace
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed font-normal">
                Enjoy lifetime access to high-definition video lectures, chapter markers, source code, and downloadable resources.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 mb-6 flex items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                <Bot size={28} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">
                AI Companion & Tutor
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed font-normal">
                Ask questions anytime directly inside your video player. Receive instant code reviews, chapter summaries, and interactive quizzes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 mb-6 flex items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                <Award size={28} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">
                Verified Certificates
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed font-normal">
                Earn verifiable completion credentials ready to showcase on LinkedIn, your GitHub profile, and technical resumes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 8. Become an Instructor CTA ═══════ */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-blue-600/20 rounded-3xl transform -rotate-2 scale-105 pointer-events-none" />
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"
                alt="Become an OpenIdear instructor"
                className="relative w-full h-[420px] object-cover rounded-3xl shadow-2xl border border-border"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider mb-4">
              Creator Ecosystem
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
              Teach What You Love.
              <br />
              Inspire the Tech Community.
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-6 font-normal">
              Share your real-world development experience with thousands of ambitious engineers. We provide the platform, AI-assisted curriculum tools, and global distribution.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2.5 text-sm text-foreground/90 font-medium">
                <CheckCircle2 size={16} className="text-sky-500 flex-shrink-0" />
                <span>Keep up to 85% of course revenue with direct automated payouts</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-foreground/90 font-medium">
                <CheckCircle2 size={16} className="text-sky-500 flex-shrink-0" />
                <span>Built-in Bunny Stream CDN video hosting and AI knowledge checks</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-foreground/90 font-medium">
                <CheckCircle2 size={16} className="text-sky-500 flex-shrink-0" />
                <span>Direct 1-on-1 discussion forums with your enrolled students</span>
              </li>
            </ul>

            <Link
              href="/management/my-courses"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-xl text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Start Teaching Today
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ 9. Trending Topics Pill Cloud ═══════ */}
      <section className="bg-muted/30 py-16 border-t border-border/80">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-xl font-bold mb-6 text-foreground">
            Top Trending Technical Topics
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {TOPICS.map((t) => (
              <Link
                key={t.label}
                href={`/courses/search?q=${encodeURIComponent(t.label)}`}
                className="bg-card border border-border/80 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-foreground/80 hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-500/40 hover:shadow-xs transition-all duration-200"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseListing;
