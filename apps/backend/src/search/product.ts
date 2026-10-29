import {
  defineSearchIndex,
  graphConsume,
  graphSeed,
  search,
} from "@medusajs/framework/utils";
import { normalizePersianText } from "../utils/normalize-persian-text";

const source = {
  fields: [
    "id",
    "title",
    "description",
    "handle",
    "thumbnail",
    "status",
    "sales_channel_ids",
    "store.id",
  ],
  transform: (products) => {
    console.log(products);
    return products.map((product) => ({
      ...product,
      title: normalizePersianText(product.title),
      status: product.status,
    }));
  },
};

export const productIndex = defineSearchIndex({
  name: "product",
  entity: "product",

  fields: search.define({
    id: search.keyword().filterable().retrievable(),
    title: search.text().searchable({ weight: 3 }).sortable().retrievable(),
    description: search.text().searchable(),
    handle: search.keyword().filterable().retrievable(),
    thumbnail: search.keyword(),

    status: search.keyword().filterable().retrievable(false),

    // sales_channel_ids: search.keyword().array().filterable().retrievable(false),

    store: search
      .object({
        id: search.keyword().filterable().retrievable(false),
      })
      .filterable(),
  }),

  events: ["product.created", "product.updated", "product.deleted"],

  consume: graphConsume(source),
  seed: graphSeed(source),
});
