// apps/backend/src/workflows/pishro/steps/update-pishro-products.ts

import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateInventoryLevelsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { Query } from "@medusajs/framework/types"
import { AccountingProduct } from "../../../integrations/accounting/type"

type Input = {
  accoutingProducts: AccountingProduct[]
  stockLocationId: string
}

export const updateAccountingProductsStep = createStep(
  "update-accounting-products",
  async (
    { accoutingProducts, stockLocationId }: Input,
    { container }
  ) => {
    const query = container.resolve<Query>(
      ContainerRegistrationKeys.QUERY
    )

    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: [
        "id",
        "sku",
        "product.id",
        "inventory_items.id",
        "inventory_items.inventory_item_id",
      ],
    })

    const variantsBySku = new Map(
      variants
        .filter((variant) => variant.sku)
        .map((variant) => [
          variant.sku!,
          variant,
        ])
    )

    const priceUpdates: Array<{
      id: string
      prices: Array<{
        currency_code: string
        amount: number
      }>
    }> = []

    const inventoryUpdates: Array<{
      inventory_item_id: string
      location_id: string
      stocked_quantity: number
    }> = []

    const unmatched: string[] = []

    for (const product of accoutingProducts) {
      const variant = variantsBySku.get(product.sku)

      if (!variant) {
        unmatched.push(product.sku)
        continue
      }

      priceUpdates.push({
        id: variant.id,
        prices: [
          {
            currency_code: "irr",
            amount: product.priceToman,
          },
        ],
      })

      const inventoryItemId =
        variant.inventory_items?.[0]?.inventory_item_id

      if (inventoryItemId) {
        inventoryUpdates.push({
          inventory_item_id: inventoryItemId,
          location_id: stockLocationId,
          stocked_quantity: product.stockedQuantity,
        })
      }
    }
    console.log("priceUpdates", priceUpdates)
    if (priceUpdates.length) {
      await updateProductVariantsWorkflow(container).run({
        input: {
          product_variants: priceUpdates,
        },
      })
    }

    if (inventoryUpdates.length) {
      await updateInventoryLevelsWorkflow(container).run({
        input: {
          updates: inventoryUpdates,
        },
      })
    }

    return new StepResponse({
      updated: accoutingProducts.length - unmatched.length,
      pricesUpdated: priceUpdates.length,
      inventoryUpdated: inventoryUpdates.length,
      unmatched,
    })
  }
)
