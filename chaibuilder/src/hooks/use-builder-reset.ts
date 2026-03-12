import { userActionsCountAtom } from "@chaibuilder/atoms/builder";
import { aiAssistantActiveAtom } from "@chaibuilder/atoms/ui";
import { useBlockRepeaterDataAtom } from "@chaibuilder/hooks/async-props/use-async-props";
import { useUndoManager } from "@chaibuilder/hooks/history/use-undo-manager";
import { useBlockHighlight } from "@chaibuilder/hooks/use-block-highlight";
import { usePartialBlocksStore } from "@chaibuilder/hooks/use-partial-blocks-store";
import { useSavePage } from "@chaibuilder/hooks/use-save-page";
import { useSelectedBlockIds } from "@chaibuilder/hooks/use-selected-blockIds";
import { useSelectedStylingBlocks } from "@chaibuilder/hooks/use-selected-styling-blocks";
import { useAtom } from "jotai";

export const useBuilderReset = () => {
  const { clear } = useUndoManager();
  const [, setSelectedIds] = useSelectedBlockIds();
  const { clearHighlight } = useBlockHighlight();
  const [, setStylingHighlighted] = useSelectedStylingBlocks();
  const [, setAiAssistantActive] = useAtom(aiAssistantActiveAtom);
  const { reset: resetPartialBlocks } = usePartialBlocksStore();
  const { setSaveState } = useSavePage();
  const [, setBlockRepeaterDataAtom] = useBlockRepeaterDataAtom();
  const [, setActionsCount] = useAtom(userActionsCountAtom);

  return () => {
    setBlockRepeaterDataAtom({});
    setSelectedIds([]);
    setStylingHighlighted([]);
    clearHighlight();
    clear();
    setAiAssistantActive(false);
    resetPartialBlocks();
    setSaveState("SAVED");
    setActionsCount(0);
  };
};
