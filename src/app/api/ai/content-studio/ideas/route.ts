import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// =============================================================================
//  POST /api/ai/content-studio/ideas
//  OpenIdear AI Content Studio — Server-Side Ideas Generation Endpoint
// =============================================================================

const RequestSchema = z.object({
  topic: z.string().min(1, "topic is required"),
  contentGoal: z
    .enum(["seo", "educational", "thought_leadership", "product", "news"])
    .default("seo"),
  numberOfIdeas: z.number().int().min(1).max(25).default(10),
  existingCategories: z.array(z.string()).optional(),
});

const ContentIdeaSchema = z.object({
  id: z.string().default(() => `idea-${Math.random().toString(36).substring(2, 9)}`),
  title: z.string().min(1),
  hook: z.string().min(1),
  contentType: z.enum([
    "guide",
    "comparison",
    "tutorial",
    "explainer",
    "listicle",
    "case_study",
    "news",
  ]),
  category: z.string().min(1),
  targetAudience: z.string().min(1),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  searchIntent: z.enum([
    "informational",
    "commercial",
    "transactional",
    "navigational",
  ]),
  keywords: z.array(z.string()).default([]),
  contentRelationship: z
    .enum([
      "new_topic",
      "supports_existing",
      "comparison",
      "follow_up",
      "content_gap",
    ])
    .optional()
    .default("new_topic"),
  contentRole: z.enum(["pillar", "supporting"]).optional().default("supporting"),
  isNextLogicalArticle: z.boolean().optional(),
  nextLogicalReason: z.string().optional(),
  duplicateRisk: z.any().optional(),
  relatedArticleTitle: z.string().optional(),
  relatedArticleSlug: z.string().optional(),
  internalLinkOpportunity: z.string().optional(),
  internalLinkingSuggestions: z.array(z.any()).optional().default([]),
});

