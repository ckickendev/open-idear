// =============================================================================
//  AI AUTOSAVE FEATURE — DRAFT STATUS INDICATOR BADGE
//  src/features/autosave/components/DraftStatusIndicator.tsx
//
//  Design Decisions:
//  - Reusable, responsive glassmorphic status badge representing draft states.
//  - Displays: Saving, Saved, Offline, Conflict, and Recovered.
//  - Features micro-animations (pulsing indicator lights, fade-ins).
//  - Designed for placement in editor headers or utility bars.
// =============================================================================

import React from "react";
import { CloudOff, CloudLightning, ShieldAlert, CheckCircle2, Loader2, RotateCcw } from "lucide-react";

export type DraftStatusType = 
  | "idle" 
  | "saving" 
  | "saved" 
  | "offline" 
  | "conflict" 
  | "recovered";

interface DraftStatusIndicatorProps {
  readonly status: DraftStatusType;
  readonly lastSavedAt?: Date | null;
}

export default function DraftStatusIndicator({
  status,
  lastSavedAt = null,
}: DraftStatusIndicatorProps) {
  
  const getStatusConfig = (type: DraftStatusType) => {
    switch (type) {
      case "saving":
        return {
          icon: <Loader2 size={12} className="animate-spin text-indigo-400" />,
          label: "Saving changes...",
          badgeClass: "bg-indigo-500/[0.04] border-indigo-500/20 text-indigo-400",
          dotClass: "bg-indigo-400 animate-ping",
        };
      case "saved":
        return {
          icon: <CheckCircle2 size={12} className="text-emerald-400" />,
          label: "Saved to cloud",
          badgeClass: "bg-emerald-500/[0.04] border-emerald-500/20 text-emerald-400",
          dotClass: "bg-emerald-500",
        };
      case "offline":
        return {
          icon: <CloudOff size={12} className="text-amber-400" />,
          label: "Offline: Saved locally",
          badgeClass: "bg-amber-500/[0.04] border-amber-500/20 text-amber-400 animate-pulse",
          dotClass: "bg-amber-400 animate-ping",
        };
      case "conflict":
        return {
          icon: <ShieldAlert size={12} className="text-rose-400" />,
          label: "Save Conflict: Out of sync",
          badgeClass: "bg-rose-500/[0.04] border-rose-500/20 text-rose-400 animate-bounce",
          dotClass: "bg-rose-500",
        };
      case "recovered":
        return {
          icon: <RotateCcw size={12} className="text-violet-400" />,
          label: "Local backup restored",
          badgeClass: "bg-violet-500/[0.04] border-violet-500/20 text-violet-400",
          dotClass: "bg-violet-500",
        };
      case "idle":
      default:
        return {
          icon: <CloudLightning size={12} className="text-[var(--color-editor-muted)]" />,
          label: lastSavedAt ? `Saved at ${lastSavedAt.toLocaleTimeString()}` : "Cloud Synced",
          badgeClass: "bg-[var(--color-editor-border)]/10 border-[var(--color-editor-border)] text-[var(--color-editor-secondary)]",
          dotClass: "bg-[var(--color-editor-muted)]",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div
      className={`draft-status-indicator inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-wide transition-all duration-300 select-none ${config.badgeClass}`}
      title={config.label}
    >
      {/* State dot light */}
      <span className="relative flex h-1.5 w-1.5">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotClass}`} />
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dotClass.split(" ")[0]}`} />
      </span>

      {/* State details */}
      <div className="flex items-center gap-1.5">
        {config.icon}
        <span>{config.label}</span>
      </div>
    </div>
  );
}
