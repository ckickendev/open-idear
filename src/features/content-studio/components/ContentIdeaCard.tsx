"use client";

// =============================================================================
//  AI CONTENT STUDIO — STRATEGIC CONTENT IDEA CARD COMPONENT
//  src/features/content-studio/components/ContentIdeaCard.tsx
//
//  Design Decisions:
//  - Displays Content Role (Pillar vs Supporting).
//  - Highlights "Next Logical Article" recommendations in the content cluster.
//  - Surfaces duplicate detection checks and specific internal linking advice.
// =============================================================================

import React from "react";
import {
  Check,
  BookOpen,
  GitCompare,
  Terminal,
  FileText,
  ListOrdered,
  Briefcase,
  Flame,
  Search,
  Target,
  Tag,
  Sparkles,
  Link2,
  CornerDownRight,
  Compass,
  Zap,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  ContentIdea,
  ContentType,
  ContentDifficulty,
  SearchIntent,
  ContentRelationship,
} from "../types/contentStudio.types";

interface ContentIdeaCardProps {
  idea: ContentIdea;
  isSelected: boolean;
  onToggle: () => void;
}

const CONTENT_TYPE_LABELS: Record<
  ContentType,
  { label: string; icon: React.ComponentType<{ className?: string; size?: number }> }
> = {
  guide: { label: "Guide", icon: BookOpen },
  comparison: { label: "Comparison", icon: GitCompare },
  tutorial: { label: "Tutorial", icon: Terminal },
  explainer: { label: "Explainer", icon: FileText },
  listicle: { label: "Listicle", icon: ListOrdered },
  case_study: { label: "Case Study", icon: Briefcase },
  news: { label: "News", icon: Flame },
};

const DIFFICULTY_VARIANTS: Record<
  ContentDifficulty,
  { label: string; className: string }
