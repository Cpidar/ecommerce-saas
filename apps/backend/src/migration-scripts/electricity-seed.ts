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
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
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

export default async function initial_data_seed({
  container,
  storeId
}: {
  container: MedusaContainer;
  storeId: string
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
          name: "کانال فروش پیش‌فرض",
          description: "ایجاد شده توسط نیتروکامرس",
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
          title: "کلید API انتشار پیش‌فرض",
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

  const storeModuleService: IStoreModuleService = container.resolve(Modules.STORE);

  let stores = await storeModuleService.listStores({

  });
  let currentStore: any;

  if (!storeId) {
    logger.info('هیچ فروشگاهی یافت نشد. در حال ایجاد فروشگاه جدید...');
    const {
      result: [store],
    } = await createStoresWorkflow(container).run({
      input: {
        stores: [
          {
            name: "فروشگاه تجهیزات الکتریکی",
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
    logger.info(`فروشگاه جدید با شناسه: ${currentStore.id} ایجاد شد`);
  } else {
    currentStore = await storeModuleService.retrieveStore(storeId)
    logger.info(`استفاده از فروشگاه موجود با شناسه: ${currentStore.id}`);
  }

  if (!container.hasRegistration('currentStore')) {
    container.register({
      currentStore: {
        resolve: () => currentStore,
        lifetime: 'SCOPED',
      },
    });
    logger.info('currentStore در کانتینر ثبت شد');
  }

  try {
    const resolvedStore = container.resolve('currentStore') as any;
    logger.info(`✅ currentStore با موفقیت دریافت شد: ${resolvedStore.id}`);
  } catch (err) {
    logger.warn('دریافت currentStore از کانتینر امکان‌پذیر نیست - ممکن است سرویس‌ها نیاز به تزریق دستی داشته باشند');
  }

  logger.info("در حال ایجاد داده‌های منطقه...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
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
  const region = regionResult[0];
  logger.info("ایجاد داده‌های منطقه به پایان رسید.");

  logger.info("در حال ایجاد داده‌های مناطق مالیاتی...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("ایجاد داده‌های مناطق مالیاتی به پایان رسید.");

  logger.info("در حال ایجاد داده‌های مکان انبار...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "انبار مرکزی تجهیزات الکتریکی",
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

  logger.info("در حال ایجاد داده‌های حمل و نقل...");
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "ارسال از انبار مرکزی",
    type: "shipping",
    service_zones: [
      {
        name: "ایران",
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
        name: "ارسال عادی",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "عادی",
          description: "تحویل در ۲ تا ۳ روز کاری",
          code: "standard",
        },
        prices: [
          {
            currency_code: "irr",
            amount: 500000,
          },
          {
            region_id: region.id,
            amount: 500000,
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
        name: "ارسال فوری",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "فوری",
          description: "تحویل در کمتر از ۲۴ ساعت",
          code: "express",
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
    ],
  });
  logger.info("ایجاد داده‌های حمل و نقل به پایان رسید.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });
  logger.info("ایجاد داده‌های مکان انبار به پایان رسید.");

  logger.info("در حال ایجاد داده‌های محصول...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "کابل و سیم",
          is_active: true,
        },
        {
          name: "کلید و پریز",
          is_active: true,
        },
        {
          name: "لامپ و روشنایی",
          is_active: true,
        },
        {
          name: "تابلو برق و تجهیزات حفاظتی",
          is_active: true,
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "کابل مسی ۲×۱.۵ میلیمتر",
          category_ids: [
            categoryResult.find((cat) => cat.name === "کابل و سیم")!.id,
          ],
          description:
            "کابل مسی افشان با کیفیت بالا، مناسب برای سیم‌کشی داخلی ساختمان و تابلوهای برق. دارای استاندارد ملی و تحمل ولتاژ ۳۰۰/۵۰۰ ولت.",
          handle: "copper-cable-2x1.5",
          weight: 5000,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/cable-copper.jpg",
            },
          ],
          options: [
            {
              title: "رنگ",
              values: ["آبی", "قهوه‌ای", "زرد-سبز"],
            },
          ],
          variants: [
            {
              title: "رنگ آبی",
              sku: "CABLE-2X1.5-BLUE",
              options: {
                Color: "آبی",
              },
              prices: [
                {
                  amount: 12000000,
                  currency_code: "irr",
                }
              ],
            },
            {
              title: "رنگ قهوه‌ای",
              sku: "CABLE-2X1.5-BROWN",
              options: {
                Color: "قهوه‌ای",
              },
              prices: [
                {
                  amount: 12000000,
                  currency_code: "irr",
                }
              ],
            },
            {
              title: "رنگ زرد-سبز (ارت)",
              sku: "CABLE-2X1.5-GREEN-YELLOW",
              options: {
                Color: "زرد-سبز",
              },
              prices: [
                {
                  amount: 12000000,
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
          title: "کلید تک پل برقی",
          category_ids: [
            categoryResult.find((cat) => cat.name === "کلید و پریز")!.id,
          ],
          description:
            "کلید تک پل با طراحی مدرن و بدنه ضدخش، مناسب برای روشنایی و کنترل مدارهای برقی. دارای استاندارد IP20 و جریان نامی ۱۰ آمپر.",
          handle: "single-switch",
          weight: 150,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/switch-single.jpg",
            },
          ],
          options: [
            {
              title: "رنگ",
              values: ["سفید", "طوسی", "مشکی"],
            },
          ],
          variants: [
            {
              title: "سفید",
              sku: "SWITCH-SINGLE-WHITE",
              options: {
                Color: "سفید",
              },
              prices: [
                {
                  amount: 2500000,
                  currency_code: "irr",
                }
              ],
            },
            {
              title: "طوسی",
              sku: "SWITCH-SINGLE-GRAY",
              options: {
                Color: "طوسی",
              },
              prices: [
                {
                  amount: 2800000,
                  currency_code: "irr",
                }
              ],
            },
            {
              title: "مشکی",
              sku: "SWITCH-SINGLE-BLACK",
              options: {
                Color: "مشکی",
              },
              prices: [
                {
                  amount: 3200000,
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
          title: "پریز برق دوپل",
          category_ids: [
            categoryResult.find((cat) => cat.name === "کلید و پریز")!.id,
          ],
          description:
            "پریز دوپل با کیفیت ساخت بالا و گیره‌های مسی، مناسب برای مصارف خانگی و اداری. دارای استاندارد ایمنی و جریان نامی ۱۶ آمپر.",
          handle: "double-socket",
          weight: 200,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/socket-double.jpg",
            },
          ],
          options: [
            {
              title: "رنگ",
              values: ["سفید", "کرم"],
            },
          ],
          variants: [
            {
              title: "سفید",
              sku: "SOCKET-DOUBLE-WHITE",
              options: {
                Color: "سفید",
              },
              prices: [
                {
                  amount: 3500000,
                  currency_code: "irr",
                }
              ],
            },
            {
              title: "کرم",
              sku: "SOCKET-DOUBLE-CREAM",
              options: {
                Color: "کرم",
              },
              prices: [
                {
                  amount: 3800000,
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
          title: "لامپ LED مهتابی ۴۰ وات",
          category_ids: [
            categoryResult.find((cat) => cat.name === "لامپ و روشنایی")!.id,
          ],
          description:
            "لامپ LED مهتابی با مصرف کم و روشنایی بالا، مناسب برای فضاهای مسکونی، اداری و تجاری. دارای راندمان نوری بالا و عمر مفید بیش از ۲۵۰۰۰ ساعت.",
          handle: "led-tube-40w",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/led-tube.jpg",
            },
          ],
          options: [
            {
              title: "دمای رنگ",
              values: ["سفید گرم (۳۰۰۰K)", "سفید سرد (۶۵۰۰K)"],
            },
          ],
          variants: [
            {
              title: "سفید گرم",
              sku: "LED-TUBE-40W-WARM",
              options: {
                Color: "سفید گرم (۳۰۰۰K)",
              },
              prices: [
                {
                  amount: 4500000,
                  currency_code: "irr",
                }
              ],
            },
            {
              title: "سفید سرد",
              sku: "LED-TUBE-40W-COOL",
              options: {
                Color: "سفید سرد (۶۵۰۰K)",
              },
              prices: [
                {
                  amount: 4500000,
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
          title: "مینیاتوری (کلید حفاظتی) ۶ آمپر",
          category_ids: [
            categoryResult.find((cat) => cat.name === "تابلو برق و تجهیزات حفاظتی")!.id,
          ],
          description:
            "مینیاتوری یا کلید حفاظتی تک‌پل با جریان نامی ۶ آمپر، مناسب برای محافظت از مدارهای روشنایی و پریزها. دارای قابلیت قطع در برابر اتصال کوتاه و بار اضافی.",
          handle: "mcb-6a",
          weight: 100,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/mcb-6a.jpg",
            },
          ],
          options: [
            {
              title: "نوع",
              values: ["تک‌پل", "دوپل"],
            },
          ],
          variants: [
            {
              title: "تک‌پل",
              sku: "MCB-6A-SINGLE",
              options: {
                Type: "تک‌پل",
              },
              prices: [
                {
                  amount: 1500000,
                  currency_code: "irr",
                }
              ],
            },
            {
              title: "دوپل",
              sku: "MCB-6A-DOUBLE",
              options: {
                Type: "دوپل",
              },
              prices: [
                {
                  amount: 2500000,
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
  logger.info("ایجاد داده‌های محصول به پایان رسید.");

  logger.info("در حال ایجاد سطح موجودی...");

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

  logger.info("ایجاد سطح موجودی به پایان رسید.");
}
