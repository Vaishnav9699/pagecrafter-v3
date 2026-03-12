import { registerChaiBlockProps, stylesProp } from "@chaibuilder/runtime";
import { ChaiBlockComponentProps, ChaiStyles } from "@chaibuilder/types/blocks";
import * as React from "react";

export type EmptyBoxProps = {
  styles: ChaiStyles;
  backgroundImage: string;
};

const EmptyBox = (props: ChaiBlockComponentProps<EmptyBoxProps>) => {
  const { blockProps, styles, backgroundImage } = props;
  let cssStyles = {};
  if (backgroundImage) {
    cssStyles = { backgroundImage: `url(${backgroundImage})` };
  }
  return React.createElement("div", { ...blockProps, ...styles, style: cssStyles });
};

const Config = {
  type: "EmptyBox",
  description: "A box component with no children",
  label: "Empty Box",
  category: "core",
  group: "basic",
  props: registerChaiBlockProps({
    properties: {
      styles: stylesProp(""),
      backgroundImage: {
        type: "string",
        title: "Background Image",
        default: "",
        ui: { "ui:widget": "image", "ui:allowEmpty": true },
      },
    },
  }),
};

export { EmptyBox as Component, Config };
