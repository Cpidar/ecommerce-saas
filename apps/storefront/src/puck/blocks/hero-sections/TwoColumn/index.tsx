import { ComponentConfig, CustomField } from "@puckeditor/core";
import TwoColumn from "./TwoColumn";
import { ReactNode } from "react";
import { StaticImageData } from "next/image";
import { imagePickerField } from "@/puck/fields/image-picker";

export interface SectionHeroProps {
  leftSection: {
    text: ReactNode;
    image: StaticImageData | string;
  };
  rightSection: {
    text: ReactNode;
    image: StaticImageData | string;
  };
}
const PLACEHOLDER_IMAGE = "/images/products/placeholder.svg";

export const HeroSection03: ComponentConfig<SectionHeroProps> = {
  label: "Hero Section 03",
  fields: {
    rightSection: {
      type: "object",
      objectFields: {
        text: { type: "richtext" },
        image: {
          label: "Image",
          ...imagePickerField,
        },
      },
    },
    leftSection: {
      type: "object",
      objectFields: {
        text: { type: "richtext" },
        image: {
          label: "Image",
          ...imagePickerField,
        },
      },
    },
  },
  defaultProps: {
    rightSection: {
      text: "test",
      image: PLACEHOLDER_IMAGE,
    },
    leftSection: {
      text: "test 2",
      image: PLACEHOLDER_IMAGE,
    },
  },
  resolveData: async ({ props }, { changed, metadata }) => {
    const { env, tenantSlug, isEditing } = metadata || {}; // Custom metadata passed from CMS/storefront
    if (changed || metadata.trigger === "load") {
      if (env === "cms" || isEditing) {
        return { props: { ...props, products: [] } }; // Or mock: [{ id: 'mock1', name: 'Sample Product' }]
      } else {
        // Storefront/runtime: Real fetch, cached
        // const cachedFetch = cache(
        //   async () => await fetchProducts(tenantSlug, props.filters)
        // ); // Next.js cache for perf
        // const products = await cachedFetch();
        // return { props: { ...props, products } };
      }
    }
    return { ...props };
  },
  render: ({ rightSection, leftSection }) => {
    return <TwoColumn rightSection={rightSection} leftSection={leftSection} />;
  },
};
