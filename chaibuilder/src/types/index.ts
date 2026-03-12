import type { ChaiBuilderEditorProps } from "@chaibuilder/types/chaibuilder-editor-props";

export type { ChaiBuilderEditorProps };

export type ChaiAsset = {
  url: string;
  id?: string;
  thumbnailUrl?: string;
  description?: string;
  width?: number;
  height?: number;
};

export * from "@chaibuilder/types/actions";
export * from "@chaibuilder/types/blocks";
export * from "@chaibuilder/types/chaibuilder-editor-props";
export * from "@chaibuilder/types/collections";
export * from "@chaibuilder/types/common";
export * from "@chaibuilder/types/types";
