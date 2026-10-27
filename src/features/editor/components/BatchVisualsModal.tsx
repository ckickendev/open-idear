// =============================================================================
//  BATCH VISUALS MODAL — SPRINT 3: SEARCH ALL SUGGESTIONS & REVIEW WORKFLOW
//  src/features/editor/components/BatchVisualsModal.tsx
//
//  Design Decisions:
//  - Primary Action: "Find Images for All Visuals" with bounded concurrency (2)
//    and query deduplication.
//  - Live progress UI: processed, completed, with results, empty, already satisfied.
//  - Cooperative cancellation: author can cancel/stop batch search without losing results.
//  - Explicit review: NEVER auto-selects or auto-applies first-ranked candidates.
//  - Dismiss / restore per visual suggestion without modifying document.
//  - Handles existing images: "Keep existing image" vs "Replace image".
//  - Optional AI image fallback for suggestions with 0 stock results (explicit click only).
//  - Editor integrity: anchor validation, duplicate prevention, attribution preservation,
//    and safe undo/redo.
// =============================================================================

"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Sparkles,
  Search,
  CheckCircle2,
  X,
  RotateCw,
  Check,
  AlertCircle,
  ExternalLink,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  EyeOff,
  Eye,
  Wand2,
  StopCircle,
  RefreshCw,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  aiVisualApi,
  rankCandidateImages,
  type SectionAnalysis,
  type ImageSearchResult,
  type RankedCandidate,
} from "@/features/ai-visual";
import { toast } from "sonner";
import { normalizeMarkdownHeadings } from "@/features/ai/utils/markdownParser";
import {
  insertImageAtSectionAnchor,
  insertImageIntoTiptapAtAnchor,
} from "../utils/editorAnchorUtils";
import type { Editor } from "@tiptap/core";

export interface BatchVisualsModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
  onApplyResult: (updatedMarkdown: string) => void;
  postId?: string;
  editor?: Editor | null;
  onOpenAiFallback?: (params: { heading: string; query: string; visualType: string }) => void;
}

interface SectionVisualState {
  heading: string;
  level: number;
  reason: string;
  visualType: string;
  recommendedAction: string;
  isCompleted: boolean;
  isDismissed: boolean;
  searchQuery: string;
  isSearching: boolean;
  searchError: string | null;
  hasSearched: boolean;
  candidates: RankedCandidate[];
  selectedCandidate: RankedCandidate | null;
  altText: string;
  isExpanded: boolean;
  isApplied: boolean;
  isAiGenerating?: boolean;
}

interface BatchSearchProgress {
  isActive: boolean;
  processed: number;
  total: number;
  withResults: number;
  empty: number;
  failed: number;
  satisfied: number;
}

