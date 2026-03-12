import { getChaiThemeOptions } from "@chaibuilder/core/components/canvas/static/chai-theme-helpers";
import { defaultThemeOptions } from "@chaibuilder/hooks/default-theme-options";
import { ChaiThemeOptions } from "@chaibuilder/types/chaibuilder-editor-props";

export const getChaiBuilderTheme = (themeOptions: ChaiThemeOptions = defaultThemeOptions) => {
  return {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    ...getChaiThemeOptions(themeOptions),
  };
};
