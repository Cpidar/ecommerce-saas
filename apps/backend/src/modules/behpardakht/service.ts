import { AbstractPaymentProvider, Modules, PaymentActions, PaymentSessionStatus, } from "@medusajs/framework/utils";
import { MedusaError } from "@medusajs/framework/utils";
import { AdminStore, AuthorizePaymentInput, AuthorizePaymentOutput, CancelPaymentInput, CancelPaymentOutput, CapturePaymentInput, CapturePaymentOutput, DeletePaymentInput, DeletePaymentOutput, GetPaymentStatusInput, GetPaymentStatusOutput, InitiatePaymentInput, InitiatePaymentOutput, Logger, ProviderWebhookPayload, RefundPaymentInput, RefundPaymentOutput, RetrievePaymentInput, RetrievePaymentOutput, UpdatePaymentInput, UpdatePaymentOutput, WebhookActionResult } from "@medusajs/framework/types"
import { BehpardakhtDriver, getPaymentDriver } from "monopay";


type Options = {
    terminalId: string;
    username: string;
    password: string;
    wsdlUrl: string;
    gatewayUrl: string;
    backendUrl: string;
};

type InjectedDependencies = {
    logger: Logger,
}


export default class BehpardakhtPaymentProvider extends AbstractPaymentProvider<Options> {

    static identifier = "behpardakht"

    protected options_: Options;
    protected logger_: Logger;
    // protected driver: BehpardakhtDriver;


    constructor(
        container: InjectedDependencies,
        options: Options
    ) {
        super(container, options)
        console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥")

        this.logger_ = container.logger
        this.options_ = options

        // this.driver = getPaymentDriver("behpardakht")({
        //     terminalId: +this.options_.terminalId,
        //     username: this.options_.username,
        //     password: this.options_.password,
        //     links: {
        //         payment: this.options_.gatewayUrl,
        //         request: this.options_.wsdlUrl,
        //         verify: this.options_.wsdlUrl
        //     }
        // });


    }

    async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
        const { terminalId, username, password, wsdlUrl, backendUrl } = this.options_;
        const { amount, currency_code, context } = input;

        const callbackUrl = `${backendUrl}/behpardakht/callback`;
        const payerId = 0;

        try {
            // get behpardakht config for this store
            // const config = await this.behpardakhtConfig.retrieveBehpardakhtConfig()

            // const { referenceId, url, method, params } = await this.driver.request({
            //     amount: +amount,
            //     callbackUrl,
            //     payerId
            // })

            // Mocked response for demonstration purposes
            const { url, method, params } = {
                // referenceId: "123456789",
                url: "https://bpm.shaparak.ir/pgwchannel/startpay.mellat",
                method: "POST",
                params: {
                    Amount: amount,
                    ResNum: "123456789",
                }
            }

            const { RefId: referenceId } = await fetch("http://localhost:3000/api/behpardakht/request", {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: `{
                    "terminalId": "12345678",
                    "userName": "test",
                    "userPassword": "test",
                    "orderId": "ORD-9876",
                    "amount": 2500000,
                    "callbackUrl": "http://localhost:9000/callback",
                    "additionalData": "user_id=55231&plan=premium&campaign=spring",
                    "payerId": "customer-44567"
                }`
            }).then(res => res.json())

            return {
                id: `${referenceId}`,
                data: { ...context, amount, gateway_url: url, method, params, referenceId },
                status: PaymentSessionStatus.REQUIRES_MORE,
            };
        } catch (error) {
            this.logger_.error({ name: MedusaError.Types.NOT_ALLOWED, message: `Initiate payment failed: ${error}` });

            return {
                id: ``,
                data: { ...context, amount, error },
                status: PaymentSessionStatus.ERROR,
            };
        }
    }

    async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {

        // const data = input.data ?? {};
        // const amount = data.amount as number;
        // const referenceId = data.referenceId as string | undefined;
        // const SaleReferenceId = data.SaleReferenceId as string | undefined; // params from callback query

        // try {

        //     // const { transactionId, cardPan, raw } = await this.driver.verify({ amount }, data)

        //     // Mocked response for demonstration purposes
        //     const { transactionId, cardPan, raw } = {
        //         transactionId: "987654321",
        //         cardPan: "603799******1234",
        //         raw: {
        //             Status: "0",
        //             RRN: "123456789012",
        //             SaleOrderId: referenceId,
        //             SaleReferenceId: SaleReferenceId,
        //         }
        //     }

        //     const updatedData = { ...data, transactionId, cardPan, raw, verified: true };
        return { data: input, status: PaymentSessionStatus.AUTHORIZED };

        // } catch (error) {

        //     this.logger_.error({ name: MedusaError.Types.NOT_ALLOWED, message: `Authorize payment failed: ${error}` });
        //     const updatedData = { ...data, error, verified: false };
        //     return { data: updatedData, status: PaymentSessionStatus.ERROR };

        // }
    }

    async getStatus(data: Record<string, unknown>): Promise<PaymentSessionStatus> {
        return data.verified ? PaymentSessionStatus.AUTHORIZED : PaymentSessionStatus.PENDING;
    }

    async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
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

    async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
        // Simplified: re-initiate if amount changes
        return this.initiatePayment(input);
    }

    async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
        console.log("😂😂😂😂😂😂😂😂😂")
        return {
            action: PaymentActions.FAILED,
            data: {
                amount: new BigNumber(0),
                session_id: "payses_01KTYTEBB7WK88CP9Y9QK5G88D"
            }
        }
    }

    async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
        return { data: {} }
    }
    getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
        throw new Error("Method not implemented.");
    }
    retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
        throw new Error("Method not implemented.");
    }

}