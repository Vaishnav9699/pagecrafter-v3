import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

// ============================================
// UPGRADE #6: Pre-built component patterns
// ============================================
const COMPONENT_PATTERNS = `
COMPONENT PATTERNS TO USE:
- Navigation: Sticky top navbar with logo, nav links, and mobile hamburger menu
- Hero Section: Full-width with gradient/image background, headline, subtext, and CTA buttons
- Feature Cards: CSS Grid (3 columns desktop, 1 mobile) with icons, titles, descriptions
- Testimonials: Card carousel or grid with avatar, quote, name, role
- CTA Section: Centered text with gradient background and action button
- Footer: Multi-column with links, contact info, social media icons, copyright
- Forms: Styled inputs with labels, validation states, submit button
- Buttons: Primary (gradient), Secondary (outline), with hover/active states
`;

// ============================================
// UPGRADE #1: Detailed system prompt
// UPGRADE #7: Real images
// UPGRADE #8: CDN libraries  
// UPGRADE #9: Mandatory sections checklist
// UPGRADE #10: Force responsive design
// ============================================
const SYSTEM_PROMPT = `You are PageCrafter Pro, an elite AI web designer and developer. You generate COMPLETE, PRODUCTION-QUALITY websites with full functionality.

CRITICAL RULES:
1. Generate COMPLETE code — never use placeholder comments like "<!-- add more here -->" or "// TODO"
2. Every website MUST include ALL of these sections:
   - ✅ NAVIGATION: Sticky navbar with logo text, navigation links, mobile hamburger menu
   - ✅ HERO SECTION: Full-width with compelling headline, subtext, and at least 2 CTA buttons
   - ✅ FEATURES/SERVICES: Grid of 3-6 feature cards with icons (use Font Awesome), titles, descriptions
   - ✅ ABOUT or TESTIMONIALS: Social proof section with content
   - ✅ CTA SECTION: Call-to-action with gradient background and action button
   - ✅ FOOTER: Multi-column footer with navigation links, contact info, social icons, copyright

3. INTERACTIVITY — Every website MUST have:
   - ✅ Working navigation links (smooth scroll to sections)
   - ✅ Mobile hamburger menu that actually opens/closes
   - ✅ Hover effects on ALL buttons and cards (scale, shadow, color change)
   - ✅ Scroll animations using AOS library (data-aos="fade-up", etc.)
   - ✅ At least one working form with input validation
   - ✅ Smooth transitions on all interactive elements

4. DESIGN — Use premium, modern aesthetics:
   - CSS custom properties (variables) for colors, fonts, spacing
   - Glassmorphism effects (backdrop-blur, semi-transparent backgrounds)
   - Gradient backgrounds (linear-gradient, mesh gradients)
   - Box shadows for depth
   - Border-radius for rounded elements
   - Proper whitespace and typography hierarchy

5. IMAGES — Use ONLY these real image sources:
   - https://picsum.photos/WIDTH/HEIGHT for random images
   - https://picsum.photos/seed/KEYWORD/WIDTH/HEIGHT for themed images
   Example: <img src="https://picsum.photos/seed/hotel/800/400" alt="Hotel">

6. CDN LIBRARIES — ALWAYS include these in <head>:
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css">
   And in <body> before closing:
   <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>
   <script>AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true });</script>

7. RESPONSIVE DESIGN — MANDATORY breakpoints:
   - Desktop: default styles
   - Tablet: @media (max-width: 768px) { ... }
   - Mobile: @media (max-width: 480px) { ... }

${COMPONENT_PATTERNS}

OUTPUT FORMAT — You MUST use these exact markers:
RESPONSE: [Your brief summary of what you built]

<!-- HTML_START -->
[Complete HTML code here - body content only, no <html>, <head>, or <body> tags]
<!-- HTML_END -->

<!-- CSS_START -->
[Complete CSS code here]
<!-- CSS_END -->

<!-- JS_START -->
[Complete JavaScript code here]
<!-- JS_END -->

Generate MORE code, not less. A full website should be 200-500+ lines MINIMUM across HTML, CSS, and JS combined.`;

