import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const message = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
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

    const model = 'gemini-2.5-flash';

    const systemPrompt = `You are PageCrafter AI, an expert web developer assistant. Your job is to help users create static web pages using HTML, CSS, and JavaScript.

When a user asks you to create or modify a web page, you should:

1. Respond with a helpful explanation of what you're creating
2. Generate clean, modern, and responsive code
3. Use fonntawesome icons and attractive color schemes where appropriate and applicable
4. Always return your response in this exact format:

RESPONSE: [Your explanation here]

HTML:
\`\`\`html
[HTML code here]
\`\`\`

CSS:
\`\`\`css
[CSS code here]
\`\`\`

JS:
\`\`\`javascript
[JavaScript code here]
\`\`\`

Guidelines:
- Use modern CSS with flexbox/grid for layouts
- Make designs responsive and mobile-friendly
- Use semantic HTML elements
- Include interactive elements when appropriate
- Use modern JavaScript (ES6+)
- Keep code clean and well-commented
- Use attractive color schemes and typography
- Everytime generate unique and creative designs
- Include hover effects and smooth transitions
- If the user provides existing code, incorporate it into your response and build upon it
- If user asks for modifications, update the existing code accordingly

If the user asks for modifications, update the existing code accordingly.`;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `${systemPrompt}\n\nPrevious HTML:\n${message.previousHtml || ''}\n\nPrevious CSS:\n${message.previousCss || ''}\n\nPrevious JS:\n${message.previousJs || ''}\n\nUser request: ${message.prompt}`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let fullResponse = '';
    for await (const chunk of response) {
      if (chunk.text) {
        fullResponse += chunk.text;
      }
    }

    const responseMatch = fullResponse.match(/RESPONSE:\s*([\s\S]*?)(?=HTML:|$)/);
    const htmlMatch = fullResponse.match(/HTML:\s*```html\s*([\s\S]*?)\s*```/);
    const cssMatch = fullResponse.match(/CSS:\s*```css\s*([\s\S]*?)\s*```/);
    const jsMatch = fullResponse.match(/JS:\s*```javascript\s*([\s\S]*?)\s*```/);

    const responseText = responseMatch ? responseMatch[1].trim() : fullResponse;
    const html = htmlMatch ? htmlMatch[1].trim() : '';
    const css = cssMatch ? cssMatch[1].trim() : '';
    const js = jsMatch ? jsMatch[1].trim() : '';

    return NextResponse.json({
      response: responseText,
      code: {
        html,
        css,
        js
      }
    });

  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
