import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@chaibuilder/components/ui/alert-dialog";
import { Button } from "@chaibuilder/components/ui/button";
import { useBlocksStoreUndoableActions } from "@chaibuilder/hooks/history/use-blocks-store-undoable-actions";
import { useSelectedBlockIds } from "@chaibuilder/hooks/use-selected-blockIds";
import { useSelectedStylingBlocks } from "@chaibuilder/hooks/use-selected-styling-blocks";
import { EraserIcon } from "@radix-ui/react-icons";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

export const ClearCanvas = ({ children }: { children?: React.ReactNode }) => {
  const { t } = useTranslation();
  const { setNewBlocks } = useBlocksStoreUndoableActions();
  const [, setIds] = useSelectedBlockIds();
  const [, setStyleIds] = useSelectedStylingBlocks();
  const clearCanvas = useCallback(() => {
    setNewBlocks([]);
    setIds([]);
    setStyleIds([]);
  }, [setNewBlocks]);

  return (
    <div className="flex items-center">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {children || (
            <Button size="sm" variant="ghost" className="flex items-center">
              <EraserIcon />
            </Button>
          )}
        </AlertDialogTrigger>
        <AlertDialogContent className={"border-border"}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">{t("Clear whole canvas?")}</AlertDialogTitle>
            <AlertDialogDescription>{t("Are you sure you want to clear the page?")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-foreground">{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={clearCanvas}>{t("Yes")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
