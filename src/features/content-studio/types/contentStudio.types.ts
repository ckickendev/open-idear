// =============================================================================
//  AI CONTENT STUDIO — DOMAIN TYPES
//  src/features/content-studio/types/contentStudio.types.ts
// =============================================================================

export type ContentGoal =
  | "seo"
  | "educational"
  | "thought_leadership"
  | "product"
  | "news";

export type ContentType =
  | "guide"
  | "comparison"
  | "tutorial"
  | "explainer"
  | "listicle"
  | "case_study"
  | "news";

export type ContentDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

export type SearchIntent =
  | "informational"
  | "commercial"
  | "transactional"
  | "navigational";

export type ContentRelationship =
  | "new_topic"
  | "supports_existing"
  | "comparison"
  | "follow_up"
  | "content_gap";

export type ContentRole = "pillar" | "supporting";

export interface DuplicateRisk {
  isDuplicateRisk: boolean;
  similarityScore: number;
  matchedArticleTitle?: string;
  matchedArticleSlug?: string;
  mitigationNote?: string;
}

export interface InternalLinkDetail {
  direction: "inbound" | "outbound" | "bidirectional";
  articleTitle: string;
  articleSlug: string;
  recommendedAnchorText: string;
  strategicReason: string;
}

export interface ClusterArticleNode {
  id: string;
  title: string;
  slug: string;
  role: ContentRole;
  status: "published" | "draft" | "gap" | "planned";
  recommendedNext?: boolean;
}

export interface ContentClusterSubtopic {
  name: string;
  articles: ClusterArticleNode[];
  coverageScore: number;
  nextLogicalArticle?: string;
  nextLogicalReason?: string;
}

export interface HierarchicalCluster {
  pillarDomain: string;
  subtopics: ContentClusterSubtopic[];
}

export interface TopicCoverage {
  overallScore: number;
  publishedCount: number;
  draftCount: number;
  gapCount: number;
  clusterHealth: string;
}

export interface NextLogicalRecommendation {
  articleTitle: string;
  clusterName: string;
  contentRole: ContentRole;
  rationale: string;
}

export interface ContentCluster {
  name: string;
  description?: string;
  existingArticles: string[];
  gapRecommendations: string[];
}

export interface InternalLinkOpportunity {
  sourceTitle: string;
  sourceSlug: string;
  recommendedAngle: string;
}

export interface ContentIntelligence {
  existingCount: number;
  summary: string;
  coveredTopics: string[];
  recommendedGaps: string[];
  clusters?: ContentCluster[];
  hierarchicalClusters?: HierarchicalCluster[];
  topicCoverage?: TopicCoverage;
  nextLogicalRecommendation?: NextLogicalRecommendation;
  internalLinkOpportunities?: InternalLinkOpportunity[];
  duplicateWarnings?: string[];
}

export interface ContentIdea {
  id: string;
  title: string;
  hook: string;
  contentType: ContentType;
  category: string;
  targetAudience: string;
  difficulty: ContentDifficulty;
  searchIntent: SearchIntent;
  keywords: string[];
  contentRelationship?: ContentRelationship;
  contentRole?: ContentRole;
  isNextLogicalArticle?: boolean;
  nextLogicalReason?: string;
  duplicateRisk?: DuplicateRisk;
  relatedArticleTitle?: string;
  relatedArticleSlug?: string;
  internalLinkOpportunity?: string;
  internalLinkingSuggestions?: InternalLinkDetail[];
}

export interface GenerateIdeasRequest {
  topic: string;
  contentGoal: ContentGoal;
  numberOfIdeas: number;
  existingCategories?: string[];
}

export interface GenerateIdeasResponse {
  ideas: ContentIdea[];
  intelligence?: ContentIntelligence;
  status?: string;
  error?: string;
}

export interface GoalOptionConfig {
  value: ContentGoal;
  label: string;
  description: string;
  iconName: string;
}

export const CONTENT_GOAL_CONFIGS: GoalOptionConfig[] = [
  {
    value: "seo",
    label: "SEO Growth",
    description: "Target high-intent search queries to rank and capture organic traffic",
    iconName: "TrendingUp",
  },
  {
    value: "educational",
    label: "Educational",
    description: "Deep dive explanations, conceptual breakdowns, and comprehensive guides",
    iconName: "GraduationCap",
  },
  {
    value: "thought_leadership",
    label: "Thought Leadership",
    description: "Provocative viewpoints, architectural debates, and future perspectives",
    iconName: "Sparkles",
  },
  {
    value: "product",
    label: "Product Content",
    description: "Practical product reviews, buying guides, and hands-on feature tours",
    iconName: "PackageCheck",
  },
  {
    value: "news",
    label: "News / Trends",
    description: "Breaking tech updates, industry developments, and ecosystem trends",
    iconName: "Flame",
  },
];

// ─── Content Brief (Sprint 2) ────────────────────────────────────────────────

export interface ContentBrief {
  targetAudience: string[];
  tone: string;
  length: string;
  category: string;
  objective: string;
}

export interface GenerateBriefRequest {
  idea: ContentIdea;
  existingCategories?: string[];
}

export interface GenerateBriefResponse {
  brief: ContentBrief;
  status?: string;
  error?: string;
}

export const TONE_OPTIONS = [
  "Practical",
  "Professional",
  "Beginner-friendly",
  "Technical",
  "Conversational",
  "Data-driven",
  "Opinionated",
  "Educational",
] as const;

export const LENGTH_OPTIONS = [
  "Short — 1,000–1,500 words",
  "Medium — 1,500–2,500 words",
  "Long — 2,500–3,500 words",
  "Deep Dive — 3,500–5,000 words",
] as const;

export const OBJECTIVE_OPTIONS = [
  "Explain",
  "Educate",
  "Compare",
  "Help users make a purchase decision",
  "Solve a technical problem",
  "Build topical authority",
  "Generate SEO traffic",
] as const;

export const DEFAULT_AUDIENCE_SUGGESTIONS = [
  "Beginner PC builders",
  "Intermediate gamers",
  "Developers",
  "Content creators",
  "AI enthusiasts",
  "System Architects",
  "Tech Enthusiasts",
] as const;

// ─── Outline & Writing Types ──────────────────────────────────────────────────

export interface OutlineSection {
  id: string;
  heading: string;
  purpose: string;
  keyPoints: string[];
}

export interface OutlineFaqItem {
  question: string;
  answerDirection: string;
}

export interface ContentOutline {
  title: string;
  introduction: string;
  sections: OutlineSection[];
  conclusion: string;
  faq?: OutlineFaqItem[];
}

export interface GenerateOutlineRequest {
  idea: ContentIdea;
  contentBrief: ContentBrief;
}

export interface GenerateOutlineResponse {
  outline: ContentOutline;
  status?: string;
  error?: string;
}

export type WritingStageId =
  | "brief"
  | "structure"
  | "writing"
  | "blocks"
  | "editor";

export interface WritingStageStatus {
  id: WritingStageId;
  label: string;
  status: "idle" | "running" | "completed" | "error";
  error?: string;
}

