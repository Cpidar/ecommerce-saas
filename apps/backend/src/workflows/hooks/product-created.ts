import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import { linkProductToStoreWorkflow } from "@sepidar/medusa-multistore-plugin/workflows/link-product-to-store/index";
import { resolveCurrentStore } from "../../utils/resolve-current-store";
import { createProductPriceListPricesWorkflow } from "@sepidar/medusa-multistore-plugin/workflows/create-product-price-list-prices/index";
import { MedusaError, MedusaErrorTypes, Modules } from "@medusajs/framework/utils";
import { IProductModuleService } from "@medusajs/types";
import { normalizePersianText } from "../../utils/normalize-persian-text";

createProductsWorkflow.hooks.productsCreated(
    async ({ products }, { container }) => {
        console.log("HOOK productsCreated", products.map(p => p.title));
        const productModuleService = container.resolve<IProductModuleService>(Modules.PRODUCT)

        // const currentStore = container.resolve("currentStore") as Pick<StoreDTO, 'id'>;
        const currentStore = await resolveCurrentStore(container)
        if (!currentStore) {
            throw new MedusaError(MedusaErrorTypes.INVALID_DATA, "Current Store not Found")
        }
        console.log("✌️✌️✌️✌️✌️ in store ", currentStore)

        await Promise.all(
            products.map(({ id }) =>
                linkProductToStoreWorkflow(container).run({
                    input: {
                        productId: id,
                        storeId: currentStore.id,
                    },
                })
            )
        );

        // add random postfix to product handle and normalize title and description
        for (const product of products) {
            const uniquPostfix = Math.floor(1000 + Math.random() * 9000).toString()


            const customHandle = `ncp-${uniquPostfix}-${product.handle}`
            const normalizedTitle = normalizePersianText(product.title)
            const normalizedDescription = product.description ? normalizePersianText(product.description) : undefined;

            await productModuleService.updateProducts(product.id, {
                handle: customHandle,
                title: normalizedTitle,
                description: normalizedDescription
            })
        }

        if (process.env.IS_CHANNEL_PRICING_ENABLED) {
            await createProductPriceListPricesWorkflow(container).run({
                input: {
                    products,
                    storeId: currentStore.id,
                },
            });
        }
    }
);
