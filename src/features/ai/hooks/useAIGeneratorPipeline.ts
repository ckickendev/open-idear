"use client";

// =============================================================================
//  ONE CLICK AI PUBLISHER — PIPELINE HOOK
//  src/features/ai/hooks/useAIGeneratorPipeline.ts
//
//  State Machine coordinating the 6-stage AI publishing workflow:
//  Planner → Writer → Growth → ContentStructureService → SEO Generator → Save Draft
//
//  Design Decisions:
//  - Strictly sequential stage execution with automatic retry support.
//  - Supports cooperative cancellation via AbortController.
//  - Autosaves state after every completed stage.
//  - Preserves aiContext across retries and stage boundaries.
// =============================================================================

import { useState, useRef, useCallback } from "react";
import { aiApi, type ResolvedImage } from "../api/ai.api";
import { buildPostMetadata } from "@/features/seo/metadata/buildPostMetadata";
import { getPostStructuredData } from "@/features/seo/schemas/getPostStructuredData";
import type {
  PipelineStageId,
  PipelineStageState,
  PipelineInput,
  PipelineData,
  UseAIGeneratorPipelineOptions,
  UseAIGeneratorPipelineReturn,
} from "../types/pipeline.types";
import type { ArticleBlock } from "@/features/article/types/article.types";

const INITIAL_STAGES: PipelineStageState[] = [
  {
    id: "planner",
    name: "1. AI Planner",
    description: "Generate structured outline, keywords, and title",
    status: "idle",
    elapsedTimeMs: 0,
  },
  {
    id: "writer",
    name: "2. AI Writer",
    description: "Compile long-form article content from outline",
    status: "idle",
    elapsedTimeMs: 0,
  },
  {
    id: "growth",
    name: "3. Growth Engine",
    description: "Enrich content with images, FAQ, and comparison tables",
    status: "idle",
    elapsedTimeMs: 0,
  },
  {
    id: "structure",
    name: "4. Content Structure",
    description: "Parse content into structured ArticleBlock[] format",
    status: "idle",
    elapsedTimeMs: 0,
  },
  {
    id: "seo",
    name: "5. SEO & Schema",
    description: "Build meta tags, OpenGraph, and Schema.org JSON-LD",
    status: "idle",
    elapsedTimeMs: 0,
  },
  {
    id: "saveDraft",
    name: "6. Save Draft",
    description: "Persist complete post state and aiContext to database",
    status: "idle",
    elapsedTimeMs: 0,
  },
];

