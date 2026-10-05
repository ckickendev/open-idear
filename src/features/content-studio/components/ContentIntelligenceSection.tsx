"use client";

// =============================================================================
//  AI CONTENT STUDIO — LONG-TERM CONTENT STRATEGY AGENT HUB
//  src/features/content-studio/components/ContentIntelligenceSection.tsx
//
//  Design Decisions:
//  - Displays Content Clusters, Pillar vs Supporting articles, Topic Coverage,
//    and Next Logical Article recommendations based on OpenIdear publishing history.
//  - Interactive Hierarchical Cluster Tree (PC Hardware -> GPU / CPU / RAM).
//  - Duplicate detection awareness and internal linking opportunities.
//  - Compact, non-overwhelming, and expandable.
// =============================================================================

import React, { useState } from "react";
import {
  Sparkles,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Link2,
  Database,
  Compass,
  FolderTree,
  ShieldCheck,
  TrendingUp,
  Zap,
  Bookmark,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  ContentIntelligence,
  HierarchicalCluster,
} from "../types/contentStudio.types";

interface ContentIntelligenceSectionProps {
  intelligence: ContentIntelligence;
  topic?: string;
  onSelectGap?: (gap: string) => void;
}

export function ContentIntelligenceSection({
  intelligence,
  topic,
  onSelectGap,
}: ContentIntelligenceSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "clusters">("overview");

  const {
    existingCount = 0,
    summary,
    coveredTopics = [],
    recommendedGaps = [],
    hierarchicalClusters = [],
    topicCoverage,
    nextLogicalRecommendation,
    internalLinkOpportunities = [],
  } = intelligence;

  const coverageScore = topicCoverage?.overallScore ?? 65;
  const hasHierarchicalClusters =
    hierarchicalClusters && hierarchicalClusters.length > 0;

  return (
    <div className="relative rounded-2xl border border-primary/25 bg-gradient-to-b from-primary/[0.04] via-card to-card shadow-xs overflow-hidden transition-all duration-300">
      {/* ─── Top Header Bar ────────────────────────────────────────────── */}
      <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 shadow-2xs">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-foreground tracking-tight">
                AI Content Strategist
              </span>
              <Badge
                variant="outline"
                className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0 bg-primary/10 text-primary border-primary/20"
              >
                Strategy Agent
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] font-medium px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 flex items-center gap-1"
              >
                <ShieldCheck size={10} />
                <span>Duplicate Shield Active</span>
              </Badge>
            </div>
            {summary && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xl">
                {summary}
              </p>
            )}
          </div>
        </div>

        {/* Right Action & Collapsible Controls */}
        <div className="flex items-center gap-2">
          {/* Tab Selector when expanded */}
          {isExpanded && hasHierarchicalClusters && (
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeTab === "overview"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Coverage & Gaps
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("clusters")}
                className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-all ${
                  activeTab === "clusters"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FolderTree size={12} />
                <span>Cluster Tree</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer flex-shrink-0"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse Strategy Hub" : "Expand Strategy Hub"}
          >
            <span className="hidden sm:inline">
              {isExpanded ? "Minimize" : "Expand Hub"}
            </span>
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* ─── Expandable Body ────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="p-5 space-y-4">
          {/* 1. Next Logical Article Recommendation Banner */}
          {nextLogicalRecommendation && (
            <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/[0.08] via-primary/[0.03] to-transparent p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                    <Zap size={13} className="text-amber-500 fill-amber-500" />
                    Recommended Next Article in Strategy
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-semibold px-1.5 py-0 bg-primary/10 text-primary border-primary/20 capitalize"
                  >
                    {nextLogicalRecommendation.contentRole} Article
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">
                    Cluster: {nextLogicalRecommendation.clusterName}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  {nextLogicalRecommendation.articleTitle}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {nextLogicalRecommendation.rationale}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelectGap?.(nextLogicalRecommendation.articleTitle)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-2xs flex-shrink-0"
              >
                <span>Write This Next</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* 2. Topic Coverage Meter */}
          <div className="rounded-xl border border-border/60 bg-card/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <TrendingUp size={13} className="text-primary" />
                <span>Topic Coverage & Authority Health</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <span>{coverageScore}% Covered</span>
                <span>•</span>
                <span className="text-foreground">
                  {existingCount} Published / {recommendedGaps.length} Gaps
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden flex">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(10, coverageScore))}%` }}
              />
            </div>
          </div>

          {/* 3. Tab Content: Overview (Covered vs Gaps) vs Cluster Tree */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Column 1: Covered in Inventory */}
              <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Database size={13} className="text-primary/70" />
                    Covered in Existing Inventory
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {coveredTopics.length} detected
                  </span>
                </div>

                {coveredTopics.length > 0 ? (
                  <ul className="space-y-1.5">
                    {coveredTopics.map((topicItem, idx) => (
                      <li
                        key={`covered-${idx}`}
                        className="flex items-start gap-2 text-xs text-foreground/80 leading-snug"
                      >
                        <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                          <Check size={10} strokeWidth={3} />
                        </span>
                        <span className="font-medium text-foreground/90">
                          {topicItem}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground/80 italic">
                    No articles indexed yet on this specific angle. High opportunity to establish authority!
                  </p>
                )}
              </div>

              {/* Column 2: Recommended Content Gaps */}
              <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Compass size={13} className="text-primary" />
                    Recommended Content Gaps
                  </span>
                  <span className="text-[11px] text-primary font-medium">
                    {recommendedGaps.length} opportunities
                  </span>
                </div>

                {recommendedGaps.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {recommendedGaps.map((gap, idx) => (
                      <button
                        key={`gap-${idx}`}
                        type="button"
                        onClick={() => onSelectGap?.(gap)}
                        title={`Generate ideas focused on: ${gap}`}
                        className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-background hover:bg-primary hover:text-primary-foreground border border-border/80 hover:border-primary text-foreground/90 transition-all cursor-pointer shadow-2xs"
                      >
                        <ArrowRight
                          size={11}
                          className="text-primary group-hover:text-primary-foreground transition-transform group-hover:translate-x-0.5"
                        />
                        <span>{gap}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/80 italic">
                    Synthesizing strategic content gap recommendations...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 4. Tab Content: Hierarchical Cluster Tree View */}
          {activeTab === "clusters" && hasHierarchicalClusters && (
            <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <FolderTree size={13} className="text-primary" />
                  Content Cluster Architecture
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Click any missing subtopic (→) to plan it next
                </span>
              </div>

              {hierarchicalClusters.map((cluster, cIdx) => (
                <div key={`cluster-${cIdx}`} className="space-y-3">
                  <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Bookmark size={14} className="text-primary" />
                    <span>{cluster.pillarDomain}</span>
                  </div>

                  <div className="space-y-3 pl-3 border-l-2 border-primary/20 ml-2">
                    {cluster.subtopics.map((sub, sIdx) => (
                      <div key={`sub-${sIdx}`} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-foreground/90">
                          <span className="flex items-center gap-1.5">
                            <span className="text-primary">├──</span>
                            <span>{sub.name}</span>
                          </span>
                          <span className="text-[11px] text-muted-foreground font-normal">
                            {sub.coverageScore}% coverage
                          </span>
                        </div>

                        <div className="pl-6 space-y-1 text-xs">
                          {sub.articles.map((art, aIdx) => {
                            const isGap = art.status === "gap";
                            const isNext = art.recommendedNext;
                            return (
                              <div
                                key={`art-${aIdx}`}
                                className={`flex items-center justify-between py-1 px-2 rounded-md transition-colors ${
                                  isNext
                                    ? "bg-primary/10 border border-primary/30 text-primary font-medium"
                                    : "hover:bg-muted/40 text-foreground/80"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {isNext ? (
                                    <Zap size={11} className="text-amber-500 flex-shrink-0" />
                                  ) : isGap ? (
                                    <span className="text-amber-500 font-bold flex-shrink-0">→</span>
                                  ) : (
                                    <Check size={11} className="text-emerald-500 flex-shrink-0" />
                                  )}
                                  <span className="truncate">{art.title}</span>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground/70">
                                    {art.role}
                                  </span>
                                  {isGap && (
                                    <button
                                      type="button"
                                      onClick={() => onSelectGap?.(art.title)}
                                      className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                                    >
                                      Plan
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. Internal Linking Opportunities Preview */}
          {internalLinkOpportunities && internalLinkOpportunities.length > 0 && (
            <div className="pt-2 border-t border-border/50 text-xs">
              <div className="font-semibold text-foreground flex items-center gap-1.5 mb-2">
                <Link2 size={13} className="text-primary/70" />
                Strategic Internal Linking Suggestions
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {internalLinkOpportunities.slice(0, 4).map((link, lIdx) => (
                  <div
                    key={`link-${lIdx}`}
                    className="p-2 rounded-lg bg-muted/30 border border-border/40 text-xs"
                  >
                    <span className="font-medium text-foreground/90 block truncate">
                      {link.sourceTitle}
                    </span>
                    <span className="text-muted-foreground text-[11px] block mt-0.5">
                      → {link.recommendedAngle}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
