// =============================================================================
//  AI PUBLISHING FEATURE — POST INSIGHTS VIEW COMPONENT
//  src/features/publish/components/PostInsights.tsx
//
//  Design Decisions:
//  - Fully reusable, responsive UI showcasing readable metrics.
//  - Displays Reading Time, Word Count, Images, Headings, Links, Tables,
//    Code Blocks, and Flesch Reading Difficulty indicators.
//  - Implements beautiful summary cards with radial gauges for reading ease.
//  - Leverages tailwind styling for a premium editor experience.
// =============================================================================

import React from "react";
import { BookOpen, Award, CheckCircle, BarChart3, AlertCircle, Compass } from "lucide-react";

export interface ClientPostInsights {
  readonly wordCount: number;
  readonly readingTimeMin: number;
  readonly imageCount: number;
  readonly headingCount: number;
  readonly linkCount: {
    readonly internal: number;
    readonly external: number;
  };
  readonly tableCount: number;
  readonly codeBlockCount: number;
  readonly readability: {
    readonly score: number;
    readonly gradeLevel: string;
    readonly difficulty: "easy" | "moderate" | "difficult";
  };
}

interface PostInsightsProps {
  readonly insights: ClientPostInsights;
}

export default function PostInsights({ insights }: PostInsightsProps) {
  const { score, gradeLevel, difficulty } = insights.readability;

  // Determine difficulty styling parameters
  const getDifficultyStyles = (level: "easy" | "moderate" | "difficult") => {
    switch (level) {
      case "easy":
        return {
          color: "text-emerald-400",
          border: "border-emerald-500/25",
          bg: "bg-emerald-500/[0.02]",
          label: "Easy / Conversational",
        };
      case "difficult":
        return {
          color: "text-rose-400 animate-pulse",
          border: "border-rose-500/25",
          bg: "bg-rose-500/[0.02]",
          label: "Technical / Academic",
        };
      case "moderate":
      default:
        return {
          color: "text-amber-400",
          border: "border-amber-500/25",
          bg: "bg-amber-500/[0.02]",
          label: "Intermediate / Professional",
        };
    }
  };

  const difficultyStyle = getDifficultyStyles(difficulty);

  return (
    <div className="post-insights-root grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-[var(--color-editor-text)] animate-[fade-in_0.2s_ease-out]">
      {/* ─── Readability Rating Gauge Card ───────────────────────────────────── */}
      <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 shadow-sm md:col-span-1 ${difficultyStyle.border} ${difficultyStyle.bg}`}>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-editor-secondary)] flex items-center gap-1 select-none">
            <Award size={12} className={difficultyStyle.color} />
            <span>Readability Index</span>
          </span>
          <span className={`text-3xl font-extrabold font-mono tracking-tight block ${difficultyStyle.color}`}>
            {score}/100
          </span>
        </div>

        {/* Difficulty label details */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-[var(--color-editor-muted)]">Grade Level:</span>
            <span className={difficultyStyle.color}>{gradeLevel}</span>
          </div>

          {/* Heuristic visual dial slider */}
          <div className="w-full bg-[var(--color-editor-border)] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                difficulty === "easy" ? "bg-emerald-500" : difficulty === "difficult" ? "bg-rose-500" : "bg-amber-500"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <p className="text-[10px] leading-relaxed text-[var(--color-editor-muted)] italic pt-1 border-t border-[var(--color-editor-border)]">
          Flesch Reading Ease calculations measure word syllable counts and average sentence lengths to determine overall article comprehension rates.
        </p>
      </div>

      {/* ─── Column 2-3: Core Metrics cards grid ─────────────────────────────── */}
      <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Read Time */}
        <div className="p-3.5 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-xl flex flex-col justify-between gap-1 shadow-xs">
          <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-editor-secondary)] flex items-center gap-1">
            <BookOpen size={11} className="text-violet-400" />
            <span>Read Time</span>
          </span>
          <span className="text-lg font-bold font-mono tracking-tight text-[var(--color-editor-text)] pt-0.5">
            {insights.readingTimeMin} min
          </span>
          <span className="text-[9px] text-[var(--color-editor-muted)] truncate block">
            {insights.wordCount.toLocaleString()} words count.
          </span>
        </div>

        {/* Card 2: Outline Headings */}
        <div className="p-3.5 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-xl flex flex-col justify-between gap-1 shadow-xs">
          <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-editor-secondary)] flex items-center gap-1">
            <Compass size={11} className="text-emerald-400" />
            <span>Headings</span>
          </span>
          <span className="text-lg font-bold font-mono tracking-tight text-[var(--color-editor-text)] pt-0.5">
            {insights.headingCount} headers
          </span>
          <span className="text-[9px] text-[var(--color-editor-muted)] truncate block">
            Outline anchors.
          </span>
        </div>

        {/* Card 3: Body Images */}
        <div className="p-3.5 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-xl flex flex-col justify-between gap-1 shadow-xs">
          <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-editor-secondary)] flex items-center gap-1">
            <BarChart3 size={11} className="text-amber-400" />
            <span>Images</span>
          </span>
          <span className="text-lg font-bold font-mono tracking-tight text-[var(--color-editor-text)] pt-0.5">
            {insights.imageCount} images
          </span>
          <span className="text-[9px] text-[var(--color-editor-muted)] truncate block">
            Visual page banners.
          </span>
        </div>

        {/* Card 4: Links */}
        <div className="p-3.5 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-xl flex flex-col justify-between gap-1 shadow-xs">
          <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-editor-secondary)] flex items-center gap-1">
            <CheckCircle size={11} className="text-cyan-400" />
            <span>Links</span>
          </span>
          <span className="text-lg font-bold font-mono tracking-tight text-[var(--color-editor-text)] pt-0.5">
            {insights.linkCount.internal + insights.linkCount.external} links
          </span>
          <span className="text-[9px] text-[var(--color-editor-muted)] truncate block">
            Int: {insights.linkCount.internal} | Ext: {insights.linkCount.external}
          </span>
        </div>

        {/* Card 5: Tables */}
        <div className="p-3.5 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-xl flex flex-col justify-between gap-1 shadow-xs">
          <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-editor-secondary)] flex items-center gap-1">
            <AlertCircle size={11} className="text-pink-400" />
            <span>Tables</span>
          </span>
          <span className="text-lg font-bold font-mono tracking-tight text-[var(--color-editor-text)] pt-0.5">
            {insights.tableCount} tables
          </span>
          <span className="text-[9px] text-[var(--color-editor-muted)] truncate block">
            Comparison data cells.
          </span>
        </div>

        {/* Card 6: Code Blocks */}
        <div className="p-3.5 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-xl flex flex-col justify-between gap-1 shadow-xs">
          <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-editor-secondary)] flex items-center gap-1">
            <CheckCircle size={11} className="text-rose-400" />
            <span>Code Blocks</span>
          </span>
          <span className="text-lg font-bold font-mono tracking-tight text-[var(--color-editor-text)] pt-0.5">
            {insights.codeBlockCount} blocks
          </span>
          <span className="text-[9px] text-[var(--color-editor-muted)] truncate block">
            Language code snippets.
          </span>
        </div>
      </div>
    </div>
  );
}
