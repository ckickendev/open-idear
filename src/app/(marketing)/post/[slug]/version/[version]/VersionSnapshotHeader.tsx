"use client";

// =============================================================================
//  VERSION SNAPSHOT HEADER (ARCHIVE BANNER & CONTROLS)
//  src/app/(marketing)/post/[slug]/version/[version]/VersionSnapshotHeader.tsx
// =============================================================================

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  RotateCcw,
  GitCompare,
  ArrowLeft,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import authenticationStore from "@/store/AuthenticationStore";
import { versioningApi } from "@/features/article/versioning";
import { VersionDiffViewer } from "@/features/article/versioning";

interface VersionSnapshotHeaderProps {
  readonly slug: string;
  readonly postId: string;
  readonly version: string;
  readonly latestVersion: string;
  readonly isCurrentHead: boolean;
  readonly changelog?: string;
  readonly createdAt: string;
  readonly author?: { username?: string; avatar?: string };
  readonly oldContent: string;
  readonly currentContent: string;
  readonly authorId?: string;
}

export const VersionSnapshotHeader: React.FC<VersionSnapshotHeaderProps> = ({
  slug,
  postId,
  version,
  latestVersion,
  isCurrentHead,
  changelog,
  createdAt,
  author,
  oldContent,
  currentContent,
  authorId,
}) => {
  const router = useRouter();
  const [showDiff, setShowDiff] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const currentUser = authenticationStore((state) => state.currentUser);
  const isOwner = Boolean(
    currentUser?._id &&
    authorId &&
    currentUser._id.toString() === authorId.toString()
  );

  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const res = await versioningApi.rollbackArticleVersion(postId, version);
      toast.success(res.message || `Restored version ${version}!`);
      router.push(`/post/${slug}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to restore version.");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <>
      {/* ─── Top Banner ─────────────────────────────────────────────────── */}
      <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 text-amber-900 dark:text-amber-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
            <div>
              <span>
                <strong>Archived Snapshot:</strong> You are viewing <strong>v{version}</strong>
                {isCurrentHead ? " (Current Head)" : ` (Latest is v${latestVersion})`}, published on {formattedDate}.
              </span>
              {changelog && (
                <span className="ml-2 text-muted-foreground italic truncate">
                  &ldquo;{changelog}&rdquo;
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Compare with Current Button */}
            {!isCurrentHead && (
              <button
                onClick={() => setShowDiff(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-background text-foreground border border-border/80 hover:bg-muted font-medium transition-colors cursor-pointer"
              >
                <GitCompare size={12} />
                <span>Compare Diff</span>
              </button>
            )}

            {/* Restore Button (Owner only) */}
            {isOwner && !isCurrentHead && (
              <button
                onClick={handleRestore}
                disabled={isRestoring}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isRestoring ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <RotateCcw size={12} />
                )}
                <span>Restore v{version}</span>
              </button>
            )}

            {/* View Current Head Link */}
            <Link
              href={`/post/${slug}`}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors font-medium"
            >
              <span>View Latest</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Diff Comparison Modal Overlay ─────────────────────────────── */}
      {showDiff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-[fade-in_0.15s_ease-out]">
          <div className="w-full max-w-5xl h-[85vh] flex flex-col">
            <VersionDiffViewer
              oldText={oldContent}
              newText={currentContent}
              oldVersion={version}
              newVersion={latestVersion}
              changelog={changelog}
              isOwner={isOwner}
              isRestoring={isRestoring}
              onRestore={handleRestore}
              onClose={() => setShowDiff(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};
