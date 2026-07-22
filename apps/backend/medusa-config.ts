import {
  loadEnv,
  defineConfig,
  Modules,
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    workerMode: "shared",
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    cookieOptions: {
      sameSite: "lax",
      secure: false,
    },

  },
  admin: {
    vite: (config) => {
      config.define["__VITE_DISABLE_SIGNUP_WIDGET__"] = JSON.stringify(true);
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/auth",
      dependencies: [
        Modules.CACHE,
        ContainerRegistrationKeys.LOGGER,
        Modules.EVENT_BUS,
      ],
      options: {
        providers: [
          // default provider
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
          {
            resolve: "./src/modules/phone-auth",
            id: "phone-auth",
            options: {
              jwtSecret: process.env.PHONE_AUTH_JWT_SECRET || "supersecret",
            },
          },
        ],
      },
    },
    {
      resolve: "./src/modules/product-media",
    },
    {
      resolve: "./src/modules/store-config",
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            // if module provider is in a plugin, use `plugin-name/providers/my-payment`
            resolve: "./src/modules/behpardakht",
            id: "behpardakht",
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/notification-local",
            id: "local",
            options: {
              name: "Local Notification Provider",
              channels: ["feed"],
            },
          },
        ],
      },
    },

    // Production Modules
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "rustfs-s3",
            options: {
              // Use port 3900 for S3 API
              endpoint: process.env.S3_ENDPOINT || "http://rustfs:3900", // Custom port
              file_url: process.env.S3_FILE_URL || "http://localhost:3900/medusabucket",
              access_key_id: process.env.S3_ACCESS_KEY_ID, // From step 1
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY, // From step 1
              region: process.env.S3_REGION || "us-east-1",
              bucket: process.env.S3_BUCKET || "medusabucket",
              additional_client_config: {
                forcePathStyle: true,
              },
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/caching",
      options: {
        providers: [
          {
            resolve: "@medusajs/caching-redis",
            id: "caching-redis",
            is_default: true,
            options: {
              redisUrl: process.env.CACHE_REDIS_URL || process.env.REDIS_URL,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          // Note: This was `url` before v2.12.2
          // It's now deprecated in favor of `redisUrl`
          redisUrl: process.env.REDIS_URL,
        },
      },
    },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: {
              redisUrl: process.env.LOCKING_REDIS_URL || process.env.REDIS_URL,
            },
          },
        ],
      },
    },
    // {
    //   resolve: "./src/modules/meilisearch",
    //   options: {
    //     config: {
    //       host:
    //         process.env.MEILISEARCH_HOST ??
    //         "https://fashion-starter-search.agilo.agency",
    //       apiKey: process.env.MEILISEARCH_API_KEY,
    //     },
    //     settings: {
    //       products: {
    //         indexSettings: {
    //           searchableAttributes: [
    //             "title",
    //             "subtitle",
    //             "description",
    //             "collection",
    //             "categories",
    //             "type",
    //             "tags",
    //             "variants",
    //             "sku",
    //           ],
    //           displayedAttributes: [
    //             "id",
    //             "title",
    //             "handle",
    //             "subtitle",
    //             "description",
    //             "is_giftcard",
    //             "status",
    //             "thumbnail",
    //             "collection",
    //             "collection_handle",
    //             "categories",
    //             "categories_handle",
    //             "type",
    //             "tags",
    //             "variants",
    //             "sku",
    //           ],
    //         },
    //         primaryKey: "id",
    //         /**
    //          * @param {import('@medusajs/types').ProductDTO} product
    //          */
    //         transformer: (product) => {
    //           return {
    //             id: product.id,
    //             title: product.title,
    //             handle: product.handle,
    //             subtitle: product.subtitle,
    //             description: product.description,
    //             is_giftcard: product.is_giftcard,
    //             status: product.status,
    //             thumbnail: product.images?.[0]?.url ?? null,
    //             collection: product.collection.title,
    //             collection_handle: product.collection.handle,
    //             categories:
    //               product.categories?.map((category) => category.name) ?? [],
    //             categories_handle:
    //               product.categories?.map((category) => category.handle) ?? [],
    //             type: product.type?.value,
    //             tags: product.tags.map((tag) => tag.value),
    //             variants: product.variants.map((variant) => variant.title),
    //             sku: product.variants
    //               .filter(
    //                 (variant) => typeof variant.sku === "string" && variant.sku,
    //               )
    //               .map((variant) => variant.sku),
    //           };
    //         },
    //       },
    //     },
    //   },
    // },
  ],

  plugins: [
    {
      resolve: "@reorderjs/reorder",
      options: {},
    },
    {
      resolve: "@techlabi/medusa-marketplace-plugin",
      options: {},
    },
  ],
});
