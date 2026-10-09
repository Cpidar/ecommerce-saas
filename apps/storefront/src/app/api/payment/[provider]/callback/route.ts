import { bpVerifyRequest } from "@/lib/checkout/behpardakht";
import { BehpardakhtErrors } from "@/lib/constants";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

type Provider = "sandbox" | "behpardakht";

type BpCallbackFields = {
  RefId?: string;
  ResCode?: string;
  SaleOrderId?: string;
  SaleReferenceId?: string;
  FinalAmount?: string;
  CardHolderPan?: string;
  CardHolderInfo?: string;
  additionalData?: string;
  payerId?: string;
};

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.includes("NEXT_REDIRECT")
  );
}

function parseFormBody(body: string): BpCallbackFields {
  const params = new URLSearchParams(body);
  return Object.fromEntries(params.entries()) as BpCallbackFields;
}

function buildRedirectUrl(
  baseUrl: string,
  path: string | null,
  query: Record<string, string>,
): string {
  const cleanPath = (path || "checkout/failed").replace(/^\//, "");
  const url = new URL(`${baseUrl}/${cleanPath}`);

  Object.entries(query).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  return url.toString();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const searchParams = request.nextUrl.searchParams;

  const successUrl = searchParams.get("successUrl") || "checkout/success";
  const failUrl = searchParams.get("failUrl") || "checkout/failed";
  const cartId = searchParams.get("cartId") || "";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

  try {
    switch (provider as Provider) {
      case "sandbox":
      case "behpardakht": {
        const result = await processBehpardakhtCallback(request, {
          isSandbox: provider === "sandbox",
          cartId,
        });

        if (!result.success) {
          redirect(
            buildRedirectUrl(baseUrl, failUrl, {
              errorMessage: result.error,
              cartId,
            }),
          );
        }

        redirect(
          buildRedirectUrl(baseUrl, successUrl, {
            saleReferenceId: result.saleReferenceId,
            cartId,
          }),
        );
      }

      default:
        redirect(
          buildRedirectUrl(baseUrl, failUrl, {
            errorMessage: "درگاه پرداخت نامعتبر است",
          }),
        );
    }
  } catch (error) {
    // Let Next.js handle redirects
    if (isNextRedirect(error)) throw error;

    console.error("Payment callback unexpected error:", error);

    redirect(
      buildRedirectUrl(baseUrl, failUrl, {
        errorMessage: "مشکلی در پرداخت شما بوجود آمده است",
        cartId,
      }),
    );
  }
}

type ProcessResult =
  | { success: true; saleReferenceId: string; saleOrderId: string }
  | { success: false; error: string; resCode?: string };

async function processBehpardakhtCallback(
  request: NextRequest,
  options: { isSandbox: boolean; cartId: string },
): Promise<ProcessResult> {
  const bodyText = await request.text();
  const fields = parseFormBody(bodyText);

  const { RefId, ResCode, SaleOrderId, SaleReferenceId, FinalAmount } = fields;

  console.log("Behpardakht callback fields:", {
    RefId,
    ResCode,
    SaleOrderId,
    SaleReferenceId,
    FinalAmount,
    cartId: options.cartId,
  });

  // Required fields from documentation
  if (!RefId || !ResCode || !SaleOrderId || !SaleReferenceId) {
    return {
      success: false,
      error: "پارامترهای بازگشتی ناقص است",
    };
  }

  // ResCode rules from docs:
  // 0  = successful sale on bank page → must Verify
  // 43 = already verified (can treat as success in some flows)
  if (ResCode !== "0" && ResCode !== "43") {
    const message =
      BehpardakhtErrors[ResCode] || `خطای پرداخت (کد: ${ResCode})`;

    return {
      success: false,
      error: message,
      resCode: ResCode,
    };
  }

  // If already verified, skip verify call
  if (ResCode === "43") {
    return {
      success: true,
      saleReferenceId: SaleReferenceId,
      saleOrderId: SaleOrderId,
    };
  }
  let verify: Awaited<ReturnType<typeof bpVerifyRequest>>;
  if (options.isSandbox) {
    verify = await fetch(`http://localhost:3000/api/behpardakht/verify`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        RefId,
        // saleOrderId,
        // saleReferenceId,
      }),
    }).then((res) => res.json());
  } else {
    // Call real bpVerifyRequest (not mock)
    verify = await bpVerifyRequest({
      terminalId: process.env.BEHPARDAKHT_TERMINAL_ID!,
      userName: process.env.BEHPARDAKHT_USERNAME!,
      userPassword: process.env.BEHPARDAKHT_PASSWORD!,
      orderId: SaleOrderId, // can be same as saleOrderId
      saleOrderId: SaleOrderId,
      saleReferenceId: SaleReferenceId,
      // isSandbox: options.isSandbox,
    });
  }

  if (!verify.success) {
    return {
      success: false,
      error: verify.message,
      resCode: verify.resCode,
    };
  }

  // Optional: settle (if you handle settle yourself)
  // Many merchants let Behpardakht auto-settle; enable only if needed.
  /*
  const settle = await bpSettleRequest({
    terminalId: process.env.BEHPARDAKHT_TERMINAL_ID!,
    userName: process.env.BEHPARDAKHT_USERNAME!,
    userPassword: process.env.BEHPARDAKHT_PASSWORD!,
    orderId: SaleOrderId,
    saleOrderId: SaleOrderId,
    saleReferenceId: SaleReferenceId,
    isSandbox: options.isSandbox,
  });

  if (!settle.success) {
    return {
      success: false,
      error: settle.message,
      resCode: settle.resCode,
    };
  }
  */

  return {
    success: true,
    saleReferenceId: SaleReferenceId,
    saleOrderId: SaleOrderId,
  };
}
