type BaseCredentials = {
  pin: string; // LoginAccount
  isSandbox?: boolean; // Pasargad usually has one live endpoint; keep for future
};

type SaleRequestParams = BaseCredentials & {
  orderId: string | number;
  amount: number; // Rials
  callBackUrl: string;
  additionalData?: string;
  originator?: string;
};

type TokenParams = BaseCredentials & {
  token: string;
};

type PecResult =
  | { success: true; token?: string; status: 0 }
  | { success: false; status: number | string; message: string };

const ENDPOINTS = {
  sale: "https://pec.shaparak.ir/NewIPGServices/Sale/SaleService.asmx",
  confirm: "https://pec.shaparak.ir/NewIPGServices/Confirm/ConfirmService.asmx",
  reverse: "https://pec.shaparak.ir/NewIPGServices/Reverse/ReversalService.asmx",
  paymentPage: "https://pec.shaparak.ir/NewIPG/",
} as const;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function callSoap(
  endpoint: string,
  soapAction: string,
  bodyXml: string,
): Promise<string> {
  const envelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    ${bodyXml}
  </soap:Body>
</soap:Envelope>`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: soapAction,
    },
    body: envelope,
    cache: "no-store",
  });

  return response.text();
}

function extractTag(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(re);
  return match?.[1]?.trim() ?? null;
}

/**
 * SalePaymentRequest → get Token and redirect URL
 */
export async function pecSaleRequest(
  params: SaleRequestParams,
): Promise<
  | { success: true; token: string; url: string; method: "GET" }
  | { success: false; status: string; message: string }
> {
  const {
    pin,
    orderId,
    amount,
    callBackUrl,
    additionalData = "",
    originator = "",
  } = params;

  const bodyXml = `
    <SalePaymentRequest xmlns="https://pec.Shaparak.ir/NewIPGServices/Sale/SaleService">
      <requestData>
        <LoginAccount>${escapeXml(pin)}</LoginAccount>
        <Amount>${Number(amount)}</Amount>
        <OrderId>${escapeXml(String(orderId))}</OrderId>
        <CallBackUrl>${escapeXml(callBackUrl)}</CallBackUrl>
        <AdditionalData>${escapeXml(additionalData)}</AdditionalData>
        <Originator>${escapeXml(originator)}</Originator>
      </requestData>
    </SalePaymentRequest>
  `;

  try {
    const xml = await callSoap(
      ENDPOINTS.sale,
      "https://pec.Shaparak.ir/NewIPGServices/Sale/SaleService/SalePaymentRequest",
      bodyXml,
    );

    if (xml.includes("<faultstring>")) {
      const fault = extractTag(xml, "faultstring") || "SOAP Fault";
      return { success: false, status: "999", message: fault };
    }

    const status = extractTag(xml, "Status");
    const token = extractTag(xml, "Token");
    const message = extractTag(xml, "Message") || "";

    if (status === "0" && token) {
      return {
        success: true,
        token,
        url: `${ENDPOINTS.paymentPage}?Token=${encodeURIComponent(token)}`,
        method: "GET",
      };
    }

    return {
      success: false,
      status: status || "999",
      message: message || `خطای پارسیان (کد: ${status})`,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Connection error";
    return { success: false, status: "999", message: msg };
  }
}

/**
 * ConfirmPayment (after successful callback)
 */
export async function pecConfirmPayment(
  params: TokenParams,
): Promise<PecResult> {
  const { pin, token } = params;

  const bodyXml = `
    <ConfirmPayment xmlns="https://pec.Shaparak.ir/NewIPGServices/Confirm/ConfirmService">
      <requestData>
        <LoginAccount>${escapeXml(pin)}</LoginAccount>
        <Token>${escapeXml(token)}</Token>
      </requestData>
    </ConfirmPayment>
  `;

  try {
    const xml = await callSoap(
      ENDPOINTS.confirm,
      "https://pec.Shaparak.ir/NewIPGServices/Confirm/ConfirmService/ConfirmPayment",
      bodyXml,
    );

    if (xml.includes("<faultstring>")) {
      const fault = extractTag(xml, "faultstring") || "SOAP Fault";
      return { success: false, status: "999", message: fault };
    }

    const status = extractTag(xml, "Status");

    if (status === "0") {
      return { success: true, status: 0 };
    }

    return {
      success: false,
      status: status || "999",
      message: `تایید ناموفق (کد: ${status})`,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Connection error";
    return { success: false, status: "999", message: msg };
  }
}

/**
 * ReversalRequest (optional)
 */
export async function pecReversalRequest(
  params: TokenParams,
): Promise<PecResult> {
  const { pin, token } = params;

  const bodyXml = `
    <ReversalRequest xmlns="https://pec.Shaparak.ir/NewIPGServices/Reverse/ReversalService">
      <requestData>
        <LoginAccount>${escapeXml(pin)}</LoginAccount>
        <Token>${escapeXml(token)}</Token>
      </requestData>
    </ReversalRequest>
  `;

  try {
    const xml = await callSoap(
      ENDPOINTS.reverse,
      "https://pec.Shaparak.ir/NewIPGServices/Reverse/ReversalService/ReversalRequest",
      bodyXml,
    );

    if (xml.includes("<faultstring>")) {
      const fault = extractTag(xml, "faultstring") || "SOAP Fault";
      return { success: false, status: "999", message: fault };
    }

    const status = extractTag(xml, "Status");
    const message = extractTag(xml, "Message") || "";

    if (status === "0") {
      return { success: true, status: 0 };
    }

    return {
      success: false,
      status: status || "999",
      message: message || `برگشت ناموفق (کد: ${status})`,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Connection error";
    return { success: false, status: "999", message: msg };
  }
}
