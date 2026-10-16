import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// =============================================================================
//  POST /api/ai/content-studio/outline
//  OpenIdear AI Content Studio — Server-Side Content Outline Generation Endpoint
// =============================================================================

const IdeaSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "title is required"),
  hook: z.string().optional().default(""),
  contentType: z.string().optional().default("guide"),
  category: z.string().optional().default("Technology"),
  targetAudience: z.string().optional().default(""),
  difficulty: z.string().optional().default("intermediate"),
  searchIntent: z.string().optional().default("informational"),
  keywords: z.array(z.string()).default([]),
});

const ContentBriefSchema = z.object({
  targetAudience: z.array(z.string()).min(1),
  tone: z.string().min(1),
  length: z.string().min(1),
  category: z.string().min(1),
  objective: z.string().min(1),
});

const RequestSchema = z.object({
  idea: IdeaSchema,
  contentBrief: ContentBriefSchema,
});

const OutlineSectionSchema = z.object({
  id: z.string().default(() => `sec-${Math.random().toString(36).substring(2, 9)}`),
  heading: z.string().min(1),
  purpose: z.string().min(1),
  keyPoints: z.array(z.string()).default([]),
});

const OutlineFaqItemSchema = z.object({
  question: z.string().min(1),
  answerDirection: z.string().min(1),
});

const ContentOutlineSchema = z.object({
  title: z.string().min(1),
  introduction: z.string().min(1),
  sections: z.array(OutlineSectionSchema).min(1),
  conclusion: z.string().min(1),
  faq: z.array(OutlineFaqItemSchema).optional(),
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

    const { idea, contentBrief } = parseResult.data;
    const authHeader = request.headers.get("authorization");

    // 1. Delegate to OpenIdear Backend service (http://localhost:5001)
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    try {
      const backendRes = await fetch(
        `${backendUrl}/ai/v1/content-studio/outline`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          body: JSON.stringify({
            idea,
            contentBrief,
          }),
        }
      );

      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data && data.outline) {
          return NextResponse.json({
            status: "success",
            outline: data.outline,
          });
        }
      }
    } catch {
      // Backend unavailable; proceed to server-side Gemini fallback
    }

    // 2. Server-side Gemini Provider Execution
    const rawApiKey = process.env.GEMINI_API_KEY || "";
    const apiKey = rawApiKey.replace(/['"]/g, "").trim();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured on the server, using structured fallback outline.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const systemPrompt = `You are an elite technical editorial director and SEO content architect for OpenIdear.
Your task is to generate a comprehensive, logically structured Content Outline based on the provided Content Idea and Content Brief.

CRITICAL RULES:
- Match search intent naturally (${idea.searchIntent}).
- Target the specified audience (${contentBrief.targetAudience.join(", ")}).
- Use requested tone (${contentBrief.tone}) and objective (${contentBrief.objective}).
- Respect target length (${contentBrief.length}) by sizing number of sections (e.g. 4-6 sections for medium, 6-9 sections for long/deep-dive).
- Include practical examples, actionable takeaways, benchmarks, or code hints where relevant.
- Avoid keyword stuffing and unnecessary filler.
- Supply 3 to 5 key points per section.
- Provide 2 to 4 FAQs with concise answer directions.

Return strictly valid JSON matching this schema:
{
  "title": "string (Compelling, finalized article title)",
  "introduction": "string (Introduction summary/hook)",
  "sections": [
    {
      "id": "string (e.g. sec-1)",
      "heading": "string (Descriptive H2 section title)",
      "purpose": "string (Editorial purpose of this section)",
      "keyPoints": ["string", "string", "string"]
    }
  ],
  "conclusion": "string (Summary of key insights and wrap-up)",
  "faq": [
    {
      "question": "string",
      "answerDirection": "string"
    }
  ]
}
`.trim();

    const userPrompt = `Generate a structured content outline for:
IDEA:
Title: ${idea.title}
Hook: ${idea.hook || ""}
Content Type: ${idea.contentType || "guide"}
Search Intent: ${idea.searchIntent || "informational"}

CONTENT BRIEF:
Target Audience: ${contentBrief.targetAudience.join(", ")}
Tone: ${contentBrief.tone}
Length: ${contentBrief.length}
Category: ${contentBrief.category}
Objective: ${contentBrief.objective}
`;

    const chat = model.startChat({
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }],
      },
    });

    const result = await chat.sendMessage(userPrompt);
    const responseText = result.response.text();

    let parsedOutline;
    try {
      parsedOutline = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedOutline = JSON.parse(match[0]);
      } else {
        throw new Error("Unable to parse JSON from AI model response");
      }
    }

    const validatedOutline = ContentOutlineSchema.parse(parsedOutline);

    return NextResponse.json({
      status: "success",
      outline: validatedOutline,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate content outline";
    console.error("[POST /api/ai/content-studio/outline] Error:", error);

    // Fallback outline if external API fails completely
    const fallbackOutline = {
      title: "Comprehensive Strategic Analysis & Practical Implementation",
      introduction: "A deep dive into fundamental principles, benchmarks, and actionable workflows for modern practitioners.",
      sections: [
        {
          id: "sec-1",
          heading: "Core Concepts & Architecture Foundations",
          purpose: "Deconstruct the core mechanics and explain underlying system principles.",
          keyPoints: [
            "Essential terminology and conceptual architecture",
            "Why modern teams prioritize this approach",
            "Common baseline requirements",
          ],
        },
        {
          id: "sec-2",
          heading: "Step-by-Step Implementation & Configuration",
          purpose: "Walk through end-to-end setup with practical considerations.",
          keyPoints: [
            "Hands-on configuration walkthrough",
            "Performance optimization checkpoints",
            "Recommended tooling and hardware considerations",
          ],
        },
        {
          id: "sec-3",
          heading: "Comparative Benchmarks & Trade-Offs",
          purpose: "Analyze metrics, alternatives, and cost/performance trade-offs.",
          keyPoints: [
            "Real-world benchmark comparisons",
            "Latency and throughput considerations",
            "Cost vs performance trade-off analysis",
          ],
        },
        {
          id: "sec-4",
          heading: "Troubleshooting & Production Best Practices",
          purpose: "Equip readers with actionable checklists to diagnose issues and avoid pitfalls.",
          keyPoints: [
            "Top 3 most frequent pitfalls and how to prevent them",
            "Validation checklist before deployment",
            "Long-term maintainability recommendations",
          ],
        },
      ],
      conclusion: "Key summary takeaways with concrete next steps for readers to implement immediately.",
      faq: [
        {
          question: "What is the recommended starting configuration?",
          answerDirection: "Recommend balanced baseline setup with room for iterative scaling.",
        },
        {
          question: "How does this compare against traditional alternatives?",
          answerDirection: "Highlight key performance gains and operational cost savings.",
        },
      ],
    };

    return NextResponse.json({
      status: "success",
      outline: fallbackOutline,
      warning: message,
    });
  }
}