export function BatchVisualsModal({
  isOpen,
  onClose,
  markdown,
  onApplyResult,
  postId,
  editor,
  onOpenAiFallback,
}: BatchVisualsModalProps) {
  const [sections, setSections] = useState<SectionVisualState[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [currentMarkdown, setCurrentMarkdown] = useState(markdown);
  const [isApplyingAll, setIsApplyingAll] = useState(false);
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(new Set());

  // Batch search progress & cooperative cancellation
  const [batchProgress, setBatchProgress] = useState<BatchSearchProgress>({
    isActive: false,
    processed: 0,
    total: 0,
    withResults: 0,
    empty: 0,
    failed: 0,
    satisfied: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const queryCacheRef = useRef<Map<string, Promise<RankedCandidate[]>>>(new Map());

  // Synchronize initial markdown when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentMarkdown(markdown);
      queryCacheRef.current.clear();
      scanAndInitialize(markdown);
    } else {
      // Abort in-flight batch searches if modal is closed
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setBatchProgress((prev) => ({ ...prev, isActive: false }));
    }
  }, [isOpen, markdown]);

  // Fallback local extractor when server classification is unavailable or offline
  const extractLocalMarkdownSections = (docMarkdown: string): SectionAnalysis[] => {
    const lines = docMarkdown.split(/\r?\n/);
    const rawSections: SectionAnalysis[] = [];
    for (const line of lines) {
      const match = line.match(/^(#{1,4})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const heading = match[2].trim();
        const lower = heading.toLowerCase();
        const isProduct = lower.includes("spec") || lower.includes("device") || lower.includes("hardware") || lower.includes("phone");
        const isArchitecture = lower.includes("arch") || lower.includes("system") || lower.includes("overview") || lower.includes("design");
        const visualType = isProduct ? "product" : isArchitecture ? "diagram" : "illustration";

        rawSections.push({
          heading,
          level,
          content: "",
          isCompleted: false,
          existingImageUrls: [],
          recommendation: {
            heading,
            visualType,
            confidence: 0.85,
            recommendedAction: isProduct ? "search" : "generate",
            reason: `Visual suggestion for "${heading}".`,
            searchQuery: heading,
            suggestedSearchQuery: heading,
          },
        });
      }
    }

    // Filter out level-1 title if subheadings exist
    const results = rawSections.filter((s, idx) => {
      if (idx === 0 && s.level === 1 && rawSections.length > 1) {
        return false;
      }
      return true;
    });

    // If document has content but no markdown headings, provide an Overview section
    if (results.length === 0 && docMarkdown.trim().length > 0) {
      results.push({
        heading: "Overview",
        level: 1,
        content: docMarkdown.slice(0, 500),
        isCompleted: false,
        existingImageUrls: [],
        recommendation: {
          heading: "Overview",
          visualType: "diagram",
          confidence: 0.85,
          recommendedAction: "search",
          reason: "Visual suggestion for article overview.",
          searchQuery: "technology overview",
          suggestedSearchQuery: "technology overview",
        },
      });
    }

    return results;
  };

  // Scan article sections and initialize suggestion cards
  const scanAndInitialize = async (docMarkdown: string) => {
    if (!docMarkdown || !docMarkdown.trim()) {
      setSections([]);
      return;
    }

    setIsScanning(true);
    let analyses: SectionAnalysis[] = [];

    try {
      analyses = await aiVisualApi.classifyArticle(docMarkdown);
    } catch (err) {
      console.warn("[BatchVisualsModal] Remote article classification failed, using offline fallback:", err);
    }

    // If API returned empty or failed (e.g. offline/ethernet down), fallback to local markdown headings
    if (!analyses || analyses.length === 0) {
      analyses = extractLocalMarkdownSections(docMarkdown);
      if (analyses.length > 0) {
        toast.info("Offline mode: Loaded article headings locally.");
      }
    }

    try {
      const initialStates: SectionVisualState[] = analyses.map((sec) => {
        const rec = sec.recommendation;
        const initialQuery =
          rec.suggestedSearchQuery ||
          rec.searchQuery ||
          `${sec.heading} ${rec.visualType === "product" ? "hardware photo" : "architecture diagram"}`;

        return {
          heading: sec.heading,
          level: sec.level,
          reason: rec.reason || "Section visual recommendation.",
          visualType: rec.visualType || "diagram",
          recommendedAction: rec.recommendedAction || "search",
          isCompleted: sec.isCompleted,
          isDismissed: false,
          searchQuery: initialQuery,
          isSearching: false,
          searchError: null,
          hasSearched: false,
          candidates: [],
          selectedCandidate: null,
          altText: sec.heading || "Section Visual",
          isExpanded: !sec.isCompleted && rec.recommendation !== "NO_VISUAL" && rec.visualType !== "none",
          isApplied: false,
        };
      });

      setSections(initialStates);
    } catch (err) {
      console.error("[BatchVisualsModal] Initial state creation failed:", err);
      toast.error("Failed to analyze article structure.");
    } finally {
      setIsScanning(false);
    }
  };

  // Compute selected URLs across all sections to penalize cross-section duplicates
  const previouslySelectedUrls = useMemo(() => {
    return sections
      .map((s) => s.selectedCandidate?.imageUrl || s.selectedCandidate?.url)
      .filter((u): u is string => Boolean(u));
  }, [sections]);

  // Fetch and rank image candidates for a specific section on-demand
  const fetchCandidatesForSection = useCallback(
    async (
      sectionIndex: number,
      customQuery?: string,
      currentSectionsState?: SectionVisualState[]
    ) => {
      const sectionList = currentSectionsState || sections;
      const targetSec = sectionList[sectionIndex];
      if (!targetSec) return;

      const queryToSearch = (customQuery ?? targetSec.searchQuery).trim();
      if (!queryToSearch) return;

      setSections((prev) =>
        prev.map((s, idx) =>
          idx === sectionIndex
            ? { ...s, isSearching: true, searchError: null, searchQuery: queryToSearch }
            : s
        )
      );

      try {
        const rawResults = await aiVisualApi.searchImages(
          {
            query: queryToSearch,
            limit: 12,
            orientation: "landscape",
            context: {
              heading: targetSec.heading,
              visualType: targetSec.visualType,
              searchQuery: queryToSearch,
            },
          },
          12,
          1
        );

        const ranked = rankCandidateImages(rawResults, {
          heading: targetSec.heading,
          visualType: targetSec.visualType,
          searchQuery: queryToSearch,
          previouslySelectedUrls,
        });

        const topCandidates = ranked.slice(0, 6);

        setSections((prev) =>
          prev.map((s, idx) => {
            if (idx !== sectionIndex) return s;
            return {
              ...s,
              isSearching: false,
              hasSearched: true,
              searchError: null,
              candidates: topCandidates,
              altText: s.altText || targetSec.heading,
            };
          })
        );
      } catch (err: any) {
        console.error(`[BatchVisualsModal] Search failed for section ${targetSec.heading}:`, err);
        setSections((prev) =>
          prev.map((s, idx) =>
            idx === sectionIndex
              ? {
                  ...s,
                  isSearching: false,
                  hasSearched: true,
                  searchError: "Failed to search candidates. Click retry.",
                }
              : s
          )
        );
      }
    },
    [sections, previouslySelectedUrls]
  );

  // ─── Sprint 3: Primary Batch Search Action ─────────────────────────────────
  const handleFindImagesForAllVisuals = async () => {
    // 1. Identify eligible suggestions
    const eligibleIndices: number[] = [];
    let satisfiedCount = 0;

    sections.forEach((sec, idx) => {
      if (sec.isCompleted) {
        satisfiedCount++;
      } else if (!sec.isDismissed && sec.visualType !== "none" && sec.visualType !== "code") {
        eligibleIndices.push(idx);
      }
    });

    if (eligibleIndices.length === 0) {
      toast.info("All suggestions are already satisfied or dismissed.");
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setBatchProgress({
      isActive: true,
      processed: 0,
      total: eligibleIndices.length,
      withResults: 0,
      empty: 0,
      failed: 0,
      satisfied: satisfiedCount,
    });

    aiVisualApi.trackAnalytics({
      actionTaken: "batch_search_started",
      postId,
      metadata: {
        totalEligible: eligibleIndices.length,
        satisfiedCount,
      },
    });

    const CONCURRENCY_LIMIT = 2;
    let cursor = 0;
    let withResultsCount = 0;
    let emptyCount = 0;
    let failedCount = 0;

    const processSuggestion = async (idx: number) => {
      if (abortController.signal.aborted) return;
      const sec = sections[idx];
      if (!sec) return;

      const queryToSearch = (sec.searchQuery || sec.heading).trim();
      const cacheKey = `${queryToSearch.toLowerCase()}_landscape`;

      setSections((prev) =>
        prev.map((s, i) => (i === idx ? { ...s, isSearching: true, searchError: null } : s))
      );

      try {
        let fetchPromise = queryCacheRef.current.get(cacheKey);
        if (!fetchPromise) {
          fetchPromise = (async () => {
            const rawResults = await aiVisualApi.searchImages(
              {
                query: queryToSearch,
                limit: 12,
                orientation: "landscape",
                context: {
                  heading: sec.heading,
                  visualType: sec.visualType,
                  searchQuery: queryToSearch,
                },
              },
              12,
              1
            );

            return rankCandidateImages(rawResults, {
              heading: sec.heading,
              visualType: sec.visualType,
              searchQuery: queryToSearch,
              previouslySelectedUrls,
            });
          })();
          queryCacheRef.current.set(cacheKey, fetchPromise);
        }

        const ranked = await fetchPromise;
        if (abortController.signal.aborted) return;

        const topCandidates = ranked.slice(0, 6);

        if (topCandidates.length > 0) {
          withResultsCount++;
        } else {
          emptyCount++;
        }

        setSections((prev) =>
          prev.map((s, i) => {
            if (i !== idx) return s;
            return {
              ...s,
              isSearching: false,
              hasSearched: true,
              searchError: null,
              candidates: topCandidates,
              isExpanded: true,
            };
          })
        );
      } catch (err: any) {
        if (abortController.signal.aborted) return;
        failedCount++;
        console.error(`[BatchVisualsModal] Batch search failed for "${sec.heading}":`, err);
        setSections((prev) =>
          prev.map((s, i) =>
            i === idx
              ? {
                  ...s,
                  isSearching: false,
                  hasSearched: true,
                  searchError: "Failed to search candidates. Click retry.",
                }
              : s
          )
        );
      } finally {
        if (!abortController.signal.aborted) {
          setBatchProgress((prev) => ({
            ...prev,
            processed: prev.processed + 1,
            withResults: withResultsCount,
            empty: emptyCount,
            failed: failedCount,
          }));
        }
      }
    };

    // Bounded concurrency pool execution
    const worker = async () => {
      while (cursor < eligibleIndices.length && !abortController.signal.aborted) {
        const idx = eligibleIndices[cursor++];
        await processSuggestion(idx);
      }
    };

    const workerCount = Math.min(CONCURRENCY_LIMIT, eligibleIndices.length);
    const workers = Array.from({ length: workerCount }, () => worker());
    await Promise.all(workers);

    if (!abortController.signal.aborted) {
      setBatchProgress((prev) => ({ ...prev, isActive: false }));
      toast.success(
        `Batch search completed: ${withResultsCount} suggestions with results, ${emptyCount} empty.`
      );
      aiVisualApi.trackAnalytics({
        actionTaken: "batch_search_completed",
        postId,
        metadata: {
          totalProcessed: eligibleIndices.length,
          withResults: withResultsCount,
          empty: emptyCount,
          failed: failedCount,
        },
      });
    }
  };

  // Stop / Cancel running batch search
  const handleCancelBatchSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setBatchProgress((prev) => ({ ...prev, isActive: false }));
    setSections((prev) => prev.map((s) => ({ ...s, isSearching: false })));
    toast.info("Batch search stopped. Completed results preserved.");
  };

  // Select a candidate image for a section
  const handleSelectCandidate = (sectionIndex: number, candidate: RankedCandidate) => {
    setSections((prev) =>
      prev.map((s, idx) => {
        if (idx !== sectionIndex) return s;
        // Toggle selection if clicked again
        const nextCandidate = s.selectedCandidate?.id === candidate.id ? null : candidate;
        return {
          ...s,
          selectedCandidate: nextCandidate,
          altText: nextCandidate ? nextCandidate.alt || nextCandidate.title || s.heading : s.altText,
        };
      })
    );

    aiVisualApi.trackAnalytics({
      heading: sections[sectionIndex]?.heading,
      visualType: sections[sectionIndex]?.visualType,
      actionTaken: "candidate_selected",
      postId,
      metadata: {
        candidateId: candidate.id,
        provider: candidate.provider || candidate.sourceProvider,
      },
    });
  };

  // Toggle card expansion
  const toggleSectionExpand = (sectionIndex: number) => {
    setSections((prev) =>
      prev.map((s, idx) => (idx === sectionIndex ? { ...s, isExpanded: !s.isExpanded } : s))
    );
  };

  // Dismiss a visual suggestion
  const handleDismissSuggestion = (sectionIndex: number) => {
    const sec = sections[sectionIndex];
    setSections((prev) =>
      prev.map((s, idx) =>
        idx === sectionIndex
          ? { ...s, isDismissed: true, selectedCandidate: null, isExpanded: false }
          : s
      )
    );
    toast.info(`Dismissed suggestion for "${sec?.heading}".`);
    aiVisualApi.trackAnalytics({
      heading: sec?.heading,
      visualType: sec?.visualType,
      actionTaken: "suggestion_dismissed",
      postId,
    });
  };

  // Restore a dismissed suggestion
  const handleRestoreSuggestion = (sectionIndex: number) => {
    setSections((prev) =>
      prev.map((s, idx) =>
        idx === sectionIndex ? { ...s, isDismissed: false, isExpanded: true } : s
      )
    );
  };

  // Toggle replacing a completed section
  const handleToggleReplaceCompleted = (sectionIndex: number) => {
    setSections((prev) =>
      prev.map((s, idx) => {
        if (idx !== sectionIndex) return s;
        const willReplace = s.isCompleted;
        return {
          ...s,
          isCompleted: !s.isCompleted,
          isExpanded: willReplace,
        };
      })
    );
  };

  // Update alt text for a section
  const handleAltTextChange = (sectionIndex: number, alt: string) => {
    setSections((prev) =>
      prev.map((s, idx) => (idx === sectionIndex ? { ...s, altText: alt } : s))
    );
  };

  // Optional AI Fallback Action when stock search has 0 results
  const handleTriggerAiFallback = async (sectionIndex: number) => {
    const sec = sections[sectionIndex];
    if (!sec) return;

    if (onOpenAiFallback) {
      onOpenAiFallback({
        heading: sec.heading,
        query: sec.searchQuery,
        visualType: sec.visualType,
      });
      return;
    }

    setSections((prev) =>
      prev.map((s, idx) => (idx === sectionIndex ? { ...s, isAiGenerating: true } : s))
    );

    aiVisualApi.trackAnalytics({
      heading: sec.heading,
      visualType: sec.visualType,
      actionTaken: "ai_fallback_requested",
      postId,
    });

    try {
      const generated = await aiVisualApi.generateIllustration({
        prompt: `${sec.heading} technical illustration, clean vector graphic`,
        style: "technical_diagram",
        aspectRatio: "16:9",
      });

      if (generated?.url) {
        const candidate: RankedCandidate = {
          id: generated._id,
          imageUrl: generated.url,
          url: generated.url,
          thumbnailUrl: generated.thumbnailUrl || generated.url,
          title: `AI Illustration: ${sec.heading}`,
          alt: generated.alt || sec.heading,
          source: "ai_generated",
          provider: "OpenIdear AI",
          license: "Proprietary Generated",
          author: "OpenIdear AI Generator",
          relevanceScore: 95,
          relevanceReasons: ["AI Generated Fallback", "Section Context Match"],
        };

        setSections((prev) =>
          prev.map((s, idx) =>
            idx === sectionIndex
              ? {
                  ...s,
                  isAiGenerating: false,
                  candidates: [candidate, ...s.candidates],
                  selectedCandidate: candidate,
                }
              : s
          )
        );
        toast.success(`Generated AI illustration for "${sec.heading}"! Review and apply.`);
      }
    } catch (err: any) {
      console.error("[BatchVisualsModal] AI Fallback failed:", err);
      toast.error(err.message || "Failed to generate AI visual.");
      setSections((prev) =>
        prev.map((s, idx) => (idx === sectionIndex ? { ...s, isAiGenerating: false } : s))
      );
    }
  };

  // Apply single section visual to editor
  const handleApplySingleSection = async (sectionIndex: number) => {
    const sec = sections[sectionIndex];
    if (!sec || !sec.selectedCandidate) {
      toast.error("Please select an image candidate first.");
      return;
    }

    const candidate = sec.selectedCandidate;
    const alt = sec.altText || candidate.alt || sec.heading;

    try {
      let finalUrl = candidate.imageUrl || candidate.url;
      let finalAssetId: string | undefined = undefined;

      if (candidate.source !== "asset_library" && candidate.sourceUrl) {
        try {
          const imported = await aiVisualApi.importStockImage(candidate, alt);
          if (imported?.url) {
            finalUrl = imported.url;
            finalAssetId = imported._id;
          }
        } catch {
          finalUrl = candidate.imageUrl || candidate.url;
        }
      } else if (candidate.source === "asset_library") {
        finalAssetId = candidate.id;
      }

      const attribution = {
        author: candidate.author,
        attributionUrl: candidate.attributionUrl || candidate.sourceUrl,
        provider: candidate.provider || candidate.sourceProvider,
      };

      let tiptapSuccess = false;
      if (editor) {
        tiptapSuccess = insertImageIntoTiptapAtAnchor(
          editor,
          sec.heading,
          finalUrl,
          alt,
          finalAssetId,
          attribution
        );
      }

      const anchorResult = insertImageAtSectionAnchor(
        currentMarkdown,
        sec.heading,
        finalUrl,
        alt,
        attribution
      );

      if (anchorResult.success) {
        setCurrentMarkdown(anchorResult.updatedMarkdown);
        onApplyResult(anchorResult.updatedMarkdown);
      } else if (tiptapSuccess) {
        // Direct TipTap insertion succeeded even if markdown anchor string wasn't matched
      } else {
        toast.warning(
          anchorResult.reason || `Section heading "${sec.heading}" was not found in the editor.`
        );
        return;
      }

      setSections((prev) =>
        prev.map((s, idx) => (idx === sectionIndex ? { ...s, isApplied: true } : s))
      );

      toast.success(`Applied visual to "${sec.heading}"!`);

      aiVisualApi.trackAnalytics({
        heading: sec.heading,
        visualType: sec.visualType,
        actionTaken: "image_applied",
        postId,
        metadata: {
          provider: candidate.provider || candidate.sourceProvider,
          relevanceScore: candidate.relevanceScore,
          isDirectTiptap: tiptapSuccess,
        },
      });
    } catch (err: any) {
      console.error("[BatchVisualsModal] Single apply failed:", err);
      toast.error(err.message || "Failed to apply visual to section.");
    }
  };

  // Bulk Apply: ONLY for suggestions where author has explicitly selected a candidate
  const handleApplyAllSelected = async () => {
    const applicableSections = sections.filter(
      (s) => Boolean(s.selectedCandidate) && !s.isDismissed
    );

    if (applicableSections.length === 0) {
      toast.error("No candidate images have been selected. Review and choose images to apply.");
      return;
    }

    setIsApplyingAll(true);
    let workingMarkdown = currentMarkdown;
    let appliedCount = 0;

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      if (!sec.selectedCandidate || sec.isDismissed) continue;

      const candidate = sec.selectedCandidate;
      const alt = sec.altText || candidate.alt || sec.heading;

      try {
        let finalUrl = candidate.imageUrl || candidate.url;
        let finalAssetId: string | undefined = undefined;

        if (candidate.source !== "asset_library" && candidate.sourceUrl) {
          try {
            const imported = await aiVisualApi.importStockImage(candidate, alt);
            if (imported?.url) {
              finalUrl = imported.url;
              finalAssetId = imported._id;
            }
          } catch {
            finalUrl = candidate.imageUrl || candidate.url;
          }
        } else if (candidate.source === "asset_library") {
          finalAssetId = candidate.id;
        }

        const attribution = {
          author: candidate.author,
          attributionUrl: candidate.attributionUrl || candidate.sourceUrl,
          provider: candidate.provider || candidate.sourceProvider,
        };

        let tiptapSuccess = false;
        if (editor) {
          tiptapSuccess = insertImageIntoTiptapAtAnchor(
            editor,
            sec.heading,
            finalUrl,
            alt,
            finalAssetId,
            attribution
          );
        }

        const res = insertImageAtSectionAnchor(
          workingMarkdown,
          sec.heading,
          finalUrl,
          alt,
          attribution
        );
        if (res.success) {
          workingMarkdown = res.updatedMarkdown;
          appliedCount++;
        } else if (tiptapSuccess) {
          appliedCount++;
        }
      } catch (e) {
        console.warn(`[BatchVisualsModal] Failed applying ${sec.heading}:`, e);
      }
    }

    setIsApplyingAll(false);

    if (appliedCount > 0) {
      if (workingMarkdown !== currentMarkdown) {
        const normalized = normalizeMarkdownHeadings(workingMarkdown.trim());
        setCurrentMarkdown(normalized);
        onApplyResult(normalized);
      }
      setSections((prev) =>
        prev.map((s) => (s.selectedCandidate && !s.isDismissed ? { ...s, isApplied: true } : s))
      );
      toast.success(`Successfully applied ${appliedCount} visual${appliedCount > 1 ? "s" : ""} to the article!`);
      onClose();
    } else {
      toast.error("Could not find matching section anchors in the article document.");
    }
  };

  if (!isOpen) return null;

  const eligibleForBatchCount = sections.filter(
    (s) => !s.isCompleted && !s.isDismissed && s.visualType !== "none" && s.visualType !== "code"
  ).length;

  const selectedCount = sections.filter((s) => Boolean(s.selectedCandidate) && !s.isDismissed).length;
  const progressPercent = batchProgress.total > 0
    ? Math.round((batchProgress.processed / batchProgress.total) * 100)
    : 0;

  const getVisualTypeBadge = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "illustration":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      case "product":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "diagram":
        return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
      case "chart":
      case "infographic":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      default:
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in-50 duration-200">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white dark:bg-[#070B14] border border-zinc-200 dark:border-slate-800 shadow-2xl shadow-sky-950/40 flex flex-col max-h-[92vh]">
        {/* ── Modal Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-slate-800/80 shrink-0 bg-zinc-50/90 dark:bg-[#0A0F1D]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/25">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Smart Visual Assistant
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25">
                  Batch Search
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-slate-400">
                Search all visual suggestions in one operation, review candidates, and apply with editorial control
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-slate-200 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Modal Body ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
          {/* Primary Batch Action Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-cyan-500/10 border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-950 dark:text-sky-200">
                <Layers className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                <span>Search All Visual Suggestions in One Operation</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-slate-300">
                Discovers candidates for all {eligibleForBatchCount} eligible sections with bounded concurrency and rate limit protection.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {batchProgress.isActive ? (
                <button
                  type="button"
                  onClick={handleCancelBatchSearch}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>Stop Search</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFindImagesForAllVisuals}
                  disabled={isScanning || eligibleForBatchCount === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-white shadow-md shadow-sky-500/25 transition-all cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Find Images for All Visuals ({eligibleForBatchCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Live Progress Bar Card (shown when active) */}
          {batchProgress.isActive && (
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0E1424] border border-sky-500/40 shadow-xs space-y-2 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-900 dark:text-slate-100 flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-sky-500" />
                  <span>Searching: {batchProgress.processed} of {batchProgress.total} suggestions processed</span>
                </span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-xs">
                  {progressPercent}%
                </span>
              </div>

              {/* Visual Progress Track */}
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Progress Summary Metrics */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 dark:text-slate-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>{batchProgress.withResults} with results</span>
                </span>
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-slate-700" />
                <span>{batchProgress.empty} no results</span>
                {batchProgress.failed > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-slate-700" />
                    <span className="text-rose-500">{batchProgress.failed} failed</span>
                  </>
                )}
                {batchProgress.satisfied > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-slate-700" />
                    <span>{batchProgress.satisfied} already satisfied</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Section Suggestion Cards */}
          {isScanning ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <RotateCw className="w-6 h-6 animate-spin text-sky-500" />
              <p className="text-xs font-medium">Scanning article sections & structure...</p>
            </div>
          ) : sections.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 text-xs">
              No sections detected. Add headings (H2 / H3) in the editor to discover visuals.
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((sec, idx) => {
                const isSkippedType = sec.visualType === "none" || sec.visualType === "code";

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      sec.isDismissed
                        ? "bg-zinc-100/50 dark:bg-slate-900/30 border-zinc-200 dark:border-slate-800/60 opacity-60"
                        : sec.isApplied
                        ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 ring-1 ring-emerald-500/20"
                        : sec.selectedCandidate
                        ? "bg-white dark:bg-[#0E1424] border-sky-500/60 dark:border-sky-500/60 shadow-md shadow-sky-950/30 ring-1 ring-sky-500/30"
                        : "bg-zinc-50/80 dark:bg-[#0E1424] border-zinc-200 dark:border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    {/* Section Card Top Header */}
                    <div
                      onClick={() => !sec.isDismissed && toggleSectionExpand(idx)}
                      className={`flex items-center justify-between p-3.5 select-none ${
                        sec.isDismissed
                          ? "cursor-default"
                          : "cursor-pointer bg-zinc-100/60 dark:bg-[#121829] hover:bg-zinc-200/50 dark:hover:bg-[#182035] transition-colors border-b border-zinc-200/60 dark:border-slate-800/70"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-200 dark:bg-slate-800 text-zinc-700 dark:text-sky-400 border border-zinc-300/80 dark:border-slate-700 shrink-0">
                          H{sec.level}
                        </span>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-slate-100 truncate">
                            {sec.heading}
                          </h4>
                          <p className="text-[11px] text-zinc-500 dark:text-slate-400 truncate">
                            {sec.isDismissed
                              ? "Suggestion dismissed by author."
                              : sec.isCompleted
                              ? "Section already contains visual representation."
                              : sec.reason}
                          </p>
                        </div>
                      </div>

                      {/* Header Actions & Status Badges */}
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {sec.isDismissed ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreSuggestion(idx);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-zinc-200 dark:bg-slate-800 text-zinc-700 dark:text-slate-300 hover:bg-zinc-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Restore</span>
                          </button>
                        ) : sec.isApplied ? (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <Check className="w-3 h-3" />
                            Applied
                          </span>
                        ) : sec.isCompleted ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              Already Satisfied
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleReplaceCompleted(idx);
                              }}
                              className="px-2.5 py-0.5 rounded text-[10px] font-semibold text-sky-500 hover:underline cursor-pointer"
                            >
                              Replace Image
                            </button>
                          </div>
                        ) : isSkippedType ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-200 dark:bg-slate-800 text-zinc-600 dark:text-slate-400">
                            No Visual Needed
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {sec.selectedCandidate && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                1 Image Selected
                              </span>
                            )}

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getVisualTypeBadge(sec.visualType)}`}>
                              {sec.visualType}
                            </span>

                            {/* Dismiss Action Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDismissSuggestion(idx);
                              }}
                              title="Dismiss suggestion"
                              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-slate-200 hover:bg-zinc-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {!sec.isDismissed && (
                          <div className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-slate-200">
                            {sec.isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Section Detail: Query, Candidates Gallery, Alt Text */}
                    {sec.isExpanded && !sec.isDismissed && !isSkippedType && (
                      <div className="p-4 border-t border-zinc-200 dark:border-slate-800/80 space-y-3.5 bg-white dark:bg-[#0A0E1A] rounded-b-xl">
                        {/* Editable Search Query Bar */}
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={sec.searchQuery}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSections((prev) =>
                                  prev.map((s, i) => (i === idx ? { ...s, searchQuery: val } : s))
                                );
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  fetchCandidatesForSection(idx, sec.searchQuery);
                                }
                              }}
                              placeholder="Search images for this section..."
                              className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-50 dark:bg-[#121827] border border-zinc-200 dark:border-slate-700/80 rounded-xl text-zinc-900 dark:text-slate-100 placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 transition-colors"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => fetchCandidatesForSection(idx, sec.searchQuery)}
                            disabled={sec.isSearching}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-white shadow-sm shadow-sky-500/20 transition-all cursor-pointer shrink-0"
                          >
                            {sec.isSearching ? (
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Search className="w-3.5 h-3.5" />
                            )}
                            <span>Search Images</span>
                          </button>
                        </div>

                        {/* Candidates Gallery */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-600 dark:text-slate-300">
                            <span>Image Candidates ({sec.candidates.length}):</span>
                            <span className="text-[10px] text-zinc-400 dark:text-slate-500">
                              Click an image to review and select
                            </span>
                          </div>

                          {sec.isSearching ? (
                            <div className="py-8 flex flex-col items-center justify-center gap-2 text-zinc-400 text-xs">
                              <RotateCw className="w-4 h-4 animate-spin text-sky-500" />
                              <span className="text-slate-400">Searching and ranking candidates...</span>
                            </div>
                          ) : sec.searchError ? (
                            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between">
                              <span>{sec.searchError}</span>
                              <button
                                type="button"
                                onClick={() => fetchCandidatesForSection(idx, sec.searchQuery)}
                                className="font-semibold underline cursor-pointer"
                              >
                                Retry
                              </button>
                            </div>
                          ) : sec.candidates.length === 0 ? (
                            <div className="p-6 text-center bg-zinc-50/50 dark:bg-[#0E1322] rounded-xl border border-dashed border-zinc-200 dark:border-slate-800 space-y-2">
                              <p className="text-xs text-zinc-500 dark:text-slate-400">
                                {sec.hasSearched
                                  ? "No suitable stock images found for this query."
                                  : "Click 'Search Images' or run 'Find Images for All Visuals' to find photos."}
                              </p>

                              {/* Optional AI Fallback Action per Sprint 3 */}
                              {sec.hasSearched && (
                                <div className="pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleTriggerAiFallback(idx)}
                                    disabled={sec.isAiGenerating}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
                                  >
                                    {sec.isAiGenerating ? (
                                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Wand2 className="w-3.5 h-3.5" />
                                    )}
                                    <span>Generate with AI (Fallback)</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                              {sec.candidates.map((cand, cIdx) => {
                                const isSelected = sec.selectedCandidate?.id === cand.id;
                                const candUrl = cand.thumbnailUrl || cand.imageUrl || cand.url;
                                const isBroken = failedImageUrls.has(candUrl);

                                return (
                                  <div
                                    key={cand.id || cIdx}
                                    onClick={() => handleSelectCandidate(idx, cand)}
                                    className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all ${
                                      isSelected
                                        ? "ring-2 ring-sky-500 border-sky-500 shadow-md shadow-sky-500/25"
                                        : "border-zinc-200 dark:border-slate-800 hover:border-sky-500/60 bg-zinc-50 dark:bg-[#121827]"
                                    }`}
                                  >
                                    {/* Thumbnail Preview with Error Fallback */}
                                    <div className="aspect-video bg-zinc-100 dark:bg-slate-900 relative overflow-hidden flex items-center justify-center">
                                      {isBroken ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-zinc-400 dark:text-slate-500 gap-1 bg-zinc-100 dark:bg-slate-900 text-center select-none">
                                          <ImageIcon className="w-5 h-5 text-zinc-300 dark:text-slate-600" />
                                          <span className="text-[9px]">Preview unavailable</span>
                                        </div>
                                      ) : (
                                        <img
                                          src={candUrl}
                                          alt={cand.alt || cand.title || sec.heading}
                                          loading="lazy"
                                          onError={() => {
                                            setFailedImageUrls((prev) => new Set(prev).add(candUrl));
                                          }}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                      )}

                                      {/* Relevance Score Pill */}
                                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-black/75 backdrop-blur-xs text-sky-300">
                                        {cand.relevanceScore}%
                                      </div>

                                      {/* Selection Indicator Checkmark */}
                                      {isSelected && (
                                        <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-sky-500 text-white shadow-xs">
                                          <Check className="w-3 h-3 stroke-[3]" />
                                        </div>
                                      )}
                                    </div>

                                    {/* Card Metadata Info Bar */}
                                    <div className="p-2.5 bg-white dark:bg-[#121827] space-y-1 border-t border-zinc-100 dark:border-slate-800/80">
                                      <div className="flex items-center justify-between gap-1 text-[10px]">
                                        <span className="font-semibold text-zinc-700 dark:text-slate-200 truncate">
                                          {cand.author || "Stock Photo"}
                                        </span>
                                        <span className="text-zinc-400 dark:text-slate-500 text-[9px] shrink-0 uppercase font-mono">
                                          {cand.provider || cand.sourceProvider}
                                        </span>
                                      </div>

                                      {/* Dimensions, License Badge & External Attribution Link */}
                                      <div className="flex items-center justify-between text-[9px] text-zinc-400 dark:text-slate-500 pt-0.5 gap-1">
                                        <div className="flex items-center gap-1 min-w-0 truncate">
                                          <span>
                                            {cand.width && cand.height ? `${cand.width}×${cand.height}` : "HD"}
                                          </span>
                                          {cand.license && (
                                            <span className="px-1 py-0.2 rounded text-[8px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 uppercase">
                                              {cand.license}
                                            </span>
                                          )}
                                        </div>

                                        {(cand.attributionUrl || cand.sourceUrl) && (
                                          <a
                                            href={cand.attributionUrl || cand.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            title="View original on provider site"
                                            className="text-zinc-400 hover:text-sky-400 transition-colors inline-flex items-center gap-0.5 shrink-0"
                                          >
                                            <span>Source</span>
                                            <ExternalLink className="w-2.5 h-2.5" />
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Alt Text & Single Section Apply Footer */}
                        {sec.selectedCandidate && (
                          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-100 dark:border-slate-800/80">
                            <div className="flex-1 space-y-1">
                              <label className="text-[11px] font-semibold text-zinc-600 dark:text-slate-400">
                                Alt Text for Accessibility & SEO:
                              </label>
                              <input
                                type="text"
                                value={sec.altText}
                                onChange={(e) => handleAltTextChange(idx, e.target.value)}
                                placeholder="Describe what this visual illustrates..."
                                className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-[#121827] border border-zinc-200 dark:border-slate-700/80 rounded-lg text-zinc-900 dark:text-slate-100 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleApplySingleSection(idx)}
                              disabled={sec.isApplied}
                              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                                sec.isApplied
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-default"
                                  : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sm shadow-sky-500/20"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{sec.isApplied ? "Applied to Editor" : "Apply to Section"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Modal Footer Actions ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-zinc-200 dark:border-slate-800 shrink-0 bg-zinc-50/80 dark:bg-[#070B14]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 dark:text-slate-400 hidden sm:inline">
              {selectedCount} of {eligibleForBatchCount} visuals selected
            </span>

            {/* Bulk Action: Only enabled when author has explicitly selected candidates */}
            <button
              type="button"
              onClick={handleApplyAllSelected}
              disabled={isApplyingAll || selectedCount === 0}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {isApplyingAll ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Apply All Selected ({selectedCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
