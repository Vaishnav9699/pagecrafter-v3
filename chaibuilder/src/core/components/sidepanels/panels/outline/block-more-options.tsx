import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@chaibuilder/components/ui/dropdown-menu";
import { useIsDragAndDropEnabled } from "@chaibuilder/core/components/canvas/dnd/drag-and-drop/hooks";
import { ClearCanvas } from "@chaibuilder/core/components/canvas/topbar/clear-canvas";
import { SaveToLibrary } from "@chaibuilder/core/components/sidepanels/panels/outline/save-to-library";
import { UnlinkLibraryBlock } from "@chaibuilder/core/components/sidepanels/panels/outline/unlink-library-block";
import { CHAI_BUILDER_EVENTS } from "@chaibuilder/core/events";
import { canAddChildBlock, canDeleteBlock, canDuplicateBlock } from "@chaibuilder/core/functions/block-helpers";
import { PERMISSIONS } from "@chaibuilder/core/main";
import { pubsub } from "@chaibuilder/core/pubsub";
import { useBlocksStore } from "@chaibuilder/hooks/history/use-blocks-store-undoable-actions";
import { useBuilderProp } from "@chaibuilder/hooks/use-builder-prop";
import { useCopyBlocks } from "@chaibuilder/hooks/use-copy-blockIds";
import { useCutBlockIds } from "@chaibuilder/hooks/use-cut-blockIds";
import { useDuplicateBlocks } from "@chaibuilder/hooks/use-duplicate-blocks";
import { usePasteBlocks } from "@chaibuilder/hooks/use-paste-blocks";
import { usePermissions } from "@chaibuilder/hooks/use-permissions";
import { useRemoveBlocks } from "@chaibuilder/hooks/use-remove-blocks";
import { useSelectedBlock, useSelectedBlockIds } from "@chaibuilder/hooks/use-selected-blockIds";
import {
  CardStackIcon,
  CardStackPlusIcon,
  CopyIcon,
  EraserIcon,
  Pencil2Icon,
  PlusIcon,
  ScissorsIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { has, isEmpty } from "lodash-es";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ExportCode } from "./export-code";

const CopyPasteBlocks = ({ isFromBody = false }: { isFromBody?: boolean }) => {
  const [blocks] = useBlocksStore();
  const [selectedIds] = useSelectedBlockIds();
  const { pasteBlocks } = usePasteBlocks();
  const [, copyBlocks, hasPartialBlocks] = useCopyBlocks();
  const { t } = useTranslation();
  const selectedBlock = useSelectedBlock();
  const enableCopyToClipboard = useBuilderProp("flags.copyPaste", true);

  const handleCopy = useCallback(() => {
    const actionableBlocks = isFromBody
      ? blocks?.filter((block) => !block?._parent)?.map((block) => block?._id)
      : selectedIds;
    const selectedBlocks = actionableBlocks.map((id) => {
      const block = blocks.find((b) => b._id === id);
      return {
        id,
        data: block,
      };
    });

    if (hasPartialBlocks(selectedBlocks.map((block) => block.id))) {
      toast.warning("Partial blocks detected. Clone partial blocks?", {
        cancel: {
          label: t("No"),
          onClick: () => {
            copyBlocks(selectedBlocks.map((block) => block.id));
            toast.dismiss();
          },
        },
        action: {
          label: t("Yes"),
          onClick: () => {
            copyBlocks(
              selectedBlocks.map((block) => block.id),
              true,
            );
            toast.dismiss();
          },
        },
        position: "top-center",
      });
      // setCopiedBlocks(selectedBlocks.map((block) => block.id));
    } else {
      copyBlocks(selectedBlocks.map((block) => block.id));
    }
  }, [selectedIds, blocks, copyBlocks, hasPartialBlocks]);

  return (
    <>
      {enableCopyToClipboard && (
        <DropdownMenuItem
          disabled={!canDuplicateBlock(selectedBlock?._type!)}
          onClick={handleCopy}
          className="flex items-center gap-x-4 text-xs">
          <CopyIcon /> {t("Copy")}
        </DropdownMenuItem>
      )}
      {enableCopyToClipboard && (
        <DropdownMenuItem
          className="flex items-center gap-x-4 text-xs"
          onClick={() => {
            pasteBlocks(selectedIds);
          }}>
          <CardStackIcon /> {t("Paste")}
        </DropdownMenuItem>
      )}
    </>
  );
};

const CutBlocks = () => {
  const [selectedIds] = useSelectedBlockIds();
  const [, setCutBlockIds] = useCutBlockIds();
  const { t } = useTranslation();
  const enableCopyToClipboard = useBuilderProp("flags.copyPaste", true);

  return (
    <>
      {enableCopyToClipboard && (
        <DropdownMenuItem className="flex items-center gap-x-4 text-xs" onClick={() => setCutBlockIds(selectedIds)}>
          <ScissorsIcon /> {t("Cut")}
        </DropdownMenuItem>
      )}
    </>
  );
};

