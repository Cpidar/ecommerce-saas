// app/puck/components/FeaturedProductCard.tsx
import { ComponentConfig } from "@puckeditor/core"
import Image from "next/image"
import { Link } from "@/components/ui/Link"
import { imagePickerField } from "../fields/image-picker";
import { checkboxField } from "../fields/checkbox";
import { LayoutColumn } from "@/components/layout/Layout";

interface FeaturedProductCardProps {
  // Editable props
  productImage: any;
  productName: string;
  productCategory: string;
  productPrice: string;
  productHandle: string;
  imageAlt: string;
  showSection: boolean;
  
  // Server props (none - this is a static featured product)
}

export const FeaturedProductCard: ComponentConfig<FeaturedProductCardProps> = {
  label: "محصول برجسته",
  fields: {
    productImage: {
      label: "Product Image",
      ...imagePickerField,
    },
    imageAlt: {
      type: "text",
      label: "Image Alt Text",
    },
    productName: {
      type: "text",
      label: "Product Name",
    },
    productCategory: {
      type: "text",
      label: "Category",
    },
    productPrice: {
      type: "text",
      label: "Price",
    },
    productHandle: {
      type: "text",
      label: "Product Handle (URL slug)",
    },
    showSection: {
      label: "Show Section",
      ...checkboxField
    },
  },
  defaultProps: {
    productImage: "/images/content/dark-gray-three-seater-sofa.png",
    imageAlt: "Dark gray three-seater sofa",
    productName: "Astrid Curve",
    productCategory: "Scandinavian Simplicity",
    productPrice: "1500€",
    productHandle: "astrid-curve",
    showSection: true,
  },
  render: ({ productImage, imageAlt, productName, productCategory, productPrice, productHandle, showSection }) => {
    if (!showSection) return <></>;
    
    return (
      <LayoutColumn start={{ base: 1, md: 9 }} end={13}>
        <Link href={`/products/${productHandle}`}>
          <Image
            src={productImage}
            width={768}
            height={572}
            alt={imageAlt}
            className="mb-4 md:mb-6"
          />
          <div className="flex justify-between">
            <div>
              <p className="mb-1">{productName}</p>
              <p className="text-grayscale-500 text-xs">{productCategory}</p>
            </div>
            <div>
              <p className="font-semibold">{productPrice}</p>
            </div>
          </div>
        </Link>
      </LayoutColumn>
    );
  },
};