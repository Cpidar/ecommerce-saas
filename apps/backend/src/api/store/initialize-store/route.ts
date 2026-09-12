import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { default_data_seed } from "../../../scripts/defaul-seed";
import { seedProgress } from "../../../utils/initialize-store-progress";
import { StoreDTO } from "@medusajs/types";
import { Modules } from "@medusajs/framework/utils";

const LOCK_KEY = "store:seed:initialize"

export async function POST(req: MedusaRequest, res: MedusaResponse) {

    const locking = req.scope.resolve(Modules.LOCKING)
    const currentStore = req.scope.resolve("currentStore") as StoreDTO
    const storeId = currentStore.id

    try {
        // Try to acquire the lock (non-blocking for our use-case)
        // expire = 30 minutes safety net
        await locking.acquire(LOCK_KEY, {
            expire: 60 * 30, // 30 minutes
            // optional: ownerId: storeId
        })
    } catch (err) {
        // Lock already held → someone is already seeding
        return res.status(409).json({
            message: "عملیات seed در حال حاضر در حال اجراست.",
            ...seedProgress.get()
        })
    }

    if (seedProgress.isRunning()) {
        return res.status(409).json({ message: "عملیات seed در حال حاضر در حال اجراست." });
    }

    seedProgress.start();

    // Fire-and-forget: the storefront polls /store/seed/progress instead of waiting on this request.
    default_data_seed({ container: req.scope, storeId })
        .then(async () => {
            seedProgress.complete()
            await locking.release(LOCK_KEY)
        })
        .catch(async (err) => {
            seedProgress.fail(err instanceof Error ? err.message : "خطای ناشناخته")
            // Optional: release lock on failure so user can retry
            await locking.release(LOCK_KEY).catch(() => { })
        })

    return res.status(202).json({ message: "عملیات seed آغاز شد." });
}