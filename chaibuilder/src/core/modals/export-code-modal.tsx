import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@chaibuilder/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@chaibuilder/components/ui/tabs";
import { Button } from "@chaibuilder/components/ui/button";
import { CHAI_BUILDER_EVENTS } from "@chaibuilder/core/events";
import { useBlocksHtmlForAi } from "@chaibuilder/hooks/use-blocks-html-for-ai";
import { useEditorMode } from "@chaibuilder/hooks/use-editor-mode";
import { usePubSub } from "@chaibuilder/hooks/use-pub-sub";
import { useSelectedBlock } from "@chaibuilder/hooks/use-selected-blockIds";
import { ChaiBlock } from "@chaibuilder/types/common";
import { shadcnTheme } from "@chaibuilder/utils/get-chai-builder-tailwind-config";
import { camelCase } from "lodash-es";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { DownloadIcon } from "@radix-ui/react-icons";
import { domToJsx, formatHtml } from "./domToJsx";
import { useTheme } from "@chaibuilder/hooks/use-theme";
import { useBuilderProp } from "@chaibuilder/hooks/use-builder-prop";
import { getChaiThemeCssVariables } from "@chaibuilder/render";

// Lazy load the CodeDisplay component
const CodeDisplay = lazy(() => import("./code-display"));

async function convertHtmlToJsx(html: string): Promise<{ jsx: string; html: string }> {
  try {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const children = Array.from(tempDiv.children) as Element[];
    const jsx = domToJsx(children.length === 1 ? children[0] : children);
    return { jsx, html: tempDiv.innerHTML };
  } catch {
    return { html, jsx: html };
  }
}

const getExportedCoded = async ({
  selectedBlock,
  html,
  isTypeScript = false,
}: {
  selectedBlock: ChaiBlock;
  html: string;
  isTypeScript?: boolean;
}) => {
  let componentName = selectedBlock?._name || selectedBlock?._type || "Component";
  componentName = camelCase(componentName).replace(/^./, (str) => str.toUpperCase());

  const SPACE = "  ";
  let { jsx, html: convertedHTML } = await convertHtmlToJsx(html);
  jsx = jsx?.split("\n").join(`\n${SPACE}${SPACE}`);

  // Add TypeScript type annotations if TypeScript is enabled
  const typeAnnotation = isTypeScript ? ": React.FC" : "";
  const importStatement = isTypeScript ? "import React from 'react';\n\n" : "";

  jsx = `${importStatement}export const ${componentName}${typeAnnotation} = () => {
${SPACE}return (
${SPACE}${SPACE}${jsx?.trimEnd()}
${SPACE})
}`;
  return { jsx, html: formatHtml(convertedHTML), componentName };
};

import JSZip from "jszip";

