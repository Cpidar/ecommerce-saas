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

    // When updating an existing record, prevent uniqueness-check failures on fields
    // that keep their current value (handle, medusa_store_id).
    if (id) {
      const existing = await sharedContext!.transactionManager!.findOne(
        StoreConfig,
        { id },
      )

      if (existing) {
        // Remove fields that match their existing value — avoids triggering DB unique constraints on unchanged rows
        for (const key of ["handle", "medusa_store_id"]) {
          if (
            key in updateData &&
            (existing as any)[key] === updateData[key]
          ) {
            delete updateData[key as keyof typeof updateData]
          }
        }
      }
    }

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