// ============================================
// UPGRADE #12: Style presets
// ============================================
const STYLE_PRESETS: Record<string, string> = {
  'dark-premium': `STYLE: Dark premium theme.
    - Background: #0a0a0f to #1a1a2e gradient
    - Accent colors: Electric blue (#00d4ff), Neon purple (#a855f7)
    - Text: White (#ffffff) and light gray (#94a3b8)
    - Cards: rgba(255,255,255,0.05) with backdrop-blur
    - Shadows: colored glow effects
    - Glassmorphism effects throughout`,

  'clean-modern': `STYLE: Clean modern light theme.
    - Background: White (#ffffff) and light gray (#f8fafc)
    - Accent colors: Blue (#3b82f6), Indigo (#6366f1)
    - Text: Dark gray (#1e293b) and medium gray (#64748b)
    - Cards: White with subtle shadows
    - Clean lines, lots of whitespace
    - Subtle hover animations`,

  'colorful': `STYLE: Vibrant colorful theme.
    - Background: White with colorful gradient sections
    - Accent colors: Multiple vibrant colors — orange (#f97316), pink (#ec4899), violet (#8b5cf6), emerald (#10b981)
    - Gradient buttons and headings
    - Colorful illustrations and icons
    - Playful, energetic feel
    - Bold typography`,

  'corporate': `STYLE: Professional corporate theme.
    - Background: White (#ffffff) and navy (#0f172a)
    - Accent colors: Navy blue (#1e40af), Gold (#f59e0b)
    - Text: Dark (#0f172a) and professional gray (#475569)
    - Structured grid layouts
    - Professional typography (Inter)
    - Trust badges and credentials section
    - Conservative, trustworthy design`,

  'ecommerce': `STYLE: E-commerce / shop theme.
    - Product card grid layout
    - Add to cart buttons with cart icon
    - Price displays with sale/original price
    - Star ratings
    - Category filters sidebar
    - Search bar in navigation
    - Shopping cart icon with badge in navbar
    - Clean product imagery layout`,
};

// Refine prompt for Enhance feature (Upgrade #11)
const REFINE_PROMPT = `You are refining an existing website. Analyze the provided code and ENHANCE it:

1. ADD any missing sections (navigation, hero, features, CTA, footer)
2. IMPROVE visual design — add gradients, shadows, glassmorphism, better spacing
3. ADD more interactivity — hover effects, scroll animations, smooth transitions
4. FIX responsive design — ensure mobile breakpoints work
5. ADD Font Awesome icons where appropriate
6. IMPROVE typography — better font sizes, weights, line heights
7. ADD micro-animations — subtle transforms, opacity transitions
8. ENSURE all buttons and links have hover states

Keep the existing structure and content, but make it SIGNIFICANTLY more polished and professional.
Return the COMPLETE improved code (not just the changes).

Use the same output format:
RESPONSE: [Summary of improvements made]

<!-- HTML_START -->
[Complete improved HTML]
<!-- HTML_END -->

<!-- CSS_START -->
[Complete improved CSS]
<!-- CSS_END -->

<!-- JS_START -->
[Complete improved JavaScript]
<!-- JS_END -->`;

