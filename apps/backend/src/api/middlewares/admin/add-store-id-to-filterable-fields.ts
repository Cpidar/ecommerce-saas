import {
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http";
import { UserDTO, StoreDTO } from "@medusajs/framework/types";
import { SUPER_ADMIN_STORE_NAME } from "../../../constants";
// import StoreLinkPaymentConfig from "../../../links/payment_config-store"
// import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function addStoreIdToFilterableFields(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  const loggedInUser = req.scope.resolve("loggedInUser", {
    allowUnregistered: true,
  }) as UserDTO;

  // console.log(req.url, req.method, loggedInUser?.email)
  // console.log(StoreLinkPaymentConfig.entryPoint)
  // const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // const data = await query.graph({
  //   entity: StoreLinkPaymentConfig.entryPoint,
  //   fields: ["payment_config_id"],
  // })
  // console.log(data)


  if (req.method, !loggedInUser) {
    res.status(403).json({
      type: "invalid_request_error",
      message: "You do not have access to any stores.",
    });
    return;
  }

  if (!req.filterableFields) {
    req.filterableFields = {};
  }

  // super admin?
  if (loggedInUser.metadata?.is_super_admin) {
    if (req.url.includes("/admin/stores") && req.method === "GET") {
      req.filterableFields["name"] = SUPER_ADMIN_STORE_NAME;
    }
  } else {
    const currentStore = req.scope.resolve("currentStore", {
      allowUnregistered: true,
    }) as StoreDTO;
    console.log(req.url, req.method, currentStore)
    if (currentStore) {
      if (req.url.includes("/admin/stores") && req.method === "GET") {
        req.filterableFields["id"] = currentStore.id;
      } else {
        // set 'filterableFields' so then the 'maybeApplyLinkFilter' middleware will process it
        req.filterableFields["store_id"] = currentStore.id;
        console.log(req.filterableFields)
      }
    } else {
      // user w/o stores - should not have access
      if (req.url.includes("/admin/stores") && req.method === "GET") {
        req.filterableFields["id"] = [];
      } else {
        req.filterableFields["store_id"] = [];
      }
    }
  }

  console.log('add store id to request filterableFields: ', req.filterableFields)

  return next();
}