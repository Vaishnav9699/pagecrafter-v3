"use client";

import { useI18nBlocks } from "@chaibuilder/hooks/use-i18n-blocks";
import { useSelectedBlock, useSelectedBlockIds } from "@chaibuilder/hooks/use-selected-blockIds";
import { useStreamMultipleBlocksProps } from "@chaibuilder/hooks/use-update-blocks-props";
import { Conversation, ConversationContent, ConversationEmptyState } from "@chaibuilder/pages/components/ai-elements/conversation";
import { Message as AiMessage, MessageContent, MessageResponse } from "@chaibuilder/pages/components/ai-elements/message";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@chaibuilder/pages/components/ai-elements/reasoning";
import { TaskMessage } from "@chaibuilder/pages/components/ai-elements/task-message";
import { ChaiBlock } from "@chaibuilder/types/common";
import { Bot } from "lucide-react";
import { Fragment, lazy, startTransition, Suspense, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAIConfig, useAIModels } from "./ai-models-context";
import { Message } from "./ai-panel-helper";
import { getTranslationUserPrompt } from "./prompt-helper";
import { SelectedBlockDisplay } from "./selected-block-display";

const TranslationPrompts = lazy(() => import("./ai-translation-prompt"));
const AiPromptInput = lazy(() => import("./ai-prompt-input"));

