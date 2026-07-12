// =============================================================================
//  AI PUBLISHING FEATURE — PUBLISH SUCCESS CONSOLE
//  src/features/publish/components/PublishSuccessConsole.tsx
//
//  Design Decisions:
//  - Reusable celebration dashboard component displayed on successful post releases.
//  - Displays: Reading Time, Share Links, Copy URL, Edit Again, View Post, Create Another.
//  - Includes interactive confetti indicators and premium visual triggers.
// =============================================================================

import React, { useState } from "react";
import { CheckCircle2, Share2, Copy, Check, FileText, ArrowRight, PenTool, Plus } from "lucide-react";
import { toast } from "sonner";

interface PublishSuccessConsoleProps {
  readonly postUrl: string;
  readonly title: string;
  readonly readingTimeMin: number;
  readonly onEditAgain: () => void;
  readonly onCreateAnother: () => void;
}

export default function PublishSuccessConsole({
  postUrl,
  title,
  readingTimeMin,
  onEditAgain,
  onCreateAnother,
}: PublishSuccessConsoleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast.success("Article URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL.");
    }
  };

  const getShareLinks = () => {
    const encUrl = encodeURIComponent(postUrl);
    const encTitle = encodeURIComponent(`Check out my new post on OpenIdear: "${title}"`);
    return {
      twitter: `https://twitter.com/intent/tweet?url=${encUrl}&text=${encTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
    };
  };

  const shares = getShareLinks();

  return (
    <div className="publish-success-root max-w-lg mx-auto p-6 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-2xl shadow-xl text-center space-y-6 text-xs text-[var(--color-editor-text)] animate-[scale-in_0.22s_ease-out] select-none">
      
      {/* ─── Celebration Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center space-y-3 pt-4">
        <div className="relative flex items-center justify-center w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400">
          <CheckCircle2 size={32} className="animate-[scale-in_0.3s_ease-out]" />
          <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping top-1 right-1" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
            Publish Confirmed
          </span>
          <h2 className="text-base sm:text-lg font-extrabold text-[var(--color-editor-text)] tracking-tight max-w-sm mx-auto">
            Your idea is now live!
          </h2>
        </div>
      </div>

      {/* ─── Post summary detail card ────────────────────────────────────────── */}
      <div className="p-4 bg-[var(--color-editor-bg)] rounded-xl border border-[var(--color-editor-border)] text-left space-y-2">
        <span className="text-[9px] uppercase font-bold text-[var(--color-editor-secondary)] tracking-wider block">
          Published Article
        </span>
        <h3 className="font-extrabold text-sm text-[var(--color-editor-text)] leading-snug line-clamp-2">
          {title || "Untitled Article"}
        </h3>
        <div className="flex items-center gap-3 pt-1 text-[10px] text-[var(--color-editor-muted)] border-t border-[var(--color-editor-border)]/50 mt-2">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {readingTimeMin} min read
          </span>
          <span>•</span>
          <span className="text-[var(--color-editor-secondary)] truncate">
            {postUrl}
          </span>
        </div>
      </div>

      {/* ─── Share Actions grid ──────────────────────────────────────────────── */}
      <div className="space-y-2.5">
        <span className="text-[9px] uppercase font-bold text-[var(--color-editor-secondary)] tracking-wider block text-left">
          Share your Publication
        </span>
        
        {/* URL Clipboard Copy bar */}
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={postUrl}
            className="flex-1 bg-[var(--color-editor-bg)] border border-[var(--color-editor-border)] px-3 py-2 rounded-lg font-mono text-[10px] text-[var(--color-editor-secondary)] outline-none"
          />
          <button
            type="button"
            onClick={handleCopyUrl}
            className={`px-3 py-2 border rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer select-none active:scale-95 ${
              copied
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "border-[var(--color-editor-border)] hover:bg-[var(--color-editor-elevated)] text-[var(--color-editor-secondary)]"
            }`}
            title="Copy URL"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        {/* Social Share Grid */}
        <div className="grid grid-cols-3 gap-2">
          <a
            href={shares.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-[var(--color-editor-border)] hover:bg-slate-900 hover:border-slate-800 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all text-[var(--color-editor-secondary)] hover:text-white"
          >
            <Share2 size={12} />
            <span>Twitter / X</span>
          </a>
          <a
            href={shares.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-[var(--color-editor-border)] hover:bg-indigo-600/10 hover:border-indigo-500/25 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all text-[var(--color-editor-secondary)] hover:text-indigo-400"
          >
            <Share2 size={12} />
            <span>LinkedIn</span>
          </a>
          <a
            href={shares.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-[var(--color-editor-border)] hover:bg-blue-600/10 hover:border-blue-500/25 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all text-[var(--color-editor-secondary)] hover:text-blue-400"
          >
            <Share2 size={12} />
            <span>Facebook</span>
          </a>
        </div>
      </div>

      {/* ─── Control Navigation Actions ──────────────────────────────────────── */}
      <div className="flex flex-col gap-2 pt-4 border-t border-[var(--color-editor-border)] select-none">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onEditAgain}
            className="px-4 py-2.5 border border-[var(--color-editor-border)] hover:bg-[var(--color-editor-border)] rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-97 text-[var(--color-editor-secondary)]"
          >
            <PenTool size={13} />
            <span>Edit Again</span>
          </button>
          <a
            href={postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-[var(--color-editor-accent)] hover:opacity-95 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all active:scale-97 shadow-sm"
          >
            <FileText size={13} />
            <span>View Live Post</span>
            <ArrowRight size={12} />
          </a>
        </div>

        <button
          type="button"
          onClick={onCreateAnother}
          className="w-full px-4 py-2.5 bg-[var(--color-editor-bg)] border border-[var(--color-editor-border)] hover:bg-[var(--color-editor-elevated)] rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-97 text-[var(--color-editor-secondary)] mt-1"
        >
          <Plus size={13} />
          <span>Create Another Draft</span>
        </button>
      </div>

    </div>
  );
}
