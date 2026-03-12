import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@chaibuilder/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@chaibuilder/components/ui/dialog";
import { TokensIcon } from "@radix-ui/react-icons";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { DesignTokenPreview } from "./design-token-preview";
import ManageDesignTokens from "./manage-design-tokens";

interface ManageDesignTokensModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ManageDesignTokensModal: React.FC<ManageDesignTokensModalProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation();
  const [activeToken, setActiveToken] = useState<{ name: string; value: string; id?: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardAlert, setShowDiscardAlert] = useState(false);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && hasUnsavedChanges) {
        setShowDiscardAlert(true);
        return;
      }
      onOpenChange(nextOpen);
    },
    [hasUnsavedChanges, onOpenChange],
  );

  const handleConfirmDiscard = useCallback(() => {
    setShowDiscardAlert(false);
    setHasUnsavedChanges(false);
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex h-[540px] max-w-6xl flex-col gap-0 p-0">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="flex items-center gap-2">
              <TokensIcon className="h-5 w-5 text-primary" />
              {t("Design Token Management")}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Left side - Token Management */}
            <div className="flex w-1/2 flex-col border-r border-border p-4">
              <ManageDesignTokens onActiveTokenChange={setActiveToken} onDirtyStateChange={setHasUnsavedChanges} />
            </div>

            {/* Right side - Live Preview */}
            <div className="flex w-1/2 flex-col p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t("Live Preview")}</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <DesignTokenPreview activeToken={activeToken} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDiscardAlert} onOpenChange={setShowDiscardAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Unsaved Changes")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("You have unsaved changes. Are you sure you want to close? Your changes will be lost.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Continue Editing")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard}>{t("Discard Changes")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ManageDesignTokensModal;
