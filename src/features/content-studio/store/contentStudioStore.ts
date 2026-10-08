// =============================================================================
//  AI CONTENT STUDIO — WORKFLOW STORE (ZUSTAND)
//  src/features/content-studio/store/contentStudioStore.ts
//
//  Design Decisions:
//  - Keeps the entire multi-step workflow in a dedicated Zustand store.
//  - Ensures navigation between Step 1 (Ideas), Step 2 (Brief), Step 3 (Outline),
//    and Step 4 (Writing) never loses selected ideas, generated suggestions, or manual edits.
// =============================================================================

import { create } from "zustand";
import type {
  ContentGoal,
  ContentIdea,
  ContentBrief,
  ContentOutline,
  ContentIntelligence,
  WritingStageId,
  WritingStageStatus,
} from "../types/contentStudio.types";

export type ContentStudioStep = "ideas" | "brief" | "outline" | "writing";

export const INITIAL_WRITING_STAGES: WritingStageStatus[] = [
  {
    id: "brief",
    label: "Understanding content brief & editorial angle",
    status: "idle",
  },
  {
    id: "structure",
    label: "Building article structure & heading hierarchy",
    status: "idle",
  },
  {
    id: "writing",
    label: "Drafting comprehensive long-form content",
    status: "idle",
  },
  {
    id: "blocks",
    label: "Structuring into blocks-v1 format",
    status: "idle",
  },
  {
    id: "editor",
    label: "Initializing editor draft & autosave",
    status: "idle",
  },
];

interface ContentStudioState {
  // Navigation / Workflow step
  step: ContentStudioStep;
  setStep: (step: ContentStudioStep) => void;

  // Step 1: Topic & Idea Generation Inputs
  topic: string;
  setTopic: (topic: string) => void;
  contentGoal: ContentGoal;
  setContentGoal: (goal: ContentGoal) => void;
  numberOfIdeas: number;
  setNumberOfIdeas: (count: number) => void;

  // Step 1: Results & Selections
  ideas: ContentIdea[];
  setIdeas: (ideas: ContentIdea[]) => void;
  selectedIdeaIds: string[];
  toggleSelectIdea: (id: string) => void;
  selectAllIdeas: () => void;
  deselectAllIdeas: () => void;
  setSelectedIdeaIds: (ids: string[]) => void;

  // Status flags
  isGeneratingIdeas: boolean;
  setIsGeneratingIdeas: (val: boolean) => void;
  ideasError: string | null;
  setIdeasError: (err: string | null) => void;
  hasGeneratedIdeas: boolean;
  setHasGeneratedIdeas: (val: boolean) => void;

  // Content Intelligence & Inventory Gap Analysis
  intelligence: ContentIntelligence | null;
  setIntelligence: (val: ContentIntelligence | null) => void;
  isAnalyzingIntelligence: boolean;
  setIsAnalyzingIntelligence: (val: boolean) => void;

  // Step 2: Content Briefs (keyed by idea.id)
  briefs: Record<string, ContentBrief>;
  setBrief: (ideaId: string, brief: ContentBrief, overwrite?: boolean) => void;
  updateBriefField: <K extends keyof ContentBrief>(
    ideaId: string,
    field: K,
    value: ContentBrief[K]
  ) => void;

  // Multi-idea navigation index
  activeIdeaIndex: number;
  setActiveIdeaIndex: (index: number) => void;

  // Brief Generation Status
  isGeneratingBrief: boolean;
  setIsGeneratingBrief: (val: boolean) => void;
  briefError: string | null;
  setBriefError: (err: string | null) => void;

