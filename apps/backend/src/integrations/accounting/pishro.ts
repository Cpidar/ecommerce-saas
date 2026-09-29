import { MedusaError } from "@medusajs/framework/utils";
import { AccountingProduct, AccountingProvider } from "./type";
import { toNumber } from "./helper";

export type PishroProviderOptions = {
  readonly apiUrl?: string;
  readonly username?: string;
  readonly appcode?: string;
  readonly password?: string;
};

type PishroLoginResponse = {
  entity?: {
    token?: string;
    isSuccess?: boolean;
  };
};

type PishroProduct = {
  Code: string;
  GroupId: string;
  Price: string;
  ProductStocks?: Array<{
    StockCode: string | number;
    Stock: string;
  }>;
};

type Input = {
  token: string;
  offset: number;
  limit: number;
};

export class PishroProvider implements AccountingProvider {

  constructor(private options: PishroProviderOptions) {}

  async login() {
    const { apiUrl, username, appcode, password } = this.options;

    if (!apiUrl || !username || !appcode || !password) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Pishro integration is not configured",
      );
    }
console.log(apiUrl, username, appcode, password)
    const response = await fetch(`${apiUrl}/api/User/Login`, {
      method: "POST",
      headers: {
        'content-type': 'application/json',
        // Explicitly send an empty Accept-Language header to prevent Node.js
        // from auto-injecting the system locale (e.g. "fa-IR", "en-US").
        // The Pishro Accounting .NET backend runs in Globalization Invariant Mode
        // and throws "Culture is not supported" for any culture it can't resolve.
        // Sending an empty value forces it to fall back to its default culture.
        // Remove this once the server enables ICU (DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false).
        'Accept-Language': ''
      },
      body: JSON.stringify({
        entity: {
          username,
          appcode,
          password,
        },
      }),
    });
console.log(response)
    if (!response.ok) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Pishro login failed with HTTP ${response.status}`,
      );
    }

    const data = (await response.json()) as PishroLoginResponse;

    if (!data.entity?.token) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Pishro authentication failed",
      );
    }

    return data.entity.token;
  }

  async getProducts({ token, offset, limit }: Input) {
    const apiUrl = this.options.apiUrl;

    if (!apiUrl) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Pishro API URL is not configured",
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(`${apiUrl}/api/app/syncData?timeout=10`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          requestBody: {
            OperatorId: "000000",
            RequestProductFilter: {
              Limit: limit,
              Offset: offset,
              ProductCode: "",
              RequiredGroups: false,
              RequiredStock: true,
            },
            RequestType: 3,
            status: 0,
            Type: 0,
          },
          waitingTimePeriod: 25,
          methodName: "Broadcast",
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Pishro request failed with HTTP ${response.status}`,
        );
      }

      const data = await response.json();

      if (!data.isSuccess) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          data.message || "Pishro request failed",
        );
      }

      const body = JSON.parse(data.responseBody);

      if (body.IsSuccess !== "True") {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          body.Message || "Pishro request failed",
        );
      }

      const products: PishroProduct[] = body.Products ?? [];

      return products.map((product) => {
        const stock = product.ProductStocks?.[0]?.Stock ?? "0";

        return {
          sku: `${product.GroupId}${product.Code}`,
          priceToman: Number(product.Price),
          stockedQuantity: toNumber(stock.replace("/", ".")),
        };
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
