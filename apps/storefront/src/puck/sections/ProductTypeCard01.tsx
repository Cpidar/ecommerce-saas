// configs/components/ProductTypeCard.ts
import { ComponentConfig } from "@puckeditor/core"
import Image, { StaticImageData } from "next/image"
import { Link } from "@/components/ui/Link"
import { LayoutColumn } from "@/components/layout/Layout"
import { imagePickerField } from "../fields/image-picker"

interface ProductTypeCard {
  value: string
  image: string | StaticImageData
  index: number
}

export const ProductTypeCard: ComponentConfig<ProductTypeCard> = {
  label: "نمایش نوع محصولات",
  defaultProps: {
    value: "Product Type",
    image: "",
    index: 0,
  },
  fields: {
    value: {
      type: "text",
      label: "Product Type Value",
    },
    image: {
      label: "Product Type Image",
      ...imagePickerField,
    },
    index: {
      type: "number",
      label: "Display Index (for layout)",
    },
  },
  render: ({ id, value, image, index }) => (
    <LayoutColumn
      start={index % 2 === 0 ? 1 : 7}
      end={index % 2 === 0 ? 7 : 13}
    >
      <Link href={`/store?type=${value}`}>
        {image && (
          <Image
            src={typeof image === 'string' ? image : image.src}
            width={1200}
            height={900}
            alt={value}
            className="mb-2 md:mb-8"
          />
        )}
        <p className="text-xs md:text-md">{value}</p>
      </Link>
    </LayoutColumn>
  ),
}