import { defaultThemeValues } from "@chaibuilder/hooks/default-theme-options";
import { ACTIONS } from "@chaibuilder/pages/constants/ACTIONS";
import { useFetch } from "@chaibuilder/pages/hooks/utils/use-fetch";
import { ChaiWebsiteSetting } from "@chaibuilder/types/actions";
import { useQuery } from "@tanstack/react-query";
import { useApiUrl } from "./use-builder-prop";

export const useWebsiteSetting = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  return useQuery<ChaiWebsiteSetting>({
    queryKey: [ACTIONS.GET_WEBSITE_DRAFT_SETTINGS],
    staleTime: 5 * 60 * 1000,
    placeholderData: {
      languages: [],
      theme: defaultThemeValues,
      appKey: "",
      fallbackLang: "",
      settings: {},
      designTokens: {},
    },
    queryFn: async () => {
      return fetchAPI(apiUrl, {
        action: ACTIONS.GET_WEBSITE_DRAFT_SETTINGS,
        data: { draft: true },
      });
    },
  });
};
