"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Languages, CheckCircle2, Loader2, Code2, Layers } from "lucide-react";
import { useTranslation } from "@/app/hook/useTranslation";

interface TranslationLoadingEffectProps {
  sourceLocale?: "en" | "vi";
  targetLocale?: "en" | "vi";
}

export const TranslationLoadingEffect: React.FC<TranslationLoadingEffectProps> = ({
  sourceLocale = "en",
  targetLocale = "vi",
}) => {
  const { language } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const isVi = language === "vi" || targetLocale === "vi";

  // Simulate progressive stages of AI translation for delightful user feedback
  useEffect(() => {
    const t1 = setTimeout(() => setCurrentStep(1), 1200);
    const t2 = setTimeout(() => setCurrentStep(2), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const steps = [
    {
      title: isVi ? "Đọc nội dung và phân tích khối mã nguồn" : "Reading source text & analyzing code blocks",
      desc: isVi ? "Bảo toàn cấu trúc Markdown, hình ảnh và định dạng" : "Preserving Markdown structure, images, and formatting",
    },
    {
      title: isVi ? "AI dịch thuật chuyên sâu & đối chiếu thuật ngữ kỹ thuật" : "AI translating technical vocabulary & context",
      desc: isVi ? "Giữ nguyên cú pháp API, câu lệnh CLI và thuật ngữ chuyên ngành" : "Retaining API syntax, CLI commands, and parenthetical terms",
    },
    {
      title: isVi ? "Định dạng bản nháp Markdown & tạo siêu dữ liệu SEO" : "Formatting Markdown draft & SEO metadata",
      desc: isVi ? "Tối ưu hóa tiêu đề, mô tả và cấu trúc nội dung bản ngữ" : "Optimizing localized title, description, and headings",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 animate-[fade-in_0.3s_ease-out]">
      {/* ─── Hero Floating AI Translation Status Card ─── */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-purple-950/20 p-5 sm:p-6 backdrop-blur-xl shadow-xl shadow-amber-500/5">
        {/* Subtle background glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-md shadow-amber-500/20">
              <Languages className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-amber-100 flex items-center gap-1.5">
                  <span>{isVi ? "Đang dịch bài viết bằng AI" : "AI Article Translation in Progress"}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold tracking-wide uppercase">
                    {sourceLocale.toUpperCase()} → {targetLocale.toUpperCase()}
                  </span>
                </h3>
              </div>
              <p className="text-xs text-amber-200/70 mt-0.5">
                {isVi
                  ? "Hệ thống AI đang dịch và bảo toàn nguyên vẹn mã nguồn, hình ảnh và tiêu đề bài viết..."
                  : "Preserving code blocks, formulas, tables, and images while generating a fluent draft..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-amber-500/20 text-amber-300 text-xs font-medium self-stretch sm:self-auto justify-center">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>{isVi ? "Đang xử lý..." : "Processing..."}</span>
          </div>
        </div>

        {/* Dynamic Multi-Step Progress Tracker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {steps.map((step, idx) => {
            const isDone = currentStep > idx;
            const isCurrent = currentStep === idx;
            return (
              <div
                key={idx}
                className={`relative flex items-start gap-2.5 p-3 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? "bg-amber-500/15 border-amber-500/40 shadow-xs"
                    : isDone
                    ? "bg-slate-900/60 border-emerald-500/30"
                    : "bg-slate-900/30 border-slate-800/40 opacity-50"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold leading-tight line-clamp-1 ${
                      isCurrent ? "text-amber-200" : isDone ? "text-emerald-200" : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11px] text-slate-400/80 leading-tight mt-0.5 line-clamp-1">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Shimmering Page Canvas Skeleton ─── */}
      <div className="w-full flex flex-col gap-6 opacity-85">
        {/* Title skeleton */}
        <div className="flex flex-col gap-3">
          <div className="h-10 sm:h-12 w-4/5 rounded-xl bg-gradient-to-r from-slate-800 via-slate-700/60 to-slate-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
          <div className="h-6 w-2/5 rounded-lg bg-gradient-to-r from-slate-800/70 via-slate-700/40 to-slate-800/70 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
        </div>

        {/* Author / Date / Badges meta bar skeleton */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse shrink-0" />
          <div className="h-4 w-28 rounded bg-slate-800 animate-pulse" />
          <div className="h-4 w-20 rounded bg-slate-800 animate-pulse" />
          <div className="h-4 w-16 rounded-full bg-amber-500/10 border border-amber-500/20 animate-pulse ml-auto" />
        </div>

        {/* Featured / Hero visual card skeleton */}
        <div className="w-full h-48 sm:h-64 rounded-2xl border border-slate-800/80 bg-gradient-to-tr from-slate-900 via-slate-850 to-slate-800 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%] animate-[shimmer_2.5s_infinite]" />
          <div className="flex flex-col items-center gap-2 text-slate-600">
            <Layers className="w-8 h-8 animate-pulse text-amber-500/30" />
            <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
              {isVi ? "Đang đồng bộ hình ảnh & sơ đồ..." : "Synchronizing media & diagrams..."}
            </span>
          </div>
        </div>

        {/* Paragraph text skeleton lines */}
        <div className="flex flex-col gap-2.5">
          <div className="h-4 w-full rounded bg-gradient-to-r from-slate-800 via-slate-700/60 to-slate-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
          <div className="h-4 w-[96%] rounded bg-gradient-to-r from-slate-800 via-slate-700/60 to-slate-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
          <div className="h-4 w-[92%] rounded bg-gradient-to-r from-slate-800 via-slate-700/60 to-slate-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
          <div className="h-4 w-[78%] rounded bg-gradient-to-r from-slate-800 via-slate-700/60 to-slate-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
        </div>

        {/* Code Block Skeleton */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono flex flex-col gap-3 shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Code2 className="w-3.5 h-3.5" />
              <span>code block preservation</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3.5 w-1/3 rounded bg-slate-800/80 animate-pulse" />
            <div className="h-3.5 w-2/3 rounded bg-slate-800/60 animate-pulse" />
            <div className="h-3.5 w-1/2 rounded bg-slate-800/50 animate-pulse" />
          </div>
        </div>

        {/* Section Heading & More paragraphs skeleton */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="h-7 w-2/5 rounded-lg bg-gradient-to-r from-slate-800 via-slate-700/60 to-slate-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
          <div className="h-4 w-[94%] rounded bg-gradient-to-r from-slate-800 via-slate-700/60 to-slate-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
          <div className="h-4 w-[88%] rounded bg-gradient-to-r from-slate-800 via-slate-700/60 to-slate-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
        </div>
      </div>
    </div>
  );
};
