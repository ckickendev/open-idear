"use client";

// =============================================================================
//  ARTICLE CALLOUT BLOCK COMPONENT
//  src/features/article/components/ArticleCallout.tsx
// =============================================================================

import React from "react";
import type { CalloutBlock, CalloutVariant } from "../types/article.types";
import { Info, Lightbulb, AlertTriangle, ShieldAlert } from "lucide-react";

interface ArticleCalloutProps {
  block: CalloutBlock;
}

type CalloutConfig = {
  icon: React.ReactNode;
  className: string;
  titleClass: string;
};

function getCalloutConfig(variant: CalloutVariant): CalloutConfig {
  switch (variant) {
    case "info":
      return {
        icon: <Info size={16} />,
        className: "bg-blue-500/10 border-l-4 border-blue-500 text-blue-900 dark:text-blue-200",
        titleClass: "text-blue-700 dark:text-blue-300",
      };
    case "tip":
      return {
        icon: <Lightbulb size={16} />,
        className: "bg-green-500/10 border-l-4 border-green-500 text-green-900 dark:text-green-200",
        titleClass: "text-green-700 dark:text-green-300",
      };
    case "warning":
      return {
        icon: <AlertTriangle size={16} />,
        className: "bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-900 dark:text-yellow-200",
        titleClass: "text-yellow-700 dark:text-yellow-300",
      };
    case "caution":
      return {
        icon: <ShieldAlert size={16} />,
        className: "bg-red-500/10 border-l-4 border-red-500 text-red-900 dark:text-red-200",
        titleClass: "text-red-700 dark:text-red-300",
      };
  }
}

export default function ArticleCallout({ block }: ArticleCalloutProps) {
  const config = getCalloutConfig(block.variant);

  return (
    <div
      id={`block-${block.id}`}
      className={`my-6 rounded-r-lg px-5 py-4 ${config.className}`}
      role="note"
      aria-label={`${block.variant} callout`}
    >
      <div className={`flex items-center gap-2 font-semibold text-sm mb-1 ${config.titleClass}`}>
        {config.icon}
        <span>{block.title ?? block.variant.charAt(0).toUpperCase() + block.variant.slice(1)}</span>
      </div>
      <p className="text-sm leading-relaxed">{block.content}</p>
    </div>
  );
}
