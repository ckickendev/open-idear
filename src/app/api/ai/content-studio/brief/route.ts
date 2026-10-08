import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// =============================================================================
//  POST /api/ai/content-studio/brief
//  OpenIdear AI Content Studio — Server-Side Content Brief Generation Endpoint
// =============================================================================

const IdeaSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "title is required"),
  hook: z.string().min(1, "hook is required"),
  contentType: z.string(),
  category: z.string(),
  targetAudience: z.string(),
  difficulty: z.string(),
  searchIntent: z.string(),
  keywords: z.array(z.string()).default([]),
});

const RequestSchema = z.object({
  idea: IdeaSchema,
  existingCategories: z.array(z.string()).optional(),
});

const ContentBriefSchema = z.object({
  targetAudience: z.array(z.string()).min(1),
  tone: z.string().min(1),
  length: z.string().min(1),
  category: z.string().min(1),
  objective: z.string().min(1),
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

    const { idea, existingCategories } = parseResult.data;
    const authHeader = request.headers.get("authorization");

    // 1. Delegate to OpenIdear Backend service (http://localhost:5001)
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    try {
      const backendRes = await fetch(
        `${backendUrl}/ai/v1/content-studio/brief`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          body: JSON.stringify({
            idea,
            existingCategories,
          }),
        }
      );

      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data && data.brief) {
          return NextResponse.json({
            status: "success",
            brief: data.brief,
          });
        }
      }
    } catch {
      // Backend unavailable; proceed to server-side Gemini fallback
    }

    // 2. Server-side Gemini Provider Execution
    const rawApiKey = process.env.GEMINI_API_KEY || "";
    const apiKey = rawApiKey.replace(/['"]/g, "").trim();

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const systemPrompt = `You are an elite technical editorial strategist and content planner for OpenIdear.
Your task is to analyze the provided Content Idea and infer sensible, strategic specifications for its Content Brief.

SPECIFICATIONS:
1. "targetAudience": array of 2-4 distinct reader groups (e.g. ["Beginner PC builders", "Tech enthusiasts", "First-time buyers"]).
2. "tone": exactly one of ["Practical", "Professional", "Beginner-friendly", "Technical", "Conversational", "Data-driven", "Opinionated", "Educational"].
3. "length": exactly one of ["Short — 1,000–1,500 words", "Medium — 1,500–2,500 words", "Long — 2,500–3,500 words", "Deep Dive — 3,500–5,000 words"].
4. "category": Pick the closest match from available system categories if provided. Otherwise use the idea category.
5. "objective": exactly one of ["Explain", "Educate", "Compare", "Help users make a purchase decision", "Solve a technical problem", "Build topical authority", "Generate SEO traffic"].

Return strictly valid JSON:
{
  "targetAudience": ["string"],
  "tone": "string",
  "length": "string",
  "category": "string",
  "objective": "string"
}`;

        const userPrompt = `Generate content brief for:
- Title: ${idea.title}
- Hook: ${idea.hook}
- Type: ${idea.contentType}
- Category: ${idea.category}
- Target Audience: ${idea.targetAudience}
- Difficulty: ${idea.difficulty}
- Search Intent: ${idea.searchIntent}
- Keywords: ${idea.keywords.join(", ")}
${existingCategories?.length ? `- Available System Categories: ${existingCategories.join(", ")}` : ""}
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
        const validated = ContentBriefSchema.parse(parsed);

        return NextResponse.json({
          status: "success",
          brief: validated,
        });
      } catch (geminiErr) {
        console.warn("[POST /api/ai/content-studio/brief] Gemini call failed, returning smart fallback:", geminiErr);
      }
    }

    // 3. Fallback brief response if Gemini unavailable
    const fallbackBrief = {
      targetAudience: idea.targetAudience
        ? [idea.targetAudience, "Tech Enthusiasts"]
        : ["Beginner PC builders", "Tech Enthusiasts"],
      tone: "Practical",
      length: "Medium — 1,500–2,500 words",
      category: idea.category || "PC Hardware",
      objective:
        idea.searchIntent === "commercial"
          ? "Help users make a purchase decision"
          : "Explain",
    };

    return NextResponse.json({
      status: "success",
      brief: fallbackBrief,
    });
  } catch (error: any) {
    console.error("[POST /api/ai/content-studio/brief] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate content brief",
        message: error?.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