  // Step 3: Content Outlines (keyed by idea.id)
  outlines: Record<string, ContentOutline>;
  setOutline: (ideaId: string, outline: ContentOutline) => void;
  updateOutlineTitle: (ideaId: string, title: string) => void;
  updateOutlineIntroduction: (ideaId: string, intro: string) => void;
  updateOutlineConclusion: (ideaId: string, conclusion: string) => void;
  updateSectionHeading: (ideaId: string, sectionId: string, heading: string) => void;
  updateSectionPurpose: (ideaId: string, sectionId: string, purpose: string) => void;
  reorderSections: (ideaId: string, fromIndex: number, toIndex: number) => void;
  addSection: (ideaId: string, afterIndex?: number) => void;
  deleteSection: (ideaId: string, sectionId: string) => void;
  addKeyPoint: (ideaId: string, sectionId: string, pointText?: string) => void;
  updateKeyPoint: (ideaId: string, sectionId: string, pointIndex: number, text: string) => void;
  deleteKeyPoint: (ideaId: string, sectionId: string, pointIndex: number) => void;
  addFaqItem: (ideaId: string) => void;
  updateFaqItem: (ideaId: string, faqIndex: number, question: string, answerDirection: string) => void;
  deleteFaqItem: (ideaId: string, faqIndex: number) => void;

  // Outline Generation Status
  isGeneratingOutline: boolean;
  setIsGeneratingOutline: (val: boolean) => void;
  outlineError: string | null;
  setOutlineError: (err: string | null) => void;

  // Step 4: Article Writing Progress Stages
  writingStages: WritingStageStatus[];
  setWritingStages: (stages: WritingStageStatus[]) => void;
  updateWritingStage: (id: WritingStageId, update: Partial<WritingStageStatus>) => void;
  resetWritingStages: () => void;

  // System Categories (fetched from OpenIdear database)
  categories: string[];
  setCategories: (categories: string[]) => void;

  // Full reset
  resetStudio: () => void;
}

