import { MedusaError } from "@medusajs/framework/utils";
import { requestJson, rialToToman, toNumber } from "./helper";
import { AccountingProduct, AccountingProvider } from "./type";

export type HolooProviderOptions = {
  baseUrl: string;
  dbName: string;
  username: string;
  password: string;
};

type HolooLoginResponse = {
  Token?: string;
  token?: string;
};

type HolooProduct = {
  code?: string | number;
  Code?: string | number;

  erpcode?: string;
  ERPCode?: string;

  few?: string | number;
  Few?: string | number;

  sellprice?: string | number;
  SellPrice?: string | number;

  sellprice2?: string | number;
  SellPrice2?: string | number;

  [key: string]: unknown;
};

export class HolooProvider implements AccountingProvider {
  private readonly options: HolooProviderOptions;

  constructor(options: HolooProviderOptions) {
    this.options = {
      ...options,
      baseUrl: options.baseUrl.replace(/\/?$/, "/"),
    };
  }

  async login(): Promise<string> {
    const response = await requestJson<HolooLoginResponse>(
      `${this.options.baseUrl}Login`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          dbname: this.options.dbName,
          username: this.options.username,
          userpass: this.options.password,
        }),
      },
    );

    const token = response.Token ?? response.token;

    if (!token) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Holoo login failed: ${JSON.stringify(response)}`,
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
    const response = await requestJson<unknown>(
      `${this.options.baseUrl}Product`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: token,
        },
      },
    );

    const products = this.extractProducts(response);

    return products
      .slice(offset, offset + limit)
      .map((product) => {
        const sku =
          product.erpcode ?? product.ERPCode ?? product.code ?? product.Code;

        if (sku === undefined || sku === null || sku === "") {
          return null;
        }

        const price =
          product.sellprice ??
          product.SellPrice ??
          product.sellprice2 ??
          product.SellPrice2;

        const quantity = product.few ?? product.Few;

        return {
          sku: String(sku),
          priceToman: rialToToman(toNumber(price)),
          stockedQuantity: Math.max(0, toNumber(quantity)),
        };
      })
      .filter((item): item is AccountingProduct => item !== null);
  }

  private extractProducts(response: unknown): HolooProduct[] {
    if (Array.isArray(response)) {
      return response as HolooProduct[];
    }

    if (!response || typeof response !== "object") {
      return [];
    }

    const object = response as Record<string, unknown>;

    for (const key of [
      "Product",
      "product",
      "Products",
      "products",
      "Result",
      "result",
      "data",
    ]) {
      if (Array.isArray(object[key])) {
        return object[key] as HolooProduct[];
      }
    }

    const first = Object.values(object)[0];

    return Array.isArray(first) ? (first as HolooProduct[]) : [];
  }
}
