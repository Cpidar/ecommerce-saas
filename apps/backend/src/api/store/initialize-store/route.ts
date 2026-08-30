import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { default_data_seed } from "../../../scripts/defaul-seed";
import { seedProgress } from "../../../utils/initialize-store-progress";
import { StoreDTO } from "@medusajs/types";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    if (seedProgress.isRunning()) {
        return res.status(409).json({ message: "عملیات seed در حال حاضر در حال اجراست." });
    }

    const currentStore = req.scope.resolve("currentStore") as StoreDTO;

    const { id: storeId } = currentStore;

    seedProgress.start();

    // Fire-and-forget: the storefront polls /store/seed/progress instead of waiting on this request.
    default_data_seed({ container: req.scope, storeId: storeId as string })
        .then(() => seedProgress.complete())
        .catch((err) => {
            seedProgress.fail(err instanceof Error ? err.message : "خطای ناشناخته");
        });

    res.status(202).json({ message: "عملیات seed آغاز شد." });
}