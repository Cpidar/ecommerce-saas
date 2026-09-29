import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  updateAccountingProductsStep,
  fetchAccountingProductsStep,
  resolveAccountingProviderStep,
} from "./steps";
import {
  AccountingProviderName,
  AccountingProviderOptions,
} from "../../integrations/accounting";
import { waitConfirmationAccountingSyncStep } from "./steps/wait-for-confirmation";
import { prepareAccountingProductsStep } from "./steps/prepare-accounting-products";

export type SyncAccountingProductsWorkflowInput = {
  provider: AccountingProviderName;
  storeId: string;
  stockLocationId: string;
  options?: AccountingProviderOptions;
  offset?: number;
  limit?: number;
};
export const syncAccountingProductsWorkflowId = "sync-accounting-products";

export const syncAccountingProductsWorkflow = createWorkflow(
  syncAccountingProductsWorkflowId,
  (input: SyncAccountingProductsWorkflowInput) => {
    const limit = transform(input, (input) => input.limit ?? 10);
    const offset = transform(input, (input) => input.offset ?? 0);
    const provider = input.provider;

    const token = resolveAccountingProviderStep({
      provider,
      options: input.options,
    });

    const accoutingProducts = fetchAccountingProductsStep({
      provider,
      offset,
      limit,
      token,
      options: input.options,
    });

    const prepared = prepareAccountingProductsStep({
      products: accoutingProducts,
      storeId: input.storeId,
    });

    const summary = transform({ prepared }, (data) => ({
      provider: input.provider,
      total: data.prepared.total,
      matched: data.prepared.matched,
      unmatched: data.prepared.unmatched,
      itemUpdates: data.prepared.itemUpdates,
      unchangedItems: data.prepared.unchangedItems,
    }));

    waitConfirmationAccountingSyncStep();

    const result = updateAccountingProductsStep({
      accoutingProducts,
      stockLocationId: input.stockLocationId,
    });

    return new WorkflowResponse(summary);
  },
);
