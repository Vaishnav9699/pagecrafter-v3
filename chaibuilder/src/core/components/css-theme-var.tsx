import { getChaiThemeCssVariables } from "@chaibuilder/render";
import { ChaiTheme } from "@chaibuilder/types";
import { useMemo } from "react";

export const CssThemeVariables = ({ theme }: { theme: ChaiTheme }) => {
  const themeVariables = useMemo(() => {
    return getChaiThemeCssVariables({ theme });
  }, [theme]);
  return <style id="chai-theme" dangerouslySetInnerHTML={{ __html: themeVariables }} />;
};
