"use client";

import React, { useRef } from "react";
import { Sparkles, X } from "lucide-react";

export interface TopicInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
  placeholder?: string;
}

export const TopicInput: React.FC<TopicInputProps> = ({
  value,
  onChange,
  disabled = false,
  maxLength = 300,
  placeholder = "Why do developers know exactly what they should do, but still procrastinate?",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charCount = value.length;
  const isNearLimit = charCount >= maxLength * 0.9;
  const isOverLimit = charCount >= maxLength;

  const handleClear = () => {
    if (disabled) return;
    onChange("");
    textareaRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      {/* Header bar: Label + Character Counter */}
      <div className="flex items-center justify-between text-xs">
        <label
          htmlFor="ai-publisher-topic"
          className="font-medium text-foreground flex items-center gap-1.5 cursor-pointer select-none"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          <span>Topic & Core Thesis</span>
          <span className="text-destructive font-bold text-xs" aria-hidden="true">
            *
          </span>
        </label>

        <div
          className={`font-mono text-[11px] transition-colors ${
            isOverLimit
              ? "text-destructive font-semibold"
              : isNearLimit
              ? "text-amber-500 font-medium"
              : "text-muted-foreground"
          }`}
          aria-live="polite"
        >
          {charCount} / {maxLength}
        </div>
      </div>

      {/* Hero Textarea Container */}
      <div
        className={`relative rounded-[16px] bg-muted/20 dark:bg-zinc-900/40 border border-border/80 transition-all duration-200 shadow-xs group ${
          disabled
            ? "opacity-60 cursor-not-allowed"
            : "hover:border-border hover:bg-muted/30 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10 focus-within:bg-background"
        }`}
      >
        <textarea
          id="ai-publisher-topic"
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          disabled={disabled}
          rows={3}
          placeholder={placeholder}
          className="w-full bg-transparent p-4 pr-9 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none disabled:cursor-not-allowed"
          aria-label="Topic and core thesis for AI article"
        />

        {/* Clear Button */}
        {value.length > 0 && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-3.5 right-3.5 p-1 rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Clear topic input"
            title="Clear topic"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Bottom subtle hint */}
        <div className="px-4 pb-2.5 pt-0 text-[10px] text-muted-foreground/70 flex items-center justify-between pointer-events-none">
          <span>Be specific about your audience's pain point for best results.</span>
        </div>
      </div>
    </div>
  );
};
