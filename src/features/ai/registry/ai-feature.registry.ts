// =============================================================================
//  FRONTEND AI FEATURE REGISTRY
//  src/features/ai/registry/ai-feature.registry.ts
//
//  Design Decisions:
//  - Provides client-side feature catalog for badges, tooltips, category grouping.
//  - Strictly TypeScript literal typed.
//  - Zero membership logic, zero billing, zero credit deductions.
// =============================================================================

import {
  type AIFeatureId,
  type AIFeatureCategory,
  type AIFeatureDefinition,
  AI_FEATURE_IDS,
  AI_FEATURE_CATEGORIES,
} from "../types/aiFeature.types";

export class ClientAIFeatureRegistry {
  private readonly features = new Map<AIFeatureId, AIFeatureDefinition>();
  private readonly aliasMap = new Map<string, AIFeatureId>();

  constructor() {
    this.registerDefaults();
    this.registerDefaultAliases();
  }

  get(id: AIFeatureId | string): AIFeatureDefinition {
    const feature = this.features.get(id as AIFeatureId);
    if (!feature) {
      throw new Error(`AI feature "${id}" is not registered.`);
    }
    return feature;
  }

  find(id: string): AIFeatureDefinition | undefined {
    return this.features.get(id as AIFeatureId);
  }

  has(id: string): boolean {
    return this.features.has(id as AIFeatureId);
  }

  getAll(): readonly AIFeatureDefinition[] {
    return Array.from(this.features.values());
  }

  getByCategory(category: AIFeatureCategory): readonly AIFeatureDefinition[] {
    return Array.from(this.features.values()).filter((f) => f.category === category);
  }

  resolve(aliasOrId: string): AIFeatureDefinition {
    const trimmed = (aliasOrId || "").trim();
    if (this.features.has(trimmed as AIFeatureId)) {
      return this.features.get(trimmed as AIFeatureId)!;
    }
    const canonical = this.aliasMap.get(trimmed.toLowerCase());
    if (canonical && this.features.has(canonical)) {
      return this.features.get(canonical)!;
    }
    throw new Error(`Unknown AI feature or alias: "${aliasOrId}".`);
  }

  private register(feature: AIFeatureDefinition): void {
    this.features.set(feature.id, Object.freeze({ ...feature }));
  }