export const useContentStudioStore = create<ContentStudioState>((set, get) => ({
  step: "ideas",
  setStep: (step) => set({ step }),

  topic: "",
  setTopic: (topic) => set({ topic }),
  contentGoal: "seo",
  setContentGoal: (contentGoal) => set({ contentGoal }),
  numberOfIdeas: 10,
  setNumberOfIdeas: (numberOfIdeas) => set({ numberOfIdeas }),

  ideas: [],
  setIdeas: (ideas) => set({ ideas }),
  selectedIdeaIds: [],
  toggleSelectIdea: (id) =>
    set((state) => ({
      selectedIdeaIds: state.selectedIdeaIds.includes(id)
        ? state.selectedIdeaIds.filter((item) => item !== id)
        : [...state.selectedIdeaIds, id],
    })),
  selectAllIdeas: () =>
    set((state) => ({
      selectedIdeaIds: state.ideas.map((i) => i.id),
    })),
  deselectAllIdeas: () => set({ selectedIdeaIds: [] }),
  setSelectedIdeaIds: (selectedIdeaIds) => set({ selectedIdeaIds }),

  isGeneratingIdeas: false,
  setIsGeneratingIdeas: (isGeneratingIdeas) => set({ isGeneratingIdeas }),
  ideasError: null,
  setIdeasError: (ideasError) => set({ ideasError }),
  hasGeneratedIdeas: false,
  setHasGeneratedIdeas: (hasGeneratedIdeas) => set({ hasGeneratedIdeas }),

  intelligence: null,
  setIntelligence: (intelligence) => set({ intelligence }),
  isAnalyzingIntelligence: false,
  setIsAnalyzingIntelligence: (isAnalyzingIntelligence) => set({ isAnalyzingIntelligence }),

  briefs: {},
  setBrief: (ideaId, brief, overwrite = false) =>
    set((state) => {
      const existing = state.briefs[ideaId];
      if (!existing || overwrite) {
        return {
          briefs: { ...state.briefs, [ideaId]: brief },
        };
      }
      return {
        briefs: {
          ...state.briefs,
          [ideaId]: {
            ...brief,
            targetAudience: Array.from(
              new Set([
                ...(existing.targetAudience || []),
                ...(brief.targetAudience || []),
              ])
            ),
          },
        },
      };
    }),
  updateBriefField: (ideaId, field, value) =>
    set((state) => {
      const idea = state.ideas.find((i) => i.id === ideaId);
      const current: ContentBrief = state.briefs[ideaId] || {
        targetAudience: idea?.targetAudience ? [idea.targetAudience] : ["Beginner PC builders"],
        tone: "Practical",
        length: "Medium — 1,500–2,500 words",
        category: idea?.category || "Technology",
        objective: "Explain",
      };
      return {
        briefs: {
          ...state.briefs,
          [ideaId]: {
            ...current,
            [field]: value,
          },
        },
      };
    }),

  activeIdeaIndex: 0,
  setActiveIdeaIndex: (activeIdeaIndex) => set({ activeIdeaIndex }),

  isGeneratingBrief: false,
  setIsGeneratingBrief: (isGeneratingBrief) => set({ isGeneratingBrief }),
  briefError: null,
  setBriefError: (briefError) => set({ briefError }),

  outlines: {},
  setOutline: (ideaId, outline) =>
    set((state) => ({
      outlines: { ...state.outlines, [ideaId]: outline },
    })),

  updateOutlineTitle: (ideaId, title) =>
    set((state) => {
      const outline = state.outlines[ideaId];
      if (!outline) return state;
      return {
        outlines: {
          ...state.outlines,
          [ideaId]: { ...outline, title },
        },
      };
    }),

  updateOutlineIntroduction: (ideaId, intro) =>
    set((state) => {
      const outline = state.outlines[ideaId];
      if (!outline) return state;
      return {
        outlines: {
          ...state.outlines,
          [ideaId]: { ...outline, introduction: intro },
        },
      };
    }),

  updateOutlineConclusion: (ideaId, conclusion) =>
    set((state) => {
      const outline = state.outlines[ideaId];
      if (!outline) return state;
      return {
        outlines: {
          ...state.outlines,
          [ideaId]: { ...outline, conclusion },
        },
      };
    }),

  updateSectionHeading: (ideaId, sectionId, heading) =>
    set((state) => {
      const outline = state.outlines[ideaId];
      if (!outline) return state;
      return {
        outlines: {
          ...state.outlines,
          [ideaId]: {
            ...outline,
            sections: outline.sections.map((s) =>
              s.id === sectionId ? { ...s, heading } : s
            ),
          },
        },
      };
    }),

  updateSectionPurpose: (ideaId, sectionId, purpose) =>
    set((state) => {
      const outline = state.outlines[ideaId];
      if (!outline) return state;
      return {
        outlines: {
          ...state.outlines,
          [ideaId]: {
            ...outline,
            sections: outline.sections.map((s) =>
              s.id === sectionId ? { ...s, purpose } : s
            ),
          },
        },
      };
    }),

  reorderSections: (ideaId, fromIndex, toIndex) =>
    set((state) => {
      const outline = state.outlines[ideaId];
      if (!outline) return state;
      const sections = [...outline.sections];
      if (
        fromIndex < 0 ||
        fromIndex >= sections.length ||
        toIndex < 0 ||
        toIndex >= sections.length
      ) {
        return state;
      }
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      return {
        outlines: {
          ...state.outlines,
          [ideaId]: { ...outline, sections },
        },
      };
    }),

  addSection: (ideaId, afterIndex) =>
    set((state) => {
      const outline = state.outlines[ideaId];
      if (!outline) return state;
      const newSection = {
        id: `sec-${Math.random().toString(36).substring(2, 8)}`,
        heading: "New Section",
        purpose: "Explore additional critical insights and practical details.",
        keyPoints: ["Key discussion point", "Actionable guideline"],
      };
      const sections = [...outline.sections];
      if (typeof afterIndex === "number" && afterIndex >= 0) {
        sections.splice(afterIndex + 1, 0, newSection);
      } else {
        sections.push(newSection);
      }
      return {
        outlines: {
          ...state.outlines,
          [ideaId]: { ...outline, sections },
        },
      };
    }),

  deleteSection: (ideaId, sectionId) =>
    set((state) => {
      const outline = state.outlines[ideaId];
      if (!outline || outline.sections.length <= 1) return state;
      return {
        outlines: {
          ...state.outlines,
          [ideaId]: {
            ...outline,
            sections: outline.sections.filter((s) => s.id !== sectionId),
          },
        },
      };
    }),

  addKeyPoint: (ideaId, sectionId, pointText = "New key point or benchmark") =>
    set((state) => {
      const outline = state.outlines[ideaId];
      if (!outline) return state;
      return {
        outlines: {
          ...state.outlines,
          [ideaId]: {
            ...outline,
            sections: outline.sections.map((s) =>
              s.id === sectionId
                ? { ...s, keyPoints: [...s.keyPoints, pointText] }
                : s
            ),
          },
        },
      };
    }),

  updateKeyPoint: (ideaId, sectionId, pointIndex, text) =>
    set((state) => {
      const outline = state.outlines[ideaId];
      if (!outline) return state;
      return {
        outlines: {
          ...state.outlines,
          [ideaId]: {
            ...outline,
            sections: outline.sections.map((s) => {
              if (s.id !== sectionId) return s;
              const points = [...s.keyPoints];
              points[pointIndex] = text;
              return { ...s, keyPoints: points };
            }),
          },
        },
      };
    }),

  deleteKeyPoint: (ideaId, sectionId, pointIndex) =>
    set((state) => {
      const outline = state.outlines[ideaId];
      if (!outline) return state;
      return {
        outlines: {
          ...state.outlines,
          [ideaId]: {
            ...outline,
            sections: outline.sections.map((s) => {
              if (s.id !== sectionId) return s;
              return {
                ...s,
                keyPoints: s.keyPoints.filter((_, idx) => idx !== pointIndex),
              };
            }),
          },
        },
      };
    }),

  addFaqItem: (ideaId) =>
    set((state) => {
      const outline = state.outlines[ideaId];
      if (!outline) return state;
      const faq = [
        ...(outline.faq || []),
        {
          question: "New FAQ Question?",
          answerDirection: "Explain core resolution and practical action.",
        },
      ];
      return {
        outlines: {
          ...state.outlines,
          [ideaId]: { ...outline, faq },
        },
      };
    }),

  updateFaqItem: (ideaId, faqIndex, question, answerDirection) =>
    set((state) => {
      const outline = state.outlines[ideaId];
      if (!outline || !outline.faq) return state;
      const faq = [...outline.faq];
      faq[faqIndex] = { question, answerDirection };
      return {
        outlines: {
          ...state.outlines,
          [ideaId]: { ...outline, faq },
        },
      };
    }),

  deleteFaqItem: (ideaId, faqIndex) =>
    set((state) => {
      const outline = state.outlines[ideaId];
      if (!outline || !outline.faq) return state;
      return {
        outlines: {
          ...state.outlines,
          [ideaId]: {
            ...outline,
            faq: outline.faq.filter((_, idx) => idx !== faqIndex),
          },
        },
      };
    }),

  isGeneratingOutline: false,
  setIsGeneratingOutline: (isGeneratingOutline) => set({ isGeneratingOutline }),
  outlineError: null,
  setOutlineError: (outlineError) => set({ outlineError }),

  writingStages: INITIAL_WRITING_STAGES,
  setWritingStages: (writingStages) => set({ writingStages }),
  updateWritingStage: (id, update) =>
    set((state) => ({
      writingStages: state.writingStages.map((stage) =>
        stage.id === id ? { ...stage, ...update } : stage
      ),
    })),
  resetWritingStages: () => set({ writingStages: INITIAL_WRITING_STAGES }),

  categories: [],
  setCategories: (categories) => set({ categories }),

  resetStudio: () =>
    set({
      step: "ideas",
      topic: "",
      contentGoal: "seo",
      numberOfIdeas: 10,
      ideas: [],
      selectedIdeaIds: [],
      isGeneratingIdeas: false,
      ideasError: null,
      hasGeneratedIdeas: false,
      briefs: {},
      outlines: {},
      activeIdeaIndex: 0,
      isGeneratingBrief: false,
      briefError: null,
      isGeneratingOutline: false,
      outlineError: null,
      writingStages: INITIAL_WRITING_STAGES,
      intelligence: null,
      isAnalyzingIntelligence: false,
    }),
}));