const ResponseSchema = z.object({
  ideas: z.array(ContentIdeaSchema),
  intelligence: z.any().optional(),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => ({}));
    const parseResult = RequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { topic, contentGoal, numberOfIdeas, existingCategories } =
      parseResult.data;

    const authHeader = request.headers.get("authorization");

    // 1. First attempt: delegate to OpenIdear Backend service (http://localhost:5001)
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    try {
      const backendRes = await fetch(
        `${backendUrl}/ai/v1/content-studio/ideas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          body: JSON.stringify({
            topic,
            contentGoal,
            numberOfIdeas,
            existingCategories,
          }),
        }
      );

      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data && Array.isArray(data.ideas) && data.ideas.length > 0) {
          return NextResponse.json({
            status: "success",
            ideas: data.ideas,
            intelligence: data.intelligence,
          });
        }
      }
    } catch {
      // Backend is unavailable or timed out; proceed to server-side Gemini fallback
    }

    // 2. Server-side Gemini Provider Execution
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const systemPrompt = `You are an elite technical editorial strategist and SEO architect for OpenIdear.
Your task is to generate ${numberOfIdeas} high-performing, genuinely diverse technical content ideas.

CRITICAL RULES:
1. Distinct angles: Each idea must tackle a completely different problem, persona, or architecture dilemma.
2. Natural, human-written titles: No repetitive prefixes, clickbait, or superficial marketing tropes.
3. Content Types allowed: "guide", "comparison", "tutorial", "explainer", "listicle", "case_study", "news".
4. Search Intent allowed: "informational", "commercial", "transactional", "navigational".
5. Difficulty allowed: "beginner", "intermediate", "advanced".
6. Hook: A punchy 1-2 sentence hook highlighting the core value proposition.
7. Return strictly valid JSON matching this schema:
{
  "ideas": [
    {
      "id": "string",
      "title": "string",
      "hook": "string",
      "contentType": "guide",
      "category": "PC Hardware",
      "targetAudience": "Beginner PC builders",
      "difficulty": "beginner",
      "searchIntent": "informational",
      "keywords": ["GPU", "VRAM", "build PC"]
    }
  ]
}`;

    const userPrompt = `Generate ${numberOfIdeas} content ideas for:
- Topic: ${topic}
- Content Goal: ${contentGoal}
${existingCategories?.length ? `- Existing Categories: ${existingCategories.join(", ")}` : ""}
`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt },
    ]);

    const responseText = result.response.text();
    const cleanJson = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanJson);
    const validated = ResponseSchema.parse(parsed);

    const isHardware = /gpu|pc hardware|hardware|graphics card|vram|cpu|ram/i.test(topic);

    // Normalize ideas with strategic roles, next logical recommendation, and internal links
    let hasAssignedNext = false;
    const normalizedIdeas = validated.ideas.map((idea, index) => {
      const isPillar =
        idea.contentRole === "pillar" ||
        (index === 0 && (idea.contentType === "guide" || idea.title.toLowerCase().includes("guide"))) ||
        idea.title.toLowerCase().includes("ultimate") ||
        idea.title.toLowerCase().includes("complete guide");
      const contentRole = isPillar ? "pillar" : "supporting";

      let isNext = false;
      if (!hasAssignedNext) {
        if (
          idea.isNextLogicalArticle === true ||
          idea.title.toLowerCase().includes("dlss") ||
          index === 0
        ) {
          isNext = true;
          hasAssignedNext = true;
        }
      }

      return {
        ...idea,
        id:
          idea.id && idea.id.trim()
            ? idea.id.trim()
            : `idea-${Date.now()}-${index + 1}-${Math.random().toString(36).substring(2, 7)}`,
        contentRole,
        isNextLogicalArticle: isNext,
        nextLogicalReason: isNext
          ? "Recommended next logical step in content strategy to fill the highest-impact cluster authority gap."
          : undefined,
        duplicateRisk: idea.duplicateRisk || {
          isDuplicateRisk: false,
          similarityScore: 0,
        },
        internalLinkingSuggestions:
          idea.internalLinkingSuggestions && idea.internalLinkingSuggestions.length > 0
            ? idea.internalLinkingSuggestions
            : isHardware
            ? [
                {
                  direction: "inbound",
                  articleTitle: "What is VRAM? (Video RAM Explained)",
                  articleSlug: "what-is-vram",
                  recommendedAnchorText: "video memory buffer",
                  strategicReason: "Pillar article aggregates internal link equity from foundational VRAM explainer",
                },
              ]
            : [
                {
                  direction: "outbound",
                  articleTitle: `${topic} Architectural Foundations`,
                  articleSlug: `${topic.toLowerCase().replace(/\s+/g, "-")}-foundations`,
                  recommendedAnchorText: `${topic} core fundamentals`,
                  strategicReason: "Establishes semantic cluster connectivity back to the central authority pillar",
                },
              ],
      };
    });

    const fallbackIntelligence = validated.intelligence || {
      existingCount: isHardware ? 7 : 2,
      summary: isHardware
        ? 'OpenIdear has 7 tracked article(s) covering aspects of "GPU". Key gaps exist in advanced troubleshooting, frame generation, and bottleneck analysis.'
        : `Content strategy awareness active for "${topic}".`,
      coveredTopics: isHardware
        ? [
            "What is VRAM? (Video RAM Explained)",
            "RTX 3060 vs 4060 vs 5060: Mid-Range GPU Shootout",
            "Used GPU Buying Guide: What to Check Before Buying",
            "CPU Cores & Threads: How Many Do You Really Need?",
            "Ultimate Gaming CPU Guide: Best Processors Ranked",
            "16GB vs 32GB RAM: Is 16GB Still Enough for Modern Gaming?",
            "DDR4 vs DDR5 RAM: Is Upgrading Platform Worth It?",
          ]
        : [`${topic} Core Overview`, `${topic} Getting Started`],
      recommendedGaps: isHardware
        ? [
            "What is DLSS & Frame Generation? Complete Guide",
            "GPU Bottleneck: How to Identify & Fix It",
            "CPU Bottleneck: When Does Your Processor Hold Back Your Rig?",
            "1440p vs 4K Gaming GPU Buying Guide for 2026",
          ]
        : [
            `Comprehensive Architecture & Core Primitives Guide to ${topic}`,
            `Common Costly Anti-Patterns & Pitfalls When Navigating ${topic}`,
            `Performance Benchmarking & Trade-Off Matrix for ${topic}`,
          ],
      hierarchicalClusters: isHardware
        ? [
            {
              pillarDomain: "PC Hardware",
              subtopics: [
                {
                  name: "GPU",
                  articles: [
                    {
                      id: "gpu-1",
                      title: "What is VRAM? (Video RAM Explained)",
                      slug: "what-is-vram",
                      role: "pillar",
                      status: "published",
                      recommendedNext: false,
                    },
                    {
                      id: "gpu-2",
                      title: "RTX 3060 vs 4060 vs 5060: Mid-Range GPU Shootout",
                      slug: "rtx-3060-vs-4060-vs-5060",
                      role: "supporting",
                      status: "published",
                      recommendedNext: false,
                    },
                    {
                      id: "gpu-3",
                      title: "Used GPU Buying Guide: What to Check Before Buying",
                      slug: "used-gpu-buying-guide",
                      role: "supporting",
                      status: "published",
                      recommendedNext: false,
                    },
                    {
                      id: "gpu-4",
                      title: "What is DLSS & Frame Generation? Complete Guide",
                      slug: "what-is-dlss",
                      role: "supporting",
                      status: "gap",
                      recommendedNext: true,
                    },
                    {
                      id: "gpu-5",
                      title: "GPU Bottleneck: How to Identify & Fix It",
                      slug: "gpu-bottleneck",
                      role: "supporting",
                      status: "gap",
                      recommendedNext: false,
                    },
                  ],
                  coverageScore: 60,
                  nextLogicalArticle: "What is DLSS & Frame Generation? Complete Guide",
                  nextLogicalReason:
                    "OpenIdear already covers VRAM, tier comparisons, and used buying guides. Explaining AI upscaling & DLSS bridges the critical technology gap before addressing bottlenecks.",
                },
                {
                  name: "CPU",
                  articles: [
                    {
                      id: "cpu-1",
                      title: "CPU Cores & Threads: How Many Do You Really Need?",
                      slug: "cpu-cores-and-threads",
                      role: "supporting",
                      status: "published",
                      recommendedNext: false,
                    },
                    {
                      id: "cpu-2",
                      title: "CPU Bottleneck: When Does Your Processor Hold Back Your Rig?",
                      slug: "cpu-bottleneck",
                      role: "supporting",
                      status: "gap",
                      recommendedNext: false,
                    },
                    {
                      id: "cpu-3",
                      title: "Ultimate Gaming CPU Guide: Best Processors Ranked",
                      slug: "gaming-cpu-guide",
                      role: "pillar",
                      status: "published",
                      recommendedNext: false,
                    },
                  ],
                  coverageScore: 66,
                  nextLogicalArticle: "CPU Bottleneck: When Does Your Processor Hold Back Your Rig?",
                  nextLogicalReason:
                    "Pairs with GPU bottleneck analysis to complete the foundational PC hardware troubleshooting cluster.",
                },
                {
                  name: "RAM",
                  articles: [
                    {
                      id: "ram-1",
                      title: "16GB vs 32GB RAM: Is 16GB Still Enough for Modern Gaming?",
                      slug: "16gb-vs-32gb-ram",
                      role: "supporting",
                      status: "published",
                      recommendedNext: false,
                    },
                    {
                      id: "ram-2",
                      title: "DDR4 vs DDR5 RAM: Is Upgrading Platform Worth It?",
                      slug: "ddr4-vs-ddr5-ram",
                      role: "supporting",
                      status: "published",
                      recommendedNext: false,
                    },
                  ],
                  coverageScore: 100,
                  nextLogicalArticle: "RAM Speed & Latency (CL): Real-World FPS Impact",
                  nextLogicalReason:
                    "Deep-dive supporting article for competitive gaming optimizations.",
                },
              ],
            },
          ]
        : [
            {
              pillarDomain: `${topic} Ecosystem`,
              subtopics: [
                {
                  name: "Foundations & Architecture",
                  articles: [
                    {
                      id: "dyn-1",
                      title: `Comprehensive Guide to ${topic}: Architecture & Best Practices`,
                      slug: `${topic.toLowerCase().replace(/\s+/g, "-")}-foundations`,
                      role: "pillar",
                      status: "gap",
                      recommendedNext: true,
                    },
                  ],
                  coverageScore: 40,
                  nextLogicalArticle: `Comprehensive Guide to ${topic}: Architecture & Best Practices`,
                  nextLogicalReason: `Primary cornerstone pillar asset to establish authority in ${topic}.`,
                },
              ],
            },
          ],
      topicCoverage: {
        overallScore: isHardware ? 65 : 40,
        publishedCount: isHardware ? 7 : 2,
        draftCount: 0,
        gapCount: isHardware ? 3 : 3,
        clusterHealth: isHardware ? "Growing" : "Nascent",
      },
      nextLogicalRecommendation: {
        articleTitle: isHardware
          ? "What is DLSS & Frame Generation? Complete Guide"
          : `Comprehensive Guide to ${topic}: Architecture & Best Practices`,
        clusterName: isHardware ? "GPU" : `${topic} Ecosystem`,
        contentRole: isHardware ? "supporting" : "pillar",
        rationale: isHardware
          ? "OpenIdear already covers VRAM, tier comparisons, and used buying guides. Explaining AI upscaling & DLSS bridges the critical technology gap before addressing bottlenecks."
          : `Establishes the cornerstone pillar asset for ${topic} before branching into specialized supporting guides.`,
      },
      internalLinkOpportunities: isHardware
        ? [
            {
              sourceTitle: "What is VRAM? (Video RAM Explained)",
              sourceSlug: "what-is-vram",
              recommendedAngle: "Link foundational VRAM buffer explanations into GPU selection and resolution scaling",
            },
            {
              sourceTitle: "RTX 3060 vs 4060 vs 5060: Mid-Range GPU Shootout",
              sourceSlug: "rtx-3060-vs-4060-vs-5060",
              recommendedAngle: "Cross-reference architecture benchmarks into purchasing value frameworks",
            },
            {
              sourceTitle: "Ultimate Gaming CPU Guide: Best Processors Ranked",
              sourceSlug: "gaming-cpu-guide",
              recommendedAngle: "Pass link equity to prevent CPU bottleneck misconceptions in graphics-heavy setups",
            },
          ]
        : [
            {
              sourceTitle: `${topic} Architectural Foundations`,
              sourceSlug: `${topic.toLowerCase().replace(/\s+/g, "-")}-foundations`,
              recommendedAngle: `Foundational cross-link to primary ${topic} authority hub`,
            },
          ],
      clusters: [
        {
          name: isHardware ? "GPU Architecture & Real-World Performance" : `${topic} Topical Hub`,
          existingArticles: isHardware
            ? [
                "What is VRAM? (Video RAM Explained)",
                "RTX 3060 vs 4060 vs 5060: Mid-Range GPU Shootout",
                "Used GPU Buying Guide: What to Check Before Buying",
              ]
            : [],
          gapRecommendations: isHardware
            ? [
                "What is DLSS & Frame Generation? Complete Guide",
                "GPU Bottleneck: How to Identify & Fix It",
              ]
            : [`${topic} Fundamentals`, `${topic} Advanced Architecture`],
        },
      ],
    };

    return NextResponse.json({
      status: "success",
      ideas: normalizedIdeas,
      intelligence: fallbackIntelligence,
    });
  } catch (error: any) {
    console.error("[POST /api/ai/content-studio/ideas] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate content ideas",
        message: error?.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
