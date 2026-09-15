"use client";

// =============================================================================
//  AI PUBLISHER PANEL — REDESIGNED
//  src/features/ai/components/AIPublisherPanel.tsx
//
//  Redesigned AI Publisher card for PublishDrawer and editor workspaces.
//  Minimal, premium, AI-native aesthetic inspired by Notion, Linear & Cursor.
// =============================================================================

import React from "react";
import {
  AIPublisherCard,
  type AIPublisherCardProps,
  type AIPublisherResult,
} from "./publisher/AIPublisherCard";
import type { PipelineStep, StepStatus } from "./publisher/GenerationProgress";

export type { AIPublisherResult, PipelineStep, StepStatus };

export interface AIPublisherPanelProps extends AIPublisherCardProps {}

/**
 * AIPublisherPanel is a drop-in component that renders the redesigned AIPublisherCard
 * with complete backward compatibility.
 */
export const AIPublisherPanel: React.FC<AIPublisherPanelProps> = (props) => {
  return <AIPublisherCard {...props} />;
};

export default AIPublisherPanel;
