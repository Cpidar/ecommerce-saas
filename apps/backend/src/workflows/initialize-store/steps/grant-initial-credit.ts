import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { creditStoreCreditAccountWorkflow } from "@medusajs/loyalty-plugin/workflows";
import { createStoreCreditWithMetadataWorkflow } from "../../store-credit-account";
import { Query } from "@medusajs/framework/types";
import { IStoreCreditModuleService } from "@medusajs/loyalty-plugin/types";
import { Logger } from "@medusajs/framework/types";

const INITIAL_GIFT_CREDIT = Number(process.env.INITIAL_GIFT_CREDIT ?? 100_000); // 100,000 Tomans / Rials equivalent
const CURRENCY = "irr"; // Or your configured base currency code (e.g., "irr" / "irt")
const REFERENCE = "welcome-gift-credit";
const REFERENCE_ID = "welcome-gift-credit";

export const grantInitialCreditStep = createStep(
  "grant-initial-credit",
  async ({ customer_id }: { customer_id: string }, { container }) => {
    const query = container.resolve<Query>(ContainerRegistrationKeys.QUERY);
    const storeCreditModuleService = container.resolve<IStoreCreditModuleService>("store-credit");
    const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);

    if (!process.env.SAAS_STORE_ID) {
      return new StepResponse({
        message: "SAAS_STORE_ID is not set",
      });
    }

    if (!customer_id) {
      return new StepResponse({
        message: "customer_id, amount, reference, and reference_id are required",
      });
    }

    try {
      // 2. Find or create the store credit account
      const { data: accounts } = await query.graph({
        entity: "store_credit_account",
        fields: ["id"],
        filters: { customer_id },
      });

      let accountId: string;

      if (accounts.length === 0) {
        const {
          result: [account],
        } = await createStoreCreditWithMetadataWorkflow(container).run({
          input: {
            customer_id,
            currency_code: CURRENCY,
            //
            metadata: { store_id: process.env.SAAS_STORE_ID },
          },
        });
        accountId = account.id;
        logger.info(
          `Created store credit account ${accountId} for customer ${customer_id}`,
        );
      } else {
        accountId = accounts[0].id;
      }

      // 3. Idempotency guard: skip if this reference_id was already credited
      const existing = await storeCreditModuleService.listAccountTransactions({
        account_id: accountId,
        reference: REFERENCE,
        reference_id: REFERENCE_ID,
      });

      if (existing.length > 0) {
        logger.info(
          `Skipping duplicate credit: reference=${REFERENCE}, reference_id=${REFERENCE_ID}`,
        );
        return new StepResponse({
          message: "Transaction already processed",
          account_id: accountId,
        });
      }

      // 4. Credit the account
      const { result: creditResult } = await creditStoreCreditAccountWorkflow(
        container,
      ).run({
        input: {
          account_id: accountId,
          amount: INITIAL_GIFT_CREDIT,
          note: `SaaS credit: ${REFERENCE}`,
          reference: REFERENCE,
          reference_id: REFERENCE_ID,
        },
      });

      logger.info(
        `Credited ${INITIAL_GIFT_CREDIT} to account ${accountId} (ref: ${REFERENCE}/${REFERENCE_ID})`,
      );

      return new StepResponse(creditResult);
    } catch (error) {
      logger.error(
        `Store credit transaction failed for customer ${customer_id}:`,
        error,
      );
      return new StepResponse({ message: "Store credit transaction failed" });
    }
  },
  async (creditId, { container }) => {
    // Compensation logic if workflow fails
    if (!creditId) return;
    const storeCreditService = container.resolve<IStoreCreditModuleService>("store-credit");
    await storeCreditService.deleteTransactions([creditId]);
  },
);
