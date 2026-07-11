// configs/components/ProductTypesSection.ts
import { ArrayField, ComponentConfig } from "@puckeditor/core"
import { Layout, LayoutColumn } from "@/components/layout/Layout"
import { checkboxField } from "../fields/checkbox"
import { Link } from "@/components/ui/Link"
import Image, { StaticImageData } from "next/image"
import { StoreProductType } from "@medusajs/types"

interface ProductTypesSection {
  showSection: boolean
  title: string
  productTypes: StoreProductType[]
}

export const ProductTypesSection: ComponentConfig<ProductTypesSection> = {
  label: "نمایش نوع محصولات",
  defaultProps: {
    showSection: true,
    title: "Our products",
    productTypes: [],
  },
  fields: {
    showSection: {
      label: "Show Section",
      ...checkboxField,
    },
    title: {
      type: "text",
      label: "Section Title",
    },
    productTypes: {
      type: "text",
      visible: false
    },
  },
  render: ({ showSection, title, productTypes }: ProductTypesSection) => {
    if (!showSection) return <></>

    return (
      <Layout className="mb-26 md:mb-36 max-md:gap-x-2">
        <LayoutColumn>
          <h3 className="text-md md:text-2xl mb-8 md:mb-15">{title}</h3>
        </LayoutColumn>
        {productTypes && productTypes.map((productType, index) => (
          <LayoutColumn
            key={productType?.id}
            start={index % 2 === 0 ? 1 : 7}
            end={index % 2 === 0 ? 7 : 13}
          >
            <Link href={`/store?type=${productType?.value}`}>
              {typeof productType?.metadata?.image === "object" &&
                productType?.metadata.image &&
                "url" in productType.metadata.image &&
                typeof productType.metadata.image.url === "string" && (
                  <Image
                    src={productType.metadata.image.url}
                    width={1200}
                    height={900}
                    alt={productType.value}
                    className="mb-2 md:mb-8"
                  />
                )}
              <p className="text-xs md:text-md">{productType?.value}</p>
            </Link>
          </LayoutColumn>
        ))}
      </Layout>
    )
  },
}