// ============================================
// Helper: Parse the full response for code blocks
// ============================================
function parseResponse(fullResponse: string, isRefineMode: boolean) {
  let html = "";
  let css = "";
  let js = "";
  let responseText = "";

  // Try structured markers first (most reliable)
  const htmlMarkerMatch = fullResponse.match(/<!-- HTML_START -->([\s\S]*?)<!-- HTML_END -->/);
  const cssMarkerMatch = fullResponse.match(/<!-- CSS_START -->([\s\S]*?)<!-- CSS_END -->/);
  const jsMarkerMatch = fullResponse.match(/<!-- JS_START -->([\s\S]*?)<!-- JS_END -->/);

  if (htmlMarkerMatch) {
    html = htmlMarkerMatch[1].trim();
    css = cssMarkerMatch ? cssMarkerMatch[1].trim() : "";
    js = jsMarkerMatch ? jsMarkerMatch[1].trim() : "";
  } else {
    // Fallback: Try code block extraction
    const extractBlock = (type: string, langs: string[]) => {
      const labelRegex = new RegExp(`${type}[:\\s]*(?:\`\`\`(?:${langs.join('|')})?\\s*)([\\s\\S]*?)(?:\`\`\`|$)`, 'i');
      const labelMatch = fullResponse.match(labelRegex);
      if (labelMatch && labelMatch[1].trim()) return labelMatch[1].trim();

      const langRegex = new RegExp(`\`\`\`(?:${langs.join('|')})\\s*([\\s\\S]*?)(?:\`\`\`|$)`, 'i');
      const langMatch = fullResponse.match(langRegex);
      if (langMatch && langMatch[1].trim()) return langMatch[1].trim();

      return "";
    };

    html = extractBlock("HTML", ["html", "xml", ""]);
    css = extractBlock("CSS", ["css"]);
    js = extractBlock("JS", ["javascript", "js"]);
  }

  // Extract response text
  const responseMatch = fullResponse.match(/RESPONSE:\s*(.*?)(?=\n|<!-- HTML_START|```)/s);
  if (responseMatch) {
    responseText = responseMatch[1].trim();
  } else {
    responseText = fullResponse.split(/html:|css:|js:|```|<!-- HTML_START/i)[0]
      .replace(/RESPONSE:/gi, "")
      .trim();
  }

  if (!responseText) responseText = isRefineMode
    ? "✨ Enhanced your website with better design and interactivity!"
    : "🎨 Generated your website with all sections and interactivity!";

  return { html, css, js, responseText, usedMarkers: !!htmlMarkerMatch };
}

// ============================================
// UPGRADE #14: Streaming API endpoint
// ============================================
export async function POST(request: NextRequest) {
  try {
    const message = await request.json();

    const apiKey = message.customApiKey || process.env.GEMINI_API_KEY || process.env.Gemini_API_key;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing Gemini API Key. Please add it in Settings." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelName = "gemini-2.5-flash";

    // Apply style preset
    const stylePreset = message.stylePreset ? STYLE_PRESETS[message.stylePreset] || '' : '';

    // Refine mode check
    const isRefineMode = message.refine === true;
    const activeSystemPrompt = isRefineMode ? REFINE_PROMPT : SYSTEM_PROMPT;

    // Build full prompt
    let fullPrompt = activeSystemPrompt;

    if (stylePreset) {
      fullPrompt += `\n\n${stylePreset}`;
    }

    if (message.previousHtml || message.previousCss || message.previousJs) {
      fullPrompt += `\n\nEXISTING CODE TO ${isRefineMode ? 'ENHANCE' : 'BUILD UPON'}:`;
      if (message.previousHtml) fullPrompt += `\nHTML:\n${message.previousHtml}`;
      if (message.previousCss) fullPrompt += `\nCSS:\n${message.previousCss}`;
      if (message.previousJs) fullPrompt += `\nJS:\n${message.previousJs}`;
    }

    fullPrompt += `\n\nUser Request: ${message.prompt}`;

    // ============================================
    // STREAMING RESPONSE
    // ============================================
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let fullText = '';

          // Use streaming API
          const stream = await ai.models.generateContentStream({
            model: modelName,
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
            config: {
              temperature: 0.6,
              topP: 0.95,
              maxOutputTokens: 32768,
            }
          });

          // Stream each chunk to the client
          for await (const chunk of stream) {
            const text = chunk.text || '';
            if (text) {
              fullText += text;

              // Send text chunk to client
              const data = JSON.stringify({ type: 'chunk', content: text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // Parse the full response for code
          const parsed = parseResponse(fullText, isRefineMode);

          console.log("--- PARSE LOG ---");
          console.log("Mode:", isRefineMode ? "REFINE" : "GENERATE");
          console.log("Style:", message.stylePreset || "none");
          console.log("Total Length:", fullText.length);
          console.log("HTML:", parsed.html.length, "chars");
          console.log("CSS:", parsed.css.length, "chars");
          console.log("JS:", parsed.js.length, "chars");
          console.log("Markers:", parsed.usedMarkers);

          // Send final parsed code
          const finalData = JSON.stringify({
            type: 'done',
            response: parsed.responseText,
            code: { html: parsed.html, css: parsed.css, js: parsed.js },
          });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorData = JSON.stringify({
            type: 'error',
            error: `Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ error: `Generation failed: ${error instanceof Error ? error.message : "Unknown error"}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
