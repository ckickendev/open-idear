import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ═══════════════════════════════════════════════════════════════════
//  POST /api/ai/media-metadata
//  Generate alt text, description, and tags for an image via Gemini
// ═══════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are an accessibility and SEO expert analyzing images for a content platform.

Given an image, generate:
1. **altText**: A concise, descriptive alt text (max 125 characters) following WCAG 2.1 guidelines. Describe what the image shows, not what it is. Never start with "Image of" or "Picture of".
2. **description**: A detailed description (1-2 sentences) useful for content creators to remember what this image is about and where to use it.
3. **tags**: 3-8 relevant tags (lowercase, no spaces, use hyphens for multi-word). Include both descriptive tags (what's in the image) and usage tags (where it might be used: cover, thumbnail, banner, diagram, screenshot, etc.)

Respond ONLY with valid JSON in this exact format:
{
  "altText": "...",
  "description": "...",
  "tags": ["tag1", "tag2", "tag3"]
}`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Fetch the image and convert to base64 for Gemini inline_data
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image from URL" },
        { status: 400 }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType =
      imageResponse.headers.get("content-type") || "image/jpeg";

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      {
        inlineData: {
          data: base64Image,
          mimeType,
        },
      },
    ]);

    const text = result.response.text();

    // Parse JSON — handle potential markdown code fence wrapping
    const jsonStr = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const metadata = JSON.parse(jsonStr);

    return NextResponse.json({
      success: true,
      data: {
        altText: metadata.altText || "",
        description: metadata.description || "",
        tags: Array.isArray(metadata.tags) ? metadata.tags : [],
        model: "gemini-2.0-flash",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("AI media metadata error:", message);
    return NextResponse.json(
      { error: "Failed to generate metadata", details: message },
      { status: 500 }
    );
  }
}
