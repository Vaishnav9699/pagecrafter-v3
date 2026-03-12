import { ACTIONS } from "@chaibuilder/pages/constants/ACTIONS";
import { useApiUrl } from "@chaibuilder/pages/hooks/project/use-builder-prop";
import { useFetch } from "@chaibuilder/pages/hooks/utils/use-fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDuplicatePage = () => {
  const apiUrl = useApiUrl();
  const queryClient = useQueryClient();
  const fetchAPI = useFetch();

  return useMutation({
    mutationFn: async ({ pageId, name, slug }: { pageId: string; name: string; slug?: string }) => {
      // Create payload with required fields
      const data: { pageId: string; name: string; slug?: string } = {
        pageId,
        name,
      };

      // Only include slug in the payload if it's provided
      if (slug) {
        data.slug = slug;
      }

      const response = await fetchAPI(apiUrl, {
        action: "DUPLICATE_PAGE",
        data,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ACTIONS.GET_WEBSITE_PAGES],
      });
      toast.success("Page duplicated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to duplicate page", {
        description: error.message || "An error occurred while duplicating the page",
      });
    },
  });
};