interface AiPanelForOtherLangProps {
  fetch: any;
  input: string;
  isLoading: boolean;
  messages: Message[];
  fallbackLang: string;
  selectedLang: string;
  handleStop: () => void;
  handleReset: () => void;
  forceNewConversation: boolean;
  currentBlock: ChaiBlock | null;
  suggestNewConversation: boolean;
  setInput: (value: string) => void;
  abortController: AbortController | null;
  setIsLoading: (loading: boolean) => void;
  setCurrentBlock: (block: ChaiBlock | null) => void;
  setAbortController: (controller: AbortController | null) => void;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

const AiPanelForOtherLang = ({
  fetch,
  input,
  messages,
  setInput,
  isLoading,
  handleStop,
  setMessages,
  setIsLoading,
  selectedLang,
  currentBlock,
  fallbackLang,
  abortController,
  setAbortController,
  setCurrentBlock,
  selectedModel,
  onModelChange,
}: AiPanelForOtherLangProps) => {
  const { t } = useTranslation();
  const { models } = useAIModels();
  const config = useAIConfig();
  const defaultModel = models.find((model) => model.id === "google/gemini-3-flash") || models[0];
  const currentSelectedModel = selectedModel || defaultModel.id;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedBlock = useSelectedBlock();
  const [, setSelectedBlockIds] = useSelectedBlockIds();
  const i18nBlocks = useI18nBlocks();
  const updateBlocksWithStream = useStreamMultipleBlocksProps();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleTranslationPrompt = async (prompt: string, content?: string, model?: string) => {
    if (selectedBlock) {
      setCurrentBlock(selectedBlock as ChaiBlock);
    }
    const isTranslate = prompt?.toLowerCase() === "translate";
    const userMessageObj: Message = {
      id: Date.now().toString(),
      role: "user",
      content: getTranslationUserPrompt({
        fallbackLang,
        userInput: content || prompt,
        language: selectedLang,
        blocks: (isTranslate ? i18nBlocks() : i18nBlocks(selectedLang)) as ChaiBlock[],
      }),
      userMessage: content || prompt || t("Translate the content"),
    };

    // Add initial reasoning message that shows thinking state
    const reasoningMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "Thinking...",
      isReasoning: true,
      isStreaming: true,
    };

    setIsLoading(true);

    // Create new AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);

    setMessages((prev) => [...prev, userMessageObj, reasoningMessage]);
    setIsLoading(true);

    const usedModel = model || currentSelectedModel;

    // Trigger stream start event
    config.onAIEvent?.({ type: "stream_start", model: usedModel, timestamp: Date.now() });

    try {
      const requestBody: any = {
        messages: [userMessageObj],
        initiator: isTranslate ? "TRANSLATE_CONTENT" : "UPDATE_CONTENT",
        model: usedModel,
      };

      const response = await fetch({ body: { action: "ASK_AI", data: requestBody }, streamResponse: true });

      if (!response.ok) {
        throw new Error(t("Failed to get AI response"));
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      if (!reader) throw new Error(t("Response body is not readable"));

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setMessages((prev) => {
          prev[prev.length - 1].content = accumulatedText;
          return [...prev];
        });
      }

      const blocks = JSON.parse(accumulatedText?.replace("```json", "").replace("```", ""));
      updateBlocksWithStream(blocks);

      // Trigger success callbacks with actual AI response (non-urgent update)
      startTransition(() => {
        const timestamp = Date.now();
        config.onSuccess?.({ content: accumulatedText, model: usedModel, timestamp });
        config.onComplete?.({ success: true, content: accumulatedText, model: usedModel, timestamp });
        config.onAIEvent?.({
          type: "completion",
          content: accumulatedText,
          model: usedModel,
          timestamp,
        });
      });
    } catch (error: any) {
      abortController?.abort();

      // Trigger error callbacks with actual error (non-urgent update)
      startTransition(() => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const timestamp = Date.now();
        config.onError?.({ error: errorMessage, model: usedModel, timestamp });
        config.onComplete?.({ success: false, error: errorMessage, model: usedModel, timestamp });
        config.onAIEvent?.({ type: "error", error: errorMessage, model: usedModel, timestamp });
      });
    } finally {
      setIsLoading(false);
      setInput("");
      setCurrentBlock(null);
    }
  };

  return (
    <>
      <div className="py-2">
        <Suspense fallback={<div>{t("Loading...")}</div>}>
          <TranslationPrompts
            isLoading={isLoading}
            selectedBlock={selectedBlock}
            selectedLang={selectedLang}
            onClick={handleTranslationPrompt}
          />
        </Suspense>
      </div>

      <Conversation>
        <ConversationContent className="gap-4 px-0">
          {messages.length === 0 && (
            <ConversationEmptyState
              icon={<Bot size={48} className="text-gray-300" />}
              title={t("Start a conversation with the AI assistant to translate/edit your content")}
              description={t(
                "Only content can be edited in secondary languages. To edit layout, styles and more, switch to the default language.",
              )}
            />
          )}
          {messages.map(
            (message) =>
              message.role !== "system" && (
                <Fragment key={message.id}>
                  {message.isReasoning ? (
                    <Reasoning isStreaming={message.isStreaming} defaultOpen={true}>
                      <ReasoningTrigger className="text-xs [&_p]:text-muted-foreground" />
                      <ReasoningContent className="p-0 text-xs">{message.content}</ReasoningContent>
                    </Reasoning>
                  ) : message.isTask ? (
                    <TaskMessage content={message.content} isLoading={message.isTaskLoading} />
                  ) : (
                    <AiMessage from={message.role}>
                      <MessageContent className="p-0">
                        {message.role === "assistant" ? (
                          <MessageResponse className="p-0 text-xs">{message.content}</MessageResponse>
                        ) : (
                          <div className="p-0 text-xs">{message.userMessage || message.content}</div>
                        )}
                      </MessageContent>
                    </AiMessage>
                  )}
                </Fragment>
              ),
          )}
        </ConversationContent>
      </Conversation>

      <div className={`border-gray-200 pb-2`}>
        <SelectedBlockDisplay onRemove={() => setSelectedBlockIds([])} isLoading={isLoading} />
        <Suspense fallback={<div>{t("Loading...")}</div>}>
          <AiPromptInput
            input={input}
            setInput={setInput}
            onSend={handleTranslationPrompt}
            onStop={handleStop}
            isLoading={isLoading}
            selectedLang={selectedLang}
            currentBlock={(selectedBlock || currentBlock) as ChaiBlock}
            disabled={input?.length === 0}
            selectedModel={currentSelectedModel}
            onModelChange={onModelChange}
          />
        </Suspense>
      </div>
    </>
  );
};

export default AiPanelForOtherLang;
