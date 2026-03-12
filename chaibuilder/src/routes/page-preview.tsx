import { lsThemeAtom } from "@chaibuilder/atoms/ui";
import "@chaibuilder/core/index.css";
import { getChaiThemeCssVariables, getStylesForBlocks, RenderChaiBlocks } from "@chaibuilder/render";
import { applyDesignTokens } from "@chaibuilder/render/apply-design-tokens";
import { getMergedPartialBlocks } from "@chaibuilder/render/functions";
import { lsBlocksAtom, lsDesignTokensAtom } from "@chaibuilder/routes/demo/atoms-dev";
import registerCustomBlocks from "@chaibuilder/routes/demo/blocks";
import { EXTERNAL_DATA } from "@chaibuilder/routes/demo/EXTERNAL_DATA";
import { PARTIALS } from "@chaibuilder/routes/demo/PARTIALS";
import { ChaiTheme } from "@chaibuilder/types";
import { loadWebBlocks } from "@chaibuilder/web-blocks";
import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";

loadWebBlocks();
registerCustomBlocks();

function Preview() {
  const [blocks] = useAtom(lsBlocksAtom);
  const [theme] = useAtom(lsThemeAtom);
  const [designTokens] = useAtom(lsDesignTokensAtom);

  const [allStyles, setStyles] = useState("");

  useEffect(() => {
    (async () => {
      const styles = await getStylesForBlocks(applyDesignTokens(blocks, designTokens), true);
      setStyles(styles);
    })();
  }, [blocks]);
  const themeVars = useMemo(() => getChaiThemeCssVariables({ theme: theme as ChaiTheme }), [theme]);
  return (
    <>
      <style>{themeVars}</style>
      <style>{allStyles}</style>
      <RenderChaiBlocks
        lang="fr"
        fallbackLang="en"
        externalData={{
          ...EXTERNAL_DATA,
          "#promotions/ppqlwb": [
            { name: "Promotion 1", date: "2025-05-19", image: "https://picsum.photos/500/300" },
            { name: "Promotion 2", date: "2025-05-20", image: "https://picsum.photos/500/310" },
          ],
        }}
        pageProps={{ slug: "chai-builder" }}
        draft={true}
        blocks={getMergedPartialBlocks(blocks, PARTIALS)}
        dataProviderMetadataCallback={(block, meta) => {
          console.log("meta", meta);
          console.log("block", block);
        }}
      />
    </>
  );
}

export default Preview;
