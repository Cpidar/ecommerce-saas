import { IStoreModuleService } from "@medusajs/framework/types";
import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";
import { seedProgress } from "../utils/initialize-store-progress";

const IMAGE_HOST = "https://your-image-host.com"; // Replace with your actual image host
const PREFIX = "products"; // Replace with your actual prefix

// Helper function to generate random image URL
const getRandomImageUrl = (prefix = PREFIX, totalImages = 10) => {
  const randomNum = Math.floor(Math.random() * totalImages) + 1;
  return `${IMAGE_HOST}/${prefix}/${randomNum}.jpg`;
};

// Define constants for image configuration


// ============================================================
// MAIN SEED FUNCTION
// ============================================================
export async function default_data_seed({
  container,
  storeId
}: {
  container: MedusaContainer;
  storeId: string
}): Promise<void> {
  // ============================================================
  // SETUP: Initialize services and variables
  // ============================================================
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const uniquPostfix = Math.floor(1000 + Math.random() * 9000).toString()

  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );
  const apiKeyModuleService = container.resolve(
    Modules.API_KEY)

  const countries = ["ir"];

  logger.info("Seeding store data...");
  seedProgress.update(5, "ایجاد کانال فروش و کلید API");
  const salesChannel = await salesChannelModuleService.listSalesChannels({ name: "Default Sales Channel" })
  let defaultSalesChannel = salesChannel[0]
  if (!defaultSalesChannel) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
            description: "Created by Medusa",
          },
        ],
      },
    });
    defaultSalesChannel = result[0];
  }


  let publishableApiKey = (await apiKeyModuleService.listApiKeys({ type: "publishable" }))[0]
  if (!publishableApiKey) {
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Default Publishable API Key",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });
    publishableApiKey = result[0];
  }

  if (defaultSalesChannel && publishableApiKey) {
    // Link the sales channel to the API key
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableApiKey.id,
        add: [defaultSalesChannel.id],
      },
    });

  }
  // ============================================================
  // SECTION 1: STORE SETUP
  // ============================================================

  const storeModuleService: IStoreModuleService = container.resolve(Modules.STORE);

  seedProgress.update(15, "راه‌اندازی فروشگاه");

  if (!container.hasRegistration('currentStore')) {

    let currentStore: any;

    if (!storeId) {
      logger.info('No store found. Creating new store...');
      throw new Error(`فروشگاهی با شناسه ${storeId} یافت نشد`);
      // const {
      //   result: [store],
      // } = await createStoresWorkflow(container).run({
      //   input: {
      //     stores: [
      //       {
      //         name: "فروشگاه تجهیزات الکتریکی",
      //         supported_currencies: [
      //           {
      //             currency_code: "irr",
      //             is_default: true,
      //           }
      //         ],
      //         default_sales_channel_id: defaultSalesChannel.id,
      //       },
      //     ],
      //   },
      // });
      // currentStore = store;
      logger.info(`New store created with ID: ${currentStore.id}`);
    } else {

      currentStore = await storeModuleService.retrieveStore(storeId)
      if (!currentStore) throw new Error(`فروشگاهی با شناسه ${storeId} یافت نشد`);
      logger.info(`Using existing store with ID: ${currentStore.id}`);

    }

    container.register({
      currentStore: {
        resolve: () => currentStore,
        lifetime: 'SCOPED',
      },
    });
    logger.info('currentStore registered in container');
  }

  try {
    const resolvedStore = container.resolve('currentStore') as any;
    logger.info(`✅ currentStore successfully retrieved: ${resolvedStore.id}`);
  } catch (err) {
    logger.warn('Cannot retrieve currentStore from container - services may need manual injection');
  }

  // ============================================================
  // SECTION 2: REGION SETUP
  // ============================================================
  logger.info("Creating region data...");
  seedProgress.update(30, "ایجاد منطقه");


  const regionModuleService = container.resolve(Modules.REGION)

  const existingRegion = (await regionModuleService.listRegions({ currency_code: "irr" }))[0]
  let regionResult;
  if (!existingRegion) {
    const result = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "ایران",
            currency_code: "irr",
            countries,
            payment_providers: ["pp_system_default", "pp_behpardakht_behpardakht"],
          },
        ],
      },
    });
    regionResult = result.result;
  }
  const region = existingRegion || regionResult?.[0];
  logger.info("Region data creation completed.");

  // ============================================================
  // SECTION 3: TAX REGIONS SETUP
  // ============================================================
  // logger.info("Creating tax regions data...");
  // await createTaxRegionsWorkflow(container).run({
  //   input: countries.map((country_code) => ({
  //     country_code,
  //     provider_id: "tp_system",
  //   })),
  // });
  // logger.info("Tax regions data creation completed.");

  // ============================================================
  // SECTION 4: STOCK LOCATIONS SETUP
  // ============================================================
  logger.info("Creating stock location data...");
  seedProgress.update(45, "ایجاد انبار");

  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "انبار مرکزی",
          address: {
            city: "تهران",
            country_code: "IR",
            address_1: "خیابان اصلی، نبش خیابان صنعت",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  // ============================================================
  // SECTION 5: FULFILLMENT SETS & SHIPPING OPTIONS SETUP
  // ============================================================
  logger.info("Creating shipping data...");
  seedProgress.update(55, "تنظیمات ارسال");

  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];
  // TODO: [BUG]-service zone already exist
  // Create fulfillment set
  // const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
  //   name: `ارسال از انبار مرکزی ${new Date().toISOString()}`,
  //   type: "shipping",
  //   service_zones: [
  //     {
  //       name: "ایران",
  //       geo_zones: [
  //         {
  //           country_code: "ir",
  //           type: "country",
  //         },
  //       ],
  //     },
  //   ],
  // });
  // // Link fulfillment set to stock location
  // await link.create({
  //   [Modules.STOCK_LOCATION]: {
  //     stock_location_id: stockLocation.id,
  //   },
  //   [Modules.FULFILLMENT]: {
  //     fulfillment_set_id: fulfillmentSet.id,
  //   },
  // });

  // // Create all shipping options
  // await createShippingOptionsWorkflow(container).run({
  //   input: [
  //     {
  //       name: "پست عادی",
  //       price_type: "flat",
  //       provider_id: "manual_manual",
  //       service_zone_id: fulfillmentSet.service_zones[0].id,
  //       shipping_profile_id: shippingProfile.id,
  //       type: {
  //         label: "عادی",
  //         description: "ارسال در ۲ تا ۳ روز.",
  //         code: "standard",
  //       },
  //       prices: [
  //         {
  //           currency_code: "irr",
  //           amount: 1000000,
  //         },
  //         {
  //           region_id: region.id,
  //           amount: 1000000,
  //         },
  //       ],
  //       rules: [
  //         {
  //           attribute: "enabled_in_store",
  //           value: "true",
  //           operator: "eq",
  //         },
  //         {
  //           attribute: "is_return",
  //           value: "false",
  //           operator: "eq",
  //         },
  //       ],
  //     },
  //     {
  //       name: "پست پیشتاز",
  //       price_type: "flat",
  //       provider_id: "manual_manual",
  //       service_zone_id: fulfillmentSet.service_zones[0].id,
  //       shipping_profile_id: shippingProfile.id,
  //       type: {
  //         label: "پیشتاز",
  //         description: "ارسال در ۲۴ ساعت.",
  //         code: "express",
  //       },
  //       prices: [
  //         {
  //           currency_code: "irr",
  //           amount: 1500000,
  //         },
  //         {
  //           region_id: region.id,
  //           amount: 1500000,
  //         },
  //       ],
  //       rules: [
  //         {
  //           attribute: "enabled_in_store",
  //           value: "true",
  //           operator: "eq",
  //         },
  //         {
  //           attribute: "is_return",
  //           value: "false",
  //           operator: "eq",
  //         },
  //       ],
  //     },
  //     {
  //       name: "باربری",
  //       price_type: "flat",
  //       provider_id: "manual_manual",
  //       service_zone_id: fulfillmentSet.service_zones[0].id,
  //       shipping_profile_id: shippingProfile.id,
  //       type: {
  //         label: "باربری",
  //         description: "ارسال بار به وسیله شرکت‌های باربری.",
  //         code: "freight",
  //       },
  //       prices: [
  //         {
  //           currency_code: "irr",
  //           amount: 2000000,
  //         },
  //         {
  //           region_id: region.id,
  //           amount: 2000000,
  //         },
  //       ],
  //       rules: [
  //         {
  //           attribute: "enabled_in_store",
  //           value: "true",
  //           operator: "eq",
  //         },
  //         {
  //           attribute: "is_return",
  //           value: "false",
  //           operator: "eq",
  //         },
  //       ],
  //     },
  //     {
  //       name: "تیپاکس",
  //       price_type: "flat",
  //       provider_id: "manual_manual",
  //       service_zone_id: fulfillmentSet.service_zones[0].id,
  //       shipping_profile_id: shippingProfile.id,
  //       type: {
  //         label: "تیپاکس",
  //         description: "ارسال با تیپاکس (تحویل در سریع‌ترین زمان).",
  //         code: "tipax",
  //       },
  //       prices: [
  //         {
  //           currency_code: "irr",
  //           amount: 2500000,
  //         },
  //         {
  //           region_id: region.id,
  //           amount: 2500000,
  //         },
  //       ],
  //       rules: [
  //         {
  //           attribute: "enabled_in_store",
  //           value: "true",
  //           operator: "eq",
  //         },
  //         {
  //           attribute: "is_return",
  //           value: "false",
  //           operator: "eq",
  //         },
  //       ],
  //     },
  //     {
  //       name: "تحویل حضوری",
  //       price_type: "flat",
  //       provider_id: "manual_manual",
  //       service_zone_id: fulfillmentSet.service_zones[0].id,
  //       shipping_profile_id: shippingProfile.id,
  //       type: {
  //         label: "تحویل حضوری",
  //         description: "تحویل سفارش به صورت حضوری در فروشگاه.",
  //         code: "in_store_pickup",
  //       },
  //       prices: [
  //         {
  //           currency_code: "irr",
  //           amount: 0,
  //         },
  //         {
  //           region_id: region.id,
  //           amount: 0,
  //         },
  //       ],
  //       rules: [
  //         {
  //           attribute: "enabled_in_store",
  //           value: "true",
  //           operator: "eq",
  //         },
  //         {
  //           attribute: "is_return",
  //           value: "false",
  //           operator: "eq",
  //         },
  //       ],
  //     },
  //   ],
  // });
  logger.info("Shipping data creation completed.");

  // ============================================================
  // SECTION 6: LINK SALES CHANNELS TO STOCK LOCATION
  // ============================================================
  seedProgress.update(65, "اتصال کانال فروش به انبار");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });
  logger.info("Sales channels linked to stock location.");

  // ============================================================
  // SECTION 7: PRODUCT CATEGORIES SETUP
  // ============================================================
  logger.info("Creating product categories...");
  seedProgress.update(75, "ایجاد دسته‌بندی محصولات");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "تی‌شرت",
          handle: `t-shirt-789456-${uniquPostfix}`,
          is_active: true,
        },
        {
          name: "سویشرت‌",
          handle: `sweet-shirt-789456-${uniquPostfix}`,
          is_active: true,
        },
        {
          name: "شلوار",
          handle: `pants-789456-${uniquPostfix}`,
          is_active: true,
        },
        {
          name: "محصولات جانبی",
          handle: `accessories-789456-${uniquPostfix}`,
          is_active: true,
        },
      ],
    },
  });
  logger.info("Product categories creation completed.");

  // ============================================================
  // SECTION 8: PRODUCTS SETUP
  // ============================================================
  logger.info("Creating products...");
  seedProgress.update(90, "ایجاد محصولات");

  const { result: productOptionsResult } = await createProductOptionsWorkflow(
    container
  ).run({
    input: {
      product_options: [
        {
          title: `Size-${uniquPostfix}`,
          values: ["S", "M", "L", "XL"],
        },
        {
          title: `Color-${uniquPostfix}`,
          values: ["مشکی", "سفید"],
        },
      ],
    },
  });
  const sizeOption = productOptionsResult.find((o) => o.title.startsWith("Size"))!;
  const colorOption = productOptionsResult.find((o) => o.title.startsWith(`Color`))!;

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "تی‌شرت مدوسا",
          category_ids: [
            categoryResult.find((cat) => cat.handle === `t-shirt-789456-${uniquPostfix}`)!.id,
          ],
          description:
            "حس یک تی‌شرت کلاسیک را دوباره تجربه کنید. با تی‌شرت‌های نخی ما، لباس‌های روزمره دیگر معمولی نخواهند بود.",
          handle: `t-shirt-789456-${uniquPostfix}`,
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
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
          options: [
            { id: sizeOption.id },
            { id: colorOption.id },
          ],
          variants: [
            {
              title: "S / Black",
              sku: `SHIRT-S-BLACK-${uniquPostfix}`,
              options: {
                [sizeOption.title]: "S",
                [colorOption.title]: "مشکی",
              },
              prices: [
                {
                  amount: 15000000,
                  currency_code: "irr",
                }
              ],
            },
            {
              title: "S / White",
              sku: `SHIRT-S-WHITE-${uniquPostfix}`,
              options: {
                [sizeOption.title]: "S",
                [colorOption.title]: "سفید",
              },
              prices: [
                {
                  amount: 15000000,
                  currency_code: "irr",
                }
              ],
            },
            {
              title: "M / Black",
              sku: `SHIRT-M-BLACK-${uniquPostfix}`,
              options: {
                [sizeOption.title]: "M",
                [colorOption.title]: "مشکی",
              },
              prices: [
                {
                  amount: 15000000,
                  currency_code: "irr",
                }
              ],
            },
            {
              title: "M / White",
              sku: `SHIRT-M-WHITE-${uniquPostfix}`,
              options: {
                [sizeOption.title]: "M",
                [colorOption.title]: "سفید",
              },
              prices: [
                {
                  amount: 15000000,
                  currency_code: "irr",
                }
              ],
            },
            {
              title: "L / Black",
              sku: `SHIRT-L-BLACK-${uniquPostfix}`,
              options: {
                [sizeOption.title]: "L",
                [colorOption.title]: "مشکی",
              },
              prices: [
                {
                  amount: 15000000,
                  currency_code: "irr",
                }
              ],
            },
            {
              title: "L / White",
              sku: `SHIRT-L-WHITE-${uniquPostfix}`,
              options: {
                [sizeOption.title]: "L",
                [colorOption.title]: "سفید",
              },
              prices: [
                {
                  amount: 15000000,
                  currency_code: "irr",
                }
              ],
            },
            {
              title: "XL / Black",
              sku: `SHIRT-XL-BLACK-${uniquPostfix}`,
              options: {
                [sizeOption.title]: "XL",
                [colorOption.title]: "مشکی",
              },
              prices: [
                {
                  amount: 15000000,
                  currency_code: "irr",
                }
              ],
            },
            {
              title: "XL / White",
              sku: `SHIRT-XL-WHITE-${uniquPostfix}`,
              options: {
                [sizeOption.title]: "XL",
                [colorOption.title]: "سفید",
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
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "سویشرت مدوسا",
          category_ids: [
            categoryResult.find((cat) => cat.handle === `sweet-shirt-789456-${uniquPostfix}`)!.id,
          ],
          description:
            "حس یک سویشرت کلاسیک را دوباره تجربه کنید. با سویشرت نخی ما، لباس‌های روزمره دیگر معمولی نخواهند بود.",
          handle: `sweatshirt-789456-${uniquPostfix}`,
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
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
              sku: `SWEATSHIRT-S-${uniquPostfix}`,
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
              sku: `SWEATSHIRT-M-${uniquPostfix}`,
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
              sku: `SWEATSHIRT-L-${uniquPostfix}`,
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
              sku: `SWEATSHIRT-XL-${uniquPostfix}`,
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
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "شلوار اسلش مدوسا",
          category_ids: [
            categoryResult.find((cat) => cat.handle === `pants-789456-${uniquPostfix}`)!.id,
          ],
          description:
            "حس یک شلوار اسلش کلاسیک را دوباره تجربه کنید. با شلوار اسلش نخی ما، لباس‌های روزمره دیگر معمولی نخواهند بود.",
          handle: `sweatpants-789456-${uniquPostfix}`,
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
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
              sku: `SWEATPANTS-S-${uniquPostfix}`,
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
              sku: `SWEATPANTS-M-${uniquPostfix}`,
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
              sku: `SWEATPANTS-L-${uniquPostfix}`,
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
              sku: `SWEATPANTS-XL-${uniquPostfix}`,
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
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "شلوارک مدوسا",
          category_ids: [
            categoryResult.find((cat) => cat.handle === `accessories-789456-${uniquPostfix}`)!.id,
          ],
          description:
            "حس یک شلوارک کلاسیک را دوباره تجربه کنید. با شلوارک نخی ما، لباس‌های روزمره دیگر معمولی نخواهند بود.",
          handle: `shorts-789456-${uniquPostfix}`,
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
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
              sku: `SHORTS-S-${uniquPostfix}`,
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
              sku: `SHORTS-M-${uniquPostfix}`,
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
              sku: `SHORTS-L-${uniquPostfix}`,
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
              sku: `SHORTS-XL-${uniquPostfix}`,
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
              id: defaultSalesChannel.id,
            },
          ],
        },
      ],
    },
  });

  logger.info("Product data creation completed.");

  // ============================================================
  // SECTION 9: INVENTORY LEVELS SETUP
  // ============================================================
  logger.info("Creating inventory levels...");
  seedProgress.update(97, "ایجاد موجودی انبار");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 500,
        inventory_item_id: item.id,
      })),
    },
  });

  logger.info("Inventory levels creation completed.");
  logger.info("✅ All seed data has been successfully created.");
}
