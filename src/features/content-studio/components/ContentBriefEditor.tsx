"use client";

// =============================================================================
//  AI CONTENT STUDIO — CONTENT BRIEF EDITOR COMPONENT (SPRINT 2)
//  src/features/content-studio/components/ContentBriefEditor.tsx
//
//  Design Decisions:
//  - Fully editable AI-generated content brief specifications.
//  - Multi-select audience tags with add/remove + suggested audience chips.
//  - Dropdowns for Tone, Length, Category, and Objective.
//  - Supports single idea editing and tabbed multiple idea workflows.
//  - "Regenerate suggestions" button refreshes AI values without losing context.
// =============================================================================

import React, { useState, KeyboardEvent } from "react";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  RefreshCw,
  Loader2,
  Tag,
  Target,
  SlidersHorizontal,
  Clock,
  Folder,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type {
  ContentIdea,
  ContentBrief,
} from "../types/contentStudio.types";
import {
  TONE_OPTIONS,
  LENGTH_OPTIONS,
  OBJECTIVE_OPTIONS,
  DEFAULT_AUDIENCE_SUGGESTIONS,
} from "../types/contentStudio.types";

interface ContentBriefEditorProps {
  idea: ContentIdea;
  brief: ContentBrief | null;
  isLoadingBrief: boolean;
  onUpdateField: <K extends keyof ContentBrief>(
    field: K,
    value: ContentBrief[K]
  ) => void;
  onRegenerateSuggestions: () => void;
  onBack: () => void;
  onProceedToOutline: () => void;
  // Multiple ideas support
  selectedIdeas?: ContentIdea[];
  activeIdeaIndex?: number;
  onSelectIdeaIndex?: (index: number) => void;
  availableCategories?: string[];
}

