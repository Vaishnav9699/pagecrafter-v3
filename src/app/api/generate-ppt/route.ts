import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
    try {
        const message = await request.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured" },
                { status: 500 },
            );
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const model = "gemini-2.0-flash";

        const systemPrompt = `You are PageCrafter PPT AI, an expert presentation designer. Your job is to help users create professional slide decks.

When a user asks you to create a presentation, you should:
1. Respond with a professional overview of the presentation.
2. Structure the presentation into slides.
3. Each slide must have a title and a list of content points.
4. Always return your response in this exact format:

RESPONSE: [Your professional explanation here]

JSON_START
{
  "slides": [
    {
      "title": "[Slide Title]",
      "content": ["Point 1", "Point 2", "Point 3"],
      "layout": "content"
    }
  ]
}
JSON_END

Layout types can be: "title" (for the first slide), "content" (bullet points).
The first slide should always be layout "title".`;

        const contents = [
            {
                role: "user",
                parts: [
                    {
                        text: `${systemPrompt}\n\nUser request: ${message.prompt}`,
                    },
                ],
            },
        ];

        const response = await ai.models.generateContentStream({
            model,
            contents,
        });

        let fullResponse = "";
        for await (const chunk of response) {
            if (chunk.text) {
                fullResponse += chunk.text;
            }
        }

        const responseMatch = fullResponse.match(/RESPONSE:\s*([\s\S]*?)(?=JSON_START|$)/);
        const jsonMatch = fullResponse.match(/JSON_START\s*([\s\S]*?)\s*JSON_END/);

        const responseText = responseMatch ? responseMatch[1].trim() : "Here is your presentation.";
        const slidesData = jsonMatch ? JSON.parse(jsonMatch[1].trim()) : { slides: [] };

        return NextResponse.json({
            response: responseText,
            slides: slidesData.slides
        });
    } catch (error) {
        console.error("Error generating PPT content:", error);
        return NextResponse.json(
            { error: "Failed to generate PPT content" },
            { status: 500 },
        );
    }
}
