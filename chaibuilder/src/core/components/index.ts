import ChaiBuilderCanvas from "@chaibuilder/core/components/canvas/canvas-area";
import BlockPropsEditor from "@chaibuilder/core/components/settings/block-settings";
import BlockStyleEditor from "@chaibuilder/core/components/settings/block-styling";
import AddBlocksPanel from "@chaibuilder/core/components/sidepanels/panels/add-blocks/add-blocks";
import ImportHTML from "@chaibuilder/core/components/sidepanels/panels/add-blocks/import-html";
import UILibrariesPanel from "@chaibuilder/core/components/sidepanels/panels/add-blocks/libraries-panel";
import Outline from "@chaibuilder/core/components/sidepanels/panels/outline/list-tree";
import ThemeOptions from "@chaibuilder/core/components/sidepanels/panels/theme-configuration/theme-config-panel";
import i18n from "@chaibuilder/core/locales/load";

export { AIUserPrompt } from "@chaibuilder/core/components/ask-ai-panel";
export { Breakpoints as ScreenSizes } from "@chaibuilder/core/components/canvas/topbar/canvas-breakpoints";
export { DarkMode as DarkModeSwitcher } from "@chaibuilder/core/components/canvas/topbar/dark-mode";
export { UndoRedo } from "@chaibuilder/core/components/canvas/topbar/undo-redo";
export { ChaiBuilderEditor } from "@chaibuilder/core/components/chaibuilder-editor";
export { AddBlocksDialog } from "@chaibuilder/core/components/layout/add-blocks-dialog";
export { BlockAttributesEditor } from "@chaibuilder/core/components/settings/new-panel/block-attributes-editor";
export { DefaultChaiBlocks } from "@chaibuilder/core/components/sidepanels/panels/add-blocks/default-blocks";
export { default as JSONFormFieldTemplate } from "@chaibuilder/core/rjsf-widgets/json-form-field-template";
export {
  AddBlocksPanel,
  BlockPropsEditor,
  BlockStyleEditor,
  ChaiBuilderCanvas,
  i18n,
  ImportHTML,
  Outline,
  ThemeOptions,
  UILibrariesPanel as UILibraries,
};

export * from "@chaibuilder/types";
