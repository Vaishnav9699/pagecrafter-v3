import { userActionsCountAtom } from "@chaibuilder/atoms/builder";
import { useBuilderProp } from "@chaibuilder/hooks/use-builder-prop";
import { useSavePage } from "@chaibuilder/hooks/use-save-page";
import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";

export const useAutoSave = () => {
  const { savePage, saveState } = useSavePage();
  const autoSave = useBuilderProp("autoSave", true);
  const autoSaveActionsCount = useBuilderProp("autoSaveActionsCount", 10);
  const [actionsCount] = useAtom(userActionsCountAtom);
  useEffect(() => {
    if (!autoSave) return;
    if (saveState === "SAVED" || saveState === "SAVING") return;
    if (actionsCount >= autoSaveActionsCount) {
      savePage(true);
    }
  }, [autoSave, savePage, saveState, actionsCount, autoSaveActionsCount]);
};

export const useIncrementActionsCount = () => {
  const [, setActionsCount] = useAtom(userActionsCountAtom);
  const { setSaveState } = useSavePage();
  return useCallback(() => {
    setActionsCount((prev) => prev + 1);
    setSaveState((prev) => (prev !== "UNSAVED" ? "UNSAVED" : prev));
  }, [setActionsCount, setSaveState]);
};
