import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import {
  createAccountingProvider,
  AccountingProviderName,
} from "../../../integrations/accounting";
import { PishroProviderOptions } from "../../../integrations/accounting/pishro";

type Input = {
  provider: AccountingProviderName;
  options?: PishroProviderOptions;
};

export const resolveAccountingProviderStep = createStep(
  "resolve-accounting-provider",
  async ({ provider, options }: Input) => {
    const token = await createAccountingProvider(
      provider,
      options,
    ).login();
    console.log("token", token);
    return new StepResponse(token);
  },
);
