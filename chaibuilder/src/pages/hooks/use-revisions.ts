import { ACTIONS } from "@chaibuilder/pages/constants/ACTIONS";
import { useApiUrl } from "@chaibuilder/pages/hooks/project/use-builder-prop";
import { useFetch } from "@chaibuilder/pages/hooks/utils/use-fetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Types for our revisions
export interface Revision {
  uid: string | "current";
  currentEditor: string;
  createdAt: Date;
  type: "published" | "draft";
}

export function useRevisions(pageId?: string) {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  return useQuery({
    queryKey: [ACTIONS.GET_PAGE_REVISIONS, pageId],
    queryFn: async () => {
      const revisions = await fetchAPI(apiUrl, {
        action: ACTIONS.GET_PAGE_REVISIONS,
        data: { pageId },
      });
      return revisions as Revision[];
    },
    enabled: !!pageId,
    refetchOnMount: true,
  });
}

export const useDeleteRevision = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (revisionId: string) => {
      const response = await fetchAPI(apiUrl, {
        action: ACTIONS.DELETE_PAGE_REVISION,
        data: { revisionId },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["revisions"],
      });
    },
  });
};

export const useRestoreRevision = () => {
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      revisionId,
      discardCurrent,
      pageId,
    }: {
      revisionId: string;
      discardCurrent: boolean;
      pageId?: string;
    }) => {
      const response = await fetchAPI(apiUrl, {
        action: ACTIONS.RESTORE_PAGE_REVISION,
        data: { revisionId, discardCurrent, ...(pageId && { pageId }) },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["revisions"],
      });
    },
  });
};
