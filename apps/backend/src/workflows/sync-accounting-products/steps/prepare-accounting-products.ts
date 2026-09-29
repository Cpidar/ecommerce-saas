// apps/backend/src/workflows/accounting/steps/prepare-accounting-products.ts

import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import type { Query } from "@medusajs/framework/types";
import { AccountingProduct } from "../../../integrations/accounting/type";

type Input = {
  products: AccountingProduct[];
  storeId: string;
};

export const prepareAccountingProductsStep = createStep(
  "prepare-accounting-products",
  async ({ products, storeId }: Input, { container }) => {
    const query = container.resolve<Query>(ContainerRegistrationKeys.QUERY);

    const {
      data: [{ products: storeProducts }],
    } = await query.graph({
      entity: "store",
      fields: [
        "product.id",
        "product.variants.id",
        "product.variants.sku",
        "product.variants.prices.*",
        "product.variants.inventory_items.id",
        "product.variants.inventory_items.inventory_item_id",
      ],
      filters: {
        id: storeId,
      },
    });
    if (!storeProducts || storeProducts.length === 0)
      return new StepResponse({
        products: [] as unknown as AccountingProduct[],
        total: 0,
        matched: 0,
        unmatched: [""],
        itemUpdates: 0,
        unchangedItems: 0,
      });

    const variantsBySku = new Map<
      string,
      {
        id: string;
        sku: string;
        prices?: Array<{
          currency_code?: string;
          amount?: number;
        }>;
        inventory_items?: Array<{
          inventory_item_id?: string;
          stocked_quantity?: number;
        }>;
      }
    >();

    for (const storeProduct of storeProducts) {
      for (const variant of storeProduct?.variants ?? []) {
        if (variant.sku) {
          variantsBySku.set(variant.sku, {
            id: variant.id,
            sku: variant.sku,
            prices: variant.price_set?.prices?.map((price) => ({
              currency_code: price?.currency_code,
              amount: price?.amount,
            })),
            inventory_items: variant.inventory_items?.map((item) => ({
              inventory_item_id: item?.inventory_item_id,
              stocked_quantity: item?.inventory?.stocked_quantity,
            })),
          });
        }
      }
    }

    const matched: AccountingProduct[] = [];
    const unmatched: string[] = [];
    let itemUpdates = 0;

    for (const product of products) {
      const variant = variantsBySku.get(product.sku);

      if (!variant) {
        unmatched.push(product.sku);
        continue;
      }

      const currentPrice = variant.prices?.find(
        (price) => price.currency_code === "irr",
      )?.amount;

      const currentQuatity = variant.inventory_items?.[0]?.stocked_quantity;

      if (currentPrice !== product.priceToman || currentQuatity !== product.stockedQuantity) {
        matched.push(product);
        itemUpdates++
      }

    }

    return new StepResponse({
      products: matched,
      total: products.length,
      matched: matched.length,
      unmatched: unmatched,
      itemUpdates,
      unchangedItems: products.length - matched.length - unmatched.length,
    });
  },
);
