import { ACTIONS } from "@chaibuilder/pages/constants/ACTIONS";
import { useApiUrl } from "@chaibuilder/pages/hooks/project/use-builder-prop";
import { useFetch } from "@chaibuilder/pages/hooks/utils/use-fetch";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useWebsiteData = () => {
  const fetchApi = useFetch();
  const apiUrl = useApiUrl();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [ACTIONS.GET_WEBSITE_DATA],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const data = await fetchApi(apiUrl, { action: ACTIONS.GET_WEBSITE_DATA });
      queryClient.setQueryData([ACTIONS.GET_WEBSITE_DRAFT_SETTINGS], data.websiteSettings);
      queryClient.setQueryData([ACTIONS.GET_WEBSITE_PAGES], data.websitePages);
      queryClient.setQueryData([ACTIONS.GET_PAGE_TYPES], data.pageTypes);
      queryClient.setQueryData([ACTIONS.GET_LIBRARIES], data.libraries);
      queryClient.setQueryData([ACTIONS.GET_COLLECTIONS], data.collections);

      return data;
    },
  });
};
