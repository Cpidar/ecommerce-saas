// src/jobs/daily-balance-deduction.ts
import { MedusaContainer, Query } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, MathBN } from "@medusajs/framework/utils";
import { debitStoreCreditAccountWorkflow } from "@medusajs/loyalty-plugin/workflows";
import { updateStoreConfigWorkflow } from "../workflows/update-store-config";

// The amount to deduct daily (e.g., in the account's currency)
const DAILY_DEDUCTION_AMOUNT = Number(
  process.env.DAILY_DEDUCTION_AMOUNT ?? 10000,
);

export default async function dailyBalanceDeductionJob(
  container: MedusaContainer,
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve<Query>(ContainerRegistrationKeys.QUERY);

  logger.info("Starting daily store credit balance deduction job...");

  // 1. Fetch all store credit accounts
  const { data: accounts } = await query.graph({
    entity: "store_credit_account",
    fields: ["id", "customer_id", "metadata"],
    filters: {
      // @ts-ignore
      metadata: {
        store_id: process.env.SAAS_STORE_ID!,
      },
    },
  });

  if (!accounts || accounts.length === 0) {
    logger.info("No store credit accounts found. Skipping daily deduction.");
    return;
  }

  // 2. Generate a unique reference_id for today's run
  const today = new Date().toISOString().split("T")[0]; // e.g., "2026-09-26"
  const referenceId = `daily_deduction_${today}`;

  // 3. Loop through accounts and process debits
  for (const account of accounts) {
    try {
      await debitStoreCreditAccountWorkflow(container).run({
        input: {
          account_id: account.id,
          amount: DAILY_DEDUCTION_AMOUNT,
          reference: "saas_daily_deduction",
          reference_id: referenceId,
          note: `Scheduled daily deduction for ${today}`,
        },
      });

      // 1. Calculate current balance for this specific account
      let currentBalance = MathBN.convert(0);
      for (const tx of account.transactions || []) {
        if (tx?.type === "credit")
          currentBalance = MathBN.add(currentBalance, tx.amount);
        else if (tx?.type === "debit")
          currentBalance = MathBN.sub(currentBalance, tx.amount);
      }
      // 3. Check if balance is sufficient for today's deduction
      const balanceAfterDeduction = MathBN.sub(
        currentBalance,
        DAILY_DEDUCTION_AMOUNT,
      );
      const isInsufficient = MathBN.lt(balanceAfterDeduction, 0);

      if (isInsufficient) {
        logger.warn(
          `Account ${account.id} has insufficient balance (${currentBalance.toNumber()}). Suspending related store.`,
        );
        // 4. Find the related medusa_store_id via StoreConfigLink
        const { data: storeConfigs } = await query.graph({
          entity: "store_config", // Replace with your actual link entity name
          fields: ["id", "medusa_store_id", "subscription_status"],
          filters: {
            store_credit_account_id: account.id,
          },
        });

        const currentStoreConfig = storeConfigs?.[0];
        if (
          currentStoreConfig &&
          currentStoreConfig.subscription_status !== "suspended" &&
          currentStoreConfig.subscription_status !== "inactive"
        ) {
          await updateStoreConfigWorkflow.run({
            input: {
              id: currentStoreConfig.id,
              subscription_status: "suspended",
              store_suspended_at: new Date().toISOString(),
              store_suspended_reason: "insufficient_store_credit",
            },
          });
        }
      }
      logger.info(`Successfully debited account ${account.id} for ${today}`);
    } catch (error) {
      // Log error but continue processing other accounts
      logger.error(`Failed to debit account ${account.id}:`, error);
    }
  }

  logger.info("Finished daily store credit balance deduction job.");
}

export const config = {
  name: "daily-balance-deduction",
  // Run every day at midnight
  schedule: "0 0 * * *",
};
