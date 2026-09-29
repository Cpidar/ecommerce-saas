import { MedusaError } from "@medusajs/framework/utils";
import { requestJson, rialToToman, toNumber } from "./helper";
import { AccountingProduct, AccountingProvider } from "./type";

export type HesabfaProviderOptions = {
  apiKey: string;
  baseUrl?: string;
};

type HesabfaLoginResponse = {
  loginToken?: string;
  LoginToken?: string;
  token?: string;
  Token?: string;
};

type HesabfaItem = {
  code?: string;
  Code?: string;

  itemCode?: string;
  ItemCode?: string;

  barcode?: string;
  Barcode?: string;

  salePrice?: number | string;
  SalePrice?: number | string;

  sellPrice?: number | string;
  SellPrice?: number | string;

  price?: number | string;
  Price?: number | string;

  stock?: number | string;
  Stock?: number | string;

  quantity?: number | string;
  Quantity?: number | string;

  inventory?: number | string;
  Inventory?: number | string;

  [key: string]: unknown;
};

export class HesabfaProvider implements AccountingProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(options: HesabfaProviderOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? "https://api.hesabfa.com/v1/").replace(
      /\/?$/,
      "/",
    );
  }

  async login(): Promise<string> {
    /**
     * Hesabfa WooCommerce integrations use the business API key
     * and subsequently a login token.
     */
    const response = await requestJson<HesabfaLoginResponse>(
      `${this.baseUrl}login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
        }),
      },
    );

    const token =
      response.loginToken ??
      response.LoginToken ??
      response.token ??
      response.Token;

    if (!token) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Hesabfa login did not return a token: ${JSON.stringify(response)}`,
      );
    }

    return token;
  }

  async getProducts({
    token,
    offset,
    limit,
  }: {
    token: string;
    offset: number;
    limit: number;
  }): Promise<AccountingProduct[]> {
    const response = await requestJson<unknown>(`${this.baseUrl}item/list`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        offset,
        limit,
      }),
    });

    const items = this.extractItems(response);

    return items
      .map((item) => {
        const sku =
          item.code ??
          item.Code ??
          item.itemCode ??
          item.ItemCode ??
          item.barcode ??
          item.Barcode;

        if (!sku) {
          return null;
        }

        const price =
          item.salePrice ??
          item.SalePrice ??
          item.sellPrice ??
          item.SellPrice ??
          item.price ??
          item.Price;

        const quantity =
          item.stock ??
          item.Stock ??
          item.quantity ??
          item.Quantity ??
          item.inventory ??
          item.Inventory;

        return {
          sku: String(sku),
          priceToman: rialToToman(toNumber(price)),
          stockedQuantity: Math.max(0, toNumber(quantity)),
        };
      })
      .filter((item): item is AccountingProduct => item !== null);
  }

  private extractItems(response: unknown): HesabfaItem[] {
    if (Array.isArray(response)) {
      return response as HesabfaItem[];
    }

    if (!response || typeof response !== "object") {
      return [];
    }

    const data = response as Record<string, unknown>;

    for (const key of ["items", "Items", "result", "Result", "data", "Data"]) {
      if (Array.isArray(data[key])) {
        return data[key] as HesabfaItem[];
      }
    }

    return [];
  }
}
