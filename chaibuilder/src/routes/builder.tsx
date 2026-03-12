import { lsThemeAtom } from "@chaibuilder/atoms/ui";
import { ChaiBuilderEditor, defaultChaiLibrary } from "@chaibuilder/core/main";
import "@chaibuilder/index.css";
import { lsBlocksAtom, lsDesignTokensAtom } from "@chaibuilder/routes/demo/atoms-dev";
import { EXTERNAL_DATA } from "@chaibuilder/routes/demo/EXTERNAL_DATA";
import { PARTIALS } from "@chaibuilder/routes/demo/PARTIALS";
import { defaultShadcnPreset } from "@chaibuilder/routes/demo/THEME_PRESETS";
import Topbar from "@chaibuilder/routes/demo/top-bar";
import { registerChaiFont } from "@chaibuilder/runtime";
import { registerChaiLibrary, registerChaiTopBar } from "@chaibuilder/runtime/client";
import { ChaiSavePageData, ChaiSaveWebsiteData, ChaiTheme } from "@chaibuilder/types/chaibuilder-editor-props";
import { ChaiBlock } from "@chaibuilder/types/common";
import { loadWebBlocks } from "@chaibuilder/web-blocks";
import { RenderChaiBlocks } from "@chaibuilder/render";
import { useBroadcastChannel } from "@chaibuilder/hooks/use-broadcast-channel";
import { useAtom } from "jotai";
import { isArray } from "lodash-es";
import { toast } from "sonner";
import { useCallback, useMemo } from "react";

loadWebBlocks();
registerChaiTopBar(Topbar);
registerChaiLibrary("chai", defaultChaiLibrary(process.env.DEV ? { baseUrl: "http://localhost:5173" } : {}));
registerChaiFont("Bungee", {
  src: [{ url: "/fonts/bungee/Bungee-Regular.woff2", format: "woff2" }],
  fallback: "serif",
});

import { presentBlocksAtom } from "@chaibuilder/atoms/blocks";

const ChaiPreview = () => {
  const [blocks] = useAtom(presentBlocksAtom);
  return <RenderChaiBlocks blocks={blocks} />;
};

function ChaiBuilderDefault() {
  const [blocks] = useAtom(lsBlocksAtom);
  const [theme, setTheme] = useAtom(lsThemeAtom);
  const [designTokensValue, setDesignTokensValue] = useAtom(lsDesignTokensAtom);
  const { postMessage } = useBroadcastChannel();
  const onSave = useCallback(async ({ blocks, needTranslations }: ChaiSavePageData) => {
    console.log("onSave", blocks, needTranslations);
    localStorage.setItem("chai-builder-blocks", JSON.stringify(blocks));
    toast.success("Page saved successfully");
    await new Promise((resolve) => setTimeout(resolve, 100));
    return true;
  }, []);

  const onSaveWebsiteData = useCallback(async ({ type, data }: ChaiSaveWebsiteData) => {
    console.log("onSaveWebsiteData", type, data);
    if (type === "THEME") {
      localStorage.setItem("chai-builder-theme", JSON.stringify(data));
      setTheme(data as ChaiTheme);
      postMessage({ type: "theme-updated", theme: data });
    } else if (type === "DESIGN_TOKENS") {
      localStorage.setItem("chai-builder-design-tokens", JSON.stringify(data));
      setDesignTokensValue(data);
      postMessage({ type: "design-tokens-updated", designTokens: data });
    }
    return true;
  }, [postMessage, setDesignTokensValue, setTheme]);

  const getPartialBlockBlocks = useCallback(async (partialBlockKey: string) => {
    const blocks = PARTIALS[partialBlockKey] ?? PARTIALS["header"];
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(blocks);
      }, 100);
    });
  }, []);

  const getPartialBlocks = useCallback(async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          header: {
            type: "GlobalBlock",
            name: "Header",
            description: "Header",
          },
          footer: {
            type: "GlobalBlock",
            name: "Footer",
            description: "Footer",
          },
          partial: {
            type: "PartialBlock",
            name: "Partial Name here",
            description: "Partial",
          },
        });
      }, 1000);
    });
  }, []);

  const pageTypes = useMemo(() => [{ key: "page", name: "Pages" }], []);

  const searchPageTypeItems = useCallback(async (pageTypeKey: string, query: string | string[]) => {
    console.log("searchPageTypeItems", pageTypeKey, query, "query");
    if (pageTypeKey === "page") {
      const items = [
        { id: "uuid-1", name: "Page 1", slug: "/page-1" },
        { id: "uuid-2", name: "Page 2", slug: "/uuid1" },
        { id: "uuid-3", name: "About", slug: "/about" },
        { id: "uuid-4", name: "Contact", slug: "/sss" },
      ];
      await new Promise((r) => setTimeout(r, 500));
      return items.filter((item) => {
        if (isArray(query)) return query?.includes(item.id);
        return item.name.toLowerCase().includes(query.toString().toLowerCase());
      });
    }
    return [];
  }, []);

  const getBlockAsyncProps = useCallback(async (args: { block: ChaiBlock }) => {
    console.log("getBlockAsyncProps", args);
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            items: Array.from({ length: 2 }, (_, i) => ({
              name: `Promotion ${i + 1}`,
              date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              image: `https://picsum.photos/500/300`,
            })),
            totalItems: 30,
          }),
        2000,
      ),
    );
  }, []);

  const collections = useMemo(
    () => [
      {
        id: "promotions",
        name: "Promotions",
        description: "Promotions",
        filters: [
          {
            id: "filter-1",
            name: "Promotions Filter 1",
            description: "Promotions Filter 1",
          },
        ],
        sorts: [
          {
            id: "sort-1",
            name: "Promotions Sort 1",
            description: "Promotions Sort 1",
          },
        ],
      },
      {
        id: "vehicles",
        name: "Vehicles",
        description: "Vehicles",
        filters: [
          {
            id: "filter-1",
            name: "Vehicles Filter 1",
            description: "Vehicles Filter 1",
          },
        ],
        sorts: [
          {
            id: "sort-1",
            name: "Vehicles Sort 1",
            description: "Vehicles Sort 1",
          },
        ],
      },
    ],
    [],
  );

  const languages = useMemo(() => ["fr"], []);


  const flags = useMemo(() => ({
    librarySite: false,
    copyPaste: true,
    darkMode: false,
    exportCode: true,
    // dataBinding: false,
    importHtml: true,
    importTheme: true,
    dragAndDrop: true,
    designTokens: true,
  }), []);

  const themePresets = useMemo(() => [{ shadcn_default: defaultShadcnPreset }], []);

  const gotoPage = useCallback((args: any) => {
    console.log("gotoPage", args);
  }, []);

  return (
    <ChaiBuilderEditor
      previewComponent={ChaiPreview}
      pageId="header"
      designTokens={designTokensValue}
      flags={flags}
      gotoPage={gotoPage}
      permissions={null}
      // permissions={[]}
      pageExternalData={EXTERNAL_DATA}
      fallbackLang="en"
      languages={languages}
      themePresets={themePresets}
      theme={theme}
      autoSave={true}
      blocks={blocks}
      onSave={onSave}
      onSaveWebsiteData={onSaveWebsiteData}
      getPartialBlockBlocks={getPartialBlockBlocks as any}
      getPartialBlocks={getPartialBlocks as any}
      pageTypes={pageTypes}
      searchPageTypeItems={searchPageTypeItems}
      getBlockAsyncProps={getBlockAsyncProps as any}
      collections={collections}
    />
  );
}

export default ChaiBuilderDefault;
