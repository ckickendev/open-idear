// =============================================================================
//  AI PUBLISHING FEATURE — PUBLISH CONFIRMATION MODAL
//  src/features/publish/components/PublishConfirmationModal.tsx
//
//  Design Decisions:
//  - Renders a pre-flight launch confirmation dialog.
//  - Displays Post Summary, SEO Score, Reading Time, Publish Time, Category,
//    Tags, Visibility, Featured Image banner, and non-blocking Warnings.
//  - Integrates an interactive "Slide to Publish" track to prevent accidental clicks.
//  - Uses clean self-contained React state overlays for maximum compatibility.
// =============================================================================

import React, { useState, useEffect, useRef } from "react";
import { X, CheckCircle, AlertTriangle, Eye, ArrowRight, ShieldAlert, Calendar } from "lucide-react";

export interface ConfirmationDetails {
  readonly title: string;
  readonly excerpt: string;
  readonly slug: string;
  readonly seoScore: number;
  readonly readingTimeMin: number;
  readonly publishTime: string; // e.g. "Immediate" or "Scheduled: 2026-07-15 14:00 (ICT)"
  readonly category: string;
  readonly tags: readonly string[];
  readonly visibility: "public" | "private" | "unlisted";
  readonly featuredImageUrl?: string | undefined;
  readonly warnings: readonly string[];
  readonly errors?: readonly string[] | undefined;
}

interface PublishConfirmationModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => Promise<void> | void;
  readonly details: ConfirmationDetails;
  readonly isPublishing?: boolean;
}

