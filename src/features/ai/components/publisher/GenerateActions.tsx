"use client";

import React from "react";
import { Sparkles, Rocket, Clock, Loader2 } from "lucide-react";

export interface GenerateActionsProps {
  topic: string;
  isGenerating: boolean;
  isOneClick: boolean;
  onGenerateEditor: () => void;
  onOneClickDraft: () => void;
}

export const GenerateActions: React.FC<GenerateActionsProps> = ({
  topic,
  isGenerating,
  isOneClick,
  onGenerateEditor,
  onOneClickDraft,
}) => {
  const isDisabled = !topic.trim() || isGenerating;

  return (
    <div className="space-y-2.5 pt-1">
      {/* Primary Action: Generate Editor */}
      <button
        type="button"
        onClick={onGenerateEditor}
        disabled={isDisabled}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 active:scale-[0.99] shadow-sm shadow-violet-600/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
        aria-label="Generate full article in editor"
      >
        {isGenerating && !isOneClick ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Orchestrating Multi-Agent Pipeline...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-violet-200" />
            <span>Generate in Editor</span>
          </>
        )}
      </button>

      {/* Secondary Action: One Click AI Draft */}
      <button
        type="button"
        onClick={onOneClickDraft}
        disabled={isDisabled}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-orange-600 dark:text-orange-400 border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
        aria-label="Generate and auto-save complete draft"
      >
        {isGenerating && isOneClick ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
            <span>Publishing One-Click Draft...</span>
          </>
        ) : (
          <>
            <Rocket className="w-3.5 h-3.5 text-orange-500" />
            <span>One Click AI Draft</span>
          </>
        )}
      </button>

      {/* Generation Meta Hint */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-0.5">
        <Clock className="w-3 h-3 text-muted-foreground/80" />
        <span>Estimated turnaround: ~15–30 seconds</span>
      </div>
    </div>
  );
};
