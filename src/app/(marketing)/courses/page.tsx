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
};

// ─── Dummy data for sections that need it ───────────────────────────────────

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

const FEATURED_TOPICS = [
  {
    icon: Code,
    label: "Web Development",
    count: "1,200+",
    color: "text-blue-600",
  },
  {
    icon: Brain,
    label: "Artificial Intelligence",
    count: "800+",
    color: "text-purple-600",
  },
  {
    icon: Database,
    label: "Data Science",
    count: "650+",
    color: "text-green-600",
  },
  {
    icon: Smartphone,
    label: "Mobile Dev",
    count: "450+",
    color: "text-orange-600",
  },
];

const DUMMY_COURSES: Course[] = [
  {
    _id: "1",
    title: "Python Programming: Beginner to Advanced",
    slug: "python-co-ban-nang-cao",
    description: "Master Python with 100+ practical coding exercises",
    price: 1499000,
    discountPrice: 399000,
    thumbnail: {
      url: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=400&q=80",
    },
    instructor: { name: "Alex Johnson", avatar: "" },
    status: "published",
  },
  {
    _id: "2",
    title: "React & Next.js - Build Modern Web Applications",
    slug: "react-nextjs",
    description: "Learn React from scratch to real-world production projects",
    price: 1899000,
    discountPrice: 499000,
    thumbnail: {
      url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80",
    },
    instructor: { name: "Sarah Miller", avatar: "" },
    status: "published",
  },
  {
    _id: "3",
    title: "Machine Learning A-Z: Artificial Intelligence with Python",
    slug: "machine-learning-az",
    description: "Explore AI, Machine Learning & Deep Learning architectures",
    price: 2199000,
    discountPrice: 599000,
    thumbnail: {
      url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=400&q=80",
    },
    instructor: { name: "David Chen", avatar: "" },
    status: "published",
  },
  {
    _id: "4",
    title: "Node.js & Express - Backend for Beginners",
    slug: "nodejs-express",
    description: "RESTful APIs, MongoDB, Authentication & Deployment",
    price: 1299000,
    discountPrice: 349000,
    thumbnail: {
      url: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=400&q=80",
    },
    instructor: { name: "Michael Roberts", avatar: "" },
    status: "published",
  },
  {
    _id: "5",
    title: "Docker & Kubernetes for DevOps Engineers",
    slug: "docker-kubernetes",
    description: "Containerization, CI/CD, Orchestration & Production Scaling",
    price: 1699000,
    discountPrice: 449000,
    thumbnail: {
      url: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=400&q=80",
    },
    instructor: { name: "Emily Watson", avatar: "" },
    status: "published",
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
              ? "text-[#b4690e] fill-[#b4690e]"
              : "text-[#b4690e] fill-[#b4690e] opacity-30"
          }
        />
      ))}
    </div>
  );
};

// ─── Course Card (Udemy Style) ──────────────────────────────────────────────

