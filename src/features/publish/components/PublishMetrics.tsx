// =============================================================================
//  AI PUBLISHING FEATURE — PUBLISH METRICS COMPONENT
//  src/features/publish/components/PublishMetrics.tsx
//
//  Design Decisions:
//  - Fully reusable, responsive grid showing article metadata & stats.
//  - Displays Estimated Reading Time, Word Count, Headings structure (H1/H2/H3),
//    Images, Code Blocks, Tables, Internal Links, External Links, and Affiliate Links.
//  - Uses clean Tailwind styling with custom icons and visual progress cards.
// =============================================================================

import React from "react";
import { Clock, FileText, Heading, Image, Code, Table, Link, ExternalLink, ShieldCheck } from "lucide-react";
import type { ContentMetrics } from "@/features/seo/types/seo.types";

interface PublishMetricsProps {
  readonly metrics: ContentMetrics;
}

export default function PublishMetrics({ metrics }: PublishMetricsProps) {
  // Config data for rendering grid cards
  const items = [
    {
      id: "reading-time",
      name: "Est. Reading Time",
      value: `${metrics.readingTime} min`,
      icon: <Clock size={16} className="text-violet-400" />,
      description: "Based on average 200 WPM parsing.",
    },
    {
      id: "words",
      name: "Total Word Count",
      value: metrics.wordCount.toLocaleString(),
      icon: <FileText size={16} className="text-blue-400" />,
      description: `${metrics.characterCount.toLocaleString()} raw characters.`,
    },
    {
      id: "headings",
      name: "Headings Count",
      value: `H1: ${metrics.headingCount.h1} | H2: ${metrics.headingCount.h2} | H3: ${metrics.headingCount.h3}`,
      icon: <Heading size={16} className="text-emerald-400" />,
      description: "Outline layout elements.",
    },
    {
      id: "images",
      name: "Image Elements",
      value: metrics.imageCount.toString(),
      icon: <Image size={16} className="text-amber-400" />,
      description: "Visual assets inside the body.",
    },
    {
      id: "code-blocks",
      name: "Code Snippets",
      value: metrics.codeBlockCount.toString(),
      icon: <Code size={16} className="text-cyan-400" />,
      description: "Syntax highlighted editor fences.",
    },
    {
      id: "tables",
      name: "Tables Count",
      value: metrics.tableCount.toString(),
      icon: <Table size={16} className="text-pink-400" />,
      description: "Structured comparison tables.",
    },
    {
      id: "internal-links",
      name: "Internal Links",
      value: metrics.linkCount.internal.toString(),
      icon: <Link size={16} className="text-teal-400" />,
      description: "Internal page references.",
    },
    {
      id: "external-links",
      name: "External References",
      value: metrics.linkCount.external.toString(),
      icon: <ExternalLink size={16} className="text-indigo-400" />,
      description: "Outgoing external domain URLs.",
    },
    {
      id: "affiliate-links",
      name: "Affiliate Tracking Links",
      value: metrics.affiliateLinkCount.toString(),
      icon: <ShieldCheck size={16} className="text-rose-400 animate-pulse" />,
      description: "Commercial referrer links.",
    },
  ];

  return (
    <div className="publish-metrics-root space-y-4 text-xs text-[var(--color-editor-text)] animate-[fade-in_0.2s_ease-out]">
      {/* Summary Header */}
      <div className="p-3 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-xl flex items-center justify-between select-none">
        <span className="font-semibold text-xs flex items-center gap-1.5">
          📊 Content Analytics & Metrics
        </span>
        <span className="text-[10px] text-[var(--color-editor-muted)] font-mono">
          Real-time updates
        </span>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3.5 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-xl flex flex-col justify-between gap-1.5 hover:border-[var(--color-editor-accent)] transition-all duration-200 shadow-xs"
          >
            {/* Header info */}
            <div className="flex items-center justify-between gap-2 border-b border-[var(--color-editor-border)] pb-2 mb-0.5 select-none">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-editor-secondary)]">
                {item.name}
              </span>
              {item.icon}
            </div>

            {/* Main Value display */}
            <span className="text-lg font-bold text-[var(--color-editor-text)] font-mono tracking-tight pt-1">
              {item.value}
            </span>

            {/* Description */}
            <span className="text-[10px] text-[var(--color-editor-muted)] block leading-snug">
              {item.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
