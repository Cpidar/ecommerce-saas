import { behpardakht, errors } from './request'
import type { NextApiRequest, NextApiResponse } from 'next';


const getMedusaHeaders = (req: NextApiRequest, tags: string[] = []) => {
    const headers = {
        next: {
            tags,
        },
    } as Record<string, unknown>

    const token = req.cookies["_medusa_jwt"]

    if (token) {
        headers.authorization = `Bearer ${token}`
    } else {
        headers.authorization = ""
    }

    return headers
}

const retryVerify = async (res: NextApiResponse, {
    orderId,
    saleOrderId,
    saleReferenceId
}: {
    orderId: string
    saleOrderId: string
    saleReferenceId: string
}) => {
    const inquireRes = await behpardakht.inquirePayment({
        orderId,
        saleOrderId,
        saleReferenceId,
    })
    if (inquireRes.resCode === 0) {
        return res.json(inquireRes)
    } else {
        return res.status(400).json({ error: '', resCode: inquireRes.resCode })
    }
}

const bpVerify = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log(req.body)
    const { SaleOrderId, SaleReferenceId, RefId } = JSON.parse(req.body)

    // const headers = getMedusaHeaders(req, ['carts'])

    // const cartId = req.cookies["_medusa_cart_id"]

    // if (!cartId) {
    //     return null
    // }
    //  await medusaClient.carts.updatePaymentSession(cartId, 'behpardakht', { data: { resCode: 0 } })

    // const cart = await medusaClient.carts
    //     .complete(cartId, headers)
    //     .then((res) => res)
    //     .catch((err) => medusaError(err))

    //     console.log(cart)

    // if (cart?.type === "order") {
    //     const countryCode = cart.data.shipping_address?.country_code?.toLowerCase()

    //     res.setHeader('Set-Cookie', cookie.serialize("_medusa_cart_id", "", { maxAge: -1 }))
    //     res.status(200).json({ resCode: 0, countryCode, orderCode: cart?.data.id })
    //     // res.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/${countryCode}/order/confirmed/${cart?.data.id}`)
    // }

    try {
        const response = await behpardakht.verifyPayment({
            orderId: SaleOrderId,
            saleOrderId: SaleOrderId,
            saleReferenceId: SaleReferenceId
        })

        console.log(response)

        if (response.resCode === 0 || response.resCode === 43) {

            // const settleRes = await behpardakht.settlePayment({
            //     orderId,
            //     saleOrderId,
            //     saleReferenceId,
            // })
            // updatePaymentSession({ cartId, providerId: 'behpardakht', data: { data: { resCode: settleRes.resCode } } })
            // if (settleRes.resCode === 0 || response.resCode === 45) {
            // const headers = getMedusaHeaders(req, ['carts'])

            // const cartId = req.cookies["_medusa_cart_id"]
            // console.log(cartId)

            // if (!cartId) {
            //     return null
            // }

            // // save saleReferenceId into payment session
            // await medusaClient.carts
            //     .updatePaymentSession(cartId, 'behpardakht', { data: { saleReferenceId } })
            //     // .then(({ cart }) => cart)
            //     .catch((err) => medusaError(err))

            // const cart = await medusaClient.carts
            //     .complete(cartId, headers)
            //     .then((res) => res)
            //     .catch((err) => medusaError(err))

            // if (cart?.type === "order") {
            // const countryCode = cart.data.shipping_address?.country_code?.toLowerCase()

            // res.setHeader('Set-Cookie', cookie.serialize("_medusa_cart_id", "", { maxAge: -1 }))
            // res.redirect(307, `https://tabeshelecshop-frontend.liara.run/callback/saleReferenceId=${saleReferenceId}`)
            res.status(200).json(response)
            // }
        } else {
            console.warn("Gateway Error: ", response.resCode)
            res.status(400).json({ errorMessage: errors[response.resCode], resCode: response.resCode })
        }

        // } else {
        //     // return retryVerify(res, {
        //     //     orderId,
        //     //     saleOrderId,
        //     //     saleReferenceId
        //     // })
        //     res.status(400).json({ error: '', resCode: response.resCode })
        // }

    } catch (e) {
        console.log('Error, something went wrong.', e);
        res.setHeader('Cache-Control', 'no-store');
        res.status(400).json({ errorMessage: 'Unexpected error', code: 400 });
    }
};



export default bpVerify;