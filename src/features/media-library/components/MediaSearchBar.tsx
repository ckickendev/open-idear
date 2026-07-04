"use client";

import React, { useCallback, useState } from "react";
import {
  Search,
  X,
  LayoutGrid,
  List,
  SortDesc,
  ArrowUpDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";
import { MediaUploadZone } from "./MediaUploadZone";
import type { ViewMode, SortOption } from "../types/mediaLibrary.types";

// ═══════════════════════════════════════════════════════════════════
//  MediaSearchBar — search input + view/sort controls + upload button
// ═══════════════════════════════════════════════════════════════════

interface MediaSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "-relevance", label: "Most relevant" },
  { value: "-recentlyUsed", label: "Recently used" },
  { value: "-usageCount", label: "Frequently used" },
  { value: "-createdAt", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
  { value: "originalFilename", label: "Name A–Z" },
  { value: "-fileSize", label: "Largest first" },
  { value: "fileSize", label: "Smallest first" },
];

export function MediaSearchBar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
}: MediaSearchBarProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Sync local query when parent search query changes (e.g. when cleared)
  React.useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Debounce calling the parent search action handler
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== searchQuery) {
        onSearchChange(localQuery);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [localQuery, searchQuery, onSearchChange]);

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
      {/* Search input */}
      <div className="relative flex-1">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Search images…"
          className="pl-9 pr-8 h-9 text-sm"
        />
        {localQuery && (
          <button
            type="button"
            onClick={() => {
              setLocalQuery("");
              onSearchChange("");
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Sort by"
          >
            <ArrowUpDown size={14} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {SORT_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={sortBy === opt.value ? "bg-accent" : ""}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View mode toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          className={`p-2 transition-colors cursor-pointer ${
            viewMode === "grid"
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Grid view"
        >
          <LayoutGrid size={14} />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          className={`p-2 transition-colors cursor-pointer ${
            viewMode === "list"
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="List view"
        >
          <List size={14} />
        </button>
      </div>

      {/* Upload button */}
      <MediaUploadZone compact />
    </div>
  );
}
