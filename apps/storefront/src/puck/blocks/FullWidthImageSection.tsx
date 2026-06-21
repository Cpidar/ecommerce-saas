// app/puck/components/FullWidthImageSection.tsx
import { ComponentConfig } from "@puckeditor/core"
import Image from "next/image"
import { imagePickerField } from "../fields/image-picker";
import { checkboxField } from "../fields/checkbox";

interface FullWidthImageSectionProps {
  // Editable props
  image: any;
  altText: string;
  className?: string;
  showSection: boolean;
  
  // Server props (none)
}

export const FullWidthImageSection: ComponentConfig<FullWidthImageSectionProps> = {
  label: "تصویر برجسته تمام عرض",
  fields: {
    image: {
      label: "Image",
      ...imagePickerField,
    },
    altText: {
      type: "text",
      label: "Alt Text",
    },
    className: {
      type: "text",
      label: "Additional CSS Classes",
    },
    showSection: {
      label: "Show Section",
      ...checkboxField
    },
  },
  defaultProps: {
    image: "/images/content/living-room-brown-armchair-gray-corner-sofa.png",
    altText: "Living room with brown armchair and gray corner sofa",
    className: "mt-26 md:mt-36 mb-8 md:mb-26",
    showSection: true,
  },
  render: ({ image, altText, className, showSection }: FullWidthImageSectionProps) => {
    if (!showSection) return <></>;

    return (
      <Image
        src={image}
        width={2496}
        height={1404}
        alt={altText}
        className={className}
      />
    );
  },
};