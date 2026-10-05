"use client";

// =============================================================================
//  AI CONTENT STUDIO — TOPIC INPUT CARD
//  src/features/content-studio/components/ContentStudioInputCard.tsx
// =============================================================================

import React, { KeyboardEvent } from "react";
import {
  Sparkles,
  TrendingUp,
  GraduationCap,
  Lightbulb,
  PackageCheck,
  Flame,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import type { ContentGoal } from "../types/contentStudio.types";

interface ContentStudioInputCardProps {
  topic: string;
  setTopic: (topic: string) => void;
  contentGoal: ContentGoal;
  setContentGoal: (goal: ContentGoal) => void;
  numberOfIdeas: number;
  setNumberOfIdeas: (count: number) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

const GOAL_OPTIONS: {
  value: ContentGoal;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  description: string;
}[] = [
  {
    value: "seo",
    label: "SEO Growth",
    icon: TrendingUp,
    description: "High search volume & keyword intent",
  },
  {
    value: "educational",
    label: "Educational",
    icon: GraduationCap,
    description: "Deep dive tutorials & fundamentals",
  },
  {
    value: "thought_leadership",
    label: "Thought Leadership",
    icon: Lightbulb,
    description: "Architectural perspectives & trends",
  },
  {
    value: "product",
    label: "Product Content",
    icon: PackageCheck,
    description: "Hands-on teardowns & buying guides",
  },
  {
    value: "news",
    label: "News / Trends",
    icon: Flame,
    description: "Industry updates & emergent tools",
  },
];

const IDEA_COUNT_OPTIONS = [5, 10, 15, 20];

const INSPIRATION_CHIPS = [
  "GPU",
  "PC Hardware",
  "Build PC",
  "AI Agents in 2026",
  "Redis Architecture",
];

export function ContentStudioInputCard({
  topic,
  setTopic,
  contentGoal,
  setContentGoal,
  numberOfIdeas,
  setNumberOfIdeas,
  isGenerating,
  onGenerate,
}: ContentStudioInputCardProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (topic.trim() && !isGenerating) {
        onGenerate();
      }
    }
  };

  return (
    <Card className="border border-border/80 bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 sm:p-7 space-y-6">
        {/* Main Prompt Label & Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="topic-input"
              className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2"
            >
              <span>What do you want to write about?</span>
            </label>
            <span className="text-[11px] text-muted-foreground hidden sm:inline-block">
              Press <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border border-border">⌘ + Enter</kbd> to generate
            </span>
          </div>

          <div className="relative">
            <Textarea
              id="topic-input"
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Build PC, AI Agents, Java Spring Boot, Redis..."
              disabled={isGenerating}
              className="text-sm sm:text-base resize-none rounded-xl border-border/80 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary pr-4 leading-relaxed"
            />
          </div>

          {/* Quick Starter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-muted-foreground mr-1">Suggestions:</span>
            {INSPIRATION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setTopic(chip)}
                disabled={isGenerating}
                className="text-xs px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Grid */}
        <div className="pt-2 border-t border-border/60 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Content Goal Selector */}
          <div className="md:col-span-8 space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal size={13} />
              Content Goal
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {GOAL_OPTIONS.map((option) => {
                const isSelected = contentGoal === option.value;
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setContentGoal(option.value)}
                    disabled={isGenerating}
                    title={option.description}
                    className={`flex flex-col items-center justify-center text-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-primary/10 text-primary border-primary ring-1 ring-primary shadow-xs font-semibold"
                        : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border/80"
                    }`}
                  >
                    <Icon size={16} className={`mb-1 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="truncate w-full">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of Ideas Selector */}
          <div className="md:col-span-4 space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Number of ideas
            </span>
            <div className="grid grid-cols-4 gap-2">
              {IDEA_COUNT_OPTIONS.map((count) => {
                const isSelected = numberOfIdeas === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setNumberOfIdeas(count)}
                    disabled={isGenerating}
                    className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border/80"
                    }`}
                  >
                    {count}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Primary CTA Action */}
        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            size="lg"
            onClick={onGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full sm:w-auto px-7 py-3 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                <span>Generating ideas...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-2" />
                <span>✨ Generate Ideas</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
