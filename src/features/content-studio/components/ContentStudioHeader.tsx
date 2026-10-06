"use client";

// =============================================================================
//  AI CONTENT STUDIO — HEADER COMPONENT
//  src/features/content-studio/components/ContentStudioHeader.tsx
// =============================================================================

import React from "react";
import Link from "next/link";
import { Sparkles, ChevronRight, LayoutDashboard, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ContentStudioStep } from "../store/contentStudioStore";

interface ContentStudioHeaderProps {
  step?: ContentStudioStep;
}

export function ContentStudioHeader({ step = "ideas" }: ContentStudioHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium"
      >
        <Link
          href="/management"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <LayoutDashboard size={13} />
          <span>Management</span>
        </Link>
        <ChevronRight size={12} className="text-muted-foreground/60" />
        <Link
          href="/management/content-studio"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Compass size={13} className="text-primary" />
          <span>Content Studio</span>
        </Link>
        {step === "brief" && (
          <>
            <ChevronRight size={12} className="text-muted-foreground/60" />
            <span className="text-foreground font-semibold">Content Brief</span>
          </>
        )}
        {step === "outline" && (
          <>
            <ChevronRight size={12} className="text-muted-foreground/60" />
            <span className="text-foreground font-semibold">Content Outline</span>
          </>
        )}
        {step === "writing" && (
          <>
            <ChevronRight size={12} className="text-muted-foreground/60" />
            <span className="text-foreground font-semibold">Drafting Article</span>
          </>
        )}
      </nav>

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
            {step === "brief"
              ? "Review and customize AI specifications for your content brief."
              : step === "outline"
              ? "Refine article structure, headings, key points, and SEO FAQs."
              : step === "writing"
              ? "Drafting comprehensive long-form article with structured blocks-v1."
              : "Turn an idea into a complete content plan with AI."}
          </p>
        </div>

        {/* Workflow Pipeline Stepper */}
        <div className="hidden lg:flex items-center gap-2 bg-card border border-border/80 rounded-xl px-3.5 py-2 shadow-xs">
          {/* Step 1: Ideas */}
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              step === "ideas"
                ? "text-primary"
                : "text-foreground"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                step === "ideas"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/20 text-primary"
              }`}
            >
              1
            </span>
            <span>Ideas</span>
          </div>

          <ChevronRight size={13} className="text-muted-foreground/40" />

          {/* Step 2: Brief */}
          <div
            className={`flex items-center gap-1.5 text-xs ${
              step === "brief"
                ? "font-semibold text-primary"
                : step === "outline" || step === "writing"
                ? "font-medium text-foreground"
                : "font-medium text-muted-foreground/80"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                step === "brief"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : step === "outline" || step === "writing"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </span>
            <span>Brief</span>
          </div>

          <ChevronRight size={13} className="text-muted-foreground/40" />

          {/* Step 3: Outline */}
          <div
            className={`flex items-center gap-1.5 text-xs ${
              step === "outline"
                ? "font-semibold text-primary"
                : step === "writing"
                ? "font-medium text-foreground"
                : "font-medium text-muted-foreground/80"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                step === "outline"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : step === "writing"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              3
            </span>
            <span>Outline</span>
          </div>

          <ChevronRight size={13} className="text-muted-foreground/40" />

          {/* Step 4: Article */}
          <div
            className={`flex items-center gap-1.5 text-xs ${
              step === "writing"
                ? "font-semibold text-primary"
                : "font-medium text-muted-foreground/80"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                step === "writing"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              4
            </span>
            <span>Article</span>
          </div>
        </div>
      </div>
    </div>
  );
}
