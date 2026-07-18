"use client";

import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, HelpCircle } from "lucide-react";
import type { PublishTaskResult } from "../api/publishing.api";

interface PublishingChecklistProps {
  readonly taskResults: Record<string, PublishTaskResult>;
}

export function PublishingChecklist({ taskResults }: PublishingChecklistProps) {
  const metadata = taskResults.metadata;
  const seo = taskResults.seo;
  const category = taskResults.category;
  const review = taskResults.review;

  const items = [
    {
      id: "title",
      label: "Article Title Present",
      checked: metadata?.success && metadata.outputData?.titlePresent,
      severity: "error",
      errorMsg: "Title is missing.",
    },
    {
      id: "length",
      label: "Content Length Min Bound (50 chars)",
      checked: metadata?.success && metadata.outputData?.isMinLengthValid,
      severity: "error",
      errorMsg: `Content length is too short (${metadata?.outputData?.contentLength || 0} characters).`,
    },
    {
      id: "seo-slug",
      label: "Optimized URL Slug Defined",
      checked: seo?.success && !!seo.outputData?.slug,
      severity: "warning",
      errorMsg: "SEO Slug is empty.",
    },
    {
      id: "category-check",
      label: "Classification Category Selected",
      checked: category?.success && !!category.outputData?.suggestedCategory,
      severity: "info",
      errorMsg: "Category is not set.",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Preflight Checklist
      </h3>

      <div className="flex flex-col gap-2.5">
        {items.map((item) => {
          let statusIcon = <HelpCircle className="w-5 h-5 text-muted-foreground/45" />;
          let labelClass = "text-muted-foreground";

          if (taskResults.metadata) {
            if (item.checked) {
              statusIcon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
              labelClass = "text-foreground font-medium";
            } else {
              statusIcon =
                item.severity === "error" ? (
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                );
              labelClass = "text-muted-foreground line-through decoration-muted-foreground/30";
            }
          }

          return (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-background/50 shadow-sm"
            >
              {statusIcon}
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${labelClass}`}>{item.label}</p>
                {!item.checked && taskResults.metadata && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    {item.errorMsg}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Dynamic review warnings */}
        {review?.success && review.outputData?.warnings?.map((warning: string, idx: number) => (
          <div
            key={`warning-${idx}`}
            className="flex items-start gap-3 p-3 rounded-lg border border-amber-200/50 bg-amber-500/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-xs leading-normal">{warning}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
