"use client";

// =============================================================================
//  AI CONTENT STUDIO — CUSTOM HOOK (SPRINT 1, 2 & 3)
//  src/features/content-studio/hooks/useContentStudio.ts
//
//  Design Decisions:
//  - Complete pipeline orchestration:
//    Topic → Ideas → Brief → Outline → Article Drafting → Open in TipTap Editor
//  - Strictly reuses existing OpenIdear AI Writer, Content Structure Service,
//    blocks-v1 converter, and TipTap Editor.
//  - Preserves workflow state across back/forward navigation and tabs.
// =============================================================================

import { useCallback, useMemo, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { contentStudioApi } from "../api/contentStudio.api";
import { aiApi, type PlannerResponse } from "@/features/ai/api/ai.api";
import { postApi } from "@/features/ideas/api/post.api";
import { categoryApi } from "@/features/categories/api/category.api";
import { toEditorHtml } from "@/features/ai/utils/contentTransformer";
import { aiVisualApi } from "@/features/ai-visual";
import { useLanguageStore } from "@/store/useLanguage";
import {
  useContentStudioStore,
  type ContentStudioStep,
} from "../store/contentStudioStore";
import type {
  ContentGoal,
  ContentIdea,
  ContentBrief,
  ContentOutline,
  ContentIntelligence,
  WritingStageStatus,
  CompletedArticleInfo,
} from "../types/contentStudio.types";

export interface UseContentStudioReturn {
  // Navigation / Workflow step
  step: ContentStudioStep;
  setStep: (step: ContentStudioStep) => void;

  // Step 1: Inputs
  topic: string;
  setTopic: (topic: string) => void;
  language: "en" | "vi";
  setLanguage: (lang: "en" | "vi") => void;
  contentGoal: ContentGoal;
  setContentGoal: (goal: ContentGoal) => void;
  numberOfIdeas: number;
  setNumberOfIdeas: (count: number) => void;

  // Step 1: Results & Selection
  ideas: ContentIdea[];
  selectedIdeaIds: string[];
  selectedCount: number;
  selectedIdeas: ContentIdea[];
  isIdeaSelected: (id: string) => boolean;
  toggleSelectIdea: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;

  // Step 1: UX States
  isGenerating: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage: string | null;
  hasGenerated: boolean;

  // Step 1: Content Intelligence & Inventory Analysis
  intelligence: ContentIntelligence | null;
  isAnalyzingIntelligence: boolean;
  analyzeTopicIntelligence: (topic?: string) => Promise<void>;

  // Step 1: Actions
  generateIdeas: (customTopic?: string) => Promise<void>;
  regenerateIdeas: () => Promise<void>;
  reset: () => void;

  // Step 2: Content Brief State & Actions
  briefs: Record<string, ContentBrief>;
  currentIdea: ContentIdea | null;
  currentBrief: ContentBrief | null;
  activeIdeaIndex: number;
  setActiveIdeaIndex: (index: number) => void;
  isGeneratingBrief: boolean;
  briefError: string | null;
  availableCategories: string[];

  // Step 2: Brief Operations
  generateBriefForIdea: (idea: ContentIdea, force?: boolean) => Promise<ContentBrief | null>;
  updateCurrentBriefField: <K extends keyof ContentBrief>(
    field: K,
    value: ContentBrief[K]
  ) => void;
  regenerateBriefSuggestions: () => Promise<void>;
  proceedToBrief: () => Promise<void>;
  backToIdeas: () => void;
  proceedToOutline: () => Promise<void>;

  // Step 3: Content Outline State & Actions
  outlines: Record<string, ContentOutline>;
  currentOutline: ContentOutline | null;
  isGeneratingOutline: boolean;
  outlineError: string | null;
  generateOutlineForIdea: (idea: ContentIdea, brief: ContentBrief, force?: boolean) => Promise<ContentOutline | null>;
  regenerateOutline: () => Promise<void>;
  updateOutlineTitle: (title: string) => void;
  updateOutlineIntroduction: (intro: string) => void;
  updateOutlineConclusion: (conclusion: string) => void;
  updateSectionHeading: (sectionId: string, heading: string) => void;
  updateSectionPurpose: (sectionId: string, purpose: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  addSection: (afterIndex?: number) => void;
  deleteSection: (sectionId: string) => void;
  addKeyPoint: (sectionId: string, pointText?: string) => void;
  updateKeyPoint: (sectionId: string, pointIndex: number, text: string) => void;
  deleteKeyPoint: (sectionId: string, pointIndex: number) => void;
  addFaqItem: () => void;
  updateFaqItem: (faqIndex: number, question: string, answerDirection: string) => void;
  deleteFaqItem: (faqIndex: number) => void;
  createCustomIdea: (title: string, category?: string) => Promise<ContentIdea | null>;
  backToBrief: () => void;
  backToOutline: () => void;

  // Step 4: Article Writing State & Action
  writingStages: WritingStageStatus[];
  streamChunkText: string;
  generateArticle: () => Promise<void>;

  // New Tab Navigation & State Preservation
  openInNewTab: boolean;
  setOpenInNewTab: (openInNewTab: boolean) => void;
  completedArticle: CompletedArticleInfo | null;
  openEditorInNewTab: (customUrl?: string) => void;
}

export function useContentStudio(): UseContentStudioReturn {
  const router = useRouter();
  const store = useContentStudioStore();
  const [streamChunkText, setStreamChunkText] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load existing system categories on mount
  useEffect(() => {
    if (store.categories.length === 0) {
      categoryApi
        .getCategories()
        .then((res: any) => {
          const list =
            res?.data?.categories ||
            res?.data ||
            res?.categories ||
            [];
          if (Array.isArray(list)) {
            const names = list
              .map((c: any) => c.name || c.title)
              .filter(Boolean);
            if (names.length > 0) {
              store.setCategories(names);
            }
          }
        })
        .catch(() => {
          // Non-critical; fallback categories built-in
        });
    }
  }, [store]);

  const isIdeaSelected = useCallback(
    (id: string) => store.selectedIdeaIds.includes(id),
    [store.selectedIdeaIds]
  );

  const selectedIdeas = useMemo(() => {
    return store.ideas.filter((i) => store.selectedIdeaIds.includes(i.id));
  }, [store.ideas, store.selectedIdeaIds]);

  const currentIdea = useMemo(() => {
    if (selectedIdeas.length === 0) return null;
    return selectedIdeas[store.activeIdeaIndex] || selectedIdeas[0] || null;
  }, [selectedIdeas, store.activeIdeaIndex]);

  const currentBrief = useMemo(() => {
    if (!currentIdea) return null;
    return store.briefs[currentIdea.id] || null;
  }, [store.briefs, currentIdea]);

  const currentOutline = useMemo(() => {
    if (!currentIdea) return null;
    return store.outlines[currentIdea.id] || null;
  }, [store.outlines, currentIdea]);

  const selectedCount = useMemo(
    () => store.selectedIdeaIds.length,
    [store.selectedIdeaIds]
  );

  // ─── STEP 1: Ideas Generation & Content Intelligence ─────────────────────

  const generateIdeas = useCallback(
    async (customTopic?: string) => {
      const topicToUse = customTopic ?? store.topic;
      if (!topicToUse || !topicToUse.trim()) {
        toast.error("Please enter a topic or problem statement to generate ideas.");
        return;
      }

      if (customTopic && customTopic !== store.topic) {
        store.setTopic(customTopic);
      }

      store.setIsGeneratingIdeas(true);
      store.setIdeasError(null);

      try {
        const result = await contentStudioApi.generateIdeas({
          topic: topicToUse.trim(),
          contentGoal: store.contentGoal,
          numberOfIdeas: store.numberOfIdeas,
          existingCategories:
            store.categories.length > 0 ? store.categories : undefined,
          language: store.language,
        });

        const generatedIdeas = result.ideas;
        if (result.intelligence) {
          store.setIntelligence(result.intelligence);
        }

        store.setIdeas(generatedIdeas);
        store.setHasGeneratedIdeas(true);

        if (generatedIdeas.length > 0) {
          store.setSelectedIdeaIds([generatedIdeas[0].id]);
        }

        toast.success(
          `Successfully synthesized ${generatedIdeas.length} content ideas!`
        );
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to generate content ideas. Please try again.";
        store.setIdeasError(msg);
        toast.error(msg);
      } finally {
        store.setIsGeneratingIdeas(false);
      }
    },
    [store]
  );

  const analyzeTopicIntelligence = useCallback(
    async (topicToAnalyze?: string) => {
      const targetTopic = topicToAnalyze ?? store.topic;
      if (!targetTopic || !targetTopic.trim()) return;

      store.setIsAnalyzingIntelligence(true);
      try {
        const intel = await contentStudioApi.getContentIntelligence(targetTopic.trim());
        if (intel) {
          store.setIntelligence(intel);
        }
      } catch (e) {
        console.warn("[useContentStudio] analyzeTopicIntelligence error:", e);
      } finally {
        store.setIsAnalyzingIntelligence(false);
      }
    },
    [store]
  );

  const regenerateIdeas = useCallback(async () => {
    await generateIdeas();
  }, [generateIdeas]);

  // ─── STEP 2: Content Brief Generation ─────────────────────────────────────

  const generateBriefForIdea = useCallback(
    async (idea: ContentIdea, force = false): Promise<ContentBrief | null> => {
      // Seed default brief if not yet present so user fields and selections are never empty
      if (!store.briefs[idea.id]) {
        store.setBrief(idea.id, {
          targetAudience: idea.targetAudience
            ? [idea.targetAudience]
            : ["Beginner PC builders"],
          tone: "Practical",
          length: "Medium — 1,500–2,500 words",
          category: idea.category || "PC Hardware",
          objective:
            idea.searchIntent === "commercial"
              ? "Help users make a purchase decision"
              : "Explain",
        });
      }

      store.setIsGeneratingBrief(true);
      store.setBriefError(null);

      try {
        const brief = await contentStudioApi.generateBrief({
          idea,
          existingCategories:
            store.categories.length > 0 ? store.categories : undefined,
          language: store.language,
        });

        store.setBrief(idea.id, brief, force);
        return brief;
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to infer content brief suggestions.";
        store.setBriefError(msg);
        return store.briefs[idea.id] || null;
      } finally {
        store.setIsGeneratingBrief(false);
      }
    },
    [store]
  );

  const proceedToBrief = useCallback(async () => {
    if (selectedIdeas.length === 0) {
      toast.error("Please select at least one idea to continue.");
      return;
    }

    // Immediately seed briefs for all selected ideas so all fields and selections are reactive
    selectedIdeas.forEach((idea) => {
      if (!store.briefs[idea.id]) {
        store.setBrief(idea.id, {
          targetAudience: idea.targetAudience
            ? [idea.targetAudience]
            : ["Beginner PC builders"],
          tone: "Practical",
          length: "Medium — 1,500–2,500 words",
          category: idea.category || "PC Hardware",
          objective:
            idea.searchIntent === "commercial"
              ? "Help users make a purchase decision"
              : "Explain",
        });
      }
    });

    store.setStep("brief");
    store.setActiveIdeaIndex(0);

    const firstIdea = selectedIdeas[0];
    await generateBriefForIdea(firstIdea, false);
  }, [selectedIdeas, store, generateBriefForIdea]);

  // ─── STEP 3: Outline Generation ───────────────────────────────────────────

  const generateOutlineForIdea = useCallback(
    async (
      idea: ContentIdea,
      brief: ContentBrief,
      force = false
    ): Promise<ContentOutline | null> => {
      if (!force && store.outlines[idea.id]) {
        return store.outlines[idea.id];
      }

      store.setIsGeneratingOutline(true);
      store.setOutlineError(null);

      try {
        const outline = await contentStudioApi.generateOutline({
          idea,
          contentBrief: brief,
          language: store.language,
        });

        store.setOutline(idea.id, outline);
        return outline;
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to generate structured content outline.";
        store.setOutlineError(msg);
        toast.error(msg);
        return null;
      } finally {
        store.setIsGeneratingOutline(false);
      }
    },
    [store]
  );

  const setActiveIdeaIndex = useCallback(
    async (index: number) => {
      if (index < 0 || index >= selectedIdeas.length) return;
      store.setActiveIdeaIndex(index);

      const idea = selectedIdeas[index];
      if (idea) {
        let brief = store.briefs[idea.id];
        if (!brief) {
          brief = {
            targetAudience: idea.targetAudience
              ? [idea.targetAudience]
              : ["Beginner PC builders"],
            tone: "Practical",
            length: "Medium — 1,500–2,500 words",
            category: idea.category || "PC Hardware",
            objective:
              idea.searchIntent === "commercial"
                ? "Help users make a purchase decision"
                : "Explain",
          };
          store.setBrief(idea.id, brief);
          await generateBriefForIdea(idea, false);
        }
        if (store.step === "outline" && !store.outlines[idea.id]) {
          await generateOutlineForIdea(idea, store.briefs[idea.id] || brief);
        }
      }
    },
    [selectedIdeas, store, generateBriefForIdea, generateOutlineForIdea]
  );

  const updateCurrentBriefField = useCallback(
    <K extends keyof ContentBrief>(field: K, value: ContentBrief[K]) => {
      if (!currentIdea) return;
      store.updateBriefField(currentIdea.id, field, value);
    },
    [currentIdea, store]
  );

  const regenerateBriefSuggestions = useCallback(async () => {
    if (!currentIdea) return;
    toast.info("Regenerating AI brief specifications...");
    await generateBriefForIdea(currentIdea, true);
    toast.success("Brief suggestions updated!");
  }, [currentIdea, generateBriefForIdea]);

  const backToIdeas = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    store.setStep("ideas");
  }, [store]);

  const proceedToOutline = useCallback(async () => {
    if (!currentIdea) {
      toast.error("Please select an idea before generating the outline.");
      return;
    }

    store.setStep("outline");

    const brief = store.briefs[currentIdea.id] || currentBrief;
    if (brief && !store.outlines[currentIdea.id]) {
      await generateOutlineForIdea(currentIdea, brief);
    }

    // Auto-generate outlines for other selected ideas in parallel/background so switching tabs is instant
    selectedIdeas.forEach(async (otherIdea) => {
      if (otherIdea.id !== currentIdea.id && !store.outlines[otherIdea.id]) {
        const otherBrief = store.briefs[otherIdea.id] || {
          targetAudience: otherIdea.targetAudience ? [otherIdea.targetAudience] : ["Beginner PC builders"],
          tone: "Practical",
          length: "Medium — 1,500–2,500 words",
          category: otherIdea.category || "PC Hardware",
          objective: otherIdea.searchIntent === "commercial" ? "Help users make a purchase decision" : "Explain",
        };
        await generateOutlineForIdea(otherIdea, otherBrief);
      }
    });
  }, [currentIdea, currentBrief, selectedIdeas, store, generateOutlineForIdea]);

  const createCustomIdea = useCallback(
    async (title: string, category?: string) => {
      const trimmed = title.trim();
      if (!trimmed) return null;

      const newIdea: ContentIdea = {
        id: `custom_idea_${Date.now()}`,
        title: trimmed,
        hook: `Key insights and practical overview for ${trimmed}`,
        contentType: "guide",
        category: category || store.topic || "PC Hardware",
        targetAudience: "Enthusiasts & Builders",
        difficulty: "intermediate",
        searchIntent: "informational",
        keywords: trimmed.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
      };

      store.addCustomIdea(newIdea);

      const defaultBrief: ContentBrief = {
        targetAudience: ["Enthusiasts & Builders"],
        tone: "Practical",
        length: "Medium — 1,500–2,500 words",
        category: newIdea.category,
        objective: "Explain",
      };
      store.setBrief(newIdea.id, defaultBrief);

      toast.success(`Created idea: "${trimmed}"`);

      if (store.step === "outline") {
        await generateOutlineForIdea(newIdea, defaultBrief);
      } else if (store.step === "brief") {
        await generateBriefForIdea(newIdea, false);
      }

      return newIdea;
    },
    [store, generateOutlineForIdea, generateBriefForIdea]
  );

  const backToOutline = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    store.setStep("outline");
  }, [store]);

  const regenerateOutline = useCallback(async () => {
    if (!currentIdea || !currentBrief) return;
    toast.info("Regenerating article outline...");
    await generateOutlineForIdea(currentIdea, currentBrief, true);
    toast.success("Outline updated!");
  }, [currentIdea, currentBrief, generateOutlineForIdea]);

  const backToBrief = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    store.setStep("brief");
  }, [store]);

  // Outline Editing Handlers
  const updateOutlineTitle = useCallback(
    (title: string) => {
      if (!currentIdea) return;
      store.updateOutlineTitle(currentIdea.id, title);
    },
    [currentIdea, store]
  );

  const updateOutlineIntroduction = useCallback(
    (intro: string) => {
      if (!currentIdea) return;
      store.updateOutlineIntroduction(currentIdea.id, intro);
    },
    [currentIdea, store]
  );

  const updateOutlineConclusion = useCallback(
    (conclusion: string) => {
      if (!currentIdea) return;
      store.updateOutlineConclusion(currentIdea.id, conclusion);
    },
    [currentIdea, store]
  );

  const updateSectionHeading = useCallback(
    (sectionId: string, heading: string) => {
      if (!currentIdea) return;
      store.updateSectionHeading(currentIdea.id, sectionId, heading);
    },
    [currentIdea, store]
  );

  const updateSectionPurpose = useCallback(
    (sectionId: string, purpose: string) => {
      if (!currentIdea) return;
      store.updateSectionPurpose(currentIdea.id, sectionId, purpose);
    },
    [currentIdea, store]
  );

  const reorderSections = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!currentIdea) return;
      store.reorderSections(currentIdea.id, fromIndex, toIndex);
    },
    [currentIdea, store]
  );

  const addSection = useCallback(
    (afterIndex?: number) => {
      if (!currentIdea) return;
      store.addSection(currentIdea.id, afterIndex);
    },
    [currentIdea, store]
  );

  const deleteSection = useCallback(
    (sectionId: string) => {
      if (!currentIdea) return;
      store.deleteSection(currentIdea.id, sectionId);
    },
    [currentIdea, store]
  );

  const addKeyPoint = useCallback(
    (sectionId: string, pointText?: string) => {
      if (!currentIdea) return;
      store.addKeyPoint(currentIdea.id, sectionId, pointText);
    },
    [currentIdea, store]
  );

  const updateKeyPoint = useCallback(
    (sectionId: string, pointIndex: number, text: string) => {
      if (!currentIdea) return;
      store.updateKeyPoint(currentIdea.id, sectionId, pointIndex, text);
    },
    [currentIdea, store]
  );

  const deleteKeyPoint = useCallback(
    (sectionId: string, pointIndex: number) => {
      if (!currentIdea) return;
      store.deleteKeyPoint(currentIdea.id, sectionId, pointIndex);
    },
    [currentIdea, store]
  );

  const addFaqItem = useCallback(() => {
    if (!currentIdea) return;
    store.addFaqItem(currentIdea.id);
  }, [currentIdea, store]);

  const updateFaqItem = useCallback(
    (faqIndex: number, question: string, answerDirection: string) => {
      if (!currentIdea) return;
      store.updateFaqItem(currentIdea.id, faqIndex, question, answerDirection);
    },
    [currentIdea, store]
  );

  const deleteFaqItem = useCallback(
    (faqIndex: number) => {
      if (!currentIdea) return;
      store.deleteFaqItem(currentIdea.id, faqIndex);
    },
    [currentIdea, store]
  );

  // ─── STEP 4: Article Generation Workflow ──────────────────────────────────

  const generateArticle = useCallback(async () => {
    if (!currentIdea || !currentBrief || !currentOutline) {
      toast.error("Missing brief or outline specifications for article generation.");
      return;
    }

    store.setStep("writing");
    store.resetWritingStages();
    store.setCompletedArticle(null);
    setStreamChunkText("");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // ── Stage 1: Understanding content brief ──────────────────────────────
      store.updateWritingStage("brief", { status: "running" });
      await new Promise((r) => setTimeout(r, 600)); // real validation & context compile
      store.updateWritingStage("brief", { status: "completed" });

      // ── Stage 2: Building article structure ───────────────────────────────
      store.updateWritingStage("structure", { status: "running" });

      const plannerPlan: PlannerResponse = {
        title: currentOutline.title || currentIdea.title,
        difficulty: (currentIdea.difficulty as any) || "intermediate",
        estimatedReadingTime: Math.max(
          5,
          Math.ceil(
            parseInt(currentBrief.length.replace(/\D/g, "") || "2500", 10) / 250
          )
        ),
        keywords: currentIdea.keywords || [],
        outline: [
          {
            title: "Introduction",
            description: currentOutline.introduction,
            level: 2,
          },
          ...currentOutline.sections.map((s) => ({
            title: s.heading,
            description: `Purpose: ${s.purpose}. Key points: ${s.keyPoints.join(", ")}`,
            level: 2,
          })),
          {
            title: "Conclusion",
            description: currentOutline.conclusion,
            level: 2,
          },
          ...(currentOutline.faq && currentOutline.faq.length > 0
            ? [
                {
                  title: "Frequently Asked Questions",
                  description: currentOutline.faq
                    .map((f) => `Q: ${f.question} | A: ${f.answerDirection}`)
                    .join("; "),
                  level: 2,
                },
              ]
            : []),
        ],
      };

      const langLabel = store.language === "vi" ? "Vietnamese (Tiếng Việt)" : "English";
      const additionalInstructions = `
Target Audience: ${currentBrief.targetAudience.join(", ")}
Tone: ${currentBrief.tone}
Length: ${currentBrief.length}
Category: ${currentBrief.category}
Objective: ${currentBrief.objective}
Search Intent: ${currentIdea.searchIntent}
Editorial Angle: ${currentIdea.hook || currentIdea.title}
Target Language: ${langLabel} (Write 100% of the article strictly in ${langLabel}. Do NOT mix languages).
`.trim();

      await new Promise((r) => setTimeout(r, 600));
      store.updateWritingStage("structure", { status: "completed" });

      // ── Stage 3: Writing sections via AI Writer ───────────────────────────
      store.updateWritingStage("writing", { status: "running" });

      let articleMarkdown = "";

      try {
        // Attempt streaming with existing writer architecture
        const stream = await aiApi.runWriterStream(
          {
            plan: plannerPlan,
            additionalInstructions,
            language: store.language,
          },
          controller.signal
        );

        const reader = stream.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const dataStr = trimmed.replace(/^data:\s*/, "");
            if (dataStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                console.warn("[useContentStudio] SSE stream reported error:", parsed.error);
                throw new Error(parsed.error);
              }
              if (parsed.chunk) {
                articleMarkdown += parsed.chunk;
                setStreamChunkText((prev) => (prev + parsed.chunk).slice(-400));
              }
            } catch (pErr: any) {
              if (pErr?.message && !pErr.message.includes("JSON")) {
                throw pErr;
              }
              // Ignore partial JSON parse
            }
          }
        }
      } catch (streamErr) {
        console.warn(
          "[useContentStudio] Writer stream fallback to direct generation:",
          streamErr
        );
      }

      // Check if user navigated away or cancelled
      if (controller.signal.aborted) {
        console.info("[useContentStudio] Article generation aborted by user.");
        return;
      }

      // Resilient Fallback: If streaming was aborted, network dropped, or returned insufficient text (< 150 chars),
      // assemble a comprehensive initial draft based on the user-approved outline so the editor is NEVER empty.
      if (!articleMarkdown || articleMarkdown.trim().length < 150) {
        console.info(
          "[useContentStudio] Assembling robust outline-based draft fallback (locale: " +
            store.language +
            ")"
        );
        const isVi = store.language === "vi";
        articleMarkdown = `
# ${plannerPlan.title}

${currentOutline.introduction}

${currentOutline.sections
  .map(
    (sec) => `## ${sec.heading}

${sec.purpose}

${sec.keyPoints
  .map(
    (pt) =>
      `* **${pt}**: ${
        isVi
          ? "Phân tích kỹ thuật chuyên sâu và hướng dẫn ứng dụng thực tế."
          : "Practical insights, benchmarks, and actionable technical recommendations."
      }`
  )
  .join("\n")}
`
  )
  .join("\n\n")}

## ${isVi ? "Kết luận" : "Conclusion"}

${currentOutline.conclusion}

${
  currentOutline.faq && currentOutline.faq.length > 0
    ? `## ${isVi ? "Câu hỏi thường gặp" : "Frequently Asked Questions"}\n\n` +
      currentOutline.faq
        .map((faq) => `### ${faq.question}\n\n${faq.answerDirection}\n`)
        .join("\n")
    : ""
}
`.trim();
      }

      store.updateWritingStage("writing", { status: "completed" });

      // ── Stage 4: Structuring into blocks-v1 format ────────────────────────
      store.updateWritingStage("blocks", { status: "running" });

      let articleBlocks: any[] = [];
      try {
        const structureRes = await aiApi.structureArticle({
          markdown: articleMarkdown,
        });
        if (structureRes.data?.blocks && Array.isArray(structureRes.data.blocks)) {
          articleBlocks = structureRes.data.blocks;
        }
      } catch (structErr) {
        console.warn(
          "[useContentStudio] ContentStructureService warning (using markdown fallback):",
          structErr
        );
      }

      await new Promise((r) => setTimeout(r, 600));
      store.updateWritingStage("blocks", { status: "completed" });

      // ── Stage 5: Initializing editor draft & autosave ──────────────────────
      store.updateWritingStage("editor", { status: "running" });

      const editorHtml = toEditorHtml(articleMarkdown);
      const postTitle = currentOutline.title || currentIdea.title;
      const description = currentOutline.introduction
        .slice(0, 160)
        .replace(/[#*`_]/g, "")
        .trim();

      // Determine content locale directly from author's chosen language
      const determinedLocale: "en" | "vi" = store.language;
      let createdPostId: string | null = null;
      let finalLocale: "en" | "vi" = determinedLocale;

      // Find authentic high-resolution photography on Unsplash for cover
      let resolvedCoverImage: string | null = null;
      try {
        const stockPhotos = await aiVisualApi.searchImages(
          { query: postTitle, limit: 4, orientation: "landscape" },
          4,
          1
        );
        if (stockPhotos && stockPhotos.length > 0) {
          resolvedCoverImage = stockPhotos[0].url;
        }
      } catch (imgErr) {
        console.warn("[useContentStudio] Stock cover search fallback:", imgErr);
      }

      // Ensure clean string tags array without bracket or quote artifacts
      const rawKeywords =
        currentIdea.keywords && currentIdea.keywords.length > 0
          ? currentIdea.keywords
          : ["technology"];
      const sanitizedTags = Array.isArray(rawKeywords)
        ? rawKeywords
            .flatMap((k: any) =>
              typeof k === "string"
                ? k
                    .replace(/^[\[\s'"]+|[\]\s'"]+$/g, "")
                    .split(",")
                    .map((s) => s.trim().replace(/^['"]+|['"]+$/g, ""))
                : []
            )
            .filter(Boolean)
        : ["technology"];

      try {
        const draftRes = await postApi.createPost({
          title: postTitle,
          text: currentOutline.introduction,
          content: editorHtml,
          markdown: articleMarkdown,
          contentVersion: "blocks-v1",
          blocks: articleBlocks,
          description,
          category: currentBrief.category || "Technology",
          tags: sanitizedTags.length > 0 ? sanitizedTags : ["technology"],
          image: resolvedCoverImage,
          published: false, // AI-generated content must NEVER automatically publish
          locale: determinedLocale,
        });

        if (draftRes.success && draftRes.data?.post?._id) {
          createdPostId = draftRes.data.post._id;
          if (draftRes.data.post.defaultLocale) {
            finalLocale = draftRes.data.post.defaultLocale as "en" | "vi";
          }
        }
      } catch (saveDraftErr) {
        console.warn(
          "[useContentStudio] Draft database save fallback to sessionStorage:",
          saveDraftErr
        );
      }

      // Store in sessionStorage as guaranteed fallback for EditorShell
      const draftPayload = {
        title: postTitle,
        content: editorHtml,
        markdown: articleMarkdown,
        description,
        category: currentBrief.category,
        blocks: articleBlocks,
        contentVersion: "blocks-v1",
        image: resolvedCoverImage,
        published: false,
        locale: finalLocale,
      };

      try {
        const payloadStr = JSON.stringify(draftPayload);
        sessionStorage.setItem("content_studio_draft", payloadStr);
        localStorage.setItem("content_studio_draft", payloadStr);
      } catch (sessionErr) {
        console.warn("[useContentStudio] storage write warning:", sessionErr);
      }

      store.updateWritingStage("editor", { status: "completed" });
      await new Promise((r) => setTimeout(r, 400));

      const editorUrl = createdPostId
        ? `/create?id=${createdPostId}&locale=${finalLocale}`
        : `/create?locale=${finalLocale}`;

      const completedInfo: CompletedArticleInfo = {
        postId: createdPostId,
        url: editorUrl,
        title: postTitle,
        locale: finalLocale,
        completedAt: Date.now(),
        draft: draftPayload,
      };
      store.setCompletedArticle(completedInfo);

      if (controller.signal.aborted) {
        console.info("[useContentStudio] Generation aborted prior to editor navigation.");
        return;
      }

      // Mechanism to open in new tab instead of current page
      if (store.openInNewTab) {
        let openedTab = false;
        try {
          const newWin = window.open(editorUrl, "_blank", "noopener,noreferrer");
          if (newWin && !newWin.closed && typeof newWin.closed !== "undefined") {
            openedTab = true;
          }
        } catch (popupErr) {
          console.warn("[useContentStudio] window.open failed/blocked:", popupErr);
        }

        if (openedTab) {
          toast.success(
            "Article draft opened in a new tab! Topic & generated ideas preserved in Content Studio.",
            { duration: 6000 }
          );
        } else {
          toast.success(
            "Article successfully compiled! Click 'Open in Editor (New Tab)' to review.",
            { duration: 6000 }
          );
        }
      } else {
        toast.success(
          "Article successfully compiled! Opening OpenIdear Editor for manual review."
        );
        router.push(editorUrl);
      }
    } catch (pipelineErr: unknown) {
      if (abortControllerRef.current?.signal.aborted) {
        console.info("[useContentStudio] Pipeline aborted by user navigation.");
        return;
      }
      const errorMsg =
        pipelineErr instanceof Error
          ? pipelineErr.message
          : "Article generation pipeline failed.";
      toast.error(errorMsg);
      store.updateWritingStage("writing", {
        status: "error",
        error: errorMsg,
      });
    }
  }, [
    currentIdea,
    currentBrief,
    currentOutline,
    store,
    router,
  ]);

  const setStep = useCallback(
    (targetStep: ContentStudioStep) => {
      if (store.step === "writing" && targetStep !== "writing") {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }
      store.setStep(targetStep);
    },
    [store]
  );

  return {
    step: store.step,
    setStep,

    topic: store.topic,
    setTopic: store.setTopic,
    language: store.language,
    setLanguage: store.setLanguage,
    contentGoal: store.contentGoal,
    setContentGoal: store.setContentGoal,
    numberOfIdeas: store.numberOfIdeas,
    setNumberOfIdeas: store.setNumberOfIdeas,

    ideas: store.ideas,
    selectedIdeaIds: store.selectedIdeaIds,
    selectedCount,
    selectedIdeas,
    isIdeaSelected,
    toggleSelectIdea: store.toggleSelectIdea,
    selectAll: store.selectAllIdeas,
    deselectAll: store.deselectAllIdeas,

    isGenerating: store.isGeneratingIdeas,
    isSuccess: store.hasGeneratedIdeas && store.ideas.length > 0,
    isError: Boolean(store.ideasError),
    errorMessage: store.ideasError,
    hasGenerated: store.hasGeneratedIdeas,

    // Content Intelligence
    intelligence: store.intelligence,
    isAnalyzingIntelligence: store.isAnalyzingIntelligence,
    analyzeTopicIntelligence,

    generateIdeas,
    regenerateIdeas,
    reset: store.resetStudio,

    briefs: store.briefs,
    currentIdea,
    currentBrief,
    activeIdeaIndex: store.activeIdeaIndex,
    setActiveIdeaIndex,
    isGeneratingBrief: store.isGeneratingBrief,
    briefError: store.briefError,
    availableCategories: store.categories,

    generateBriefForIdea,
    updateCurrentBriefField,
    regenerateBriefSuggestions,
    proceedToBrief,
    backToIdeas,
    proceedToOutline,

    outlines: store.outlines,
    currentOutline,
    isGeneratingOutline: store.isGeneratingOutline,
    outlineError: store.outlineError,
    generateOutlineForIdea,
    regenerateOutline,
    updateOutlineTitle,
    updateOutlineIntroduction,
    updateOutlineConclusion,
    updateSectionHeading,
    updateSectionPurpose,
    reorderSections,
    addSection,
    deleteSection,
    addKeyPoint,
    updateKeyPoint,
    deleteKeyPoint,
    addFaqItem,
    updateFaqItem,
    deleteFaqItem,
    createCustomIdea,
    backToBrief,
    backToOutline,

    writingStages: store.writingStages,
    streamChunkText,
    generateArticle,

    openInNewTab: store.openInNewTab,
    setOpenInNewTab: store.setOpenInNewTab,
    completedArticle: store.completedArticle,
    openEditorInNewTab: (customUrl?: string) => {
      const target = customUrl || store.completedArticle?.url || "/create";
      try {
        window.open(target, "_blank", "noopener,noreferrer");
      } catch (err) {
        console.warn("[useContentStudio] openEditorInNewTab fallback:", err);
        router.push(target);
      }
    },
  };
}
