import { registerChaiBlockProps, stylesProp } from "@chaibuilder/runtime";
import { ChaiBlockComponentProps, ChaiStyles } from "@chaibuilder/types/blocks";
import { createElement } from "react";

export type LineBreakProps = {
  styles: ChaiStyles;
};

const LineBreakBlock = (props: ChaiBlockComponentProps<LineBreakProps>) => {
  const { blockProps, styles } = props;

  return createElement("br", { ...blockProps, ...styles });
};

const Config = {
  type: "LineBreak",
  label: "Line Break",
  category: "core",
  group: "basic",
  hidden: true,
  props: registerChaiBlockProps({
    properties: {
      styles: stylesProp(""),
    },
  }),
  canAcceptBlock: () => true,
  canDelete: () => false,
  canMove: () => false,
  canDuplicate: () => false,
};

export { LineBreakBlock as Component, Config };
