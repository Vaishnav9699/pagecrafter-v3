import { useIsLanguagePageCreated } from "@chaibuilder/pages/hooks/pages/use-is-languagep-page-created";
import { useSearchParams } from "@chaibuilder/pages/hooks/utils/use-search-params";
import { Suspense, lazy } from "react";

const NoLanguagePageContent = lazy(() => import("./no-language-page-content"));

const NoLanguagePageDialog = () => {
  const [searchParams] = useSearchParams();
  const lang = searchParams.get("lang");
  const isLanguagePageCreated = useIsLanguagePageCreated(lang as string);

  if (isLanguagePageCreated) return null;

  return (
    <Suspense>
      <NoLanguagePageContent />
    </Suspense>
  );
};

export default NoLanguagePageDialog;
