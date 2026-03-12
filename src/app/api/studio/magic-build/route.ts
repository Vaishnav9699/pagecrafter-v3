import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();

        const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_key;

        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured. Please add it to your .env file." },
                { status: 500 },
            );
        }

        const ai = new GoogleGenAI({ apiKey });
        const modelName = "gemini-2.5-flash";

        const systemPrompt = `You are PageCrafter Magic AI. Your job is to generate a comprehensive, high-quality website structure based on a user's prompt. 
You must return a JSON object containing an array of 'sections'.

Supported section types: 
- 'hero': Large headline, subtext, button structure.
- 'shop': Product-focused section (use this for services too).
- 'features': 3-column feature list with icons.
- 'footer': Bottom section with copyright.
- 'content': General text/image section.
- 'stats': Number-based achievements (e.g. "500+ Clients").

JSON Structure Example:
{
  "sections": [
    {
      "id": "hero-1",
      "type": "hero",
      "content": { "title": "Coffee Haven", "description": "Best beans in town." },
      "style": { "background": "linear-gradient(135deg, #2c1b0e 0%, #4a301f 100%)", "color": "#f3e5ab", "padding": "120px 40px", "textAlign": "center", "borderRadius": "0px" }
    },
    {
      "id": "features-1",
      "type": "features",
      "content": { "title": "Our Secret Sauce" },
      "style": { "background": "#ffffff", "padding": "80px 40px", "color": "#1a1a1a" }
    }
  ]
}

Guidelines for Quality:
1. IMAGES: For any background images, use https://picsum.photos/seed/[keyword]/1600/900.
2. COLORS: Use modern gradients and high-contrast accessible text.
3. SECTIONS: Generate 5-8 sections to create a complete landing page.
4. VARIETY: Ensure the styles (padding, background, color) feel premium and distinct.
5. FORMAT: Return ONLY the JSON object. Do not include any text before or after the JSON.`;

        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nUser Request: ${prompt}` }] }],
            config: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 16384,
            }
        });

        let fullResponse = response.text || "";
        
        // Clean up any markdown blocks if the AI included them
        const cleanedResponse = fullResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(cleanedResponse);
            return NextResponse.json(data);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, "Raw response:", fullResponse);
            return NextResponse.json(
                { error: "AI returned invalid JSON structure" },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Magic Build Error:", error);
        return NextResponse.json(
            { error: "Failed to generate website structure" },
            { status: 500 },
        );
    }
}
