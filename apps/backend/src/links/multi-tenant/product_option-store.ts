import ProductModule from "@medusajs/medusa/product";
import StoreModule from "@medusajs/medusa/store";
import { defineLink } from "@medusajs/framework/utils";

export default defineLink(
  {
    linkable: ProductModule.linkable.productOption,
    isList: true,
  },
  StoreModule.linkable.store,
);