import {
  defineSearchIndex,
  graphConsume,
  graphSeed,
  search,
} from "@medusajs/framework/utils"

const source = {
  fields: [
    "id",
    "title",
    "description",
    "handle",
    "thumbnail",
    "status",
    "store_id",
  ],
}

export const productIndex = defineSearchIndex({
  name: "product",
  entity: "product",

  fields: search.define({
    id: search.keyword().filterable(),
    title: search.text().searchable({ weight: 3 }),
    description: search.text().searchable(),
    handle: search.keyword().filterable(),
    thumbnail: search.keyword(),

    status: search
      .keyword()
      .filterable()
      .retrievable(false),

    store_id: search
      .keyword()
      .filterable(),
  }),

  events: [
    "product.created",
    "product.updated",
    "product.deleted",
  ],

  consume: graphConsume(source),
  seed: graphSeed(source),
})
