import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { creditStoreCreditAccountWorkflow } from "@medusajs/loyalty-plugin/workflows";
import { createStoreCreditWithMetadataWorkflow } from "../../../workflows/store-credit-account";
import { IStoreCreditModuleService } from "@medusajs/loyalty-plugin/types";

const CURRENCY = "irr";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const storeCreditModuleService =
    req.scope.resolve<IStoreCreditModuleService>("store_credit");

  // 1. Read all transaction details from the request body
  const {
    customer_id,
    amount,
    reference, // e.g., "saas_subscription", "saas_renewal", "welcome_gift"
    reference_id, // e.g., "sub_123", "inv_456" — unique per transaction
    note, // optional human-readable note
  } = req.body as {
    customer_id: string;
    amount: number;
    reference: string;
    reference_id: string;
    note?: string;
  };

  if (!process.env.SAAS_STORE_ID) {
    return res.status(500).json({
      message: "SAAS_STORE_ID is not set",
    });
  }

  if (!customer_id || !amount || !reference || !reference_id) {
    return res.status(400).json({
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
      } = await createStoreCreditWithMetadataWorkflow(req.scope).run({
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
    });

    const filteredExisting = existing.filter(
      (t) => t.reference === reference && t.reference_id === reference_id,
    );

    if (filteredExisting.length > 0) {
      logger.info(
        `Skipping duplicate credit: reference=${reference}, reference_id=${reference_id}`,
      );
      return res.status(200).json({
        message: "Transaction already processed",
        account_id: accountId,
      });
    }

    // 4. Credit the account
    await creditStoreCreditAccountWorkflow(req.scope).run({
      input: {
        account_id: accountId,
        amount,
        note: note ?? `SaaS credit: ${reference}`,
        reference,
        reference_id,
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
      { throwIfKeyNotFound: true },
    );

    logger.info(
      `Credited ${amount} to account ${accountId} (ref: ${reference}/${reference_id})`,
    );

    return res.status(200).json({ store_credit_account });
  } catch (error) {
    logger.error(
      `Store credit transaction failed for customer ${customer_id}:`,
      error,
    );
    return res.status(500).json({ message: "Store credit transaction failed" });
  }
}
