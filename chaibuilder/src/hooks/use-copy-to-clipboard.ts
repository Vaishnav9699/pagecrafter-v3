import { useBuilderProp } from "@chaibuilder/hooks/use-builder-prop";
import { useCallback, useState } from "react";

type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

export const useCopyToClipboard = (): [CopiedValue, CopyFn] => {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);
  const enableCopyToClipboard = useBuilderProp("flags.copyPaste", true);

  const copy: CopyFn = useCallback(async (text) => {
    if (!enableCopyToClipboard) {
      console.warn("Clipboard feature is disabled");
      return false;
    }
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    // Try to save to clipboard then save it in the state if worked
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setCopiedText(null);
      return false;
    }
  }, []);

  return [copiedText, copy];
};
