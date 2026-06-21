
export async function requestProvider(
    { providerId, amount, calcallbackUrl }:
        { providerId: string; amount: string; calcallbackUrl?: string }
): Promise<{ referenceId: string; url: string; method: "POST" | "GET" } | undefined> {

    switch (providerId) {
        case "pp_system_default":
            const res =
            // const res = await PromiseWithTimeout(3000, 
                await fetch("http://localhost:3000/api/behpardakht/request", {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: `{
                    "terminalId": "12345678",
                    "userName": "test",
                    "userPassword": "test",
                    "orderId": "ORD-9876",
                    "amount": 2500000,
                    "callbackUrl": "http://localhost:8000/api/payment/sandbox/callback",
                    "additionalData": "user_id=55231&plan=premium&campaign=spring",
                    "payerId": "customer-44567"
                }`
            })
        // ) as Response

            const { RefId } = await res.json()
            console.log(RefId)

            return { referenceId: RefId, url: `http://localhost:3000/payment/${RefId}`, method: "POST" }

        case "behpardakht":
            return { referenceId: '', url: '', method: "GET" }
    }

}

// for simulating request latency
export function PromiseWithTimeout<T>(millis: number, promise: Promise<T>): Promise<T | unknown> {
    let timeoutPid: string | number | NodeJS.Timeout | undefined;
    const timeout = new Promise((resolve, reject) =>
        timeoutPid = setTimeout(
            () => reject(`Timed out after ${millis} ms.`),
            millis));
    return Promise.race([
        promise,
        timeout
    ]).finally(() => {
        if (timeoutPid) {
            clearTimeout(timeoutPid);
        }
    });
};