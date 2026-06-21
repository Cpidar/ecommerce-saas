import {
  InjectTransactionManager,
  MedusaContext,
  MedusaService,
} from "@medusajs/framework/utils"
import { Context } from "@medusajs/framework/types"
import { EntityManager } from "@medusajs/framework/mikro-orm/knex"

import StoreConfig from "./models/store-config"
import { UpdateStoreConfigWorkflowInput } from "../../workflows/update-store-config/types"

export default class StoreConfigModuleService extends MedusaService({
  StoreConfig,
}) {
  @InjectTransactionManager()
  async replaceFields(
    { id, ...fields }: UpdateStoreConfigWorkflowInput,
    @MedusaContext() sharedContext?: Context<EntityManager>
  ) {
    const updateData = Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== undefined)
    )

    await sharedContext!.transactionManager!.nativeUpdate(
      "store_config",
      { id },
      {
        ...updateData,
        updated_at: new Date(),
      }
    )

  }
}