const ExportCodeModalContent = ({ tab }: { tab: string }) => {
  const { t } = useTranslation();
  const [allExportContent, setAllExportContent] = useState<{
    js: string;
    ts: string;
    html: string;
    tailwind: string;
  }>({
    js: "",
    ts: "",
    html: "",
    tailwind: "",
  });
  const selectedBlock = useSelectedBlock();
  const blocksHtmlForAi = useBlocksHtmlForAi();
  const [fileName, setFileName] = useState<string>("Component");
  const [loading, setLoading] = useState(true);

  const tailwindConfig = useMemo(() => {
    const theme = { extend: shadcnTheme() };
    const extend = JSON.stringify(theme, null, 2);
    return `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  content: ["./src/**/*.{js,jsx,ts,tsx}"],\n  theme: ${extend?.split("\n").join("\n  ")},\n  plugins: [],\n}`;
  }, []);

  const handleExportAll = useCallback(async () => {
    setLoading(true);
    const blockForExport: ChaiBlock = selectedBlock ?? ({ _name: "Body", _type: "Body" } as ChaiBlock);
    try {
      let html = blocksHtmlForAi(
        selectedBlock
          ? { blockId: selectedBlock._id, additionalCoreBlocks: ["Icon"] }
          : { additionalCoreBlocks: ["Icon"] },
      );
      html = html.replace(/\s*bid=["'][^"']*["']/g, "");

      const jsResult = await getExportedCoded({ selectedBlock: blockForExport, html, isTypeScript: false });
      const tsResult = await getExportedCoded({ selectedBlock: blockForExport, html, isTypeScript: true });

      setAllExportContent({
        js: jsResult.jsx,
        ts: tsResult.jsx,
        html: jsResult.html || "",
        tailwind: tailwindConfig,
      });
      setFileName(jsResult.componentName);
      setLoading(false);
    } catch {
      toast.error(t("Failed to generate export code"));
      setLoading(false);
    }
  }, [t, selectedBlock, blocksHtmlForAi, tailwindConfig]);

  const [theme] = useTheme();
  const brandingOptions = useBuilderProp("brandingOptions", { name: "PageCrafter" });

  const fullHtmlContent = useMemo(() => {
    const themeCss = getChaiThemeCssVariables({ theme });
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${brandingOptions.name || "My Page"}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        ${themeCss}
    </style>
</head>
<body class="bg-white text-gray-900">
    ${allExportContent.html}
</body>
</html>`;
  }, [allExportContent.html, theme, brandingOptions.name]);

  useEffect(() => {
    handleExportAll();
  }, [handleExportAll]);

  const handleCopy = useCallback(
    async (text: string) => {
      if (typeof window === "undefined") return;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          toast.success(t("Export code copied!"));
        } else {
          // Fallback for non-secure contexts or older browsers
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-9999px";
          textArea.style.top = "0";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const successful = document.execCommand("copy");
          document.body.removeChild(textArea);
          if (successful) {
            toast.success(t("Export code copied!"));
          } else {
            throw new Error("Unable to copy");
          }
        }
      } catch (err) {
        console.error("Copy failed", err);
        toast.error(t("Failed to copy export code"));
      }
    },
    [t],
  );

  const downloadFile = (content: string, name: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(anchor);
  };

  const handleDownloadAll = async () => {
    try {
      const zip = new JSZip();
      zip.file(`${fileName}.jsx`, allExportContent.js);
      zip.file(`${fileName}.tsx`, allExportContent.ts);
      zip.file(`${fileName}.html`, fullHtmlContent);
      zip.file(`tailwind.config.js`, allExportContent.tailwind);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${fileName}-export.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
      toast.success(t("All files downloaded as ZIP!"));
    } catch (err) {
      toast.error(t("Failed to download ZIP"));
    }
  };

  const activeContent = useMemo(() => {
    switch (tab) {
      case "js":
        return allExportContent.js;
      case "ts":
        return allExportContent.ts;
      case "html":
        return fullHtmlContent;
      case "tailwind":
        return allExportContent.tailwind;
      default:
        return "";
    }
  }, [tab, allExportContent]);

  const activeFileName = useMemo(() => {
    switch (tab) {
      case "js":
        return `${fileName}.jsx`;
      case "ts":
        return `${fileName}.tsx`;
      case "html":
        return `${fileName}.html`;
      case "tailwind":
        return "tailwind.config.js";
      default:
        return "";
    }
  }, [tab, fileName]);

  const activeLanguage = useMemo(() => {
    switch (tab) {
      case "js":
      case "ts":
        return "javascript";
      case "html":
        return "html";
      case "tailwind":
        return "javascript";
      default:
        return "text";
    }
  }, [tab]);

  if (loading) {
    return <div className="flex h-[620px] w-full items-center justify-center p-4">Generating code...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <CodeDisplay
        key={tab}
        code={activeContent}
        language={activeLanguage}
        onCopy={handleCopy}
        onDownload={(content) => downloadFile(content, activeFileName)}
        downloadText={
          <span>
            Download <span className="font-mono text-[10px] opacity-70">{activeFileName}</span>
          </span>
        }
      />
      <div className="flex justify-start px-1">
        <Button variant="secondary" size="sm" onClick={handleDownloadAll} className="gap-2">
          <DownloadIcon /> Download All Files (ZIP)
        </Button>
      </div>
    </div>
  );
};

export const ExportCodeModal = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { setMode } = useEditorMode();
  const [tab, setTab] = useState("js");

  const handleOpenModal = useCallback(async () => {
    setTab("js");
    setMode("view");
    setOpen(true);
  }, [setTab, setMode, setOpen]);

  usePubSub(CHAI_BUILDER_EVENTS.OPEN_EXPORT_CODE, handleOpenModal);

  const handleCloseModal = async () => {
    setMode("edit");
    await new Promise((resolve) => setTimeout(resolve, 300));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-5xl overflow-hidden border-border">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-foreground">{t("Export Code")}</DialogTitle>
          <Tabs defaultValue="js" onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="js">Javascript</TabsTrigger>
              <TabsTrigger value="ts">Typescript</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="tailwind">Tailwind config</TabsTrigger>
            </TabsList>
          </Tabs>
          <div />
        </DialogHeader>
        <div className="flex min-h-[400px] flex-col gap-4">
          {open && (
            <Suspense
              fallback={
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  Loading code editor...
                </div>
              }>
              <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <ExportCodeModalContent tab={tab} />
              </ErrorBoundary>
            </Suspense>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
