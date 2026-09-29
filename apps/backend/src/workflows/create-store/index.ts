import {
  createHook,
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createStoresWorkflow,
  emitEventStep,
  useRemoteQueryStep,
} from "@medusajs/medusa/core-flows";

import { createUserStep } from "./steps/create-user";
import { getSalesChannelStep } from "./steps/get-sales-channel";
import { linkUserToStoreStep } from "./steps/link-user-to-store";
import { checkSuperAdminStep } from "./steps/checkSuperAdmin";
import { checkUnickStoreNameStep } from "./steps/checkUnickStoreName";
import { AdditionalData } from "@medusajs/types";

export type CreateStoreInput = {
  store_name: string;
  email?: string;
  password?: string;
  user_id?: string;
  is_super_admin?: boolean;
  metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
};

export type CreateStoreWorkflowInput = { store: CreateStoreInput } & AdditionalData

export const MerchantWorkflowEvents = {
  CREATED: "merchant.created",
  ACTIVATED: "merchant.activated",
};

export const createStoreWorkflow = createWorkflow(
  "create-store",
  (input: CreateStoreWorkflowInput,) => {
    const existUser = when("is-multi-store", input, ({ store: { user_id } }) => {
      return !!user_id;
    }).then(() => {
      checkSuperAdminStep(input.store);
      checkUnickStoreNameStep(input.store);

      return useRemoteQueryStep({
        entry_point: "user",
        fields: ["*"],
        variables: {
          filters: {
            id: input.store.user_id,
          },
        },
        list: false,
      });
    });

    const { user: createdUser, authResponse } = when(
      "is-regular-store",
      input,
      ({ store: { user_id } }) => {
        return !user_id;
      }
    ).then(() => {
      return createUserStep({
        email: input.store.email,
        password: input.store.password,
        metadata: input.store.user_metadata,
      });
    });

    const user = transform(
      { existUser, createdUser },
      ({ existUser, createdUser }) => existUser || createdUser
    );

    const salesChannel = getSalesChannelStep();

    const storesData = transform({ input, salesChannel }, (data) => [
      {
        name: data.input.store.store_name,
        supported_currencies: [{ currency_code: "usd", is_default: true }],
        default_sales_channel_id: data.salesChannel.id,
        metadata: data.input.store.metadata,
      },
    ]);

    const stores = createStoresWorkflow.runAsStep({
      input: {
        stores: storesData,
      },
    });

    const store = stores[0];

    // super admins users do not have a link to store
    // so they will see all products and orders
    const userStoreLinkArray = when(
      { input, createdUser },
      ({ input, createdUser }) => {
        return !input.store.is_super_admin;
      }
    ).then(() => {
      return linkUserToStoreStep({ userId: user.id, storeId: store.id });
    });

    when("is-merchant-created", input, (input) => {
      return !input.store.user_id && !input.store.is_super_admin;
    }).then(() => {
      emitEventStep({
        eventName: MerchantWorkflowEvents.CREATED,
        data: createdUser,
      });
    });

    const storeCreated = createHook("storeCreated", {
      store: {
        storeId: store.id,
        salesChannel,
        userId: user.id,
      },
      additional_data: input.additional_data,
    });

    return new WorkflowResponse(
      {
        store,
        user,
        userStoreLinkArray,
        authResponse,
      },
      {
        hooks: [storeCreated],
      }
    );
  }
);
