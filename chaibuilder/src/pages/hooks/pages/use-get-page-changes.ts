import { ACTIONS } from "@chaibuilder/pages/constants/ACTIONS";
import { useApiUrl } from "@chaibuilder/pages/hooks/project/use-builder-prop";
import { useFetch } from "@chaibuilder/pages/hooks/utils/use-fetch";
import { useQuery } from "@tanstack/react-query";

export const useGetPageChanges = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  return useQuery({
    queryKey: [ACTIONS.GET_CHANGES],
    queryFn: async () => {
      return fetchAPI(apiUrl, { action: ACTIONS.GET_CHANGES });
    },
  });
};
