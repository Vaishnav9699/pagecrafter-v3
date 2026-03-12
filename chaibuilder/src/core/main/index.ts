import ChaiBuilderCanvas from "@chaibuilder/core/components/canvas/canvas-area";
import BlockPropsEditor from "@chaibuilder/core/components/settings/block-settings";
import BlockStyleEditor from "@chaibuilder/core/components/settings/block-styling";
import AddBlocksPanel from "@chaibuilder/core/components/sidepanels/panels/add-blocks/add-blocks";
import ImportHTML from "@chaibuilder/core/components/sidepanels/panels/add-blocks/import-html";
import UILibrariesPanel from "@chaibuilder/core/components/sidepanels/panels/add-blocks/libraries-panel";
import Outline from "@chaibuilder/core/components/sidepanels/panels/outline/list-tree";
import ThemeConfigPanel from "@chaibuilder/core/components/sidepanels/panels/theme-configuration/theme-config-panel";
import i18n from "@chaibuilder/core/locales/load";
import { registerFeatureFlags } from "@chaibuilder/core/utils/feature-flag";
import type { ChaiBuilderEditorProps } from "@chaibuilder/types";

if (typeof window === "undefined") {
  throw new Error("@chaibuilder/sdk is only supported in the browser. Avoid using it in the server side.");
}

// Register feature flags
registerFeatureFlags();

// components
export { AIUserPrompt as ChaiAskAiUserPrompt } from "@chaibuilder/core/components/ask-ai-panel";
export { Breakpoints as ChaiScreenSizes } from "@chaibuilder/core/components/canvas/topbar/canvas-breakpoints";
export { DarkMode as ChaiDarkModeSwitcher } from "@chaibuilder/core/components/canvas/topbar/dark-mode";
export { UndoRedo as ChaiUndoRedo } from "@chaibuilder/core/components/canvas/topbar/undo-redo";
export { ChaiBuilderEditor } from "@chaibuilder/core/components/chaibuilder-editor";
export { AddBlocksDialog as ChaiAddBlocksDialog } from "@chaibuilder/core/components/layout/add-blocks-dialog";
export { BlockAttributesEditor as ChaiBlockAttributesEditor } from "@chaibuilder/core/components/settings/new-panel/block-attributes-editor";
export { DefaultChaiBlocks as ChaiDefaultBlocks } from "@chaibuilder/core/components/sidepanels/panels/add-blocks/default-blocks";
export { ChaiDraggableBlock } from "@chaibuilder/core/components/sidepanels/panels/add-blocks/draggable-block";
export { ExportCodeModal as ChaiExportCodeModal } from "@chaibuilder/core/modals/export-code-modal";
export {
  AddBlocksPanel as ChaiAddBlocksPanel,
  BlockPropsEditor as ChaiBlockPropsEditor,
  BlockStyleEditor as ChaiBlockStyleEditor,
  ChaiBuilderCanvas,
  ImportHTML as ChaiImportHTML,
  Outline as ChaiOutline,
  ThemeConfigPanel as ChaiThemeConfigPanel,
  UILibrariesPanel as ChaiUILibrariesPanel,
};

// i18n
export { i18n };

// helper functions
export { generateUUID as generateBlockId, cn as mergeClasses } from "@chaibuilder/core/functions/common-functions";
export { getClassValueAndUnit } from "@chaibuilder/core/functions/helper-fn";
export { getBlocksFromHTML as convertHTMLToChaiBlocks, getBlocksFromHTML } from "@chaibuilder/core/import-html/html-to-json";
export { defaultChaiLibrary } from "@chaibuilder/core/library-blocks/default-chai-library";

// types
export type { ChaiBuilderEditorProps };

export type { ChaiLibrary, ChaiLibraryBlock } from "@chaibuilder/types/chaibuilder-editor-props";

// constants
export { PERMISSIONS } from "@chaibuilder/core/constants/PERMISSIONS";
export { useAddBlock } from "@chaibuilder/hooks/use-add-block";
export { useBlocksHtmlForAi } from "@chaibuilder/hooks/use-blocks-html-for-ai";
export { useHtmlToBlocks } from "@chaibuilder/hooks/use-html-to-blocks";
export { useI18nBlocks } from "@chaibuilder/hooks/use-i18n-blocks";
export { useLanguages } from "@chaibuilder/hooks/use-languages";
export { useReplaceBlock } from "@chaibuilder/hooks/use-replace-block";
export { useSavePage } from "@chaibuilder/hooks/use-save-page";
export { useSelectedBlock } from "@chaibuilder/hooks/use-selected-blockIds";
export { useStreamMultipleBlocksProps } from "@chaibuilder/hooks/use-update-blocks-props";
export * from "@chaibuilder/runtime/client";
export type { ChaiTheme } from "@chaibuilder/types/chaibuilder-editor-props";
export { useTranslation } from "react-i18next";
