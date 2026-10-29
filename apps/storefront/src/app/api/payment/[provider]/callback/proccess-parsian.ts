import { pecConfirmPayment } from "@/lib/checkout/parsian";
import { NextRequest } from "next/server";

type ProcessResult =
  | {
      success: true;
      token: string;
      rrn: string;
      orderId: string;
      amount: string;
    }
  | {
      success: false;
      error: string;
      status?: string;
  };

export async function processPasargadCallback(
  request: NextRequest,
): Promise<ProcessResult> {
  const bodyText = await request.text();
  const fields = Object.fromEntries(new URLSearchParams(bodyText).entries());

  // Fields returned by Pasargad (from your PHP sample)
  const token = fields.Token ?? "";
  const status = fields.status ?? fields.Status ?? "";
  const orderId = fields.OrderId ?? "";
  const rrn = fields.RRN ?? "";
  const amount = fields.Amount ?? "";
  const terminalNo = fields.TerminalNo ?? "";

  console.log("Pasargad callback fields:", {
    token,
    status,
    orderId,
    rrn,
    amount,
    terminalNo,
  });

  // Bank page failed / user canceled
  if (status !== "0" || !token) {
    return {
      success: false,
      error:
        status && status !== "0"
          ? `پرداخت ناموفق (کد: ${status})`
          : "پاسخی معتبر از درگاه دریافت نشد",
      status,
    };
  }

  // RRN must be > 0 on success (same rule as PHP sample)
  if (!rrn || Number(rrn) <= 0) {
    return {
      success: false,
      error: "شماره پیگیری معتبر نیست",
      status,
    };
  }

  // Confirm is required (same as confirmServices in PHP)
  const confirm = await pecConfirmPayment({
    pin: process.env.PASARGAD_PIN!,
    token,
  });

  if (!confirm.success) {
    return {
      success: false,
      error: confirm.message,
      status: String(confirm.status),
    };
  }

  // Optional: update order in DB here (paid, store token + rrn)

  return {
    success: true,
    token,
    rrn,
    orderId,
    amount,
  };
}
