"use client";

// =============================================================================
//  ARTICLE VERSION ACTION & TRIGGER COMPONENT
//  src/features/article/versioning/components/ArticleVersionAction.tsx
//
//  Design Decisions:
//  - Placed prominently inside article view.
//  - Displays active version badge (e.g. v1.0).
//  - Triggers the Version History slide-over drawer on click.
//  - Computes author ownership automatically against authentication store.
// =============================================================================

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { History, GitCommit, Sparkles, Clock } from "lucide-react";
import authenticationStore from "@/store/AuthenticationStore";
import { VersionHistoryDrawer } from "./VersionHistoryDrawer";

interface ArticleVersionActionProps {
  readonly slug: string;
  readonly postId: string;
  readonly currentVersion?: string;
  readonly currentContent?: string;
  readonly authorId?: string;
  readonly variant?: "badge" | "button" | "sidebar";
}

export const ArticleVersionAction: React.FC<ArticleVersionActionProps> = ({
  slug,
  postId,
  currentVersion = "1.0",
  currentContent = "",
  authorId,
  variant = "badge",
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const currentUser = authenticationStore((state) => state.currentUser);

  // Check if current logged-in user is article owner
  const isOwner = Boolean(
    currentUser?._id &&
    authorId &&
    currentUser._id.toString() === authorId.toString()
  );

  const handleVersionRestored = () => {
    // Refresh page to reload new head content
    router.refresh();
  };

  return (
    <>
      {variant === "sidebar" ? (
        /* Sidebar Action Icon */
        <div className="flex flex-col items-center">
          <button
            onClick={() => setDrawerOpen(true)}
            id="version-history-sidebar-btn"
            className="p-3 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200 hover:scale-110 cursor-pointer shadow-xs"
            title={`Version History (v${currentVersion})`}
            aria-label="Open article version history"
          >
            <History size={20} className="text-primary" />
          </button>
          <span className="text-[10px] font-mono font-bold text-muted-foreground mt-1">
            v{currentVersion}
          </span>
        </div>
      ) : variant === "button" ? (
        /* Full Header Action Button */
        <button
          onClick={() => setDrawerOpen(true)}
          id="version-history-header-btn"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border/80 transition-all cursor-pointer shadow-xs hover:border-border"
          title="Open article version history"
        >
          <History size={13} className="text-primary" />
          <span>History</span>
          <span className="ml-1 px-1.5 py-0.2 rounded font-mono text-[10px] bg-background text-muted-foreground border border-border/60">
            v{currentVersion}
          </span>
        </button>
      ) : (
        /* Badge Pill Variant (ideal for publication metadata row) */
        <button
          onClick={() => setDrawerOpen(true)}
          id="version-history-pill-btn"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted/60 hover:bg-muted text-foreground/80 hover:text-foreground border border-border/70 transition-all cursor-pointer select-none"
          title="Click to view full revision history & compare versions"
        >
          <GitCommit size={13} className="text-primary" />
          <span className="font-mono font-semibold text-primary">v{currentVersion}</span>
          <span className="text-muted-foreground/60 text-[10px]">·</span>
          <span className="text-[11px] text-muted-foreground hover:underline">History</span>
        </button>
      )}

      {/* Slide-over History Drawer */}
      <VersionHistoryDrawer
        slug={slug}
        postId={postId}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentContent={currentContent}
        currentVersion={currentVersion}
        isOwner={isOwner}
        onVersionRestored={handleVersionRestored}
      />
    </>
  );
};
