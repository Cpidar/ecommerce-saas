import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http";
import { StoreDTO } from "@medusajs/framework/types";

import { asValue } from "@medusajs/framework/awilix";
import { storeContext } from "../../utils/resolve-current-store";

export async function addStoreScope(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  // --- 1. Reslove store id -----------------------------------
  let storeId: string;
  if (req.scope.hasRegistration("currentStore")) {
    const store = req.scope.resolve("currentStore") as Pick<StoreDTO, "id">;
    storeId = store.id;
  } else {
    storeId =
      req.cookies["current_store_id"] || (req?.headers["x-store-id"] as string);
  }

  if (!storeId) {
    res.status(403).json({
      type: "invalid_request_error",
      message: "You do not have access to any stores.",
    });
    return;
  }

  // TODO: must be optimized (every request query the database)
  // ── 2. Check existance of store id ─────────────────────────
  // const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  // const { data: [store] } = await query.graph({
  //   entity: "store",
  //   fields: ["id"],
  //   filters: { id: storeId },
  // });

  // if (!store || !store.id) {
  //   res.status(404).json({
  //     type: "not_found",
  //     message: "Store not found.",
  //     code: "STORE_NOT_FOUND",
  //   });
  //   return;
  // }

  // ── 3. Attach storeId to request scope for downstream handlers ──────────────────────────────

  req.scope.register({
    currentStore: asValue({ id: storeId }),
  });
  return storeContext.run({ storeId }, () => next());
}
