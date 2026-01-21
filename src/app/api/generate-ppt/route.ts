import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
    try {
        const message = await request.json();

        if (!process.env.GEMINI_API_KEY) {
            console.error("PPT Generator: GEMINI_API_KEY is missing");
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured" },
                { status: 500 },
            );
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        // Mirroring the working generate/route.ts config
        const config = {
            thinkingConfig: {
                thinkingBudget: -1,
            },
        };
        const model = "gemini-2.5-flash"; // Matched with working generate/route.ts

        const systemPrompt = `You are PageCrafter PPT AI, an expert presentation designer.
Your job is to generate a professional slide deck based on the user's request.

CRITICAL: You must return your response in two parts:
1. Start with 'RESPONSE: ' followed by a brief professional summary.
2. Then, provide the slides data exactly between JSON_START and JSON_END markers.

Example Format:
RESPONSE: I have created a 5-slide presentation on Quantum Computing.

JSON_START
{
  "slides": [
    {
      "title": "Introduction to Quantum Computing",
      "content": ["The basics of qubits", "Superposition explained", "Entanglement and its role"],
      "layout": "title"
    },
    {
      "title": "Quantum Supremacy",
      "content": ["What it means for the future", "Current leaders in the field", "Potential applications"],
      "layout": "content"
    }
  ]
}
JSON_END

Guidelines:
- First slide MUST be layout "title".
- Subsequent slides should be layout "content".
- Keep content items concise.`;

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

        console.log("PPT Generator: Starting stream for prompt:", message.prompt);

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

        const responseMatch = fullResponse.match(/RESPONSE:\s*([\s\S]*?)(?=JSON_START|$)/);
        const jsonMatch = fullResponse.match(/JSON_START\s*([\s\S]*?)\s*JSON_END/);

        const responseText = responseMatch ? responseMatch[1].trim() : "I have generated your presentation slides.";

        let slides = [];
        if (jsonMatch) {
            try {
                const cleanedJson = jsonMatch[1].trim()
                    .replace(/```json/g, '')
                    .replace(/```/g, '');
                const data = JSON.parse(cleanedJson);
                slides = data.slides || [];
            } catch (parseError) {
                console.error("PPT Generator: JSON Parse Error:", parseError, "Content:", jsonMatch[1]);
                // Fallback slides if parsing fails but tag exists
                slides = [{ title: "Error Generating Slides", content: ["The AI response could not be parsed. Please try a simpler prompt."], layout: "title" }];
            }
        } else {
            console.warn("PPT Generator: No JSON markers found in response");
            slides = [{ title: "Format Error", content: ["AI failed to return structured data. Please try again."], layout: "title" }];
        }

        return NextResponse.json({
            response: responseText,
            slides: slides
        });
    } catch (error) {
        console.error("Error in PPT generation route:", error);
        return NextResponse.json(
            { error: "Failed to generate PPT content. Check server logs." },
            { status: 500 },
        );
    }
}
