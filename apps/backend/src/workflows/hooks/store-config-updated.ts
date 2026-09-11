import { MedusaError } from "@medusajs/framework/utils"
import { updateStoreConfigWorkflow } from "../update-store-config"
import { revalidate } from "../../utils/revalidate"

updateStoreConfigWorkflow.hooks.storeConfigUpdated(
    async ({ storeConfig }, { container }) => {
        revalidate(
            container,
            "store-configs",
            {
                type: "store_config.updated",
                id: storeConfig.id,
                handle: storeConfig.handle!,
                affects_grid: true
            })
    }
)