const RemoveBlocks = () => {
  const [selectedIds] = useSelectedBlockIds();
  const removeBlocks = useRemoveBlocks();
  const selectedBlock = useSelectedBlock();
  const { t } = useTranslation();

  return (
    <DropdownMenuItem
      // @ts-ignore
      disabled={!canDeleteBlock(selectedBlock?._type)}
      className="flex items-center gap-x-4 text-xs"
      onClick={() => removeBlocks(selectedIds)}>
      <TrashIcon /> {t("Remove")}
    </DropdownMenuItem>
  );
};

const RenameBlock = ({ node }: { node: any }) => {
  const { t } = useTranslation();
  return (
    <DropdownMenuItem
      onClick={(e) => {
        e.stopPropagation();
        node.edit();
        node.deselect();
      }}
      className="flex items-center gap-x-4 text-xs">
      <Pencil2Icon className="h-4 w-4" /> {t("Rename")}
    </DropdownMenuItem>
  );
};

const BlockContextMenuContent = ({ node }: { node: any }) => {
  const { t } = useTranslation();
  const [selectedIds] = useSelectedBlockIds();
  const duplicateBlocks = useDuplicateBlocks();
  const selectedBlock = useSelectedBlock();
  const { hasPermission } = usePermissions();
  const { librarySite } = useBuilderProp("flags", { librarySite: false });
  const isDragAndDropEnabled = useIsDragAndDropEnabled();

  const duplicate = useCallback(() => {
    duplicateBlocks(selectedIds);
  }, [selectedIds, duplicateBlocks]);

  const isLibLinkedBlock = useMemo(() => {
    return has(selectedBlock, "_libBlockId") && !isEmpty(selectedBlock._libBlockId);
  }, [selectedBlock?._libBlockId]);

  if (node === "BODY") {
    return (
      <DropdownMenuContent side="bottom" className="border-border text-xs">
        {hasPermission(PERMISSIONS.ADD_BLOCK) && (
          <>
            <DropdownMenuItem
              disabled={false}
              className="flex items-center gap-x-4 text-xs"
              onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK, selectedBlock)}>
              <PlusIcon className="h-3.5 w-3.5" /> {t("Add block")}
            </DropdownMenuItem>
            {hasPermission(PERMISSIONS.ADD_BLOCK) && <CopyPasteBlocks isFromBody={true} />}
            <ExportCode />
            <DropdownMenuItem
              disabled={false}
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-x-4 text-xs">
              <ClearCanvas
                children={
                  <div className="flex items-center gap-x-4 text-xs">
                    <EraserIcon /> {t("Clear canvas")}
                  </div>
                }
              />
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    );
  }

  return (
    <DropdownMenuContent side="bottom" className="border-border text-xs">
      {hasPermission(PERMISSIONS.ADD_BLOCK) && (
        <>
          {!isDragAndDropEnabled && (
            <DropdownMenuItem
              disabled={!canAddChildBlock(selectedBlock?._type!)}
              className="flex items-center gap-x-4 text-xs"
              onClick={() => pubsub.publish(CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK, selectedBlock)}>
              <PlusIcon className="h-3.5 w-3.5" /> {t("Add block")}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            disabled={!canDuplicateBlock(selectedBlock?._type!)}
            className="flex items-center gap-x-4 text-xs"
            onClick={duplicate}>
            <CardStackPlusIcon /> {t("Duplicate")}
          </DropdownMenuItem>
        </>
      )}
      <RenameBlock node={node} />
      {hasPermission(PERMISSIONS.MOVE_BLOCK) && <CutBlocks />}
      {hasPermission(PERMISSIONS.ADD_BLOCK) && <CopyPasteBlocks />}
      {isLibLinkedBlock && librarySite && <UnlinkLibraryBlock />}
      {hasPermission(PERMISSIONS.CREATE_LIBRARY_BLOCK) && librarySite && <SaveToLibrary />}
      <ExportCode />
      {hasPermission(PERMISSIONS.DELETE_BLOCK) && <RemoveBlocks />}
    </DropdownMenuContent>
  );
};

export const BlockMoreOptions = ({ children, id, node }: { children: React.ReactNode | null; id: any; node: any }) => {
  const [, setSelectedIds] = useSelectedBlockIds();
  return (
    <>
      <DropdownMenu
        onOpenChange={(open) => {
          if (open) setSelectedIds([id]);
        }}>
        <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
        <BlockContextMenuContent node={node} />
      </DropdownMenu>
    </>
  );
};
