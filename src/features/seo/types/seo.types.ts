// ─── Content Metrics ────────────────────────────────────────────────────────

export interface ContentMetrics {
  wordCount: number;
  characterCount: number;
  readingTime: number;
  headingCount: { h1: number; h2: number; h3: number };
  imageCount: number;
  linkCount: { internal: number; external: number };
  paragraphCount: number;
}

// ─── SEO Analysis ───────────────────────────────────────────────────────────

export type ScoreGrade = "A" | "B" | "C" | "D" | "F";
export type CheckStatus = "pass" | "warn" | "fail";

export interface ContentCheck {
  id: string;
  name: string;
  status: CheckStatus;
  message: string;
  weight: number;
  value?: number;
  target?: number;
}

export interface ScoreAnalysis {
  score: number;
  grade: ScoreGrade;
  checks: ContentCheck[];
}

// ─── Hook Return ────────────────────────────────────────────────────────────

export interface UseContentMetricsOptions {
  /** Debounce delay in ms for re-analysis. Default: 500 */
  debounceMs?: number;
}

export interface UseContentMetricsReturn {
  metrics: ContentMetrics;
  isAnalyzing: boolean;
}

// ─── SEO Analysis Input ─────────────────────────────────────────────────────

export interface SEOAnalysisInput {
  title: string;
  html: string;
  text: string;
  description: string;
  headings: { level: number; text: string }[];
  images: { src: string; alt: string }[];
  links: { href: string; text: string; isInternal: boolean }[];
}
