"use client";

// =============================================================================
//  AI CONTENT STUDIO — IDEAS GRID & SELECTION ACTIONS
//  src/features/content-studio/components/ContentStudioIdeasGrid.tsx
// =============================================================================

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  RefreshCw,
  CheckCheck,
  XCircle,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ContentIdeaCard } from "./ContentIdeaCard";
import type {
  ContentIdea,
  ContentType,
} from "../types/contentStudio.types";

interface ContentStudioIdeasGridProps {
  ideas: ContentIdea[];
  selectedIdeaIds: string[];
  isIdeaSelected: (id: string) => boolean;
  onToggleIdea: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRegenerate: () => void;
  isGenerating: boolean;
  onContinue?: () => void;
}

export function ContentStudioIdeasGrid({
  ideas,
  selectedIdeaIds,
  isIdeaSelected,
  onToggleIdea,
  onSelectAll,
  onDeselectAll,
  onRegenerate,
  isGenerating,
  onContinue,
}: ContentStudioIdeasGridProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedCount = selectedIdeaIds.length;
  const totalCount = ideas.length;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  // Filter ideas if search or type is applied
  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      const matchesType =
        filterType === "all" || idea.contentType === filterType;
      const matchesSearch =
        !searchQuery.trim() ||
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.keywords.some((k) =>
          k.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesType && matchesSearch;
    });
  }, [ideas, filterType, searchQuery]);

  const handleContinue = () => {
    if (selectedCount === 0) return;
    if (onContinue) {
      onContinue();
    } else {
      const selectedTitles = ideas
        .filter((i) => selectedIdeaIds.includes(i.id))
        .map((i) => i.title);

      toast.success(
        `Selected ${selectedCount} ideas: "${selectedTitles[0]}" ${
          selectedCount > 1 ? `+ ${selectedCount - 1} more` : ""
        }. Ready for Content Brief!`
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Grid Header & Batch Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            {totalCount} Ideas Generated
          </h2>
          <Badge
            variant="secondary"
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
          >
            {selectedCount} selected
          </Badge>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Select All / Deselect All */}
          {isAllSelected ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDeselectAll}
              className="text-xs h-9 rounded-xl border-border/80 hover:bg-muted font-medium cursor-pointer"
            >
              <XCircle size={14} className="mr-1.5 text-muted-foreground" />
              Deselect All
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              className="text-xs h-9 rounded-xl border-border/80 hover:bg-muted font-medium cursor-pointer"
            >
              <CheckCheck size={14} className="mr-1.5 text-primary" />
              Select All
            </Button>
          )}

          {/* Regenerate Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="text-xs h-9 rounded-xl border-border/80 hover:bg-muted font-medium cursor-pointer"
          >
            <RefreshCw
              size={13}
              className={`mr-1.5 ${isGenerating ? "animate-spin text-primary" : "text-muted-foreground"}`}
            />
            <span>Refresh Ideas</span>
          </Button>
        </div>
      </div>

      {/* Optional Search / Filter Strip */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter ideas by keyword or category..."
            className="w-full text-xs bg-muted/30 border border-border/70 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        {/* Content Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterType === "all"
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border/50"
            }`}
          >
            All Types
          </button>
          {(["guide", "comparison", "tutorial", "explainer", "listicle"] as ContentType[]).map(
            (type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium whitespace-nowrap transition-colors ${
                  filterType === type
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border/50"
                }`}
              >
                {type}
              </button>
            )
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredIdeas.map((idea) => (
          <ContentIdeaCard
            key={idea.id}
            idea={idea}
            isSelected={isIdeaSelected(idea.id)}
            onToggle={() => onToggleIdea(idea.id)}
          />
        ))}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-4 z-20 pt-4">
        <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="text-sm font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
              <span>{selectedCount} of {totalCount} ideas selected</span>
              {selectedCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedCount === 0
                ? "Select one or more ideas to advance to Content Brief."
                : "Proceed with selected ideas into your editorial outline."}
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            disabled={selectedCount === 0}
            onClick={handleContinue}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold transition-all shadow-md ${
              selectedCount > 0
                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25 cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <span>Continue with {selectedCount} ideas</span>
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
