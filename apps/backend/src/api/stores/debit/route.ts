import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { debitStoreCreditAccountWorkflow } from "@medusajs/loyalty-plugin/workflows";
import { MathBN } from "@medusajs/framework/utils";
import { ModuleStoreCreditAccount } from "@medusajs/loyalty-plugin/types";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const storeCreditModuleService = req.scope.resolve("store_credit");

  const {
    customer_id,
    amount,
    reference, // e.g., "saas_renewal", "saas_overage"
    reference_id, // unique per billing event, e.g., "inv_2026_10"
    note,
  } = req.body as {
    customer_id: string;
    amount: number;
    reference: string;
    reference_id: string;
    note?: string;
  };

  if (!customer_id || !amount || !reference || !reference_id) {
    return res.status(400).json({
      message: "customer_id, amount, reference, and reference_id are required",
    });
  }

  try {
    // 1. Find the store credit account (do NOT create one for debits)
    const { data: accounts } = await query.graph({
      entity: "store_credit_account",
      fields: ["id"],
      filters: { customer_id },
    });

    if (accounts.length === 0) {
      return res.status(404).json({
        message: "No store credit account found for this customer",
      });
    }

    const accountId = accounts[0].id;

    // 2. Idempotency guard: skip if this reference_id was already debited
    const existingAccount = await storeCreditModuleService.listAccountTransactions({
      account_id: accountId,
    });

    const filteredExisting = existingAccount.filter(
      (t) => t.reference === reference && t.reference_id === reference_id,
    );

    if (filteredExisting.length > 0) {
      logger.info(
        `Skipping duplicate debit: reference=${reference}, reference_id=${reference_id}`,
      );
      return res.status(200).json({
        message: "Transaction already processed",
        account_id: accountId,
      });
    }

    // 3. Debit the account
    await debitStoreCreditAccountWorkflow(req.scope).run({
      input: {
        account_id: accountId,
        amount,
        note: note ?? `SaaS debit: ${reference}`,
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
      `Debited ${amount} from account ${accountId} (ref: ${reference}/${reference_id})`,
    );

    return res.status(200).json({ store_credit_account });
  } catch (error) {
    logger.error(
      `Store credit debit failed for customer ${customer_id}:`,
      error,
    );
    return res.status(402).json({ message: error.message ?? "Store credit debit failed" });
  }
}
