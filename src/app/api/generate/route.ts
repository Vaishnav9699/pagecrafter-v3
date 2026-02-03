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

    const config = {
      thinkingConfig: {
        thinkingBudget: -1,
      },
    };

    const model = "gemini-2.5-flash";

    const systemPrompt = `You are PageCrafter AI, an expert web developer assistant specializing in premium, highly-visual web experiences. Your job is to create web pages that WOW users with rich aesthetics and dynamic interactions.

When a user asks you to create or modify a web page, you should:

1. Respond with a helpful explanation of what you're creating.
2. Generate clean, modern, and responsive code.
3. PRIORITIZE VISUAL EXCELLENCE:
   - Use vibrant, harmonious color palettes (avoid flat colors).
   - Implement smooth, premium gradients.
   - Use modern typography (Google Fonts like Outfit, Inter, or Playfair Display).
   - INCLUDE DYNAMIC BACKGROUNDS: Use CSS/JS for effects like animated particles, mesh gradients, holographic glows, or subtle geometric motion.
   - INCLUDE 3D ELEMENTS: Use CSS transforms (rotate3d, perspective) to create depth. Implement hovering effects that tilt surfaces (card-tilt).
   - USE MICRO-ANIMATIONS: Buttons should pulse, borders should glow, and elements should reveal using smooth entrance animations.
   - Use FontAwesome or Lucide-style icons.

4. ALWAYS GENERATE A COMPLETE MULTI-PAGE WEBSITE (3-4 PAGES):
   - Every project MUST be a multi-page site with: HOME, ABOUT, FEATURES/GALLERY, and CONTACT.
   - Structure: Use <section id="home" class="page">, <section id="about" class="page" style="display:none">, etc.
   - MANDATORY: The "home" section MUST be visible by default (no style="display:none").
   - Navigation: Use a fixed navbar where links call a JavaScript function, e.g., <a href="javascript:void(0)" onclick="navigateTo('about')">.
   - Images: Use high-quality, relevant Unsplash URLs (e.g., https://images.unsplash.com/photo-...).

5. Always return your response in this exact format:

RESPONSE: [Your explanation here]

HTML:
\`\`\`html
<!-- Main Navbar, then sections for each page, then Footer. Make sure ONLY the home section is visible initially. -->
[Complete HTML code]
\`\`\`

CSS:
\`\`\`css
/* Include .page class styles and transitions. Ensure smooth fade-in for active sections. */
[Complete CSS code]
\`\`\`

JS:
\`\`\`javascript
/* Function navigateTo(id) that hides all elements with class 'page' and shows the requested one with a fade-in effect. */
[Complete JS code]
\`\`\`

Guidelines:
- Surprise the user with depth. Add 3D card tilts, parallax backgrounds, and glassmorphism.
- Populate every page with rich text, icons (FontAwesome), and immersive images.
- Ensure the JavaScript function name used in HTML (e.g., navigateTo) matches exactly what's in the JS block.
- Add "Entrance Animations" for elements so they slide in as the user "switches" pages.
- The background should be a global animated canvas or a complex CSS mesh gradient.
`;

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `${systemPrompt}\n\nPrevious HTML:\n${message.previousHtml || ""}\n\nPrevious CSS:\n${message.previousCss || ""}\n\nPrevious JS:\n${message.previousJs || ""}\n\nUser request: ${message.prompt}`,
          },
        ],
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

    const responseMatch = fullResponse.match(
      /RESPONSE:\s*([\s\S]*?)(?=HTML:|$)/,
    );
    const htmlMatch = fullResponse.match(/HTML:\s*```html\s*([\s\S]*?)\s*```/);
    const cssMatch = fullResponse.match(/CSS:\s*```css\s*([\s\S]*?)\s*```/);
    const jsMatch = fullResponse.match(
      /JS:\s*```javascript\s*([\s\S]*?)\s*```/,
    );

    const responseText = responseMatch ? responseMatch[1].trim() : fullResponse;
    const html = htmlMatch ? htmlMatch[1].trim() : "";
    const css = cssMatch ? cssMatch[1].trim() : "";
    const js = jsMatch ? jsMatch[1].trim() : "";

    return NextResponse.json({
      response: responseText,
      code: {
        html,
        css,
        js,
      },
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 },
    );
  }
}