const CourseCard = ({ course }: { course: Course }) => {
  const rating = 4 + Math.random() * 0.9;
  const students = Math.floor(1000 + Math.random() * 50000);
  const totalHours = Math.floor(10 + Math.random() * 40);
  const totalLectures = Math.floor(50 + Math.random() * 150);

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group relative block w-[280px] flex-shrink-0 bg-background rounded-2xl overflow-hidden border border-border hover:border-indigo-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
    >
      {/* Ambient Glass Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-[var(--color-admin-primary)] to-blue-500 opacity-0 group-hover:opacity-5 blur transition duration-500" />

      <div className="relative aspect-video overflow-hidden bg-muted mb-4">
        <img
          src={course.thumbnail?.url}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="px-5 pb-5 relative z-10 bg-background">
        <h3 className="font-bold text-[15px] leading-tight text-foreground mb-1.5 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-blue-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-2 truncate font-medium">
          {course.instructor?.name}
        </p>
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="text-sm font-extrabold text-amber-500">
            {rating.toFixed(1)}
          </span>
          <RatingStars rating={rating} />
          <span className="text-xs text-muted-foreground font-medium">
            ({students.toLocaleString()})
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3 font-medium">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-indigo-400" /> {totalHours} hrs
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={12} className="text-blue-400" /> {totalLectures} lectures
          </span>
        </div>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {course.discountPrice && course.discountPrice > 0 ? (
              <>
                <span className="font-extrabold text-foreground text-lg">
                  ₫{course.discountPrice.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  ₫{course.price.toLocaleString()}
                </span>
              </>
            ) : course.price === 0 ? (
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">
                Free
              </span>
            ) : (
              <span className="font-extrabold text-foreground text-lg">
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
      const amount = 280 * 2;
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
        className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-background/90 backdrop-blur-md text-[var(--color-admin-primary)] rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all hover:bg-background hover:scale-110 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border"
      >
        <ChevronLeft size={24} />
      </button>
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-8 pt-4 px-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {courses.map((c) => (
          <CourseCard key={c._id} course={c} />
        ))}
      </div>
      <button
        onClick={() => scroll("right")}
        className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-background/90 backdrop-blur-md text-[var(--color-admin-primary)] rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all hover:bg-background hover:scale-110 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────

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
        const response = await axios.get(
          `${ENV.ROOT_API}/course`,
        );
        setCourses(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/courses/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const displayCourses = courses?.length > 0 ? courses : DUMMY_COURSES;

  return (
    <div className="bg-background min-h-screen font-sans text-[#1c1d1f]">
      {/* ═══════ Hero Banner ═══════ */}
      {/* ═══════ Hero Banner ═══════ */}
      <section className="relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--color-admin-primary)] via-indigo-700 to-blue-900 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-background/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center">
          <div className="flex-1 py-16 lg:py-24 lg:pr-12">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
              Learn New Skills.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                Build Your Future.
              </span>
            </h1>
            <p className="text-indigo-100 text-lg mb-10 max-w-lg leading-relaxed font-medium">
              Fresh knowledge every day — from coding and data to AI. Learn from leading global industry experts.
            </p>
            <div className="flex max-w-xl bg-background rounded-full p-1.5 shadow-2xl shadow-indigo-900/50 backdrop-blur-sm border border-white/20">
              <div className="flex-1 flex items-center pl-4">
                <Search
                  className="text-muted-foreground flex-shrink-0"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="What do you want to learn today?"
                  className="w-full py-3 px-3 text-foreground focus:outline-none text-base bg-transparent placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-[var(--color-admin-primary)] text-white px-8 font-bold rounded-full hover:bg-[var(--color-admin-primary-hover)] transition-all duration-300 flex-shrink-0 shadow-lg hover:shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:-translate-y-0.5"
              >
                Search
              </button>
            </div>
          </div>
          <div className="hidden lg:block flex-1 max-w-lg relative z-10 group perspective-1000">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/50 transition-transform duration-700 ease-out group-hover:scale-[1.02] group-hover:-rotate-1 group-hover:-translate-y-2 border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=700&q=80"
                alt="Learning"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            {/* Floating badge */}
            <div
              className="absolute -bottom-6 -left-6 bg-background p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce"
              style={{ animationDuration: "3s" }}
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-[var(--color-admin-primary)]">
                <Star size={20} className="fill-current" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">4.8/5</p>
                <p className="text-xs text-muted-foreground">
                  Student Rating
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ Trusted By ═══════ */}
      <section className="bg-muted/30 border-b border-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">
          <span className="text-sm text-muted-foreground font-bold whitespace-nowrap uppercase tracking-wider">
            Trusted by
          </span>
          {/* Gradient mask for smooth edge fading */}
          <div className="flex-1 w-full relative">
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-gray-50 to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-gray-50 to-transparent z-10" />
            <div className="flex justify-around items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 overflow-x-auto scrollbar-hide py-2">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
                alt="Google"
                className="h-6 hover:scale-110 transition-transform"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"
                alt="Microsoft"
                className="h-6 hover:scale-110 transition-transform"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
                alt="Amazon"
                className="h-6 hover:scale-110 transition-transform"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg"
                alt="Meta"
                className="h-6 hover:scale-110 transition-transform"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ Instructor CTA (Banner) ═══════ */}
      <section className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-foreground/80">
            <span className="font-bold">Are you an instructor?</span> Effortlessly create and manage your courses from your dashboard.
          </p>
          <Link
            href="/management/my-courses"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#5624d0] hover:text-[#401b9c] transition-colors"
          >
            <LayoutDashboard size={16} />
            Instructor Dashboard
          </Link>
        </div>
      </section>

      <RecentCourses />

      {/* ═══════ Topic Tabs + Course Carousel ═══════ */}
      <section className="py-12 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-2">
          Popular Courses by Topic
        </h2>
        <p className="text-muted-foreground mb-6">
          Explore curated courses across the most popular and trending tech topics.
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {TOPICS.slice(0, 6).map((topic) => (
            <button
              key={topic.label}
              onClick={() => setActiveTab(topic.label)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm ${activeTab === topic.label
                ? "bg-[var(--color-admin-primary)] text-white shadow-indigo-500/30 -translate-y-0.5"
                : "bg-background border border-border text-muted-foreground hover:bg-muted/30 hover:text-foreground hover:shadow-md"
                }`}
            >
              {topic.label}
            </button>
          ))}
        </div>

        {/* Content for active tab */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-1">Explore {activeTab}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {TOPICS.find((t) => t.label === activeTab)?.learners || "10M+"} learners are currently studying this topic worldwide.
          </p>
        </div>

        {isLoading ? (
          <div className="flex gap-6 overflow-x-auto pb-8 pt-4 px-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <CourseCardSkeleton key={idx} />
            ))}
          </div>
        ) : (
          <CourseRow courses={displayCourses} />
        )}
      </section>

      {/* ═══════ Featured Topics ═══════ */}
      <section className="bg-[#f7f9fa] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-2">
            Featured Topics by Category
          </h2>
          <p className="text-muted-foreground mb-10">
            The most in-demand skills in today's technology ecosystem.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_TOPICS.map((topic) => (
              <div
                key={topic.label}
                className="bg-background border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 hover:border-indigo-100 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                <div
                  className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-transparent to-current opacity-5 rounded-full ${topic.color} group-hover:scale-150 transition-transform duration-500`}
                />
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${topic.color.replace("text-", "bg-").replace("600", "50")} ${topic.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                >
                  <topic.icon size={28} />
                </div>
                <h3 className="font-bold text-lg mb-1.5 text-foreground group-hover:text-[var(--color-admin-primary)] transition-colors relative z-10">
                  {topic.label}
                </h3>
                <p className="text-sm text-muted-foreground font-medium relative z-10">
                  {topic.count} courses
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ Why Learn With Us ═══════ */}
      <section className="bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-gray-900 via-[#1c1d1f] to-black text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl font-extrabold mb-16 text-center">
            Why Learn with OpenIdear?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-white/10 group-hover:border-indigo-400/50 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all duration-500 group-hover:-translate-y-2">
                <PlayCircle size={32} className="text-indigo-400" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">
                Learn at Your Own Pace
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                Lifetime access anytime, anywhere. Learn on mobile or desktop at your convenience.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 group-hover:border-purple-400/50 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-500 group-hover:-translate-y-2">
                <Award size={32} className="text-purple-400" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">
                Professional Certificates
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                Earn verifiable certificates of completion recognized by industry leaders.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 group-hover:border-amber-400/50 group-hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all duration-500 group-hover:-translate-y-2">
                <Users size={32} className="text-amber-400" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">
                Collaborative Community
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                Connect, discuss, and receive 1-on-1 feedback from instructors and peers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ Become Instructor CTA ═══════ */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-blue-100 rounded-3xl transform -rotate-3 scale-105" />
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80"
                alt="Become an instructor"
                className="relative w-full h-[400px] object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-6 text-foreground">
              Become an Instructor
            </h2>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed font-medium">
              Share your knowledge with millions of learners worldwide. Create high-impact video courses and earn while doing what you love.
            </p>
            <Link
              href="/management/my-courses"
              className="inline-block bg-[var(--color-admin-primary)] text-white font-bold px-8 py-4 rounded-xl hover:bg-[var(--color-admin-primary-hover)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              Start Teaching Today
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ Top Topics ═══════ */}
      <section className="bg-muted/30 py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8 text-foreground">
            Top Trending Topics
          </h2>
          <div className="flex flex-wrap gap-3">
            {TOPICS.map((t) => (
              <Link
                key={t.label}
                href={`/courses/search?q=${encodeURIComponent(t.label)}`}
                className="bg-background border border-border px-6 py-2.5 rounded-full text-sm font-bold text-foreground/80 hover:bg-muted/30 hover:text-[var(--color-admin-primary)] hover:border-indigo-200 hover:shadow-sm transition-all duration-300"
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
