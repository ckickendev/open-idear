// =============================================================================
//  ONE CLICK AI PUBLISHER — PIPELINE TYPES
//  src/features/ai/types/pipeline.types.ts
//
//  Defines state machine types, stage definitions, and context for the
//  1-Click AI Publisher workflow:
//  Planner → Writer → Growth → ContentStructureService → SEO Generator → Save Draft
// =============================================================================

import type { PlannerResponse, ResolvedImage } from "../api/ai.api";
import type { ArticleBlock, ArticleSEO, ArticleAIContext } from "@/features/article/types/article.types";

export type PipelineStageId =
  | "planner"
  | "writer"
  | "growth"
  | "structure"
  | "seo"
  | "saveDraft";

export type PipelineStageStatus =
  | "idle"
  | "running"
  | "completed"
  | "error"
  | "skipped";

export interface PipelineStageState {
  id: PipelineStageId;
  name: string;
  description: string;
  status: PipelineStageStatus;
  elapsedTimeMs: number;
  outputSummary?: string;
  error?: string;
}

export interface PipelineInput {
  topic: string;
  audience: string;
  goal: string;
  tone: string;
  length: string;
  category: string;
  additionalInstructions?: string;
}

export interface PipelineData {
  planner?: PlannerResponse;
  writerMarkdown?: string;
  enhancedMarkdown?: string;
  growthResults?: {
    insertedAssets?: ResolvedImage[];
    appliedEnhancements?: string[];
    faq?: Array<{ question: string; answer: string }>;
    comparison?: unknown;
  };
  blocks?: ArticleBlock[];
  seo?: ArticleSEO;
  aiContext?: ArticleAIContext;
  postId?: string | null;
}

export interface UseAIGeneratorPipelineOptions {
  onStageComplete?: (stageId: PipelineStageId, data: PipelineData) => void;
  onAutosave?: (data: PipelineData) => Promise<void>;
}

export interface UseAIGeneratorPipelineReturn {
  stages: PipelineStageState[];
  currentStageId: PipelineStageId | null;
  pipelineStatus: "idle" | "running" | "completed" | "error" | "aborted";
  pipelineData: PipelineData;
  startPipeline: (input: PipelineInput) => Promise<void>;
  abortPipeline: () => void;
  retryStage: (stageId: PipelineStageId, input: PipelineInput) => Promise<void>;
  resetPipeline: () => void;
}
