"use client";

import { useTranslation } from "@/app/hook/useTranslation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ENV } from "@/api/const";
import {
  Users,
  Star,
  ChevronRight,
  ArrowRight,
  Code,
  Flame,
  Terminal,
  Heart,
  PenSquare,
} from "lucide-react";

export default function Banner() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    articles: "1,200+",
    members: "500+",
    series: "200+",
  });

  // Fetch dynamic statistics from the backend
  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      const rootApi = ENV?.ROOT_API;
      if (!rootApi) return;

      try {
        const [postsResult, coursesResult] = await Promise.allSettled([
          axios.get(`${rootApi}/post/getAllPosts?limit=1`, { timeout: 4000 }),
          axios.get(`${rootApi}/course?limit=1`, { timeout: 4000 }),
        ]);

        if (!isMounted) return;

        let totalPosts: number | undefined;
        let totalCourses: number | undefined;

        if (postsResult.status === "fulfilled") {
          const postData = postsResult.value?.data;
          totalPosts =
            typeof postData?.countData === "number"
              ? postData.countData
              : typeof postData?.total === "number"
                ? postData.total
                : Array.isArray(postData?.posts)
                  ? postData.posts.length
                  : undefined;
        }

        if (coursesResult.status === "fulfilled") {
          const courseData = coursesResult.value?.data;
          totalCourses =
            typeof courseData?.pagination?.totalItems === "number"
              ? courseData.pagination.totalItems
              : typeof courseData?.total === "number"
                ? courseData.total
                : Array.isArray(courseData?.courses)
                  ? courseData.courses.length
                  : Array.isArray(courseData?.data)
                    ? courseData.data.length
                    : undefined;
        }

        if (totalPosts !== undefined || totalCourses !== undefined) {
          setStats((prev) => ({
            ...prev,
            articles:
              totalPosts !== undefined
                ? `${totalPosts.toLocaleString()}+`
                : prev.articles,
            series:
              totalCourses !== undefined
                ? `${(totalCourses * 3).toLocaleString()}+`
                : prev.series,
          }));
        }
      } catch (error) {
        // Use console.warn instead of console.error to avoid triggering Next.js dev error overlay
        console.warn("Could not fetch banner stats:", error);
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  // Safe translation fallbacks with correct component namespace
  const badgeText = t("component.banner.badge") !== "component.banner.badge" ? t("component.banner.badge") : "🚀 Open Community for Developers";
  const headlineText = t("component.banner.headline") !== "component.banner.headline" ? t("component.banner.headline") : "Learn Faster. Share Knowledge. Build Better Ideas.";
  const descriptionText = t("component.banner.description") !== "component.banner.description" ? t("component.banner.description") : "OpenIdear helps developers, students, creators, and technology enthusiasts learn new skills, share knowledge, and discover innovative ideas through high-quality content and community discussions.";
  const ctaPrimaryText = t("component.banner.ctaPrimary") !== "component.banner.ctaPrimary" ? t("component.banner.ctaPrimary") : "Start Learning";
  const ctaSecondaryText = t("component.banner.ctaSecondary") !== "component.banner.ctaSecondary" ? t("component.banner.ctaSecondary") : "Explore Posts";
  const ctaCreatePostText = t("component.banner.create") !== "component.banner.create" ? t("component.banner.create") : "Create Post";
  const statArticlesText = t("component.banner.statArticles") !== "component.banner.statArticles" ? t("component.banner.statArticles") : "Articles";
  const statMembersText = t("component.banner.statMembers") !== "component.banner.statMembers" ? t("component.banner.statMembers") : "Community Members";
  const statSeriesText = t("component.banner.statSeries") !== "component.banner.statSeries" ? t("component.banner.statSeries") : "Learning Series";

  // Previews translations
  const previewCourseTitle = t("component.banner.previewCourseTitle") !== "component.banner.previewCourseTitle" ? t("component.banner.previewCourseTitle") : "Docker & Kubernetes Path";
  const previewCourseBadge = t("component.banner.previewCourseBadge") !== "component.banner.previewCourseBadge" ? t("component.banner.previewCourseBadge") : "Free";
  const previewCourseJoined = t("component.banner.previewCourseJoined") !== "component.banner.previewCourseJoined" ? t("component.banner.previewCourseJoined") : "1.2k joined";
  const previewTopicTitle = t("component.banner.previewTopicTitle") !== "component.banner.previewTopicTitle" ? t("component.banner.previewTopicTitle") : "Web Development";
  const previewTopicCount = t("component.banner.previewTopicCount") !== "component.banner.previewTopicCount" ? t("component.banner.previewTopicCount") : "342 articles published";
  const previewPostRead = t("component.banner.previewPostRead") !== "component.banner.previewPostRead" ? t("component.banner.previewPostRead") : "3m read";
  const previewPostTitle = t("component.banner.previewPostTitle") !== "component.banner.previewPostTitle" ? t("component.banner.previewPostTitle") : "Why AI won't replace developers, but developers using AI will.";
  const previewPostAction = t("component.banner.previewPostAction") !== "component.banner.previewPostAction" ? t("component.banner.previewPostAction") : "Read";

  return (
    <>
      {/* Self-contained keyframe animations for floating cards */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(0.5deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(8px) rotate(-0.5deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(1deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.15); }
        }
        .animate-float-1 {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-medium 10s ease-in-out infinite;
        }
        .animate-float-3 {
          animation: float-fast 6s ease-in-out infinite;
        }
        .animate-glow-pulse {
          animation: glow-pulse 12s ease-in-out infinite;
        }
      `}</style>

      <section className="relative overflow-hidden w-full bg-[#0A0D14] border-b border-border/60 py-16 md:py-24 lg:py-28 flex items-center">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-40 z-0 pointer-events-none" />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none animate-glow-pulse" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
            {/* ── Left Column: Value Proposition & Copy ────────────────── */}
            <div className="flex-1 max-w-2xl text-left space-y-6">
              {/* Badge Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 border border-white/15 text-white/90 rounded-full text-xs font-semibold hover:border-white/30 transition-all duration-300 w-fit cursor-default shadow-xs backdrop-blur-md">
                <Flame size={13} className="text-amber-400 animate-pulse" />
                <span>{badgeText}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                {headlineText}
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-xl">
                {descriptionText}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center gap-2 py-3 px-7 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-200 text-sm cursor-pointer"
                >
                  {ctaPrimaryText}
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/recently-post"
                  className="inline-flex items-center justify-center gap-2 py-3 px-7 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold rounded-xl backdrop-blur-md hover:-translate-y-0.5 transition-all duration-200 text-sm cursor-pointer"
                >
                  {ctaSecondaryText}
                </Link>
                <Link
                  href="/create"
                  className="inline-flex items-center justify-center gap-2 py-3 px-7 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold rounded-xl backdrop-blur-md hover:-translate-y-0.5 transition-all duration-200 text-sm cursor-pointer"
                >
                  <PenSquare size={16} className="text-blue-400" />
                  {ctaCreatePostText}
                </Link>
              </div>

              {/* Social Proof Stats */}
              <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/15 max-w-lg">
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stats.articles}</p>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{statArticlesText}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stats.members}</p>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{statMembersText}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stats.series}</p>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{statSeriesText}</p>
                </div>
              </div>
            </div>

            {/* ── Right Column: Developer-focused Interactive Visuals ──── */}
            <div className="flex-1 w-full lg:max-w-xl hidden lg:block relative min-h-[470px]">
              {/* Card 1: Floating Code Editor snippet (Top Left) */}
              <div className="absolute top-0 left-0 w-[310px] bg-[#121620]/95 border border-white/15 rounded-xl p-3.5 shadow-2xl z-20 animate-float-1 backdrop-blur-md">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">idea.config.ts</span>
                </div>
                <pre className="text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed">
                  <code className="text-[11px] block">
                    <span className="text-indigo-400">const</span>{" "}
                    <span className="text-blue-400">openidearProject</span> = {"{"}
                    <br />
                    {"  "}title: <span className="text-emerald-400">&quot;AI Idea Sharing&quot;</span>,
                    <br />
                    {"  "}techStack: [<span className="text-emerald-400">&quot;Next.js&quot;</span>, <span className="text-emerald-400">&quot;Tailwind v4&quot;</span>],
                    <br />
                    {"  "}contributors: <span className="text-amber-400">128</span>,
                    <br />
                    {"  "}isDeploying: <span className="text-blue-400">true</span>
                    <br />
                    {"}"};
                  </code>
                </pre>
              </div>

              {/* Card 2: Floating Topic Badge (Top Right) */}
              <div className="absolute top-6 right-2 bg-[#121620]/95 border border-white/15 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 shadow-xl z-20 animate-float-3 backdrop-blur-md cursor-default">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Code size={13} className="text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-white">{previewTopicTitle}</p>
                  <p className="text-[8px] text-slate-400">{previewTopicCount}</p>
                </div>
              </div>

              {/* Card 3: Floating Post snippet (Bottom Left) */}
              <div className="absolute bottom-4 left-2 w-[240px] bg-[#141926]/95 border border-white/15 rounded-xl p-3 shadow-xl z-20 animate-float-1 backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mb-1.5">
                  <span className="font-semibold text-slate-200">@creators</span>
                  <span>•</span>
                  <span>{previewPostRead}</span>
                </div>
                <p className="text-[11px] font-bold text-white leading-snug hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                  {previewPostTitle}
                </p>
                <div className="flex items-center justify-between text-[9px] text-slate-400">
                  <span className="flex items-center gap-1 text-rose-400 font-medium">
                    <Heart size={10} className="fill-rose-400 text-rose-400" /> 84
                  </span>
                  <span className="flex items-center gap-0.5 text-blue-400 font-semibold">
                    {previewPostAction} <ChevronRight size={10} />
                  </span>
                </div>
              </div>

              {/* Card 4: Interactive Course Preview Card (Bottom Right) */}
              <div className="absolute bottom-0 right-0 w-[265px] bg-[#121620]/95 border border-white/15 rounded-xl p-3 shadow-xl z-20 animate-float-2 backdrop-blur-md">
                <div className="relative aspect-video rounded-lg bg-slate-900 mb-2 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 to-blue-950/80" />
                  <Terminal size={24} className="text-blue-400 relative z-10" />
                  <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                    {previewCourseBadge}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate mb-1">
                  {previewCourseTitle}
                </h4>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="flex text-amber-400">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">(4.9)</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-white/10">
                  <span className="flex items-center gap-1">
                    <Users size={10} /> {previewCourseJoined}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
