"use client";

import { CustomField } from "@puckeditor/core";
import { ImagePickerField } from "@/puck/fields/ImagePickerField";
import { StaticImageData } from "next/image";

export const imagePickerField: CustomField<string | StaticImageData> = {
  type: "custom",
  render: ({ field, name, value, onChange }: any) => {
    return (
      <ImagePickerField
        label={field.label || name}
        value={value || ""}
        onChange={onChange}
        placeholder="Choose an image from your media library"
        name={name}
        field={field}
      />
    );
  },
};