import { useLanguages } from "@chaibuilder/hooks/use-languages";
import { useLanguagePages } from "@chaibuilder/pages/hooks/pages/use-language-pages";
import { find } from "lodash-es";
import { useMemo } from "react";

export const useCurrentLanguagePage = () => {
  const { selectedLang } = useLanguages();
  const { data: languagePages, isFetching } = useLanguagePages();

  const data = useMemo(() => {
    const page: any = find(languagePages, { lang: selectedLang || "" });
    return page || {};
  }, [languagePages, selectedLang]);

  return { data, isFetching };
};
