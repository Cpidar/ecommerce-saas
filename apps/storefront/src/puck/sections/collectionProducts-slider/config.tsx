import { ComponentConfig } from "@puckeditor/core";
import CollectionProductsSlider from "./components";
import mockData from "@/lib/static-data/products.json";
import { Product } from "@/types";

interface MedusaCollection {
  id: string;
  title: string;
  handle: string;
  deleted_at?: string;
  metadata?: Record<string, any>;
  external_id?: string;
  products?: any[];
}

type Props = {
  collection: { id: string; title: string; handle: string };
  categoryCardType: string;
  heading: string;
  subHeading: string;
  data?: Product[];
};

const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const publishableApiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

const collectionsList = async (): Promise<MedusaCollection[]> => {
  if (!publishableApiKey || !backendUrl) {
    throw new Error("Missing Medusa backend URL or publishable API key");
  }

  const match = document.cookie.match(/current_store_id=([^;]+)/);
  const storeIdCache = match && match[1];
  console.log("sdk hit from client", storeIdCache);

  const headers: HeadersInit = {
    "x-publishable-api-key": publishableApiKey,
    "Content-Type": "application/json",
    "x-store-id": storeIdCache || "store_01KVJBNGCHF9N47BJFRJ3BMWHY",
  };
  const res = await fetch(`${backendUrl}/store/collections`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const { collections } = await res.json();
  return collections.map((collection: MedusaCollection) => ({
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
  }));
};

async function getCollection(collectionId: string): Promise<{ collection: MedusaCollection }> {
  if (!publishableApiKey || !backendUrl) {
    throw new Error("Missing Medusa backend URL or publishable API key");
  }

  const match = document.cookie.match(/current_store_id=([^;]+)/);
  const storeIdCache = match && match[1];
  console.log("sdk hit from client", storeIdCache);

  const headers: HeadersInit = {
    "x-publishable-api-key": publishableApiKey,
    "Content-Type": "application/json",
    "x-store-id": storeIdCache || "store_01KVJBNGCHF9N47BJFRJ3BMWHY",
  };
  const response = await fetch(
    `${backendUrl}/store/collections/${collectionId}?fields=id,title,handle,*products`,
    {
      method: "GET",
      headers,
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const CollectionProductsSliderSection: ComponentConfig<Props> = {
  label: "اسلایدر محصولات یک کالکشن",
  fields: {
    collection: {
      type: "external",
      label: "انتخاب کالکشن",
      fetchList: collectionsList,
    },
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
      contentEditable: true,
    },
    subHeading: {
      type: "textarea",
      contentEditable: true,
    },
  },
  // resolveData: async ({ props }, { changed }) => {
  //   // Remove read-only from the title field if `data` is empty
  //   if (!props.collection.id)
  //     return { props: { data: mockData.products as unknown as Product[] } };

  //   // Don't query unless `data` has changed since resolveData was last run
  //   if (!changed.data) return { props };

  //   const { collection } = await getCollection(props.collection.id);
  //   const data = collection.products;
  //   console.log(collection);
  //   return {
  //     props: {
  //       data,
  //     },
  //   };
  // },

  defaultProps: {
    collection: { id: "", title: "نام کالکشن", handle: "default" },
    categoryCardType: "card07",
    heading: "نام کالکشن",
    subHeading: "",
    data: mockData.products as unknown as Product[],
  },
  render: ({ heading, subHeading, data }) => {
    return (
      <CollectionProductsSlider
        heading={heading}
        data={data?.length ? data : (mockData.products as unknown as Product[])}
      />
    );
  },
};
