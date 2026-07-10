import React from "react";

import { spacingOptions } from "../../options";
import { ComponentConfig } from "@puckeditor/core";

export type SpaceProps = {
  direction?: "" | "vertical" | "horizontal";
  size: string;
};

export const Space: ComponentConfig<SpaceProps> = {
  label: "Space",
  fields: {
    size: {
      type: "select",
      options: spacingOptions,
    },
    direction: {
      type: "radio",
      options: [
        { value: "vertical", label: "Vertical" },
        { value: "horizontal", label: "Horizontal" },
        { value: "", label: "Both" },
      ],
    },
  },
  defaultProps: {
    direction: "",
    size: "12",
  },
  inline: true,
  render: ({ direction, size, puck }) => {
    return (
      <div
        ref={puck.dragRef}
        className={`block h-${size} w-full`}
      />
    );
  },
};
