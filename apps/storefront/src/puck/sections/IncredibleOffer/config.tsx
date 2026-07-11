import { ComponentConfig } from "@puckeditor/core";
import IncredibleOffers from "./components";
import mockData from "@/lib/static-data/products.json";
import { Product } from "@/types";


type Props = {
  collectionSlug: string;
  categoryCardType: string;
  heading: string,
  subHeading: string,
  data?: Product[]
};


export const IncredibleOffersSection: ComponentConfig<Props> = {
  label: "محصولات شگفت انگیز",
  fields: {
    collectionSlug: { type: "text", contentEditable: false },
    categoryCardType: {
      type: "select",
      options: [
        { label: "Card 01", value: "card01" },
        { label: "Card 02", value: "card02" },
        { label: "Card 03", value: "card03" },
        { label: "Card 04", value: "card04" },
        { label: "Card 05", value: "card05" },
        { label: "Card 06", value: "card06" },
        { label: "Card 07", value: "card07" },
      ],
    },
    heading: {
      type: "textarea",
      contentEditable: true
    },
    subHeading: {
      type: "textarea",
    }
  },
  defaultProps: {
    collectionSlug: "incredible_offers",
    categoryCardType: 'card07',
    heading: 'تخفیفهای شگفت انگیز',
    subHeading: '',
    data: mockData.products as unknown as Product[]
  },
  render: ({ heading, subHeading, data }) => {
    return (
      <IncredibleOffers
        heading={heading}
        data={data ? data : mockData.products as unknown as Product[]}
      />
    );
  },
};