  private registerDefaults(): void {
    const defaultFeatures: readonly AIFeatureDefinition[] = [
      {
        id: "rewrite",
        name: "Rewrite Content",
        description: "Rewrite selected text for enhanced clarity, conciseness, and narrative flow.",
        category: "editing",
        estimatedCreditCost: 5,
        telemetryKey: "ai.editing.rewrite",
        endpoint: "/api/editor/action",
        defaultModel: "fast",
      },
      {
        id: "improve_tone",
        name: "Improve Tone",
        description: "Adjust writing tone for target audience.",
        category: "editing",
        estimatedCreditCost: 5,
        telemetryKey: "ai.editing.improve_tone",
        endpoint: "/api/editor/action",
        defaultModel: "fast",
      },
      {
        id: "summarize",
        name: "Summarize Content",
        description: "Generate concise executive or tl;dr summaries.",
        category: "editing",
        estimatedCreditCost: 5,
        telemetryKey: "ai.editing.summarize",
        endpoint: "/api/editor/action",
        defaultModel: "fast",
      },
      {
        id: "faq_generation",
        name: "FAQ Generation",
        description: "Extract and formulate high-value Q&A pairs for reader engagement and SEO rich snippets.",
        category: "growth",
        estimatedCreditCost: 10,
        telemetryKey: "ai.growth.faq",
        endpoint: "/api/growth/task",
        defaultModel: "fast",
      },
      {
        id: "comparison_generation",
        name: "Comparison Generation",
        description: "Generate comprehensive markdown comparison tables comparing options or tools.",
        category: "growth",
        estimatedCreditCost: 15,
        telemetryKey: "ai.growth.comparison",
        endpoint: "/api/growth/task",
        defaultModel: "quality",
      },
      {
        id: "seo_outline",
        name: "SEO Outline Planner",
        description: "Analyze topic and search intent to formulate a structured article outline.",
        category: "authoring",
        estimatedCreditCost: 10,
        telemetryKey: "ai.authoring.outline",
        endpoint: "/ai/v1/planner",
        defaultModel: "quality",
      },
      {
        id: "research_topic",
        name: "Deep Topic Research",
        description: "Perform comprehensive background topic research and generate core insights.",
        category: "research",
        estimatedCreditCost: 20,
        telemetryKey: "ai.research.topic",
        defaultModel: "quality",
      },
      {
        id: "publish_by_ai",
        name: "Multi-Agent Publisher",
        description: "Autonomous multi-agent pipeline generating research, outline, sections, and cover image.",
        category: "publishing",
        estimatedCreditCost: 40,
        telemetryKey: "ai.publishing.publish_by_ai",
        endpoint: "/ai/v1/publisher/generate",
        defaultModel: "quality",
      },
      {
        id: "article_writer",
        name: "Article Section Writer",
        description: "Draft comprehensive article sections based on structured outline.",
        category: "authoring",
        estimatedCreditCost: 25,
        telemetryKey: "ai.authoring.writer",
        endpoint: "/ai/v1/writer",
        defaultModel: "quality",
      },
      {
        id: "article_writer_stream",
        name: "Streaming Article Writer",
        description: "Stream generated article content in real-time chunk-by-chunk.",
        category: "authoring",
        estimatedCreditCost: 25,
        telemetryKey: "ai.authoring.writer_stream",
        endpoint: "/ai/v1/writer/stream",
        defaultModel: "quality",
      },
      {
        id: "content_structure",
        name: "Content Structure Pass",
        description: "Parse markdown text into rich structured content blocks.",
        category: "publishing",
        estimatedCreditCost: 5,
        telemetryKey: "ai.publishing.structure",
        endpoint: "/ai/v1/structure",
        defaultModel: "fast",
      },
      {
        id: "continue",
        name: "Continue Writing",
        description: "Seamlessly predict and compose the next sentences.",
        category: "editing",
        estimatedCreditCost: 5,
        telemetryKey: "ai.editing.continue",
        endpoint: "/api/editor/action",
        defaultModel: "fast",
      },
      {
        id: "improve",
        name: "Polish & Improve",
        description: "Fix grammar, enhance vocabulary, and polish phrasing.",
        category: "editing",
        estimatedCreditCost: 5,
        telemetryKey: "ai.editing.improve",
        endpoint: "/api/editor/action",
        defaultModel: "fast",
      },
      {
        id: "example",
        name: "Generate Example",
        description: "Build an illustrative text or code block based on text details.",
        category: "editing",
        estimatedCreditCost: 8,
        telemetryKey: "ai.editing.example",
        endpoint: "/api/editor/action",
        defaultModel: "fast",
      },
      {
        id: "review",
        name: "Editorial Peer Review",
        description: "Generate a complete peer review audit checklist and suggestions report.",
        category: "editing",
        estimatedCreditCost: 15,
        telemetryKey: "ai.editing.review",
        endpoint: "/api/editor/action",
        defaultModel: "quality",
      },
      {
        id: "shorten",
        name: "Shorten Block",
        description: "Condense selected paragraph while strictly preserving core meaning.",
        category: "editing",
        estimatedCreditCost: 4,
        telemetryKey: "ai.editing.shorten",
        endpoint: "/api/editor/action",
        defaultModel: "fast",
      },
      {
        id: "expand",
        name: "Expand Block",
        description: "Elaborate on concept with additional depth and examples.",
        category: "editing",
        estimatedCreditCost: 6,
        telemetryKey: "ai.editing.expand",
        endpoint: "/api/editor/action",
        defaultModel: "fast",
      },
      {
        id: "internal_links",
        name: "Internal Link Discovery",
        description: "Discover and insert contextual anchor cross-links.",
        category: "growth",
        estimatedCreditCost: 8,
        telemetryKey: "ai.growth.internal_links",
        endpoint: "/ai/v1/internal-link",
        defaultModel: "fast",
      },
      {
        id: "social_post",
        name: "Social Post Repurposing",
        description: "Generate social media posts distilled from article insights.",
        category: "growth",
        estimatedCreditCost: 8,
        telemetryKey: "ai.growth.social_post",
        endpoint: "/api/growth/task",
        defaultModel: "fast",
      },
      {
        id: "affiliate",
        name: "Affiliate Opportunity",
        description: "Identify product recommendation touchpoints.",
        category: "growth",
        estimatedCreditCost: 10,
        telemetryKey: "ai.growth.affiliate",
        endpoint: "/api/growth/task",
        defaultModel: "fast",
      },
      {
        id: "content_gap",
        name: "Content Gap Analysis",
        description: "Detect missing subtopics and competitive coverage gaps.",
        category: "growth",
        estimatedCreditCost: 12,
        telemetryKey: "ai.growth.content_gap",
        endpoint: "/api/growth/task",
        defaultModel: "quality",
      },
      {
        id: "publish_metadata",
        name: "Metadata Extraction",
        description: "Generate optimized title, excerpt, and meta descriptions.",
        category: "publishing",
        estimatedCreditCost: 5,
        telemetryKey: "ai.publishing.metadata",
        endpoint: "/api/publishing/task",
        defaultModel: "fast",
      },
      {
        id: "publish_review",
        name: "Preflight Quality Review",
        description: "Audit draft completeness, formatting adherence, and readiness.",
        category: "publishing",
        estimatedCreditCost: 8,
        telemetryKey: "ai.publishing.review",
        endpoint: "/api/publishing/task",
        defaultModel: "quality",
      },
      {
        id: "publish_seo",
        name: "Preflight SEO Audit",
        description: "Analyze keyword density, heading hierarchy, and readability.",
        category: "publishing",
        estimatedCreditCost: 8,
        telemetryKey: "ai.publishing.seo",
        endpoint: "/api/publishing/task",
        defaultModel: "fast",
      },
      {
        id: "publish_category",
        name: "Category Matcher",
        description: "Classify draft into the most accurate taxonomy category.",
        category: "publishing",
        estimatedCreditCost: 3,
        telemetryKey: "ai.publishing.category",
        endpoint: "/api/publishing/task",
        defaultModel: "fast",
      },
      {
        id: "publisher_cover_image",
        name: "Publisher Cover Image",
        description: "Synthesize tailored 16:9 banner prompt and trigger generation.",
        category: "publishing",
        estimatedCreditCost: 20,
        telemetryKey: "ai.publishing.cover_image",
        endpoint: "/ai/v1/publisher/cover-image",
        defaultModel: "fast",
      },
      {
        id: "image_generation",
        name: "AI Image Generation",
        description: "Generate original high-resolution visual illustrations.",
        category: "media",
        estimatedCreditCost: 20,
        telemetryKey: "ai.media.image_generation",
        endpoint: "/ai/v1/image/generate",
        defaultModel: "fast",
      },
      {
        id: "image_editing",
        name: "AI Image Editing",
        description: "Perform generative inpainting, smart resizing, and style transfer.",
        category: "media",
        estimatedCreditCost: 20,
        telemetryKey: "ai.media.image_editing",
        endpoint: "/ai/v1/image/edit",
        defaultModel: "fast",
      },
      {
        id: "diagram_generation",
        name: "Mermaid Diagram Studio",
        description: "Synthesize syntactically valid Mermaid diagrams.",
        category: "media",
        estimatedCreditCost: 10,
        telemetryKey: "ai.media.diagram",
        endpoint: "/ai/v1/diagram/generate",
        defaultModel: "fast",
      },
      {
        id: "content_enhancement",
        name: "Content Enhancement Pass",
        description: "Refine draft formatting and clarity across complete article text.",
        category: "media",
        estimatedCreditCost: 15,
        telemetryKey: "ai.media.content_enhance",
        endpoint: "/ai/v1/enhance",
        defaultModel: "quality",
      },
      {
        id: "image_enhancement",
        name: "Image Enhancement Pass",
        description: "Analyze embedded article media, optimize alt texts, and upscale.",
        category: "media",
        estimatedCreditCost: 15,
        telemetryKey: "ai.media.image_enhance",
        endpoint: "/ai/v1/enhance-images",
        defaultModel: "quality",
      },
    ];

    for (const feature of defaultFeatures) {
      this.register(feature);
    }
  }

  private registerDefaultAliases(): void {
    const aliases: Array<[string, AIFeatureId]> = [
      ["faq", "faq_generation"],
      ["comparison_table", "comparison_generation"],
      ["metadata", "publish_metadata"],
      ["planner", "seo_outline"],
      ["writer", "article_writer"],
      ["publisher", "publish_by_ai"],
    ];
    for (const [alias, canonicalId] of aliases) {
      this.aliasMap.set(alias.toLowerCase().trim(), canonicalId);
    }
  }
}

export const clientAIFeatureRegistry = new ClientAIFeatureRegistry();
export {
  type AIFeatureId,
  type AIFeatureCategory,
  type AIFeatureDefinition,
  AI_FEATURE_IDS,
  AI_FEATURE_CATEGORIES,
};
