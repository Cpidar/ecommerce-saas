// configs/components/HeroSection.ts
import { imagePickerField } from "../fields/image-picker"
import { ComponentConfig } from "@puckeditor/core"
import Image, { StaticImageData } from "next/image"

interface HeroSection {
  image: string | StaticImageData
  imageAlt: string
}

export const HeroSection: ComponentConfig<HeroSection> = {
  label: "بخش هیرو",
  defaultProps: {
    image: "/images/content/living-room-gray-armchair-two-seater-sofa.png",
    imageAlt: "Living room with gray armchair and two-seater sofa",
  },
  fields: {
    image: {
      label: "Hero Image",
      ...imagePickerField,
    },
    imageAlt: {
      type: "text",
      label: "Image Alt Text",
    },
  },
  render: ({ image, imageAlt }) => (
      <div className="max-md:pt-18 pb-8 md:pb-26">
        <Image
          src={typeof image === "string" ? image : image.src}
          width={2880}
          height={1500}
          alt={imageAlt}
          className="md:h-screen md:object-cover"
        />
      </div>
  ),
}
