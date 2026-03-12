import { AIChatOptions, ChaiBuilderPagesAIInterface } from "@chaibuilder/types/actions";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, StreamTextResult } from "ai";
import { noop } from "lodash-es";
import { getAskAiSystemPrompt } from "./system-prompt";

const DEFAULT_MODEL = "google/gemini-2.5-flash";

/**
 * Resolve a model string like "google/gemini-2.5-flash" to a proper AI SDK provider model.
 */
function resolveModel(modelId: string) {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
  });

  // Support "google/model-name" format
  if (modelId.startsWith("google/")) {
    const name = modelId.replace("google/", "");
    return google(name);
  }

  // Fallback: treat as gemini-2.5-flash
  return google("gemini-2.5-flash");
}

export class ChaiAIChatHandler implements ChaiBuilderPagesAIInterface {
  private model: string = DEFAULT_MODEL;
  private temperature: number = 0.7;

  constructor(private options?: { model?: string; onFinish?: () => void; onError?: (error: Error) => void }) {
    this.model = options?.model ?? this.model;
  }

  async handleRequest(options: AIChatOptions, res?: any): Promise<StreamTextResult<any, any>> {
    const { messages, image, initiator = null, model } = options;

    // Use the provided model or fall back to the default
    const selectedModelId = model || this.model;
    const resolvedModel = resolveModel(selectedModelId);

    // Get the user messages (excluding system)
    const userMessages = messages.filter((m: any) => m.role !== "system");
    const lastUserMessage = userMessages[userMessages.length - 1];

    const aiMessages = image
      ? [
          ...userMessages.slice(0, -1),
          {
            role: "user",
            content: [
              {
                type: "text",
                text: lastUserMessage.content,
              },
              {
                type: "image",
                image: image,
              },
            ],
          },
        ]
      : messages;

    const result = streamText({
      model: resolvedModel,
      system: getAskAiSystemPrompt(initiator),
      messages: aiMessages,
      temperature: this.temperature,
      onFinish: this.options?.onFinish ?? noop,
      onError: this.options?.onError ?? noop,
    });
    if (res) result.pipeTextStreamToResponse(res);
    return result;
  }

  isConfigured(): boolean {
    return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  }
}

