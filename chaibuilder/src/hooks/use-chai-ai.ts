import { useBlocksStoreUndoableActions } from "@chaibuilder/hooks/history/use-blocks-store-undoable-actions";
import { chaiAiChatAtom, ChatMessage } from "@chaibuilder/atoms/ui";
import { presentBlocksAtom } from "@chaibuilder/atoms/blocks";
import { useAtom } from "jotai";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const useChaiAi = () => {
    const [messages, setMessages] = useAtom(chaiAiChatAtom);
    const [blocks] = useAtom(presentBlocksAtom);
    const { setNewBlocks } = useBlocksStoreUndoableActions();
    const [loading, setLoading] = useState(false);

    const askAi = useCallback(async (prompt: string) => {
        setLoading(true);
        const newUserMessage: ChatMessage = { role: "user", content: prompt };
        setMessages((prev) => [...prev, newUserMessage]);

        try {
            const response = await fetch("/api/chai/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, blocks }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get response from AI");
            }

            const data = await response.json();
            
            if (data.blocks) {
                // Ensure all style strings are prefixed with "#styles:," so Chai Builder handles them correctly
                const processedBlocks = data.blocks.map((block: any) => {
                    const newBlock = { ...block };
                    if (newBlock.styles && typeof newBlock.styles === "string" && !newBlock.styles.startsWith("#styles:")) {
                        newBlock.styles = `#styles:,${newBlock.styles}`;
                    }
                    return newBlock;
                });
                setNewBlocks(processedBlocks);
                toast.success("Page updated by AI");
            }

            const assistantMessage: ChatMessage = { 
                role: "assistant", 
                content: data.response || "I've updated the page according to your request." 
            };
            setMessages((prev) => [...prev, assistantMessage]);

        } catch (error: any) {
            console.error("AI Assistant Error:", error);
            toast.error("AI Assistant: " + error.message);
            setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    }, [blocks, setMessages, setNewBlocks]);

    return { messages, askAi, loading };
};
