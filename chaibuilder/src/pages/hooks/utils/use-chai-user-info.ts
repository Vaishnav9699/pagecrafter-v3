import { ACTIONS } from "@chaibuilder/pages/constants/ACTIONS";
import { useApiUrl } from "@chaibuilder/pages/hooks/project/use-builder-prop";
import { useQuery } from "@tanstack/react-query";
import { isEmpty } from "lodash-es";
import { useFetch } from "./use-fetch";

export const useChaiUserInfo = (currentEditor: string) => {
  const apiURL = useApiUrl();
  const fetchAPI = useFetch();
  return useQuery({
    queryKey: [ACTIONS.GET_CHAI_USER, currentEditor],
    queryFn: async () => {
      const data = await fetchAPI(apiURL, {
        action: ACTIONS.GET_CHAI_USER,
        data: { userId: currentEditor },
      });
      const userInfo = (data?.data || {}) as {
        id: string;
        name: string;
        email: string;
        avatar: string;
      };
      return { ...userInfo, name: userInfo.name || userInfo.email };
    },
    enabled: !isEmpty(currentEditor),
    staleTime: "static",
  });
};
