"use server";
import { siteConfigRepository } from "../repositories/site-configs";
import { bpPayRequest } from "./behpardakht";

export type PaymentResult =
  | {
      success: true;
      referenceId: string; // RefId
      url: string; // payment page URL
      method: "POST" | "GET";
    }
  | {
      success: false;
      error: string;
      resCode?: string;
    };
export async function requestProvider({
  cartId,
  providerId,
  amount,
  config,
  callbackUrl,
  successUrl = "checkout/success",
  failUrl = "checkout/failed",
}: {
  cartId: string;
  providerId: string;
  amount: string;
  config: Record<string, string>;
  callbackUrl?: string;
  successUrl?: string;
  failUrl?: string;
}): Promise<PaymentResult> {
  const amountInRials = Number(amount) * 10;
  const fullCallbackUrl = `${callbackUrl}?cartId=${cartId}&successUrl=${successUrl}&failUrl=${failUrl}`;

  if (!config) {
    return {
      success: false,
      error:
        "تنظیمات درگاه پرداخت به درستی تنظیم نشده است. با مدیر فروشگاه تماس بگیرید",
    };
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
            terminalId: "12345678",
            userName: "test",
            userPassword: "test",
            orderId: "ORD-9876",
            amount: 2500000,
            callbackUrl: fullCallbackUrl,
            additionalData: "user_id=55231&plan=premium&campaign=spring",
            payerId: "customer-44567",
          }),
        });
      // ) as Response

      const { RefId } = await res.json();
      console.log(RefId);

      return {
        success: true,
        referenceId: RefId,
        url: `http://localhost:3000/payment/${RefId}`,
        method: "POST",
      };

    case "pp_behpardakht_behpardakht":
      const result = await bpPayRequest({
        terminalId: +config.terminalId,
        userName: config.username,
        userPassword: config.password,
        orderId: Date.now(),
        amount: amountInRials, // Rials
        callBackUrl: fullCallbackUrl,
        // additionalData: "user_id",
        payerId: "0",
        isSandbox: true,
      });
      if (!result.success) {
        return {
          success: false,
          error: result.message,
          resCode: result.resCode,
        };
      }

      return {
        success: true,
        referenceId: result.refId!,
        url:
          process.env.NODE_ENV === "production"
            ? "https://bpm.shaparak.ir/pgwchannel/startpay.mellat"
            : "https://pgw.dev.bpmellat.ir/pgwchannel/startpay.mellat",
        method: "POST",
      };
  }
  return {
    success: false,
    error: "Unknown provider",
  };
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
