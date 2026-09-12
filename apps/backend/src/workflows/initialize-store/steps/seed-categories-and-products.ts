// src/workflows/steps/seed-categories-and-products.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ProductStatus, Modules } from "@medusajs/framework/utils"
import {
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import { seedProgress } from "../../../utils/initialize-store-progress"

type Input = {
  salesChannelId: string
  shippingProfileId: string
}

export const seedCategoriesAndProductsStep = createStep(
  "seed-categories-and-products",
  async (input: Input, { container }) => {
    await seedProgress.update(75, "ایجاد دسته‌بندی محصولات")

    const unique = Math.floor(1000 + Math.random() * 9000).toString()

    const { result: categories } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: [
          {
            name: "تی‌شرت",
            handle: `t-shirt-${unique}`,
            is_active: true,
          },
          {
            name: "سویشرت‌",
            handle: `sweatshirt-${unique}`,
            is_active: true,
          },
          {
            name: "شلوار",
            handle: `pants-${unique}`,
            is_active: true,
          },
          {
            name: "محصولات جانبی",
            handle: `accessories-${unique}`,
            is_active: true,
          },
        ],
      },
    })

    await seedProgress.update(90, "ایجاد محصولات")

    const { result: options } = await createProductOptionsWorkflow(
      container
    ).run({
      input: {
        product_options: [
          {
            title: `Size-${unique}`,
            values: ["S", "M", "L", "XL"],
          },
          {
            title: `Color-${unique}`,
            values: ["مشکی", "سفید"],
          },
        ],
      },
    })

    const sizeOption = options.find((o) => o.title.startsWith("Size"))!
    const colorOption = options.find((o) => o.title.startsWith("Color"))!

    await createProductsWorkflow(container).run({
      input: {
        products: [
          // --- T-Shirt ---
          {
            title: "تی‌شرت مدوسا",
            category_ids: [
              categories.find((c) => c.handle === `t-shirt-${unique}`)!.id,
            ],
            description:
              "حس یک تی‌شرت کلاسیک را دوباره تجربه کنید. با تی‌شرت‌های نخی ما، لباس‌های روزمره دیگر معمولی نخواهند بود.",
            handle: `t-shirt-${unique}`,
            weight: 400,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: input.shippingProfileId,
            images: [
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
              },
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-back.png",
              },
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
              },
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-back.png",
              },
            ],
            options: [{ id: sizeOption.id }, { id: colorOption.id }],
            variants: [
              {
                title: "S / Black",
                sku: `SHIRT-S-BLACK-${unique}`,
                options: {
                  [sizeOption.title]: "S",
                  [colorOption.title]: "مشکی",
                },
                prices: [{ amount: 15000000, currency_code: "irr" }],
              },
              {
                title: "S / White",
                sku: `SHIRT-S-WHITE-${unique}`,
                options: {
                  [sizeOption.title]: "S",
                  [colorOption.title]: "سفید",
                },
                prices: [{ amount: 15000000, currency_code: "irr" }],
              },
              {
                title: "M / Black",
                sku: `SHIRT-M-BLACK-${unique}`,
                options: {
                  [sizeOption.title]: "M",
                  [colorOption.title]: "مشکی",
                },
                prices: [{ amount: 15000000, currency_code: "irr" }],
              },
              {
                title: "M / White",
                sku: `SHIRT-M-WHITE-${unique}`,
                options: {
                  [sizeOption.title]: "M",
                  [colorOption.title]: "سفید",
                },
                prices: [{ amount: 15000000, currency_code: "irr" }],
              },
              {
                title: "L / Black",
                sku: `SHIRT-L-BLACK-${unique}`,
                options: {
                  [sizeOption.title]: "L",
                  [colorOption.title]: "مشکی",
                },
                prices: [{ amount: 15000000, currency_code: "irr" }],
              },
              {
                title: "L / White",
                sku: `SHIRT-L-WHITE-${unique}`,
                options: {
                  [sizeOption.title]: "L",
                  [colorOption.title]: "سفید",
                },
                prices: [{ amount: 15000000, currency_code: "irr" }],
              },
              {
                title: "XL / Black",
                sku: `SHIRT-XL-BLACK-${unique}`,
                options: {
                  [sizeOption.title]: "XL",
                  [colorOption.title]: "مشکی",
                },
                prices: [{ amount: 15000000, currency_code: "irr" }],
              },
              {
                title: "XL / White",
                sku: `SHIRT-XL-WHITE-${unique}`,
                options: {
                  [sizeOption.title]: "XL",
                  [colorOption.title]: "سفید",
                },
                prices: [{ amount: 15000000, currency_code: "irr" }],
              },
            ],
            sales_channels: [{ id: input.salesChannelId }],
          },
          {
            title: "سویشرت مدوسا",
            category_ids: [
              categories.find((cat) => cat.handle === `sweet-shirt-789456-${unique}`)!.id,
            ],
            description:
              "حس یک سویشرت کلاسیک را دوباره تجربه کنید. با سویشرت نخی ما، لباس‌های روزمره دیگر معمولی نخواهند بود.",
            handle: `sweatshirt-789456-${unique}`,
            weight: 400,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: input.shippingProfileId,
            images: [
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
              },
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png",
              },
            ],
            options: [{ id: sizeOption.id }],
            variants: [
              {
                title: "S",
                sku: `SWEATSHIRT-S-${unique}`,
                options: {
                  [sizeOption.title]: "S",
                },
                prices: [
                  {
                    amount: 15000000,
                    currency_code: "irr",
                  }
                ],
              },
              {
                title: "M",
                sku: `SWEATSHIRT-M-${unique}`,
                options: {
                  [sizeOption.title]: "M",
                },
                prices: [
                  {
                    amount: 15000000,
                    currency_code: "irr",
                  }
                ],
              },
              {
                title: "L",
                sku: `SWEATSHIRT-L-${unique}`,
                options: {
                  [sizeOption.title]: "L",
                },
                prices: [
                  {
                    amount: 15000000,
                    currency_code: "irr",
                  }
                ],
              },
              {
                title: "XL",
                sku: `SWEATSHIRT-XL-${unique}`,
                options: {
                  [sizeOption.title]: "XL",
                },
                prices: [
                  {
                    amount: 15000000,
                    currency_code: "irr",
                  }
                ],
              },
            ],
            sales_channels: [
              {
                id: input.salesChannelId,
              },
            ],
          },
          {
            title: "شلوار اسلش مدوسا",
            category_ids: [
              categories.find((cat) => cat.handle === `pants-789456-${unique}`)!.id,
            ],
            description:
              "حس یک شلوار اسلش کلاسیک را دوباره تجربه کنید. با شلوار اسلش نخی ما، لباس‌های روزمره دیگر معمولی نخواهند بود.",
            handle: `sweatpants-789456-${unique}`,
            weight: 400,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: input.shippingProfileId,
            images: [
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
              },
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-back.png",
              },
            ],
            options: [{ id: sizeOption.id }],
            variants: [
              {
                title: "S",
                sku: `SWEATPANTS-S-${unique}`,
                options: {
                  [sizeOption.title]: "S",
                },
                prices: [
                  {
                    amount: 15000000,
                    currency_code: "irr",
                  }
                ],
              },
              {
                title: "M",
                sku: `SWEATPANTS-M-${unique}`,
                options: {
                  [sizeOption.title]: "M",
                },
                prices: [
                  {
                    amount: 15000000,
                    currency_code: "irr",
                  }
                ],
              },
              {
                title: "L",
                sku: `SWEATPANTS-L-${unique}`,
                options: {
                  [sizeOption.title]: "L",
                },
                prices: [
                  {
                    amount: 15000000,
                    currency_code: "irr",
                  }
                ],
              },
              {
                title: "XL",
                sku: `SWEATPANTS-XL-${unique}`,
                options: {
                  [sizeOption.title]: "XL",
                },
                prices: [
                  {
                    amount: 15000000,
                    currency_code: "irr",
                  }
                ],
              },
            ],
            sales_channels: [
              {
                id: input.salesChannelId,
              },
            ],
          },
          {
            title: "شلوارک مدوسا",
            category_ids: [
              categories.find((cat) => cat.handle === `accessories-789456-${unique}`)!.id,
            ],
            description:
              "حس یک شلوارک کلاسیک را دوباره تجربه کنید. با شلوارک نخی ما، لباس‌های روزمره دیگر معمولی نخواهند بود.",
            handle: `shorts-789456-${unique}`,
            weight: 400,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: input.shippingProfileId,
            images: [
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
              },
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-back.png",
              },
            ],
            options: [{ id: sizeOption.id }],
            variants: [
              {
                title: "S",
                sku: `SHORTS-S-${unique}`,
                options: {
                  [sizeOption.title]: "S",
                },
                prices: [
                  {
                    amount: 15000000,
                    currency_code: "irr",
                  }
                ],
              },
              {
                title: "M",
                sku: `SHORTS-M-${unique}`,
                options: {
                  [sizeOption.title]: "M",
                },
                prices: [
                  {
                    amount: 15000000,
                    currency_code: "irr",
                  }
                ],
              },
              {
                title: "L",
                sku: `SHORTS-L-${unique}`,
                options: {
                  [sizeOption.title]: "L",
                },
                prices: [
                  {
                    amount: 15000000,
                    currency_code: "irr",
                  }
                ],
              },
              {
                title: "XL",
                sku: `SHORTS-XL-${unique}`,
                options: {
                  [sizeOption.title]: "XL",
                },
                prices: [
                  {
                    amount: 15000000,
                    currency_code: "irr",
                  }
                ],
              },
            ],
            sales_channels: [
              {
                id: input.salesChannelId,
              },
            ],
          },
        ],
      },
    })

    return new StepResponse({ success: true })
  }
)