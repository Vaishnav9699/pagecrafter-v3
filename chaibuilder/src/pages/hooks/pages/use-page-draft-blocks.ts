import { ACTIONS } from "@chaibuilder/pages/constants/ACTIONS";
import { useCurrentActivePage, usePrimaryPage } from "@chaibuilder/pages/hooks/pages/use-current-page";
import { useApiUrl } from "@chaibuilder/pages/hooks/project/use-builder-prop";
import { useFallbackLang } from "@chaibuilder/pages/hooks/use-fallback-lang";
import { useFetch } from "@chaibuilder/pages/hooks/utils/use-fetch";
import { useQuery } from "@tanstack/react-query";
import { useDynamicPageSlug } from "./use-dynamic-page-selector";

export const useBuilderPageData = () => {
  const { data: currentPage } = usePrimaryPage();
  const { data: activePage } = useCurrentActivePage();
  const apiUrl = useApiUrl();
  const fetchAPI = useFetch();
  const fallbackLang = useFallbackLang();
  const dynamicPageSlug = useDynamicPageSlug();

  return useQuery({
    queryKey: [ACTIONS.GET_BUILDER_PAGE_DATA, activePage?.id, dynamicPageSlug],
    staleTime: Infinity,
    gcTime: 0,
    queryFn: async () => {
      return fetchAPI(apiUrl, {
        action: ACTIONS.GET_BUILDER_PAGE_DATA,
        data: {
          pageType: currentPage?.pageType,
          lang: activePage?.lang || fallbackLang,
          dynamic: currentPage?.dynamic,
          pageProps: {
            slug: activePage?.slug + dynamicPageSlug,
            searchParams: {},
            pageType: activePage?.pageType,
            fallbackLang,
            lastSaved: activePage.lastSaved,
            pageId: currentPage.id,
            primaryPageId: activePage.primaryPage || currentPage.id,
            pageBaseSlug: activePage?.slug,
            dynamic: currentPage?.dynamic,
            //
            languagePageId: activePage.id,
            metadata: currentPage.metadata || {},
          },
        },
      });
    },
    enabled: !!currentPage?.pageType && !!activePage.id,
  });
};
