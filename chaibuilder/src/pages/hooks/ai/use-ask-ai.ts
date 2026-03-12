import { ACTIONS } from "@chaibuilder/pages/constants/ACTIONS";
import { useAiContext } from "@chaibuilder/pages/hooks/ai/use-ai-context";
import { useApiUrl } from "@chaibuilder/pages/hooks/project/use-builder-prop";
import { useFetch } from "@chaibuilder/pages/hooks/utils/use-fetch";
import { ChaiBlock } from "@chaibuilder/types/common";
import { useCallback } from "react";

export const useAskAi = () => {
  const apiUrl = useApiUrl();
  const { aiContext } = useAiContext();
  const fetchAPI = useFetch();
  return useCallback(
    async (type: "styles" | "content", prompt: string, blocks: ChaiBlock[], lang: string) => {
      return fetchAPI(apiUrl, {
        action: ACTIONS.ASK_AI,
        data: { type, prompt, blocks, context: aiContext, lang },
      });
    },
    [apiUrl, aiContext, fetchAPI],
  );
};
