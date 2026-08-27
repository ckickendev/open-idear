"use client";

// =============================================================================
//  ARTICLE CALLOUT BLOCK COMPONENT
//  src/features/article/components/ArticleCallout.tsx
//
//  Sprint 3.1 — updated to consume editorial.css design tokens via
//  .ed-callout and variant modifier classes. No hardcoded colors.
// =============================================================================

import React from "react";
import type { CalloutBlock, CalloutVariant } from "../types/article.types";
import { Info, Lightbulb, AlertTriangle, ShieldAlert } from "lucide-react";

interface ArticleCalloutProps {
  block: CalloutBlock;
}

type CalloutConfig = {
  icon: React.ReactNode;
  variantClass: string;
  headerClass: string;
  role: "note" | "alert";
};

function getCalloutConfig(variant: CalloutVariant): CalloutConfig {
  switch (variant) {
    case "info":
      return {
        icon: <Info size={14} aria-hidden="true" />,
        variantClass: "ed-callout--info",
        headerClass: "ed-callout__header--info",
        role: "note",
      };
    case "tip":
      return {
        icon: <Lightbulb size={14} aria-hidden="true" />,
        variantClass: "ed-callout--tip",
        headerClass: "ed-callout__header--tip",
        role: "note",
      };
    case "warning":
      return {
        icon: <AlertTriangle size={14} aria-hidden="true" />,
        variantClass: "ed-callout--warning",
        headerClass: "ed-callout__header--warning",
        role: "alert",
      };
    case "caution":
      return {
        icon: <ShieldAlert size={14} aria-hidden="true" />,
        variantClass: "ed-callout--caution",
        headerClass: "ed-callout__header--caution",
        role: "alert",
      };
  }
}

export default function ArticleCallout({ block }: ArticleCalloutProps) {
  const config = getCalloutConfig(block.variant);
  const label =
    block.title ??
    block.variant.charAt(0).toUpperCase() + block.variant.slice(1);

  return (
    <div
      id={`block-${block.id}`}
      className={`ed-callout ${config.variantClass}`}
      role={config.role}
      aria-label={`${block.variant} callout`}
    >
      {/* Label row — icon + variant name */}
      <div className={`ed-callout__header ${config.headerClass}`}>
        {config.icon}
        <span>{label}</span>
      </div>

      {/* Body text */}
      <p className="ed-callout__body">{block.content}</p>
    </div>
  );
}
