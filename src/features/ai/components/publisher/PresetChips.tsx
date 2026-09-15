"use client";

import React from "react";
import { Code2, Compass, Rocket, Cpu, Target } from "lucide-react";

export interface PresetItem {
  id: string;
  label: string;
  topic: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const PUBLISHER_PRESETS: PresetItem[] = [
  {
    id: "technical",
    label: "Technical",
    icon: Code2,
    topic: "Building an Event-Driven Architecture with Kafka & Go: Hard Lessons from Production",
  },
  {
    id: "career",
    label: "Career",
    icon: Compass,
    topic: "Why do developers know exactly what they should do, but still procrastinate?",
  },
  {
    id: "startup",
    label: "Startup",
    icon: Rocket,
    topic: "How to validate a technical B2B SaaS idea before writing a single line of code",
  },
  {
    id: "ai",
    label: "AI",
    icon: Cpu,
    topic: "Local LLM Fine-Tuning: Step-by-Step Guide with Ollama, Unsloth, and LoRA",
  },
  {
    id: "productivity",
    label: "Productivity",
    icon: Target,
    topic: "Cognitive Load Theory for Developers: How Deep Work transforms engineering teams",
  },
];

export interface PresetChipsProps {
  currentTopic: string;
  onSelectPreset: (topic: string) => void;
  disabled?: boolean;
}

export const PresetChips: React.FC<PresetChipsProps> = ({
  currentTopic,
  onSelectPreset,
  disabled = false,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">
          Quick Inspirations
        </span>
        <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
          Click to auto-fill topic
        </span>
      </div>

      <div
        className="flex flex-wrap items-center gap-1.5"
        role="group"
        aria-label="Preset topic ideas"
      >
        {PUBLISHER_PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isSelected = currentTopic.trim() === preset.topic;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.topic)}
              disabled={disabled}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-[14px] border transition-all duration-150 cursor-pointer select-none active:scale-[0.97] ${
                isSelected
                  ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30 font-semibold shadow-xs"
                  : "bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border/60 hover:border-border"
              } ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
            >
              <Icon
                className={`w-3 h-3 ${
                  isSelected
                    ? "text-violet-500"
                    : "text-muted-foreground/80 group-hover:text-foreground"
                }`}
              />
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
