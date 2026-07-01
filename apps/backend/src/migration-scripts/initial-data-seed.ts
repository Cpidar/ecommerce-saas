import { MedusaContainer } from "@medusajs/framework";
import { IStoreModuleService } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  const countries = ["ir"];

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Default Sales Channel",
          description: "Created by Medusa",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
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

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  // ////////////////////////////////////////////////////////
  // Add Store Scope
  // /////////////////////////////////////////////////////

  // ✅ STEP 1: Create or retrieve the store for multi-tenant context
  const storeModuleService: IStoreModuleService = container.resolve(Modules.STORE);

  // Check if store already exists, or create a new one
  let stores = await storeModuleService.listStores();
  let currentStore: any;

  if (stores.length === 0) {
    // Create a store if none exists (first-time seeding)
    logger.info('No store found. Creating a new store...');
    const {
      result: [store],
    } = await createStoresWorkflow(container).run({
      input: {
        stores: [
          {
            name: "فروشگاه پیش‌فرض",
            supported_currencies: [
              {
                currency_code: "irr",
                is_default: true,
              }
            ],
            default_sales_channel_id: defaultSalesChannel.id,
          },
        ],
      },
    });
    currentStore = store;
    logger.info(`Created new store with ID: ${currentStore.id}`);
  } else {
    // Use existing store (for multi-tenant, you might want to select a specific one)
    // In a true multi-tenant setup, you would identify the store by subdomain or header
    currentStore = stores[stores.length - 1];
    logger.info(`Using existing store with ID: ${currentStore.id}`);
  }

  // ✅ STEP 2: Register currentStore in the request scope
  // This replicates the middleware behavior for the seed script
  // Note: The ExecArgs doesn't have req.scope directly, so we register in container
  // with a scoped lifetime to simulate request-scoped behavior

  // CRITICAL: For the seed script, we need to make currentStore available
  // to all services that expect it via req.scope.resolve('currentStore')

  // Method 1: Register as a scoped dependency in the container
  // The seed runs in a single "request" context, so we can register it globally for the script
  if (!container.hasRegistration('currentStore')) {
    container.register({
      currentStore: {
        resolve: () => currentStore,
        lifetime: 'SCOPED', // This makes it behave like a request-scoped dependency
      },
    });
    logger.info('Registered currentStore in container');
  }

  // Method 2: If your services expect currentStore via req.scope directly,
  // and you have access to the Express request object, you would do:
  // req.scope.register({ currentStore: { resolve: () => currentStore } })
  // Since seed script doesn't have req, we use container registration above

  // Verify registration works
  try {
    const resolvedStore = container.resolve('currentStore') as any;
    logger.info(`✅ currentStore resolved successfully: ${resolvedStore.id}`);
  } catch (err) {

    logger.warn('Could not resolve currentStore from container - services may need manual injection');
  }



  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Iran",
          currency_code: "irr",
          countries,
          payment_providers: ["pp_system_default", "pp_behpardakht_behpardakht"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "انبار اصفهان",
          address: {
            city: "Isfahan",
            country_code: "IR",
            address_1: "",
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

  logger.info("Seeding fulfillment data...");
  // This is created by a migration script in core.
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Iranian Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Iran",
        geo_zones: [
          {
            country_code: "ir",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "پست عادی",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "عادی",
          description: "ارسال در ۲ تا ۳ روز.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "irr",
            amount: 1000000,
          },
          {
            region_id: region.id,
            amount: 1000000,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "پست پیشتاز",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "پیشتاز",
          description: "ارسال در ۲۴ ساعت.",
          code: "express",
        },
        prices: [
          {
            currency_code: "irr",
            amount: 1500000,
          },
          {
            region_id: region.id,
            amount: 1500000,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "تی‌شرت",
          is_active: true,
        },
        {
          name: "سویشرت‌",
          is_active: true,
        },
        {
          name: "شلوار",
          is_active: true,
        },
        {
          name: "محصولات جانبی",
          is_active: true,
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "تی‌شرت مدوسا",
          category_ids: [
            categoryResult.find((cat) => cat.name === "تی‌شرت‌")!.id,
          ],
          description:
            "حس یک تی‌شرت کلاسیک را دوباره تجربه کنید. با تی‌شرت‌های نخی ما، لباس‌های روزمره دیگر معمولی نخواهند بود.",
          handle: "t-shirt",
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
            {
              title: "سایز",
              values: ["S", "M", "L", "XL"],
            },
            {
              title: "رنگ",
              values: ["مشکی", "سفید"],
            },
          ],
          variants: [
            {
              title: "S / Black",
              sku: "SHIRT-S-BLACK",
              options: {
                Size: "S",
                Color: "مشکی",
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
              sku: "SHIRT-S-WHITE",
              options: {
                Size: "S",
                Color: "سفید",
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
              sku: "SHIRT-M-BLACK",
              options: {
                Size: "M",
                Color: "مشکی",
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
              sku: "SHIRT-M-WHITE",
              options: {
                Size: "M",
                Color: "سفید",
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
              sku: "SHIRT-L-BLACK",
              options: {
                Size: "L",
                Color: "مشکی",
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
              sku: "SHIRT-L-WHITE",
              options: {
                Size: "L",
                Color: "سفید",
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
              sku: "SHIRT-XL-BLACK",
              options: {
                Size: "XL",
                Color: "مشکی",
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
              sku: "SHIRT-XL-WHITE",
              options: {
                Size: "XL",
                Color: "سفید",
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
            categoryResult.find((cat) => cat.name === "سویشرت‌")!.id,
          ],
          description:
            "حس یک سویشرت کلاسیک را دوباره تجربه کنید. با سویشرت نخی ما، لباس‌های روزمره دیگر معمولی نخواهند بود.",
          handle: "sweatshirt",
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
          options: [
            {
              title: "سایز",
              values: ["S", "M", "L", "XL"],
            },
          ],
          variants: [
            {
              title: "S",
              sku: "SWEATSHIRT-S",
              options: {
                Size: "S",
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
              sku: "SWEATSHIRT-M",
              options: {
                Size: "M",
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
              sku: "SWEATSHIRT-L",
              options: {
                Size: "L",
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
              sku: "SWEATSHIRT-XL",
              options: {
                Size: "XL",
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
            categoryResult.find((cat) => cat.name === "شلوار")!.id,
          ],
          description:
            "حس یک شلوار اسلش کلاسیک را دوباره تجربه کنید. با شلوار اسلش نخی ما، لباس‌های روزمره دیگر معمولی نخواهند بود.",
          handle: "sweatpants",
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
          options: [
            {
              title: "سایز",
              values: ["S", "M", "L", "XL"],
            },
          ],
          variants: [
            {
              title: "S",
              sku: "SWEATPANTS-S",
              options: {
                Size: "S",
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
              sku: "SWEATPANTS-M",
              options: {
                Size: "M",
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
              sku: "SWEATPANTS-L",
              options: {
                Size: "L",
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
              sku: "SWEATPANTS-XL",
              options: {
                Size: "XL",
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
            categoryResult.find((cat) => cat.name === "محصولات جانبی")!.id,
          ],
          description:
            "حس یک شلوارک کلاسیک را دوباره تجربه کنید. با شلوارک نخی ما، لباس‌های روزمره دیگر معمولی نخواهند بود.",
          handle: "shorts",
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
          options: [
            {
              title: "سایز",
              values: ["S", "M", "L", "XL"],
            },
          ],
          variants: [
            {
              title: "S",
              sku: "SHORTS-S",
              options: {
                Size: "S",
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
              sku: "SHORTS-M",
              options: {
                Size: "M",
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
              sku: "SHORTS-L",
              options: {
                Size: "L",
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
              sku: "SHORTS-XL",
              options: {
                Size: "XL",
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
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 1000000,
        inventory_item_id: item.id,
      })),
    },
  });

  logger.info("Finished seeding inventory levels data.");
}