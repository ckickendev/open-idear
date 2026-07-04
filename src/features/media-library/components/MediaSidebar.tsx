"use client";

import React from "react";
import {
  Images,
  Heart,
  Clock,
  FolderPlus,
  Folder as FolderIcon,
  ChevronRight,
  Sparkles,
  Globe,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  MediaFolder,
  QuickFilter,
} from "../types/mediaLibrary.types";

// ═══════════════════════════════════════════════════════════════════
//  MediaSidebar — navigation with quick filters + folder tree
// ═══════════════════════════════════════════════════════════════════

interface MediaSidebarProps {
  folders: MediaFolder[];
  activeFilter: QuickFilter;
  currentFolder: string | null;
  onFilterChange: (filter: QuickFilter) => void;
  onFolderChange: (folderId: string | null) => void;
  onCreateFolder: () => void;
}

const QUICK_FILTERS: { key: QuickFilter; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "My Library", icon: <Images size={15} /> },
  { key: "suggested", label: "Suggested", icon: <Sparkles size={15} className="text-violet-500" /> },
  { key: "online", label: "Search Online", icon: <Globe size={15} /> },
  { key: "recent", label: "Recent", icon: <Clock size={15} /> },
  { key: "favorites", label: "Favorites", icon: <Heart size={15} /> },
];

export function MediaSidebar({
  folders,
  activeFilter,
  currentFolder,
  onFilterChange,
  onFolderChange,
  onCreateFolder,
}: MediaSidebarProps) {
  return (
    <div className="w-56 flex-shrink-0 border-r border-border flex flex-col">
      <ScrollArea className="flex-1 py-3">
        {/* Quick Filters */}
        <div className="px-2 mb-4">
          {QUICK_FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => {
                onFilterChange(filter.key);
                onFolderChange(null);
              }}
              className={`
                flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm
                transition-all duration-150 cursor-pointer
                ${activeFilter === filter.key && !currentFolder
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }
              `}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="h-px bg-border mx-3 mb-3" />

        {/* Folders section */}
        <div className="px-2">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Folders
            </span>
            <button
              type="button"
              onClick={onCreateFolder}
              className="p-1 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Create folder"
            >
              <FolderPlus size={14} />
            </button>
          </div>

          {/* Root (no folder) */}
          <button
            type="button"
            onClick={() => {
              onFolderChange(null);
              onFilterChange("all");
            }}
            className={`
              flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm
              transition-all duration-150 cursor-pointer
              ${currentFolder === null && activeFilter === "all"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }
            `}
          >
            <FolderIcon size={15} />
            Unsorted
          </button>

          {/* Folder tree */}
          {folders.map((folder) => (
            <FolderTreeItem
              key={folder._id}
              folder={folder}
              currentFolder={currentFolder}
              onFolderChange={onFolderChange}
              depth={0}
            />
          ))}

          {folders.length === 0 && (
            <p className="px-3 py-4 text-xs text-muted-foreground/60 text-center">
              No folders yet
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Recursive folder tree item ─────────────────────────────────

function FolderTreeItem({
  folder,
  currentFolder,
  onFolderChange,
  depth,
}: {
  folder: MediaFolder;
  currentFolder: string | null;
  onFolderChange: (id: string | null) => void;
  depth: number;
}) {
  const isActive = currentFolder === folder._id;
  const hasChildren = (folder.children?.length || 0) > 0;

  return (
    <div style={{ paddingLeft: `${depth * 12}px` }}>
      <button
        type="button"
        onClick={() => onFolderChange(folder._id)}
        className={`
          flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm
          transition-all duration-150 cursor-pointer
          ${isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          }
        `}
      >
        {hasChildren && (
          <ChevronRight
            size={12}
            className="flex-shrink-0 text-muted-foreground"
          />
        )}
        <FolderIcon
          size={15}
          className="flex-shrink-0"
          style={{ color: folder.color }}
        />
        <span className="truncate">{folder.name}</span>
        {folder.assetCount > 0 && (
          <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
            {folder.assetCount}
          </span>
        )}
      </button>

      {hasChildren &&
        folder.children!.map((child) => (
          <FolderTreeItem
            key={child._id}
            folder={child}
            currentFolder={currentFolder}
            onFolderChange={onFolderChange}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}
