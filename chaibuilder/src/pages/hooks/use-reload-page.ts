import { useSavePage } from "@chaibuilder/hooks/use-save-page";
import { usePageLockStatus } from "@chaibuilder/pages/client/components/page-lock/page-lock-hook";
import { ACTIONS } from "@chaibuilder/pages/constants/ACTIONS";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const useReloadPage = () => {
  const { savePageAsync } = useSavePage();
  const queryClient = useQueryClient();
  const { isLocked } = usePageLockStatus();
  return useCallback(async () => {
    if (!isLocked) await savePageAsync();
    queryClient.invalidateQueries({ queryKey: [ACTIONS.GET_DRAFT_PAGE] });
    queryClient.invalidateQueries({ queryKey: [ACTIONS.GET_BUILDER_PAGE_DATA] });
  }, [savePageAsync, queryClient, isLocked]);
};

export const useClearAll = () => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.clear();
  }, [queryClient]);
};
