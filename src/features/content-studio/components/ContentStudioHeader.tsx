"use client";

// =============================================================================
//  AI CONTENT STUDIO — HEADER COMPONENT
//  src/features/content-studio/components/ContentStudioHeader.tsx
// =============================================================================

import React from "react";
import Link from "next/link";
import { Sparkles, ChevronRight, LayoutDashboard, Compass, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ContentStudioStep } from "../store/contentStudioStore";
import { useContentStudioStore } from "../store/contentStudioStore";

interface ContentStudioHeaderProps {
  step?: ContentStudioStep;
  onStepChange?: (step: ContentStudioStep) => void;
}

export function ContentStudioHeader({ step, onStepChange }: ContentStudioHeaderProps) {
  const store = useContentStudioStore();
  const currentStep = step || store.step;

  const canGoToIdeas = true;
  const canGoToBrief = store.selectedIdeaIds.length > 0;
  const canGoToOutline = store.selectedIdeaIds.length > 0;
  const canGoToWriting = store.writingStages.some((s) => s.status !== "idle");

  const handleStepClick = (targetStep: ContentStudioStep) => {
    if (onStepChange) {
      onStepChange(targetStep);
    } else {
      store.setStep(targetStep);
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumbs & Direct Return to Editor */}
      <div className="flex items-center justify-between">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium flex-wrap"
        >
          <Link
            href="/management"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <LayoutDashboard size={13} />
            <span>Management</span>
          </Link>
          <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" />
          <Link
            href="/management/content-studio"
            onClick={(e) => {
              e.preventDefault();
              handleStepClick("ideas");
            }}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Return to AI Content Studio Ideas"
          >
            <Compass size={13} className="text-primary" />
            <span>Content Studio</span>
          </Link>

          {currentStep === "ideas" && (
            <>
              <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" />
              <span className="text-foreground font-semibold">Ideas</span>
            </>
          )}

          {currentStep === "brief" && (
            <>
              <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" />
              <button
                type="button"
                onClick={() => handleStepClick("ideas")}
                className="hover:text-foreground transition-colors cursor-pointer"
                title="Return to Step 1: Ideas"
              >
                Ideas
              </button>
              <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" />
              <span className="text-foreground font-semibold">Content Brief</span>
            </>
          )}

          {currentStep === "outline" && (
            <>
              <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" />
              <button
                type="button"
                onClick={() => handleStepClick("ideas")}
                className="hover:text-foreground transition-colors cursor-pointer"
                title="Return to Step 1: Ideas"
              >
                Ideas
              </button>
              <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" />
              <button
                type="button"
                onClick={() => handleStepClick("brief")}
                className="hover:text-foreground transition-colors cursor-pointer"
                title="Return to Step 2: Content Brief"
              >
                Brief
              </button>
              <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" />
              <span className="text-foreground font-semibold">Content Outline</span>
            </>
          )}

          {currentStep === "writing" && (
            <>
              <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" />
              <button
                type="button"
                onClick={() => handleStepClick("ideas")}
                className="hover:text-foreground transition-colors cursor-pointer"
                title="Return to Step 1: Ideas"
              >
                Ideas
              </button>
              <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" />
              <button
                type="button"
                onClick={() => handleStepClick("brief")}
                className="hover:text-foreground transition-colors cursor-pointer"
                title="Return to Step 2: Content Brief"
              >
                Brief
              </button>
              <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" />
              <button
                type="button"
                onClick={() => handleStepClick("outline")}
                className="hover:text-foreground transition-colors cursor-pointer"
                title="Return to Step 3: Content Outline"
              >
                Outline
              </button>
              <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" />
              <span className="text-foreground font-semibold">Drafting Article</span>
            </>
          )}
        </nav>

        <Link
          href="/create"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted border border-border/60 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Editor</span>
        </Link>
      </div>

      {/* Hero Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              AI Content Studio
            </h1>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
            >
              <Sparkles size={11} className="text-primary animate-pulse" />
              AI POWERED
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {currentStep === "brief"
              ? "Review and customize AI specifications for your content brief."
              : currentStep === "outline"
              ? "Refine article structure, headings, key points, and SEO FAQs."
              : currentStep === "writing"
              ? "Drafting comprehensive long-form article with structured blocks-v1."
              : "Turn an idea into a complete content plan with AI."}
          </p>
        </div>

        {/* Workflow Pipeline Stepper */}
        <div className="hidden lg:flex items-center gap-1.5 bg-card border border-border/80 rounded-xl p-1.5 shadow-xs">
          {/* Step 1: Ideas */}
          <button
            type="button"
            onClick={() => handleStepClick("ideas")}
            disabled={!canGoToIdeas}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              currentStep === "ideas"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
            }`}
            title="Step 1: Ideas Generation & Exploration"
          >
            <span
              className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                currentStep === "ideas"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-primary/20 text-primary"
              }`}
            >
              1
            </span>
            <span>Ideas</span>
          </button>

          <ChevronRight size={13} className="text-muted-foreground/40 shrink-0" />

          {/* Step 2: Brief */}
          <button
            type="button"
            onClick={() => handleStepClick("brief")}
            disabled={!canGoToBrief}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              currentStep === "brief"
                ? "bg-primary/10 text-primary"
                : canGoToBrief
                ? "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                : "text-muted-foreground/60"
            }`}
            title="Step 2: Editorial Brief Configuration"
          >
            <span
              className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                currentStep === "brief"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : canGoToBrief
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </span>
            <span>Brief</span>
          </button>

          <ChevronRight size={13} className="text-muted-foreground/40 shrink-0" />

          {/* Step 3: Outline */}
          <button
            type="button"
            onClick={() => handleStepClick("outline")}
            disabled={!canGoToOutline}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              currentStep === "outline"
                ? "bg-primary/10 text-primary"
                : canGoToOutline
                ? "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                : "text-muted-foreground/60"
            }`}
            title="Step 3: Content Structure & Outline"
          >
            <span
              className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                currentStep === "outline"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : canGoToOutline
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              3
            </span>
            <span>Outline</span>
          </button>

          <ChevronRight size={13} className="text-muted-foreground/40 shrink-0" />

          {/* Step 4: Article */}
          <button
            type="button"
            onClick={() => handleStepClick("writing")}
            disabled={!canGoToWriting}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              currentStep === "writing"
                ? "bg-primary/10 text-primary"
                : canGoToWriting
                ? "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                : "text-muted-foreground/60"
            }`}
            title="Step 4: Long-form Article Generation"
          >
            <span
              className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                currentStep === "writing"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              4
            </span>
            <span>Article</span>
          </button>
        </div>
      </div>
    </div>
  );
}
