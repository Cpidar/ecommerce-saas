// PLAYGROUND TEST
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import StoreConfigLink from "../../links/multi-tenant/store_config-store";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    try {
        const { data: [{ store_config_id: storeConfigId }] } = await query.graph({
            entity: StoreConfigLink.entryPoint,
            fields: ["store_config_id", "store_id"],
            filters: {
                store_id: ["store_01KTK5R0R5MZZ6KSPB4M5SMPF"]
            }
        })
        console.log(storeConfigId)
        res.status(200).json(storeConfigId);
    } catch {
        res.sendStatus(409)

    }
}
