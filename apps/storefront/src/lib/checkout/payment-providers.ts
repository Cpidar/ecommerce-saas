"use server"
import { siteConfigRepository } from "../repositories/site-configs";

export async function requestProvider({
    cartId,
    providerId,
    amount,
    config,
    callbackUrl,
    successUrl = "checkout/success",
    failUrl = "checkout/failed",
}: {
    cartId: string
    providerId: string;
    amount: string;
    config: Record<string, string>
    callbackUrl?: string;
    successUrl?: string;
    failUrl?: string;
}): Promise<
    { referenceId: string; url: string; method: "POST" | "GET" } | undefined
> {

    const fullCallbackUrl = `${callbackUrl}?cartId=${cartId}&successUrl=${successUrl}&failUrl=${failUrl}`;

    if (!config) {
        throw new Error("تنظیمات درگاه پرداخت به درستی تنظیم نشده است. با مدیر فروشگاه تماس بگیرید")
    }

    let res;

    switch (providerId) {
        case "pp_system_default":
        case "pp_zibal_zibal":
            res =
                // const res = await PromiseWithTimeout(3000,
                await fetch("http://localhost:3000/api/behpardakht/request", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                        "terminalId": "12345678",
                        "userName": "test",
                        "userPassword": "test",
                        "orderId": "ORD-9876",
                        "amount": 2500000,
                        "callbackUrl": fullCallbackUrl,
                        "additionalData": "user_id=55231&plan=premium&campaign=spring",
                        "payerId": "customer-44567"
                    }),
                });
            // ) as Response

            const { RefId } = await res.json();
            console.log(RefId);

            return {
                referenceId: RefId,
                url: `http://localhost:3000/payment/${RefId}`,
                method: "POST",
            };

        case "pp_behpardakht_behpardakht":
            res = await fetch("/api/behpardakht/request", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    "terminalId": config.terminalId,
                    "userName": config.userName,
                    "userPassword": config.password,
                    "orderId": new Date().getTime().toString(),
                    "amount": amount,
                    "callbackUrl": fullCallbackUrl,
                    "additionalData": "user_id=55231&plan=premium&campaign=spring",
                    "payerId": "customer-44567"
                }),
            }).then((res) => res.json())
                ;

            return { referenceId: res.refId, url: "https://bpm.shaparak.ir/pgwchannel/startpay.mellat", method: "POST" };
    }
}

// for simulating request latency
export async function PromiseWithTimeout<T>(
    millis: number,
    promise: Promise<T>,
): Promise<T | unknown> {
    let timeoutPid: string | number | NodeJS.Timeout | undefined;
    const timeout = new Promise(
        (resolve, reject) =>
        (timeoutPid = setTimeout(
            () => reject(`Timed out after ${millis} ms.`),
            millis,
        )),
    );
    return Promise.race([promise, timeout]).finally(() => {
        if (timeoutPid) {
            clearTimeout(timeoutPid);
        }
    });
}