export function useAIGeneratorPipeline(
  options: UseAIGeneratorPipelineOptions = {},
): UseAIGeneratorPipelineReturn {
  const { onStageComplete, onAutosave } = options;

  const [stages, setStages] = useState<PipelineStageState[]>(INITIAL_STAGES);
  const [currentStageId, setCurrentStageId] = useState<PipelineStageId | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<
    "idle" | "running" | "completed" | "error" | "aborted"
  >("idle");
  const [pipelineData, setPipelineData] = useState<PipelineData>({});

  const abortControllerRef = useRef<AbortController | null>(null);
  const dataRef = useRef<PipelineData>({});
  dataRef.current = pipelineData;

  // Helper to update a stage state
  const updateStage = useCallback(
    (stageId: PipelineStageId, update: Partial<PipelineStageState>) => {
      setStages((prev) =>
        prev.map((s) => (s.id === stageId ? { ...s, ...update } : s)),
      );
    },
    [],
  );

  // Abort active pipeline execution
  const abortPipeline = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setPipelineStatus("aborted");
    if (currentStageId) {
      updateStage(currentStageId, {
        status: "error",
        error: "Pipeline cancelled by user",
      });
    }
  }, [currentStageId, updateStage]);

  // Reset pipeline state completely
  const resetPipeline = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStages(INITIAL_STAGES);
    setCurrentStageId(null);
    setPipelineStatus("idle");
    setPipelineData({});
  }, []);

  // Internal stage execution runner
  const executeStage = async (
    stageId: PipelineStageId,
    input: PipelineInput,
    signal: AbortSignal,
  ): Promise<boolean> => {
    setCurrentStageId(stageId);
    updateStage(stageId, { status: "running", error: undefined, elapsedTimeMs: 0 });
    const startTime = Date.now();

    // Timer ticker
    const timerInterval = setInterval(() => {
      updateStage(stageId, { elapsedTimeMs: Date.now() - startTime });
    }, 100);

    try {
      let accumulatedData: Partial<PipelineData> = {};

      switch (stageId) {
        case "planner": {
          const res = await aiApi.runPlanner({
            topic: input.topic,
            audience: input.audience || "developers",
            goal: input.goal || "educate",
            tone: input.tone || "informative",
            length: input.length || "medium",
            category: input.category || "general",
          });

          if (signal.aborted) throw new Error("Aborted");

          const plan = res.data;
          const outlineCount = plan.outline?.length || 0;
          const summary = `Outline ready: "${plan.title}" (${outlineCount} sections, ~${plan.estimatedReadingTime} min read)`;

          accumulatedData = {
            planner: plan,
            aiContext: {
              ...dataRef.current.aiContext,
              plannerOutput: plan,
            },
          };

          updateStage("planner", {
            status: "completed",
            outputSummary: summary,
            elapsedTimeMs: Date.now() - startTime,
          });
          break;
        }

        case "writer": {
          const plan = dataRef.current.planner;
          if (!plan) throw new Error("Planner stage output is missing.");

          let rawMarkdown = "";
          const stream = await aiApi.runWriterStream(
            {
              plan,
              additionalInstructions: input.additionalInstructions,
              language: "en",
            },
            signal,
          );

          const reader = stream.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (signal.aborted) throw new Error("Aborted");

            const textChunk = decoder.decode(value, { stream: true });
            const lines = textChunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const dataStr = line.replace("data: ", "").trim();
                if (dataStr === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.chunk) {
                    rawMarkdown += parsed.chunk;
                  }
                } catch {
                  // ignore non-json SSE lines
                }
              }
            }
          }

          const wordCount = rawMarkdown.split(/\s+/).filter(Boolean).length;
          const readingTime = Math.max(1, Math.ceil(wordCount / 225));
          const summary = `Written ${wordCount.toLocaleString()} words (~${readingTime} min read)`;

          accumulatedData = {
            writerMarkdown: rawMarkdown,
            aiContext: {
              ...dataRef.current.aiContext,
              writerOutput: { wordCount, estimatedReadingTime: readingTime },
            },
          };

          updateStage("writer", {
            status: "completed",
            outputSummary: summary,
            elapsedTimeMs: Date.now() - startTime,
          });
          break;
        }

        case "growth": {
          const markdown = dataRef.current.writerMarkdown || "";
          const plan = dataRef.current.planner;

          let enhancedMarkdown = markdown;
          let insertedAssets: ResolvedImage[] = [];
          let appliedEnhancements: string[] = [];

          try {
            const enhanceRes = await aiApi.enhanceContent({
              markdown,
              options: { title: plan?.title || input.topic },
            });
            if (enhanceRes.data) {
              enhancedMarkdown = enhanceRes.data.enhancedMarkdown || markdown;
              insertedAssets = enhanceRes.data.insertedAssets || [];
              appliedEnhancements = enhanceRes.data.appliedEnhancements || [];
            }
          } catch (enhanceErr) {
            // Growth is non-fatal — fallback to raw writer markdown
            console.warn("Growth enhancement warning:", enhanceErr);
          }

          const assetCount = insertedAssets.length;
          const summary = assetCount > 0
            ? `Enriched content: ${assetCount} images & ${appliedEnhancements.length} growth elements added`
            : "Growth engine complete (standard content format)";

          accumulatedData = {
            enhancedMarkdown,
            growthResults: {
              insertedAssets,
              appliedEnhancements,
            },
            aiContext: {
              ...dataRef.current.aiContext,
              growthResults: { insertedAssets, appliedEnhancements },
            },
          };

          updateStage("growth", {
            status: "completed",
            outputSummary: summary,
            elapsedTimeMs: Date.now() - startTime,
          });
          break;
        }

        case "structure": {
          const markdown = dataRef.current.enhancedMarkdown || dataRef.current.writerMarkdown || "";
          const growthResults = dataRef.current.growthResults;

          const res = await aiApi.structureArticle({
            markdown,
            growthResults: growthResults ? { ...growthResults } : undefined,
          });

          if (signal.aborted) throw new Error("Aborted");

          const blocks = (res.data?.blocks || []) as ArticleBlock[];
          const summary = `Structured ${blocks.length} ArticleBlocks (blocks-v1 format)`;

          accumulatedData = {
            blocks,
          };

          updateStage("structure", {
            status: "completed",
            outputSummary: summary,
            elapsedTimeMs: Date.now() - startTime,
          });
          break;
        }

        case "seo": {
          const plan = dataRef.current.planner;
          const title = plan?.title || input.topic;
          const markdown = dataRef.current.enhancedMarkdown || dataRef.current.writerMarkdown || "";
          const description = markdown.slice(0, 160).replace(/[#*`_]/g, "").trim();

          const postSEOInput = {
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
            description,
            tags: plan?.keywords || ["technology", "ai"],
          };

          const metadata = buildPostMetadata(postSEOInput);
          const structuredData = getPostStructuredData(postSEOInput);

          const titleStr = typeof metadata.title === "string" ? metadata.title : String(metadata.title || title);
          const descStr = typeof metadata.description === "string" ? metadata.description : description;
          const canonicalUrlStr = typeof metadata.openGraph?.url === "string" ? metadata.openGraph.url : String(metadata.openGraph?.url || "");

          const summary = `SEO & JSON-LD ready (${titleStr.slice(0, 30)}…)`;

          accumulatedData = {
            seo: {
              metaTitle: titleStr,
              metaDescription: descStr,
              keywords: plan?.keywords || [],
              ...(canonicalUrlStr ? { canonicalUrl: canonicalUrlStr } : {}),
              schemaOrg: {
                article: (structuredData.article as unknown) as Record<string, unknown>,
                ...(structuredData.faq ? { faqPage: (structuredData.faq as unknown) as Record<string, unknown> } : {}),
              },
            },
          };

          updateStage("seo", {
            status: "completed",
            outputSummary: summary,
            elapsedTimeMs: Date.now() - startTime,
          });
          break;
        }

        case "saveDraft": {
          const nextData = {
            ...dataRef.current,
            aiContext: {
              ...dataRef.current.aiContext,
              generation: {
                model: "OpenIdear-AI-v1",
                generatedAt: new Date().toISOString(),
              },
            },
          };

          if (onAutosave) {
            await onAutosave(nextData);
          }

          const summary = "Draft post auto-saved to database";

          accumulatedData = {
            aiContext: nextData.aiContext,
          };

          updateStage("saveDraft", {
            status: "completed",
            outputSummary: summary,
            elapsedTimeMs: Date.now() - startTime,
          });
          break;
        }
      }

      clearInterval(timerInterval);

      // Merge data & notify listeners
      const mergedData = {
        ...dataRef.current,
        ...accumulatedData,
      };
      setPipelineData(mergedData);
      dataRef.current = mergedData;

      if (onStageComplete) {
        onStageComplete(stageId, mergedData);
      }

      return true;
    } catch (err: unknown) {
      clearInterval(timerInterval);
      const errorMsg = err instanceof Error ? err.message : "Stage execution failed";
      if (errorMsg !== "Aborted") {
        updateStage(stageId, {
          status: "error",
          error: errorMsg,
          elapsedTimeMs: Date.now() - startTime,
        });
      }
      return false;
    }
  };

  // Main pipeline orchestrator loop
  const runPipelineFromStage = async (
    startStageId: PipelineStageId,
    input: PipelineInput,
  ) => {
    setPipelineStatus("running");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const stageOrder: PipelineStageId[] = [
      "planner",
      "writer",
      "growth",
      "structure",
      "seo",
      "saveDraft",
    ];

    const startIndex = stageOrder.indexOf(startStageId);

    for (let i = startIndex; i < stageOrder.length; i++) {
      const stageId = stageOrder[i];
      if (controller.signal.aborted) break;

      const success = await executeStage(stageId, input, controller.signal);
      if (!success) {
        setPipelineStatus("error");
        setCurrentStageId(null);
        return;
      }
    }

    if (!controller.signal.aborted) {
      setPipelineStatus("completed");
      setCurrentStageId(null);
    }
  };

  const startPipeline = async (input: PipelineInput) => {
    resetPipeline();
    await runPipelineFromStage("planner", input);
  };

  const retryStage = async (stageId: PipelineStageId, input: PipelineInput) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    await runPipelineFromStage(stageId, input);
  };

  return {
    stages,
    currentStageId,
    pipelineStatus,
    pipelineData,
    startPipeline,
    abortPipeline,
    retryStage,
    resetPipeline,
  };
}