export function ContentBriefEditor({
  idea,
  brief,
  isLoadingBrief,
  onUpdateField,
  onRegenerateSuggestions,
  onBack,
  onProceedToOutline,
  selectedIdeas = [],
  activeIdeaIndex = 0,
  onSelectIdeaIndex,
  availableCategories = [],
}: ContentBriefEditorProps) {
  const [customAudienceInput, setCustomAudienceInput] = useState("");

  const currentAudience = brief?.targetAudience || [];
  const currentTone = brief?.tone || TONE_OPTIONS[0];
  const currentLength = brief?.length || LENGTH_OPTIONS[1];
  const currentCategory = brief?.category || idea.category || "General";
  const currentObjective = brief?.objective || OBJECTIVE_OPTIONS[0];

  // Combined categories list (system categories + idea category fallback)
  const categoryOptions = Array.from(
    new Set([
      currentCategory,
      ...availableCategories,
      "PC Hardware",
      "Software Development",
      "Artificial Intelligence",
      "DevOps",
      "Web Development",
    ].filter(Boolean))
  );

  const handleAddAudienceTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (currentAudience.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      toast.info(`"${trimmed}" is already in target audience.`);
      setCustomAudienceInput("");
      return;
    }
    const updated = [...currentAudience, trimmed];
    onUpdateField("targetAudience", updated);
    setCustomAudienceInput("");
  };

  const handleRemoveAudienceTag = (indexToRemove: number) => {
    const updated = currentAudience.filter((_, idx) => idx !== indexToRemove);
    onUpdateField("targetAudience", updated);
  };

  const handleKeyDownAudience = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddAudienceTag(customAudienceInput);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50 duration-300">
      {/* Multiple ideas switcher tab strip if > 1 idea selected */}
      {selectedIdeas.length > 1 && onSelectIdeaIndex && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-muted-foreground mr-1 whitespace-nowrap">
            Selected Ideas ({selectedIdeas.length}):
          </span>
          {selectedIdeas.map((selIdea, idx) => {
            const isActive = idx === activeIdeaIndex;
            return (
              <button
                key={selIdea.id}
                type="button"
                onClick={() => onSelectIdeaIndex(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-xs ring-1 ring-primary"
                    : "bg-card text-muted-foreground hover:text-foreground border-border hover:bg-muted"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="max-w-[200px] truncate">{selIdea.title}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Brief Card */}
      <Card className="border border-border/80 bg-card shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Card Header: Title & Regenerate Action */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-border/70">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Compass size={14} />
                  CONTENT BRIEF
                </span>
                {selectedIdeas.length > 1 && (
                  <Badge
                    variant="outline"
                    className="text-[11px] font-semibold text-muted-foreground"
                  >
                    Idea {activeIdeaIndex + 1} of {selectedIdeas.length}
                  </Badge>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground leading-snug">
                {idea.title}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {idea.hook}
              </p>
            </div>

            {/* Regenerate suggestions button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRegenerateSuggestions}
              disabled={isLoadingBrief}
              className="text-xs h-9 rounded-xl border-border/80 hover:bg-muted font-medium flex-shrink-0 cursor-pointer"
            >
              <RefreshCw
                size={13}
                className={`mr-1.5 ${
                  isLoadingBrief ? "animate-spin text-primary" : "text-muted-foreground"
                }`}
              />
              <span>Regenerate suggestions</span>
            </Button>
          </div>

          {isLoadingBrief ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 size={24} className="animate-spin text-primary" />
              <p className="text-sm font-medium">
                Synthesizing strategic brief specifications...
              </p>
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-border/60">
              {/* Field 1: Target Audience */}
              <div className="space-y-3 pt-2 first:pt-0">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Target size={15} className="text-primary" />
                  <span>Target Audience</span>
                </label>

                {/* Selected Audience Chips */}
                <div className="flex flex-wrap items-center gap-2 min-h-8">
                  {currentAudience.map((aud, idx) => (
                    <span
                      key={`${aud}-${idx}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-2xs"
                    >
                      <span>{aud}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAudienceTag(idx)}
                        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                        aria-label={`Remove ${aud}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}

                  {/* Tag Input */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={customAudienceInput}
                      onChange={(e) => setCustomAudienceInput(e.target.value)}
                      onKeyDown={handleKeyDownAudience}
                      placeholder="Add persona (press Enter)..."
                      className="text-xs bg-muted/30 border border-border/70 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddAudienceTag(customAudienceInput)}
                      disabled={!customAudienceInput.trim()}
                      className="h-7 px-2 text-xs text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                    >
                      <Plus size={13} className="mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Quick Add Suggested Personas */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
                  <span className="font-medium mr-1">Suggestions:</span>
                  {DEFAULT_AUDIENCE_SUGGESTIONS.map((sug) => {
                    const alreadyAdded = currentAudience.some(
                      (a) => a.toLowerCase() === sug.toLowerCase()
                    );
                    if (alreadyAdded) return null;
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleAddAudienceTag(sug)}
                        className="px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 transition-colors cursor-pointer"
                      >
                        + {sug}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 2: Tone */}
              <div className="space-y-2 pt-4">
                <label
                  htmlFor="tone-select"
                  className="text-sm font-bold text-foreground flex items-center gap-2"
                >
                  <SlidersHorizontal size={15} className="text-primary" />
                  <span>Tone</span>
                </label>
                <div className="relative">
                  <select
                    id="tone-select"
                    value={currentTone}
                    onChange={(e) => onUpdateField("tone", e.target.value)}
                    className="w-full text-sm bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary appearance-none pr-8 cursor-pointer font-medium"
                  >
                    {TONE_OPTIONS.map((tone) => (
                      <option key={tone} value={tone}>
                        {tone}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                    ▼
                  </div>
                </div>
              </div>

              {/* Field 3: Length */}
              <div className="space-y-2 pt-4">
                <label
                  htmlFor="length-select"
                  className="text-sm font-bold text-foreground flex items-center gap-2"
                >
                  <Clock size={15} className="text-primary" />
                  <span>Length</span>
                </label>
                <div className="relative">
                  <select
                    id="length-select"
                    value={currentLength}
                    onChange={(e) => onUpdateField("length", e.target.value)}
                    className="w-full text-sm bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary appearance-none pr-8 cursor-pointer font-medium"
                  >
                    {LENGTH_OPTIONS.map((len) => (
                      <option key={len} value={len}>
                        {len}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                    ▼
                  </div>
                </div>
              </div>

              {/* Field 4: Category */}
              <div className="space-y-2 pt-4">
                <label
                  htmlFor="category-select"
                  className="text-sm font-bold text-foreground flex items-center gap-2"
                >
                  <Folder size={15} className="text-primary" />
                  <span>Category</span>
                </label>
                <div className="relative">
                  <select
                    id="category-select"
                    value={currentCategory}
                    onChange={(e) => onUpdateField("category", e.target.value)}
                    className="w-full text-sm bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary appearance-none pr-8 cursor-pointer font-medium"
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                    ▼
                  </div>
                </div>
              </div>

              {/* Field 5: Objective / Goal */}
              <div className="space-y-2 pt-4">
                <label
                  htmlFor="objective-select"
                  className="text-sm font-bold text-foreground flex items-center gap-2"
                >
                  <Tag size={15} className="text-primary" />
                  <span>Objective / Goal</span>
                </label>
                <div className="relative">
                  <select
                    id="objective-select"
                    value={currentObjective}
                    onChange={(e) => onUpdateField("objective", e.target.value)}
                    className="w-full text-sm bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary appearance-none pr-8 cursor-pointer font-medium"
                  >
                    {OBJECTIVE_OPTIONS.map((obj) => (
                      <option key={obj} value={obj}>
                        {obj}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                    ▼
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer Bar */}
          <div className="pt-6 border-t border-border flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border-border/80 hover:bg-muted font-semibold text-foreground cursor-pointer"
            >
              <ArrowLeft size={16} className="mr-2" />
              <span>Back</span>
            </Button>

            <Button
              type="button"
              size="lg"
              onClick={onProceedToOutline}
              disabled={isLoadingBrief || currentAudience.length === 0}
              className="px-6 py-2.5 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <span>Generate Outline</span>
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
