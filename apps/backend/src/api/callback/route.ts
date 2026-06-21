import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules, PaymentSessionStatus } from "@medusajs/framework/utils";
import { PaymentSessionDTO } from "@medusajs/framework/types";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const params = req.query;
    const { RefId, ResCode, saleOrderId, SaleReferenceId, CardHolderPan } = params;;

    if (ResCode !== "0") {
        console.error("Missing SaleOrderId in callback");
        return res.redirect(302, "/order/failed");
    }

    res.redirect(`http://localhost:8000/checkout/success?saleOrderId=${RefId}&saleReferenceId=${RefId}`)

    // try {
    //     const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    //     // const man ager = req.scope.resolve<EntityManager>("manager");
    //     const paymentService = req.scope.resolve(Modules.PAYMENT);

    //     const session = await paymentService.retrievePaymentSession(RefId as string);

    //     // const { data: session } = await query.graph({
    //     //     entity: "PaymentSession",
    //     //     fields: ["provider_id", "data"],
    //     //     filters: {
    //     //         provider_id: "behpardakht",
    //     //         data: {
    //     //             order_id: saleOrderId
    //     //         }
    //     //     },
    //     //     pagination: {
    //     //         take: 1
    //     //     }
    //     // })[0] as { data: PaymentSessionDTO }


    //     // const session = await manager.createQueryBuilder(PaymentSession, "ps")
    //     //     .where("ps.provider_id = :provider", { provider: "behpardakht" })
    //     //     .andWhere("(ps.data ->> 'order_id') = :orderId", { orderId: saleOrderId })
    //     //     .getOne();

    //     if (!session) {
    //         throw new Error("Payment session not found for SaleOrderId");
    //     }

    //     const { payment_session: updatedSession } = await paymentService.authorizePaymentSession(session.id, params); // Calls provider's authorizePayment

    //     if (updatedSession?.status === PaymentSessionStatus.AUTHORIZED) {

    //         // TODO: replace STORE_CORS with tenant storefront url
    //         // return res.redirect(302, `${process.env.STORE_CORS}/payment/confirmation?saleOrderId=${saleOrderId}&saleReferenceId=${params.saleReferenceId}`);
    //         return res.redirect(302, `$http://localhost:8000/chaeckout/confirmation?saleOrderId=${saleOrderId}&saleReferenceId=${params.saleReferenceId}`);
    //     } else {
    //         return res.redirect(302, "/order/failed");
    //     }
    // } catch (error) {
    //     console.error("Callback error:", error);
    //     return res.redirect(302, "/order/failed");
    // }
}