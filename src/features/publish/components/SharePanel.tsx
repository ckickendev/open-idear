// =============================================================================
//  AI PUBLISHING FEATURE — SHARE PANEL COMPONENT
//  src/features/publish/components/SharePanel.tsx
//
//  Design Decisions:
//  - Reusable social sharing widget supporting Facebook, LinkedIn, Twitter/X.
//  - Includes Copy Link bar and serverless QR Code generator image overlays.
//  - Reuses metadata titles and descriptions to populate sharing texts.
//  - Fully responsive, glassmorphism card layout with outline action items.
// =============================================================================

import React, { useState } from "react";
import { Share2, Copy, Check, QrCode, Facebook, Linkedin, Twitter, Download } from "lucide-react";
import { toast } from "sonner";

interface SharePanelProps {
  readonly postUrl: string;
  readonly title: string;
  readonly description?: string;
}

export default function SharePanel({
  postUrl,
  title,
  description = "",
}: SharePanelProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrLoading, setQrLoading] = useState(true);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  // Generate share URLs incorporating metadata text
  const shareText = `Read "${title}" - ${description.slice(0, 100)}${description.length > 100 ? "..." : ""}`;
  const encUrl = encodeURIComponent(postUrl);
  const encText = encodeURIComponent(shareText);

  const twitterUrl = `https://twitter.com/intent/tweet?url=${encUrl}&text=${encText}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`;
  
  // Public, serverless QR code builder endpoint
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encUrl}`;

  return (
    <div className="share-panel-card p-5 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-2xl shadow-sm text-xs text-[var(--color-editor-text)] space-y-4 text-left select-none animate-[fade-in_0.18s_ease-out]">
      <div className="flex items-center gap-1.5 border-b border-[var(--color-editor-border)] pb-3">
        <Share2 size={14} className="text-violet-400" />
        <h4 className="font-extrabold text-sm text-[var(--color-editor-text)]">
          Social Share Dashboard
        </h4>
      </div>

      {/* ─── Share Input and Copy ────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <span className="text-[9px] uppercase font-bold text-[var(--color-editor-secondary)] tracking-wider">
          Article Link URL
        </span>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={postUrl}
            className="flex-1 bg-[var(--color-editor-bg)] border border-[var(--color-editor-border)] px-3 py-2 rounded-lg font-mono text-[10px] text-[var(--color-editor-secondary)] outline-none"
          />
          <button
            type="button"
            onClick={handleCopy}
            className={`px-3 py-2 border rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer select-none active:scale-95 ${
              copied
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "border-[var(--color-editor-border)] hover:bg-[var(--color-editor-elevated)] text-[var(--color-editor-secondary)]"
            }`}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* ─── Social Network Sharing Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 pt-1.5">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 border border-[var(--color-editor-border)] hover:bg-slate-950/80 hover:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 font-bold transition-all text-[var(--color-editor-secondary)] hover:text-white"
        >
          <Twitter size={16} />
          <span>Twitter / X</span>
        </a>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 border border-[var(--color-editor-border)] hover:bg-indigo-600/10 hover:border-indigo-500/25 rounded-xl flex flex-col items-center justify-center gap-2 font-bold transition-all text-[var(--color-editor-secondary)] hover:text-indigo-400"
        >
          <Linkedin size={16} />
          <span>LinkedIn</span>
        </a>
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 border border-[var(--color-editor-border)] hover:bg-blue-600/10 hover:border-blue-500/25 rounded-xl flex flex-col items-center justify-center gap-2 font-bold transition-all text-[var(--color-editor-secondary)] hover:text-blue-400"
        >
          <Facebook size={16} />
          <span>Facebook</span>
        </a>
      </div>

      {/* ─── QR Code Section ─────────────────────────────────────────────────── */}
      <div className="border-t border-[var(--color-editor-border)]/60 pt-3.5 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[9px] uppercase font-bold text-[var(--color-editor-secondary)] tracking-wider">
            Mobile QR Link
          </span>
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className="text-[10px] text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <QrCode size={13} />
            <span>{showQr ? "Hide QR Code" : "Show QR Code"}</span>
          </button>
        </div>

        {showQr && (
          <div className="flex flex-col items-center justify-center p-4 bg-white border border-zinc-200 rounded-xl max-w-[240px] mx-auto space-y-3 shadow-inner animate-[scale-in_0.15s_ease-out]">
            <div className="relative w-40 h-40 flex items-center justify-center bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100">
              {qrLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 z-10">
                  <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="Scan to read"
                className="w-full h-full object-contain"
                onLoad={() => setQrLoading(false)}
              />
            </div>
            <a
              href={qrCodeUrl}
              download="post-qr.png"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 hover:text-zinc-800 flex items-center gap-1 transition-colors"
            >
              <Download size={11} />
              <span>Save QR Image</span>
            </a>
          </div>
        )}
      </div>

    </div>
  );
}
