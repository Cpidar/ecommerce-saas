// src/lib/behpardakht/index.ts

type BaseCredentials = {
  terminalId: number | string;
  userName: string;
  userPassword: string;
  isSandbox?: boolean;
};

type BpPayRequestParams = BaseCredentials & {
  orderId: number | string;
  amount: number;
  callBackUrl: string;
  additionalData?: string;
  payerId?: string;
};

type BpVerifyOrSettleParams = BaseCredentials & {
  orderId: number | string;
  saleOrderId: number | string;
  saleReferenceId: number | string;
};

type BpResult =
  | { success: true; resCode: "0"; refId?: string }
  | { success: false; resCode: string; message: string };

const ENDPOINTS = {
  production: "https://bpm.shaparak.ir/pgwchannel/services/pgw",
  sandbox: "https://pgw.dev.bpmellat.ir/pgwchannel/services/pgw",
} as const;

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
/**
 * Generic SOAP caller
 */
async function callSoap(
  method: string,
  body: string,
  isSandbox = false
): Promise<string> {
  const endpoint = isSandbox
    ? ENDPOINTS.sandbox
    : ENDPOINTS.production;

  const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://interfaces.core.sw.bps.com/">
      <soapenv:Header/>
      <soapenv:Body>
        <web:${method}>
          ${body}
        </web:${method}>
      </soapenv:Body>
    </soapenv:Envelope>
  `.trim();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "",
    },
    body: soapEnvelope,
    cache: "no-store",
  });

  const xml = await response.text();

  // Check for SOAP Fault
  if (xml.includes("<faultstring>")) {
    const faultMatch = xml.match(/<faultstring>(.*?)<\/faultstring>/i);
    const faultMessage = faultMatch?.[1] || "SOAP Fault";
    console.error("SOAP Fault:", faultMessage);
    console.log("xml", xml)
    return ""; // or throw
  }

  // ========== Better Parser ==========
  // Handles both <return> and <ns1:return> and other prefixes
  const match =
    xml.match(/<return[^>]*>(.*?)<\/return>/i) ||
    xml.match(/<[^:>]+:return[^>]*>(.*?)<\/[^:>]+:return>/i);

  const result = match?.[1]?.trim() ?? "";

  // Debug log (remove later)
  console.log("----- RAW SOAP RESPONSE -----");
  console.log(xml);
  console.log("----- EXTRACTED VALUE -----");
  console.log(result);

  return result;
}

/**
 * bpPayRequest
 */
export async function bpPayRequest(
  params: BpPayRequestParams
): Promise<BpResult> {
  console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥")
  console.log("bpPayRequest params", params);
  const {
    terminalId,
    userName,
    userPassword,
    orderId,
    amount,
    callBackUrl,
    additionalData = "",
    payerId = "0",
    isSandbox = false,
  } = params;

  const now = new Date();
  const localDate = now.toISOString().slice(0, 10).replace(/-/g, "");
  const localTime = now.toTimeString().slice(0, 8).replace(/:/g, "");

  const body = `
    <terminalId>${terminalId}</terminalId>
    <userName>${userName}</userName>
    <userPassword>${userPassword}</userPassword>
    <orderId>${orderId}</orderId>
    <amount>${amount}</amount>
    <localDate>${localDate}</localDate>
    <localTime>${localTime}</localTime>
    <additionalData>${escapeXml(additionalData)}</additionalData>
    <callBackUrl>${escapeXml(callBackUrl)}</callBackUrl>
    <payerId>${escapeXml(String(payerId))}</payerId>
  `;

  try {
    const raw = await callSoap("bpPayRequest", body, isSandbox);
    console.log("bpPayRequest", { raw, isSandbox })

    if (!raw) {
      return { success: false, resCode: "999", message: "Empty response" };
    }

    const [resCode, refId] = raw.split(",");

    if (resCode === "0" && refId) {
      return { success: true, resCode: "0", refId };
    }

    return {
      success: false,
      resCode: resCode || "999",
      message: getErrorMessage(resCode),
    };
  } catch (error: unknown) {
    console.error("bpPayRequest error:", error);
    return {
      success: false,
      resCode: "999",
      message: error instanceof Error ? error.message : "Connection error",
    };
  }
}

/**
 * bpVerifyRequest
 */
export async function bpVerifyRequest(
  params: BpVerifyOrSettleParams
): Promise<BpResult> {
  const {
    terminalId,
    userName,
    userPassword,
    orderId,
    saleOrderId,
    saleReferenceId,
    isSandbox = false,
  } = params;

  const body = `
    <terminalId>${terminalId}</terminalId>
    <userName>${userName}</userName>
    <userPassword>${userPassword}</userPassword>
    <orderId>${orderId}</orderId>
    <saleOrderId>${saleOrderId}</saleOrderId>
    <saleReferenceId>${saleReferenceId}</saleReferenceId>
  `;

  try {
    const resCode = await callSoap("bpVerifyRequest", body, isSandbox);

    if (resCode === "0") {
      return { success: true, resCode: "0" };
    }

    return {
      success: false,
      resCode: resCode || "999",
      message: getErrorMessage(resCode),
    };
  } catch (error: unknown) {
    console.error("bpVerifyRequest error:", error);
    return {
      success: false,
      resCode: "999",
      message: error instanceof Error ? error.message : "Connection error",
    };
  }
}

/**
 * bpSettleRequest
 */
export async function bpSettleRequest(
  params: BpVerifyOrSettleParams
): Promise<BpResult> {
  const {
    terminalId,
    userName,
    userPassword,
    orderId,
    saleOrderId,
    saleReferenceId,
    isSandbox = false,
  } = params;

  const body = `
    <terminalId>${terminalId}</terminalId>
    <userName>${userName}</userName>
    <userPassword>${userPassword}</userPassword>
    <orderId>${orderId}</orderId>
    <saleOrderId>${saleOrderId}</saleOrderId>
    <saleReferenceId>${saleReferenceId}</saleReferenceId>
  `;

  try {
    const resCode = await callSoap("bpSettleRequest", body, isSandbox);

    if (resCode === "0") {
      return { success: true, resCode: "0" };
    }

    return {
      success: false,
      resCode: resCode || "999",
      message: getErrorMessage(resCode),
    };
  } catch (error: unknown) {
    console.error("bpSettleRequest error:", error);
    return {
      success: false,
      resCode: "999",
      message:  error instanceof Error ? error.message : "Connection error",
    };
  }
}

/**
 * Common error messages (from official documentation)
 */
function getErrorMessage(resCode: string): string {
  const messages: Record<string, string> = {
    "11": "شماره کارت نامعتبر است",
    "12": "موجودی کافی نیست",
    "13": "رمز نادرست است",
    "14": "تعداد دفعات وارد کردن رمز بیش از حد مجاز است",
    "15": "کارت نامعتبر است",
    "16": "دفعات برداشت وجه بیش از حد مجاز است",
    "17": "کاربر از انجام تراکنش منصرف شده است",
    "18": "تاریخ انقضای کارت گذشته است",
    "19": "مبلغ برداشت وجه بیش از حد مجاز است",
    "21": "پذیرنده نامعتبر است",
    "23": "خطای امنیتی رخ داده است",
    "24": "اطلاعات کاربری پذیرنده نامعتبر است",
    "25": "مبلغ نامعتبر است",
    "31": "پاسخ نامعتبر است",
    "32": "فرمت اطلاعات وارد شده صحیح نمی‌باشد",
    "33": "حساب نامعتبر است",
    "34": "خطای سیستمی",
    "35": "تاریخ نامعتبر است",
    "41": "شماره درخواست تکراری است",
    "42": "تراکنش Sale یافت نشد",
    "43": "قبلاً درخواست Verify داده شده است",
    "44": "درخواست Verify یافت نشد",
    "45": "تراکنش Settle شده است",
    "46": "تراکنش Settle نشده است",
    "47": "تراکنش Settle یافت نشد",
    "48": "تراکنش Reverse شده است",
    "49": "تراکنش Refund یافت نشد",
    "51": "تراکنش تکراری است",
    "54": "تراکنش مرجع موجود نیست",
    "55": "تراکنش نامعتبر است",
    "61": "خطا در واریز",
    "62": "مسیر بازگشت به سایت در دامنه ثبت شده نمی‌باشد",
    "98": "سقف استفاده از رمز دوم اتمام یافته است",
    "20": "عدم ارسال پارامترهای احراز هویت مشتری توسط پذیرنده",
  };

  return messages[resCode] || `خطای ناشناخته (کد: ${resCode})`;
}
