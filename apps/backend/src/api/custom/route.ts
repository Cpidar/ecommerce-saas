// PLAYGROUND TEST
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import StoreConfigLink from "../../links/multi-tenant/store_config-store";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createStoreCreditAccountsWorkflow,
  creditStoreCreditAccountWorkflow,
} from "@medusajs/loyalty-plugin/workflows";

const INITIAL_GIFT_CREDIT = Number(process.env.INITIAL_GIFT_CREDIT ?? 100000); // 100,000 Tomans / Rials equivalent
const CURRENCY = "irr"; // Or your configured base currency code (e.g., "irr" / "irt")
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  console.log(INITIAL_GIFT_CREDIT);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const customerId = req.query.customerId as string;
  const storeCreditModuleService = req.scope.resolve("store_credit");
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
  let accountId: string | undefined;
  try {
    // const { data: [{ store_config_id: storeConfigId }] } = await query.graph({
    //     entity: StoreConfigLink.entryPoint,
    //     fields: ["store_config_id", "store_id"],
    //     filters: {
    //         store_id: ["store_01KTK5R0R5MZZ6KSPB4M5SMPF"]
    //     }
    // })
    // console.log(storeConfigId)
    // res.status(200).json(storeConfigId);
    // const { data } = await query.graph({
    //     entity: "product",
    //     fields: ["store.id"],
    //     filters: {
    //         id: ["prod_01KTK8Q6SWKJ344E689ES4NA03"]
    //     }
    // })
    //
    const { data: accounts } = await query.graph({
      entity: "store_credit_account",
      fields: ["id", "customer_id", "metadata"],
      filters: {
        // @ts-ignore
        "metadata": {
          "store_id": process.env.SAAS_STORE_ID!,
        },
      },
    })
    console.log(accounts)
    const storeCreditAccounts =
      await storeCreditModuleService.listStoreCreditAccounts({
        customer_id: customerId,
      });
    console.log(storeCreditAccounts);
    if (!storeCreditAccounts || storeCreditAccounts.length === 0) {
      const {
        result: [creditAccount],
      } = await createStoreCreditAccountsWorkflow(req.scope).run({
        input: [
          {
            customer_id: customerId,
            currency_code: CURRENCY,
          },
        ],
      });
      accountId = creditAccount.id;
      logger.info(`Created store credit account: ${accountId} and credited with ${INITIAL_GIFT_CREDIT}`);
      res.status(200).json(creditAccount);
    } else {
      accountId = storeCreditAccounts[0].id;
      await creditStoreCreditAccountWorkflow(
        req.scope,
      ).run({
        input: {
          account_id: accountId,
          amount: INITIAL_GIFT_CREDIT,
          note: "Welcome Gift / Initial Trial Credit",
          reference: "order",
        },
      });
      const {
        data: [store_credit_account],
      } = await query.graph(
        {
          entity: "store_credit_account",
          fields: ["*"],
          filters: { id: accountId },
        },
        { throwIfKeyNotFound: true }
      );

      logger.info(`Credited store credit account: ${accountId} with ${INITIAL_GIFT_CREDIT} `);
      res.status(200).json({ store_credit_account });
    }
  } catch (error) {
    logger.error(error);
    res.sendStatus(409);
  }
}
