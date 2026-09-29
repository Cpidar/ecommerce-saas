// apps/backend/src/workflows/pishro/steps/fetch-pishro-products.ts

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import {
  createAccountingProvider,
  AccountingProviderName,
  AccountingProviderOptions,
} from "../../../integrations/accounting";
import { AccountingProduct } from "../../../integrations/accounting/type";

type Input = {
  provider: AccountingProviderName;
  token: string;
  offset: number;
  limit: number;
  options?: AccountingProviderOptions;
};

export const fetchAccountingProductsStep = createStep(
  "fetch-accounting-products",
  async ({ provider, token, offset, limit, options }: Input) => {
    const product: AccountingProduct[] = [];
    let offsetToUse = offset;
    while (true) {
      const newProduct = await createAccountingProvider(
        provider,
        options,
      ).getProducts({
        token,
        offset: offsetToUse,
        limit,
      });

      product.push(...newProduct);
      // TODO: remove break and uncomment if statement
      break;
      // if (newProduct.length < limit) break;

      offsetToUse += limit;
    }
    console.log("product", product);
    return new StepResponse(product);
  },
);
