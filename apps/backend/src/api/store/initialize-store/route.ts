import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { default_data_seed } from "../../../scripts/defaul-seed";
import { seedProgress } from "../../../utils/initialize-store-progress";
import { StoreDTO } from "@medusajs/types";
import { Modules } from "@medusajs/framework/utils";

export async function POST(req: MedusaRequest, res: MedusaResponse) {

    const locking = req.scope.resolve(Modules.LOCKING)
    const currentStore = req.scope.resolve("currentStore") as StoreDTO
    const storeId = currentStore.id

    if (seedProgress.isRunning()) {
        return res.status(409).json({ message: "عملیات seed در حال حاضر در حال اجراست." });
    }



    seedProgress.start();

    // Fire-and-forget: the storefront polls /store/seed/progress instead of waiting on this request.
    default_data_seed({ container: req.scope, storeId: storeId as string })
        .then(() => seedProgress.complete())
        .catch((err) => {
            seedProgress.fail(err instanceof Error ? err.message : "خطای ناشناخته");
        });

    res.status(202).json({ message: "عملیات seed آغاز شد." });
}