import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured" },
                { status: 500 },
            );
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const model = "gemini-2.5-flash"; // Matched with working route
        const config = {
            thinkingConfig: {
                thinkingBudget: -1,
            },
        };

        const systemPrompt = `You are PageCrafter Magic AI. Your job is to generate a comprehensive website structure based on a user's prompt.
You must return a JSON object containing an array of 'sections'. 

Supported section types: 'hero', 'shop', 'features', 'footer'.

JSON Structure Example:
{
  "sections": [
    {
      "id": "hero-1",
      "type": "hero",
      "content": { "title": "Coffee Haven", "description": "Best beans in town." },
      "style": { "background": "linear-gradient(to right, #2c1b0e, #4a301f)", "color": "#f3e5ab", "padding": "100px 40px", "textAlign": "center" }
    },
    {
      "id": "features-1",
      "type": "features",
      "content": { "title": "Why Choose Us" },
      "style": { "background": "#fff", "padding": "60px 40px" }
    }
  ]
}

Guidelines:
1. Generate 4-6 sections.
2. Mix types: include hero and footer.
3. Be creative with styles.
4. Return ONLY valid JSON between JSON_START and JSON_END markers.`;

        const contents = [
            {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\nUser Request: ${prompt}` }],
            },
        ];

        const response = await ai.models.generateContentStream({
            model,
            config,
            contents,
        });

        let fullResponse = "";
        for await (const chunk of response) {
            if (chunk.text) {
                fullResponse += chunk.text;
            }
        }

        const jsonMatch = fullResponse.match(/JSON_START\s*([\s\S]*?)\s*JSON_END/);

        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1].trim());
            return NextResponse.json(data);
        } else {
            // Fallback: try to parse the whole response if markers are missing
            const data = JSON.parse(fullResponse.trim().replace(/```json/g, '').replace(/```/g, ''));
            return NextResponse.json(data);
        }

    } catch (error) {
        console.error("Magic Build Error:", error);
        return NextResponse.json(
            { error: "Failed to generate website structure" },
            { status: 500 },
        );
    }
}
