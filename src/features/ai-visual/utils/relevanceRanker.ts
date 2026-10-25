// =============================================================================
//  CLIENT-SIDE RELEVANCE RANKER — SPRINT 2
//  src/features/ai-visual/utils/relevanceRanker.ts
//
//  Design Decisions:
//  - Enables instant, reactive re-ranking of image search candidates in the browser.
//  - Transparent scoring criteria (0..100) with explainable reasons.
//  - Ranks candidates by product/entity match, topic overlap, visual type suitability,
//    resolution, aspect ratio, and avoids cross-section duplicate images.
// =============================================================================

import type { ImageSearchResult } from "../types/aiVisual.types";

export interface ClientRankContext {
  heading?: string;
  articleTitle?: string;
  sectionContent?: string;
  visualType?: string;
  searchQuery?: string;
  previouslySelectedUrls?: string[];
}

export interface RankedCandidate extends ImageSearchResult {
  relevanceScore: number;
  relevanceReasons: string[];
}

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with",
  "by", "about", "of", "from", "is", "are", "was", "were", "be", "been", "this",
  "that", "these", "those", "how", "what", "why", "when", "where", "which",
  "vs", "versus", "top", "best", "review", "guide", "overview", "part", "step",
]);

function extractEntities(text: string): string[] {
  const normalized = text.toLowerCase();
  const entities: string[] = [];

  const patterns = [
    /\b(?:rtx\s*[0-9]{4}(?:\s*ti)?)\b/g,
    /\b(?:rx\s*[0-9]{4}(?:\s*xtx?|xt)?)\b/g,
    /\b(?:intel\s+core\s+i[3579]|core\s+i[3579]|i[3579]-[0-9]+k?)\b/g,
    /\b(?:ryzen\s*[0-9]|ryzen\s*[0-9]{4}x?(?:3d)?)\b/g,
    /\b(?:apple\s+m[1234](?:\s*max|\s*pro)?)\b/g,
    /\b(?:geforce|radeon|snapdragon|nvidia|amd|intel)\b/g,
    /\b(?:redis|kafka|postgresql|postgres|mongodb|mysql|sqlite)\b/g,
    /\b(?:docker|kubernetes|k8s|aws|azure|gcp|linux)\b/g,
    /\b(?:ddr[45]|motherboard|socket|pcie|vram|cpu|gpu)\b/g,
  ];

  for (const regex of patterns) {
    const matches = normalized.match(regex);
    if (matches) {
      for (const m of matches) {
        entities.push(m.trim().replace(/\s+/g, " "));
      }
    }
  }

  return Array.from(new Set(entities));
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function rankCandidateImages(
  candidates: ImageSearchResult[],
  context: ClientRankContext
): RankedCandidate[] {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return [];
  }

  const headingText = (context.heading || "").toLowerCase();
  const titleText = (context.articleTitle || "").toLowerCase();
  const vType = (context.visualType || "").toLowerCase();
  const contextEntities = extractEntities(`${headingText} ${titleText} ${context.searchQuery || ""}`);
  const headingKeywords = extractKeywords(headingText);

  const ranked = candidates.map((candidate): RankedCandidate => {
    let score = 40; // baseline
    const reasons: string[] = [];
    const corpus = `${candidate.title || ""} ${candidate.alt || ""} ${(candidate.tags || []).join(" ")}`.toLowerCase();

    // 1. Exact entity match (0..35 pts)
    if (contextEntities.length > 0) {
      let matched = false;
      for (const ent of contextEntities) {
        if (corpus.includes(ent)) {
          score += 35;
          reasons.push(`Exact match: ${ent}`);
          matched = true;
          break;
        }
      }
      if (!matched) {
        for (const ent of contextEntities) {
          const parts = ent.split(" ");
          if (parts.some((p) => corpus.includes(p) && p.length > 2)) {
            score += 15;
            reasons.push(`Entity related`);
            break;
          }
        }
      }
    }

    // 2. Keyword overlap (0..25 pts)
    let kwCount = 0;
    for (const kw of headingKeywords) {
      if (corpus.includes(kw)) kwCount++;
    }
    if (kwCount > 0) {
      score += Math.min(25, kwCount * 7);
      reasons.push(`${kwCount} keyword match${kwCount > 1 ? "es" : ""}`);
    }

    // 3. Visual type compatibility (-15..+20 pts)
    if (vType === "product" || vType === "search_image") {
      if (/\b(?:photography|photo|hardware|product|device|chassis|close[- ]up)\b/.test(corpus)) {
        score += 20;
        reasons.push("Authentic product photography");
      } else if (/\b(?:diagram|clipart|vector|sketch)\b/.test(corpus)) {
        score -= 15;
      }
    } else if (vType === "diagram") {
      if (/\b(?:diagram|architecture|topology|system|flow|network|database)\b/.test(corpus)) {
        score += 20;
        reasons.push("Technical architecture diagram");
      }
    } else if (vType === "chart") {
      if (/\b(?:benchmark|chart|metric|latency|throughput|performance|graph)\b/.test(corpus)) {
        score += 20;
        reasons.push("Benchmark metrics visualization");
      }
    } else if (vType === "screenshot") {
      if (/\b(?:screenshot|interface|ui|dashboard|screen|console)\b/.test(corpus)) {
        score += 20;
        reasons.push("Interface walkthrough");
      }
    }

    // 4. Resolution & Aspect Ratio (-20..+15 pts)
    const w = candidate.width || 0;
    const h = candidate.height || 0;
    if (w >= 1200) {
      score += 15;
      reasons.push("High resolution (>=1200px)");
    } else if (w >= 800) {
      score += 8;
    } else if (w > 0 && w < 400) {
      score -= 20;
    }

    if (w > 0 && h > 0) {
      const ratio = w / h;
      if (ratio >= 1.3 && ratio <= 1.85) {
        score += 5;
        reasons.push("Landscape format");
      }
    }

    // 5. Attribution & License (0..15 pts)
    if (candidate.author && candidate.attributionUrl) {
      score += 10;
      reasons.push(`Attribution: ${candidate.author}`);
    }
    if (candidate.license === "unsplash" || candidate.license === "pexels") {
      score += 5;
      reasons.push(`Free license (${candidate.license})`);
    }

    // 6. Cross-section duplicate penalty (-50 pts)
    if (context.previouslySelectedUrls && context.previouslySelectedUrls.length > 0) {
      const isDup = context.previouslySelectedUrls.some(
        (u) => u === candidate.imageUrl || u === candidate.url || u === candidate.sourceUrl
      );
      if (isDup) {
        score -= 50;
        reasons.push("Already selected in another section");
      }
    }

    const finalScore = Math.max(5, Math.min(100, Math.round(score)));

    return {
      ...candidate,
      relevanceScore: finalScore,
      relevanceReasons: reasons,
    };
  });

  ranked.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return (b.width || 0) - (a.width || 0);
  });

  return ranked;
}