export default function PublishConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  details,
  isPublishing = false,
}: PublishConfirmationModalProps) {
  const [sliderPosition, setSliderPosition] = useState(0);
  const isDragging = useRef(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Reset slider whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setSliderPosition(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasErrors = !!(details.errors && details.errors.length > 0);

  // Handle Drag / Slide interaction logic
  const handleStartDrag = () => {
    if (isPublishing || hasErrors) return;
    isDragging.current = true;
  };

  const handleDrag = (clientX: number) => {
    if (!isDragging.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const trackWidth = rect.width;
    const handleWidth = 44; // w-11 knob size
    const relativeX = clientX - rect.left - handleWidth / 2;
    const maxDistance = trackWidth - handleWidth;
    
    const percentage = Math.max(0, Math.min(100, (relativeX / maxDistance) * 100));
    setSliderPosition(percentage);
  };

  const handleEndDrag = async () => {
    isDragging.current = false;
    // If slid past 90%, trigger confirmation publish event
    if (sliderPosition >= 90) {
      setSliderPosition(100);
      try {
        await onConfirm();
      } catch {
        setSliderPosition(0);
      }
    } else {
      // Revert slider back to start
      setSliderPosition(0);
    }
  };

  // Mouse drag handlers
  const onMouseDown = () => handleStartDrag();
  const onMouseMove = (e: React.MouseEvent) => handleDrag(e.clientX);
  const onMouseUp = () => handleEndDrag();

  // Touch handlers for mobile viewport
  const onTouchStart = () => handleStartDrag();
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0 && e.touches[0]) {
      handleDrag(e.touches[0].clientX);
    }
  };
  const onTouchEnd = () => handleEndDrag();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative w-full max-w-lg bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-xs text-[var(--color-editor-text)] animate-[scale-in_0.18s_ease-out]">
        
        {/* Cover image banner */}
        {details.featuredImageUrl ? (
          <div className="relative w-full h-36 shrink-0 bg-slate-900 border-b border-[var(--color-editor-border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={details.featuredImageUrl} alt="Featured Banner" className="w-full h-full object-cover opacity-85" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-left">
              <span className="bg-[var(--color-editor-accent)] text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Pre-Flight Launch
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate mt-1">
                {details.title || "Untitled draft"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <div className="px-5 py-4 border-b border-[var(--color-editor-border)] flex items-center justify-between shrink-0 select-none">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-editor-secondary)] block">
                Publishing Confirmation
              </span>
              <h2 className="font-extrabold text-sm text-[var(--color-editor-text)] mt-0.5 truncate max-w-xs">
                {details.title || "Untitled draft"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[var(--color-editor-elevated)] text-[var(--color-editor-secondary)] cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Scrollable details layout */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-left">
          
          {/* Post Excerpt */}
          {details.excerpt && (
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-[var(--color-editor-secondary)] tracking-wider">Summary Excerpt</span>
              <p className="text-[11px] text-[var(--color-editor-muted)] leading-relaxed italic">
                "{details.excerpt}"
              </p>
            </div>
          )}

          {/* Core Analytics Badges Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Slug Info */}
            <div className="p-2.5 bg-[var(--color-editor-bg)] rounded-xl border border-[var(--color-editor-border)]">
              <span className="text-[9px] text-[var(--color-editor-secondary)] block">Published Route:</span>
              <span className="font-mono text-[10px] font-bold block truncate mt-0.5">/posts/{details.slug}</span>
            </div>

            {/* Timing / Release Schedule */}
            <div className="p-2.5 bg-[var(--color-editor-bg)] rounded-xl border border-[var(--color-editor-border)] flex items-center gap-1.5">
              <Calendar size={12} className="text-violet-400" />
              <div>
                <span className="text-[9px] text-[var(--color-editor-secondary)] block">Release Time:</span>
                <span className="font-bold text-[10px] block mt-0.5 truncate">{details.publishTime}</span>
              </div>
            </div>

            {/* SEO Metrics Score */}
            <div className="p-2.5 bg-[var(--color-editor-bg)] rounded-xl border border-[var(--color-editor-border)]">
              <span className="text-[9px] text-[var(--color-editor-secondary)] block">SEO Score:</span>
              <span className={`font-mono text-[10px] font-bold block mt-0.5 ${details.seoScore >= 80 ? "text-emerald-500" : "text-amber-500"}`}>
                {details.seoScore}/100 Passed
              </span>
            </div>

            {/* Meta Attributes */}
            <div className="p-2.5 bg-[var(--color-editor-bg)] rounded-xl border border-[var(--color-editor-border)]">
              <span className="text-[9px] text-[var(--color-editor-secondary)] block">Category:</span>
              <span className="font-bold text-[10px] block mt-0.5 truncate">{details.category || "General"}</span>
            </div>
          </div>

          {/* Visibility and Tags */}
          <div className="space-y-1.5 pt-1.5 select-none">
            <div className="flex justify-between items-center text-[10px] border-b border-[var(--color-editor-border)] pb-1.5">
              <span className="text-[var(--color-editor-secondary)] font-medium">Access Visibility:</span>
              <span className="font-bold uppercase text-[var(--color-editor-text)] tracking-wider">
                {details.visibility}
              </span>
            </div>
            {details.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {details.tags.map((t) => (
                  <span key={t} className="bg-[var(--color-editor-border)] text-[var(--color-editor-secondary)] px-2 py-0.5 rounded text-[9px] font-semibold">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Active blocking Errors list */}
          {hasErrors && (
            <div className="p-3 bg-rose-500/[0.01] border border-rose-500/25 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-rose-500 font-bold text-[10px] uppercase tracking-wider select-none">
                <ShieldAlert size={12} />
                <span>Critical Publish Blockers</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[10px] text-[var(--color-editor-muted)] leading-relaxed">
                {details.errors!.map((err, idx) => (
                  <li key={idx} className="text-rose-400 font-medium">{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Active non-blocking Warnings list */}
          {details.warnings.length > 0 && (
            <div className="p-3 bg-amber-500/[0.01] border border-amber-500/25 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold text-[10px] uppercase tracking-wider select-none">
                <AlertTriangle size={12} />
                <span>Verification Checklist Warnings</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[10px] text-[var(--color-editor-muted)] leading-relaxed">
                {details.warnings.slice(0, 3).map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
                {details.warnings.length > 3 && (
                  <li>And {details.warnings.length - 3} other minor warnings...</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Footer: slide track */}
        <div className="p-5 bg-[var(--color-editor-elevated)] border-t border-[var(--color-editor-border)] shrink-0 flex flex-col gap-3">
          
          {/* Interactive Slide track */}
          <div
            ref={trackRef}
            className={`relative w-full h-11 border rounded-full overflow-hidden flex items-center justify-center select-none ${
              hasErrors
                ? "bg-zinc-800/40 border-zinc-700/50 cursor-not-allowed"
                : "bg-[var(--color-editor-bg)] border-[var(--color-editor-border)]"
            }`}
          >
            {/* Visual Slide background fill */}
            {!hasErrors && (
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-75"
                style={{ width: `calc(${sliderPosition}% + 44px)` }}
              />
            )}

            {/* Slider track instructions */}
            <span
              className={`font-bold uppercase tracking-wider text-[10px] z-10 transition-opacity duration-200 pointer-events-none flex items-center gap-1.5 ${
                hasErrors ? "text-zinc-500" : ""
              }`}
              style={{ opacity: hasErrors ? 1 : Math.max(0.1, 1 - sliderPosition / 50) }}
            >
              {hasErrors ? (
                <>
                  <ShieldAlert size={11} className="text-rose-500 animate-pulse" />
                  <span>Publish Locked: Fix Errors</span>
                </>
              ) : (
                <>
                  <span>Slide to Publish</span>
                  <ArrowRight size={10} className="animate-pulse" />
                </>
              )}
            </span>

            {/* Slider Knob */}
            <div
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              className={`absolute top-0 bottom-0 left-0 w-11 h-11 rounded-full flex items-center justify-center transition-all z-20 shadow-md ${
                hasErrors
                  ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                  : "bg-[var(--color-editor-accent)] hover:opacity-95 text-white cursor-grab active:cursor-grabbing"
              }`}
              style={{
                transform: `translateX(${
                  hasErrors ? "0px" : `calc(${sliderPosition}% / 100 * (100% - 44px))`
                })`,
              }}
            >
              {isPublishing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : hasErrors ? (
                "🔒"
              ) : (
                <ArrowRight size={14} />
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-[var(--color-editor-muted)] select-none">
            <span>Drag slider to confirm launch.</span>
            <button
              type="button"
              onClick={onClose}
              className="hover:underline text-[var(--color-editor-secondary)] font-semibold cursor-pointer"
            >
              Go back and Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
