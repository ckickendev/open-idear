import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Instantiate the Gemini API client
// Note: You must have GEMINI_API_KEY in your .env or .env.local file.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'GEMINI_API_KEY is not configured in the environment variables.' },
                { status: 500 }
            );
        }

        const { title } = await req.json();

        if (!title) {
            return NextResponse.json(
                { error: 'Title is required to generate content.' },
                { status: 400 }
            );
        }

        // Use gemini-2.5-flash which is the recommended model for general text tasks
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            // Enable Google Search grounding
            tools: [
                {
                    googleSearch: {},
                } as any,
            ],
        });

        const prompt = `Write a comprehensive, engaging, and detailed blog post or article about: "${title}".
    
    Requirements:
    - Perform a deep search on the internet to provide accurate, up-to-date information, facts, or recent developments related to the topic.
    - Structure the content well with clear headings (H2, H3), paragraphs, and bullet points if appropriate.
    - Format the response completely in HTML tags (e.g., <h2>, <p>, <ul>, <li>, <strong>).
    - Do NOT wrap the HTML in markdown code blocks like \`\`\`html. Just return the raw HTML string directly.
    - Make the content highly readable and ready to be inserted directly into a rich text editor.
    `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({ content: text });
    } catch (error: any) {
        console.error('Error generating AI content:', error);
        return NextResponse.json(
            { error: error?.message || 'Something went wrong while generating content.' },
            { status: 500 }
        );
    }
}
