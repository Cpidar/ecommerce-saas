import {
  AbstractPaymentProvider,
  Modules,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils";
import { MedusaError } from "@medusajs/framework/utils";
import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  SavePaymentMethodInput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types";
import { randomUUID } from "crypto";


type InjectedDependencies = {
  logger: Logger;
};

export default class BehpardakhtPaymentProvider extends AbstractPaymentProvider {
  static identifier = "behpardakht";

  protected logger_: Logger;
  // protected driver: BehpardakhtDriver;

  constructor(container: InjectedDependencies) {
    super(container);

    this.logger_ = container.logger;

  }

  async initiatePayment(
    input: InitiatePaymentInput,
  ): Promise<any> {
    const { amount, currency_code, context } = input;


    try {

      return {
        data: {
          ...context,
          amount,
        },
        status: PaymentSessionStatus.REQUIRES_MORE,
      };
    } catch (error) {
      this.logger_.error({
        name: MedusaError.Types.NOT_ALLOWED,
        message: `Initiate payment failed: ${error}`,
      });

      return {
        id: ``,
        data: { ...context, amount, error },
        status: PaymentSessionStatus.ERROR,
      };
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput,
  ): Promise<any> {
    return { data: input, status: PaymentSessionStatus.AUTHORIZED };
  }

  async getStatus(
    data: Record<string, unknown>,
  ): Promise<PaymentSessionStatus> {
    return data.verified
      ? PaymentSessionStatus.AUTHORIZED
      : PaymentSessionStatus.PENDING;
  }

  async capturePayment(
    input: CapturePaymentInput,
  ): Promise<CapturePaymentOutput> {
    // Already settled during authorize; no-op
    return { data: input.data };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    throw new Error("Method not implemented.");
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    // Use reversal for cancel if applicable; otherwise no-op
    return { data: input.data };
  }

  async updatePayment(input: UpdatePaymentInput): Promise<any> {
    // Simplified: re-initiate if amount changes
    return this.initiatePayment(input);
  }

  async savePaymentMethod({ context, data }: SavePaymentMethodInput) {
    return { id: randomUUID(), data }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"],
  ): Promise<any> {
    console.log("😂😂😂😂😂😂😂😂😂");
    return {
      action: PaymentActions.FAILED,
      data: {
        amount: new BigNumber(0),
        session_id: "payses_01KTYTEBB7WK88CP9Y9QK5G88D",
      },
    };
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: {} };
  }
  getPaymentStatus(
    input: GetPaymentStatusInput,
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }
  retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    throw new Error("Method not implemented.");
  }
}
