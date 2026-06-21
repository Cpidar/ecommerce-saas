import StoreModule from "@medusajs/medusa/store";
import { defineLink } from "@medusajs/framework/utils";
import StoreConfig from "../../modules/store-config";

export default defineLink(
  StoreConfig.linkable.storeConfig,
  StoreModule.linkable.store,
);