> = {
  beginner: {
    label: "Beginner",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  intermediate: {
    label: "Intermediate",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  advanced: {
    label: "Advanced",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
};

const RELATIONSHIP_CONFIGS: Record<
  ContentRelationship,
  { label: string; icon: React.ComponentType<{ className?: string; size?: number }>; className: string }
> = {
  content_gap: {
    label: "Content Gap",
    icon: Sparkles,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  supports_existing: {
    label: "Supports Existing",
    icon: Link2,
    className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  },
  comparison: {
    label: "Comparison",
    icon: GitCompare,
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30",
  },
  follow_up: {
    label: "Follow-Up",
    icon: CornerDownRight,
    className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
  },
  new_topic: {
    label: "New Topic",
    icon: Compass,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
};

const SEARCH_INTENT_LABELS: Record<SearchIntent, string> = {
  informational: "Informational",
  commercial: "Commercial",
  transactional: "Transactional",
  navigational: "Navigational",
};

export function ContentIdeaCard({
  idea,
  isSelected,
  onToggle,
}: ContentIdeaCardProps) {
  const typeConfig = CONTENT_TYPE_LABELS[idea.contentType] || {
    label: idea.contentType,
    icon: FileText,
  };
  const TypeIcon = typeConfig.icon;
  const difficultyConfig =
    DIFFICULTY_VARIANTS[idea.difficulty] || DIFFICULTY_VARIANTS.intermediate;

  const isPillar = idea.contentRole === "pillar";
  const isNext = Boolean(idea.isNextLogicalArticle);

  return (
    <div
      onClick={onToggle}
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`group relative rounded-2xl border p-5 sm:p-6 transition-all duration-200 cursor-pointer select-none text-left flex flex-col justify-between ${
        isSelected
          ? "border-primary bg-primary/[0.03] dark:bg-primary/[0.08] ring-2 ring-primary/40 shadow-sm"
          : isNext
          ? "border-amber-500/30 bg-amber-500/[0.02] hover:border-amber-500/50 shadow-2xs"
          : "border-border/80 bg-card hover:border-border hover:bg-muted/30 shadow-xs"
      }`}
    >
      <div>
        {/* Top Header: Checkbox & Metadata Strip */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Custom Checkbox */}
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${
              isSelected
                ? "bg-primary border-primary text-primary-foreground shadow-xs"
                : "border-muted-foreground/40 bg-background group-hover:border-primary/60"
            }`}
          >
            {isSelected && <Check size={13} strokeWidth={3} />}
          </div>

          {/* Strategic Metadata Badges */}
          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            {/* Next Logical Article Highlight */}
            {isNext && (
              <Badge
                variant="outline"
                className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 flex items-center gap-1 shadow-2xs"
              >
                <Zap size={11} className="text-amber-500 fill-amber-500" />
                <span>Next Logical</span>
              </Badge>
            )}

            {/* Pillar vs Supporting Role */}
            <Badge
              variant="outline"
              className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                isPillar
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                  : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30"
              }`}
            >
              {isPillar ? "🏛️ Pillar" : "🧱 Supporting"}
            </Badge>

            {/* Content Relationship */}
            {idea.contentRelationship && RELATIONSHIP_CONFIGS[idea.contentRelationship] && (
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs ${
                  RELATIONSHIP_CONFIGS[idea.contentRelationship].className
                }`}
              >
                {React.createElement(RELATIONSHIP_CONFIGS[idea.contentRelationship].icon, {
                  size: 11,
                  className: "flex-shrink-0",
                })}
                <span>{RELATIONSHIP_CONFIGS[idea.contentRelationship].label}</span>
              </Badge>
            )}

            {/* Content Type */}
            <Badge
              variant="secondary"
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1 bg-muted/80 text-foreground"
            >
              <TypeIcon size={11} className="text-primary" />
              <span>{typeConfig.label}</span>
            </Badge>

            {/* Difficulty */}
            <Badge
              variant="outline"
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${difficultyConfig.className}`}
            >
              {difficultyConfig.label}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug tracking-tight mb-2 group-hover:text-primary transition-colors">
          {idea.title}
        </h3>

        {/* Hook / Value Proposition */}
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3">
          {idea.hook}
        </p>

        {/* Next Logical Step Reason Banner (if applicable) */}
        {isNext && idea.nextLogicalReason && (
          <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 leading-snug">
            <strong>Strategist Note:</strong> {idea.nextLogicalReason}
          </div>
        )}

        {/* Inventory Context: Related Article & Link Opportunity */}
        {(idea.relatedArticleTitle || idea.internalLinkOpportunity) && (
          <div className="mb-3 space-y-1 text-[11px] bg-muted/40 rounded-lg p-2 border border-border/50">
            {idea.relatedArticleTitle && (
              <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                <Link2 size={12} className="text-primary/70 flex-shrink-0" />
                <span className="truncate">
                  Cluster tie-in:{" "}
                  <span className="text-foreground/90 font-medium">
                    {idea.relatedArticleTitle}
                  </span>
                </span>
              </div>
            )}
            {idea.internalLinkOpportunity && (
              <div className="flex items-center gap-1.5 text-muted-foreground/90 truncate">
                <CornerDownRight size={12} className="text-emerald-500 flex-shrink-0" />
                <span className="truncate">
                  Link opportunity:{" "}
                  <span className="text-foreground/80">
                    {idea.internalLinkOpportunity}
                  </span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Structured Internal Linking Suggestions */}
        {idea.internalLinkingSuggestions && idea.internalLinkingSuggestions.length > 0 && (
          <div className="mb-3 px-2.5 py-2 rounded-lg bg-primary/[0.03] border border-primary/20 text-[11px] space-y-1">
            <span className="font-semibold text-foreground/80 flex items-center gap-1">
              <Link2 size={11} className="text-primary" />
              Internal Linking Blueprint:
            </span>
            {idea.internalLinkingSuggestions.slice(0, 1).map((sug, idx) => (
              <div key={idx} className="text-muted-foreground leading-snug">
                <span>
                  Anchor <strong>&quot;{sug.recommendedAnchorText}&quot;</strong> from{" "}
                  <span className="text-foreground/90 font-medium">
                    &quot;{sug.articleTitle}&quot;
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Duplicate Shield, Target Audience & Search Intent */}
      <div className="pt-3 border-t border-border/50 space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          {/* Target Audience */}
          <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
            <Target size={12} className="text-primary/70 flex-shrink-0" />
            <span className="font-medium text-foreground/80 truncate max-w-[170px]">
              {idea.targetAudience}
            </span>
          </div>

          {/* Duplicate Shield Status */}
          {idea.duplicateRisk?.isDuplicateRisk ? (
            <div
              className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium truncate max-w-[200px]"
              title={idea.duplicateRisk.mitigationNote}
            >
              <AlertCircle size={11} className="flex-shrink-0" />
              <span className="truncate">
                {idea.duplicateRisk.similarityScore}% match (pivoted)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck size={11} className="flex-shrink-0" />
              <span>0% duplicate risk</span>
            </div>
          )}
        </div>

        {/* Search Intent & Category */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Search size={11} className="text-primary/60 flex-shrink-0" />
            <span className="capitalize">
              {SEARCH_INTENT_LABELS[idea.searchIntent] || idea.searchIntent}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground/80 font-medium truncate max-w-[140px]">
            {idea.category}
          </span>
        </div>

        {/* Keywords Tags */}
        {idea.keywords && idea.keywords.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <Tag size={11} className="text-muted-foreground/60 mr-0.5 flex-shrink-0" />
            {idea.keywords.slice(0, 3).map((kw, idx) => (
              <span
                key={`${kw}-${idx}`}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/50"
              >
                {kw}
              </span>
            ))}
            {idea.keywords.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{idea.keywords.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
