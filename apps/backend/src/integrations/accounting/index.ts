import { MedusaError } from "@medusajs/framework/utils";
import { HesabfaProvider, HesabfaProviderOptions } from "./hesabfa";
import { HolooProvider, HolooProviderOptions } from "./holoo";
import { PishroProvider, PishroProviderOptions } from "./pishro";
import { AccountingProvider } from "./type";

export type AccountingProviderName =
  | "pishro"
  | "hesabfa"
  | "holoo"
  | "sepidar"
  | "mahak"
  | "parsian"
  | "dasht";

export type AccountingProviderOptions = PishroProviderOptions;

export function createAccountingProvider(
  name: AccountingProviderName,
  options: unknown,
): AccountingProvider {
  switch (name) {
    case "pishro":
      return new PishroProvider(options as PishroProviderOptions);

    case "hesabfa":
      return new HesabfaProvider(options as HesabfaProviderOptions);

    case "holoo":
      return new HolooProvider(options as HolooProviderOptions);

    // case "sepidar":
    //   return new SepidarProvider(options as SepidarProviderOptions)

    // case "mahak":
    //   return new MahakProvider(options as MahakProviderOptions)

    // case "parsian":
    //   return new ParsianProvider(options as ParsianProviderOptions)

    // case "dasht":
    //   return new DashtProvider(options as DashtProviderOptions)

    default:
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Unsupported accounting provider: ${name}`,
      );
  }
}
