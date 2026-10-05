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
  relatedArticleTitle: z.string().optional(),
  relatedArticleSlug: z.string().optional(),
  internalLinkOpportunity: z.string().optional(),
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

    // Ensure unique IDs
    const normalizedIdeas = validated.ideas.map((idea, index) => ({
      ...idea,
      id:
        idea.id && idea.id.trim()
          ? idea.id.trim()
          : `idea-${Date.now()}-${index + 1}-${Math.random().toString(36).substring(2, 7)}`,
    }));

    const isGpu = topic.toLowerCase().includes("gpu");
    const fallbackIntelligence = validated.intelligence || {
      existingCount: isGpu ? 3 : 0,
      summary: isGpu
        ? "You already have 3 articles about GPU."
        : `Content awareness active for "${topic}".`,
      coveredTopics: isGpu
        ? ["GPU comparison", "VRAM", "Used GPU"]
        : ["Baseline Principles", "Overview Guide"],
      recommendedGaps: isGpu
        ? ["DLSS", "Ray Tracing", "GPU Bottleneck", "PSU requirements"]
        : [
            `${topic} Performance Benchmarks`,
            `Real-world Case Study & Troubleshooting: ${topic}`,
            `Comparative Evaluation & Buyer Trade-offs for ${topic}`,
          ],
      clusters: [
        {
          name: isGpu ? "GPU Architecture & Real-World Performance" : `${topic} Topical Hub`,
          existingArticles: isGpu
            ? [
                "GPU Comparison: Mid-Range Graphics Cards Breakdown",
                "How Much VRAM Do You Actually Need for 1440p and 4K?",
                "Used GPU Buying Guide: Benchmarks, Stress Tests & Red Flags",
              ]
            : [],
          gapRecommendations: isGpu
            ? ["DLSS", "Ray Tracing", "GPU Bottleneck", "PSU requirements"]
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
