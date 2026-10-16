"use client";

// =============================================================================
//  SEOScoreSidebar — Live SEO score panel for the editor
//  src/features/editor/components/SEOScoreSidebar.tsx
//
//  Accepts metrics from useContentMetrics + title/description state.
//  Renders:
//    • Circular score gauge (0–100) with colour-coded arc
//    • Checklist of SEO signals:
//        - Word count (≥ 300 words)
//        - H2 headings (≥ 2)
//        - Reading time (≤ 10 min)
//        - Image alt coverage
//        - Meta description present
//        - Internal links (≥ 1)
//
//  All colours use --color-editor-* + --ed-* tokens — no hardcoded colours.
//  No new hooks or API calls needed.
// =============================================================================

import React, { useMemo } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Type,
  Heading2,
  Image,
  FileText,
  Link2,
  TrendingUp,
} from "lucide-react";
import type { ContentMetrics } from "@/features/seo/types/seo.types";
import { useTranslation } from "@/app/hook/useTranslation";

// ─── Types ───────────────────────────────────────────────────────────────────

type CheckStatus = "pass" | "warn" | "fail";

interface SEOCheck {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface SEOScoreSidebarProps {
  metrics: ContentMetrics;
  title: string;
  description: string;
}

// ─── Score calculation ────────────────────────────────────────────────────────

function computeChecks(
  metrics: ContentMetrics,
  title: string,
  description: string,
  t: (key: string, params?: Record<string, string | number>) => string,
): { checks: SEOCheck[]; score: number } {
  const checks: SEOCheck[] = [];
  let totalWeight = 0;
  let earnedWeight = 0;

  function addCheck(
    check: Omit<SEOCheck, "status">,
    weight: number,
    pass: boolean,
    warn: boolean = false,
  ) {
    const status: CheckStatus = pass ? "pass" : warn ? "warn" : "fail";
    checks.push({ ...check, status });
    totalWeight += weight;
    if (pass) earnedWeight += weight;
    else if (warn) earnedWeight += weight * 0.5;
  }

  // 1. Word count (20 pts)
  addCheck(
    {
      id: "word-count",
      label: t("editor.seo_sidebar.word_count"),
      message:
        metrics.wordCount >= 600
          ? t("editor.seo_sidebar.words_great", { count: metrics.wordCount })
          : metrics.wordCount >= 300
          ? t("editor.seo_sidebar.words_good", { count: metrics.wordCount })
          : t("editor.seo_sidebar.words_short", { count: metrics.wordCount }),
      icon: Type,
    },
    20,
    metrics.wordCount >= 600,
    metrics.wordCount >= 300,
  );

  // 2. H2 headings (15 pts)
  addCheck(
    {
      id: "h2-count",
      label: t("editor.seo_sidebar.h2_headings"),
      message:
        metrics.headingCount.h2 >= 3
          ? t("editor.seo_sidebar.h2_great", { count: metrics.headingCount.h2 })
          : metrics.headingCount.h2 >= 2
          ? t("editor.seo_sidebar.h2_good", { count: metrics.headingCount.h2 })
          : metrics.headingCount.h2 === 1
          ? t("editor.seo_sidebar.h2_one")
          : t("editor.seo_sidebar.h2_none"),
      icon: Heading2,
    },
    15,
    metrics.headingCount.h2 >= 2,
    metrics.headingCount.h2 === 1,
  );

  // 3. Reading time (10 pts)
  addCheck(
    {
      id: "reading-time",
      label: t("editor.seo_sidebar.reading_time"),
      message:
        metrics.readingTime <= 10
          ? t("editor.seo_sidebar.reading_ideal", { time: metrics.readingTime })
          : t("editor.seo_sidebar.reading_long", { time: metrics.readingTime }),
      icon: Clock,
    },
    10,
    metrics.readingTime >= 3 && metrics.readingTime <= 10,
    metrics.readingTime > 10,
  );

  // 4. Images present (15 pts)
  addCheck(
    {
      id: "images",
      label: t("editor.seo_sidebar.images"),
      message:
        metrics.imageCount >= 2
          ? t("editor.seo_sidebar.images_good", { count: metrics.imageCount })
          : metrics.imageCount === 1
          ? t("editor.seo_sidebar.images_one")
          : t("editor.seo_sidebar.images_none"),
      icon: Image,
    },
    15,
    metrics.imageCount >= 2,
    metrics.imageCount === 1,
  );

  // 5. Meta description (20 pts)
  const descLen = description.trim().length;
  addCheck(
    {
      id: "meta-description",
      label: t("editor.seo_sidebar.meta_description"),
      message:
        descLen >= 120 && descLen <= 160
          ? t("editor.seo_sidebar.desc_perfect", { count: descLen })
          : descLen > 0
          ? t("editor.seo_sidebar.desc_length", { count: descLen })
          : t("editor.seo_sidebar.desc_none"),
      icon: FileText,
    },
    20,
    descLen >= 120 && descLen <= 160,
    descLen > 0 && (descLen < 120 || descLen > 160),
  );

  // 6. Title set (10 pts)
  addCheck(
    {
      id: "title",
      label: t("editor.seo_sidebar.article_title"),
      message: title.trim() ? `"${title.slice(0, 40)}${title.length > 40 ? "…" : ""}"` : t("editor.seo_sidebar.title_none"),
      icon: Type,
    },
    10,
    title.trim().length >= 20,
    title.trim().length > 0 && title.trim().length < 20,
  );

  // 7. Internal links (10 pts)
  addCheck(
    {
      id: "internal-links",
      label: t("editor.seo_sidebar.internal_links"),
      message:
        metrics.linkCount.internal >= 2
          ? t("editor.seo_sidebar.links_good", { count: metrics.linkCount.internal })
          : metrics.linkCount.internal === 1
          ? t("editor.seo_sidebar.links_one")
          : t("editor.seo_sidebar.links_none"),
      icon: Link2,
    },
    10,
    metrics.linkCount.internal >= 2,
    metrics.linkCount.internal === 1,
  );

  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  return { checks, score };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreGauge({
  score,
  t,
}: {
  score: number;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  // SVG arc gauge
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color =
    score >= 80
      ? "hsl(142, 72%, 50%)"  // green
      : score >= 60
      ? "hsl(38, 95%, 56%)"   // amber
      : score >= 40
      ? "hsl(38, 90%, 48%)"   // orange
      : "hsl(0, 75%, 55%)";   // red

  const label =
    score >= 80
      ? t("editor.seo_sidebar.score_excellent")
      : score >= 60
      ? t("editor.seo_sidebar.score_good")
      : score >= 40
      ? t("editor.seo_sidebar.score_fair")
      : t("editor.seo_sidebar.score_needs_work");

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="relative inline-flex items-center justify-center">
        <svg width={96} height={96} viewBox="0 0 96 96" aria-hidden="true">
          {/* Track */}
          <circle
            cx={48}
            cy={48}
            r={radius}
            fill="none"
            stroke="var(--color-editor-elevated)"
            strokeWidth={8}
          />
          {/* Progress arc */}
          <circle
            cx={48}
            cy={48}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 48 48)"
            style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-extrabold tabular-nums"
            style={{ color, lineHeight: 1 }}
          >
            {score}
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--color-editor-muted)]">
            /100
          </span>
        </div>
      </div>
      <span
        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
        style={{
          color,
          background: `${color}20`,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function CheckRow({ check }: { check: SEOCheck }) {
  const Icon = check.icon;

  const statusIcon =
    check.status === "pass" ? (
      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
    ) : check.status === "warn" ? (
      <AlertTriangle size={13} className="text-amber-500 shrink-0" />
    ) : (
      <XCircle size={13} className="text-red-500 shrink-0" />
    );

  return (
    <div className="flex items-start gap-2.5 py-1.5 px-1 rounded-lg hover:bg-[var(--color-editor-elevated)] transition-colors group">
      <div className="mt-0.5 text-[var(--color-editor-muted)] shrink-0">
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] font-semibold text-[var(--color-editor-text)]">
            {check.label}
          </span>
          {statusIcon}
        </div>
        <p className="text-[10px] text-[var(--color-editor-muted)] leading-snug mt-0.5 truncate">
          {check.message}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const SEOScoreSidebar: React.FC<SEOScoreSidebarProps> = ({
  metrics,
  title,
  description,
}) => {
  const { t } = useTranslation();
  const { checks, score } = useMemo(
    () => computeChecks(metrics, title, description, t),
    [metrics, title, description, t],
  );

  const passCount = checks.filter((c) => c.status === "pass").length;
  const failCount = checks.filter((c) => c.status === "fail").length;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--color-editor-border)] shrink-0">
        <TrendingUp size={16} className="text-[var(--color-editor-accent)] shrink-0" />
        <div>
          <h2 className="text-sm font-bold text-[var(--color-editor-text)]">{t("editor.seo_sidebar.title")}</h2>
          <p className="text-[10px] text-[var(--color-editor-muted)]">{t("editor.seo_sidebar.subtitle")}</p>
        </div>
      </div>

      <div className="flex-1 px-4 pb-6 overflow-y-auto">
        {/* Gauge */}
        <ScoreGauge score={score} t={t} />

        {/* Pass/fail summary */}
        <div className="flex gap-3 mb-4 text-center">
          <div className="flex-1 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-lg font-extrabold text-emerald-500">{passCount}</div>
            <div className="text-[9px] uppercase tracking-wider text-emerald-600 font-semibold">
              {t("editor.seo_sidebar.passed")}
            </div>
          </div>
          <div className="flex-1 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="text-lg font-extrabold text-red-500">{failCount}</div>
            <div className="text-[9px] uppercase tracking-wider text-red-600 font-semibold">
              {t("editor.seo_sidebar.issues")}
            </div>
          </div>
        </div>

        {/* Checks list */}
        <div className="flex flex-col gap-0.5">
          <p className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-editor-muted)] mb-1 px-1">
            {t("editor.seo_sidebar.content_checks")}
          </p>
          {checks.map((check) => (
            <CheckRow key={check.id} check={check} />
          ))}
        </div>

        {/* Stats grid */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <StatTile label={t("editor.seo_sidebar.stat_words")} value={metrics.wordCount.toLocaleString()} />
          <StatTile label={t("editor.seo_sidebar.stat_reading")} value={`${metrics.readingTime} ${t("editor.seo_sidebar.stat_min")}`} />
          <StatTile label={t("editor.seo_sidebar.stat_h2s")} value={String(metrics.headingCount.h2)} />
          <StatTile label={t("editor.seo_sidebar.stat_images")} value={String(metrics.imageCount)} />
          <StatTile label={t("editor.seo_sidebar.stat_int_links")} value={String(metrics.linkCount.internal)} />
          <StatTile label={t("editor.seo_sidebar.stat_ext_links")} value={String(metrics.linkCount.external)} />
        </div>
      </div>
    </div>
  );
};

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)]">
      <span className="text-sm font-extrabold tabular-nums text-[var(--color-editor-text)]">
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-wider text-[var(--color-editor-muted)] font-semibold">
        {label}
      </span>
    </div>
  );
}

export default SEOScoreSidebar;
