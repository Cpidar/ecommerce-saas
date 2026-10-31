import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http";
import { StoreDTO } from "@medusajs/framework/types";


// Allowed statuses that can access /store/* APIs
const OPERATIONAL_STATUSES = ["active", "trialing"];

// Map status → HTTP response for non-operational stores
const STATUS_RESPONSES: Record<
  string,
  { status: number; message: string; code: string }
> = {
  suspended: {
    status: 402,
    message:
      "Your store is suspended due to insufficient credit. Please top up your account to restore access.",
    code: "STORE_SUSPENDED",
  },
  inactive: {
    status: 402,
    message:
      "Your store is inactive. Please contact support or top up to restore access.",
    code: "STORE_INACTIVE",
  },
  deleted: {
    status: 404,
    message: "This store no longer exists.",
    code: "STORE_DELETED",
  },
};

export async function checkStoreStatus(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  let storeId;
  if (req.scope.hasRegistration("currentStore")) {
    const store = req.scope.resolve("currentStore") as Pick<StoreDTO, "id">;
    storeId = store.id;
  }

  if (!storeId) {
    res.status(403).json({
      type: "invalid_request_error",
      message: "You do not have access to any stores.",
    });
    return;
  }

  // TODO: must be optimized (every request query the database)
  // ── 2. Fetch store config with status ─────────────────────────
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: storeConfigs } = await query.graph({
    entity: "store_config",
    fields: ["subscription_status"],
    filters: { medusa_store_id: storeId },
  });
  const status = storeConfigs?.[0]?.subscription_status;

  // ── 3. Handle missing config (store not registered in SaaS) ──
  if (!status) {
    res.status(404).json({
      type: "not_found",
      message: "Store configuration not found.",
      code: "STORE_CONFIG_NOT_FOUND",
    });
    return;
  }

  // ── 4. Allow operational stores ──────────────────────────────
  if (OPERATIONAL_STATUSES.includes(status)) {
    return next();
  }

  // ── 5. Block non-operational stores with specific response ───
  const response = STATUS_RESPONSES[status] ?? {
    status: 403,
    message: `Store access denied (status: ${status}).`,
    code: "STORE_ACCESS_DENIED",
  };

  res.status(response.status).json({
    type: "invalid_request_error",
    message: response.message,
    code: response.code,
    store_status: status,
  });
}
