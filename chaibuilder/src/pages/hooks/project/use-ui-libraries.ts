import { getBlocksFromHTML } from "@chaibuilder/core/main";
import { registerChaiLibrary } from "@chaibuilder/runtime/client";
import { ChaiLibrary, ChaiLibraryBlock } from "@chaibuilder/types/chaibuilder-editor-props";
import { useQuery } from "@tanstack/react-query";
import { get, isArray } from "lodash-es";
import { useWebsiteData } from "../use-website-data";
import { useFetch } from "../utils/use-fetch";
import { useApiUrl } from "./use-builder-prop";
import { ACTIONS } from "@chaibuilder/pages/constants/ACTIONS";

const uiLibrariesChaiApi = {
  async getUILibraryBlock(uiLibBlock: ChaiLibraryBlock, fetchAPI: any, apiUrl: string) {
    const response = await fetchAPI(apiUrl, {
      action: "GET_LIBRARY_ITEM",
      data: { id: uiLibBlock.id },
    });
    const html = get(response, "html", "");
    const blocks = get(response, "blocks", []);
    return isArray(blocks) ? blocks : getBlocksFromHTML(html);
  },

  async getUILibraryBlocks(uiLibrary: ChaiLibrary, fetchAPI: any, apiUrl: string) {
    const response = await fetchAPI(apiUrl, {
      action: "GET_LIBRARY_ITEMS",
      data: { id: uiLibrary.id },
    });
    return response.map((b: { preview: string }) => ({
      ...b,
    }));
  },
};

export const useUILibraries = () => {
  const fetchAPI = useFetch();
  const apiUrl = useApiUrl();
  const { data } = useWebsiteData();
  const allLibraries = data?.libraries;

  return useQuery({
    queryKey: [ACTIONS.UI_LIBRARIES],
    staleTime: "static",
    queryFn: async () => {
      const libraries = allLibraries.map((library: any) => ({
        ...library,
      }));
      libraries.forEach((library: any) => {
        registerChaiLibrary(library.id, {
          name: library.isSiteLibrary ? library.name + " (Current Site) " : library.name,
          description: library.description,
          getBlocksList: (library: any) => {
            return uiLibrariesChaiApi.getUILibraryBlocks(library, fetchAPI, apiUrl);
          },
          getBlock: ({ block }: { block: any }) => {
            return uiLibrariesChaiApi.getUILibraryBlock(block, fetchAPI, apiUrl);
          },
        });
      });
      return libraries;
    },
  });
};
