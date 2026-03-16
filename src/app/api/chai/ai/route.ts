import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const CHAI_SYSTEM_PROMPT = `You are Chai Builder AI, an expert at constructing web pages using the Chai Builder JSON block format.
Your goal is to create, manage, and modify page structures based on user requests.

CRITICAL RULES:
1. You MUST return a JSON object with a 'blocks' array.
2. Each block MUST have:
   - _id: A unique string (like "block-1", "header-nav", etc.)
   - _type: The type of the block (see list below)
   - _parent: (Optional) The _id of the parent block.
   - styles: Tailwind CSS classes (prefixed with "c-") OR a string of Tailwind classes. Note: In this system, styles are typically just Tailwind classes like "bg-blue-500 p-4 font-bold".
   - _name: (Optional) A friendly name for the block.
3. Use semantic nesting: Rows should contain Columns, Boxes can contain anything.
4. DATA FORMAT:
{
  "response": "Briefly describe what you did/built.",
  "blocks": [
    { "_id": "root", "_type": "Box", "_name": "Container", "styles": "max-w-7xl mx-auto p-4" },
    { "_id": "title", "_type": "Heading", "_parent": "root", "content": "Welcome", "styles": "text-4xl font-bold", "tag": "h1" }
  ]
}

AVAILABLE BLOCK TYPES & THEIR PROPS:
- Box: container (props: tag="div"|"section"|"header"|"footer", backgroundImage)
- Heading: text (props: content, tag="h1"|"h2"|"h3", styles)
- Paragraph: text (props: content, styles)
- Span: inline text (props: content, styles)
- Button: action (props: content, link={href, target}, styles)
- Image: media (props: url, alt, styles)
- Video: media (props: url, styles)
- Row: flex row (props: styles)
- Column: flex col (props: styles, width)
- Divider: line (props: styles)
- Icon: icon (props: icon="lucide:home", styles)
- Link: anchor (props: content, href, styles)

TAILWIND USAGE: Use standard Tailwind classes for styles.

USER REQUESTS:
- If user says "Create a landing page", generate 10-20 blocks covering hero, features, footer.
- If user says "Change colors to dark mode", update the 'styles' of existing blocks.
- If user says "Add a button to the hero", find the hero block and add a new Button block as its child.

EXISTING CONTEXT:
The user will provide the current page blocks. You should modify them or replace them entirely depending on the request.
`;

export async function POST(request: NextRequest) {
    try {
        const { prompt, blocks: currentBlocks } = await request.json();

        const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_key;

        if (!apiKey) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });
        const modelName = "gemini-2.5-flash"; 
        console.log("Chai AI Request - Model:", modelName, "Prompt Length:", prompt.length);

        const fullPrompt = `${CHAI_SYSTEM_PROMPT}

CURRENT BLOCKS ON PAGE:
${JSON.stringify(currentBlocks, null, 2)}

USER REQUEST: ${prompt}

RESPONSE FORMAT: Valid JSON only.`;

        const result = await (ai as any).models.generateContent({
            model: modelName,
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
            config: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 16384,
            }
        });
        const responseText = result.text || "";
        console.log("Chai AI Response received, length:", responseText.length);
        
        // Extract JSON from potential markdown blocks
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid AI response format");
        }

        const data = JSON.parse(jsonMatch[0]);

        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Chai AI Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
