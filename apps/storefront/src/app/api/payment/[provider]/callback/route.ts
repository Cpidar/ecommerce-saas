import { BehpardakhtErrors } from "@/lib/constants";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const { provider } = await params;
    console.log(provider)
    const searchParams = request.nextUrl.searchParams
    const successUrl = searchParams.get('successUrl')
    const failUrl = searchParams.get('failUrl')

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

    switch (provider) {
        case "sandbox":
            const { searchParams } = new URL(request.url);
            const cartId = searchParams.get("cartId");

            if (!cartId) {
                throw new Error("cartId is missing in callback URL");
            }

            const resText = await request.text()
            // sample response: "RefId=923C8C729C825473&ResCode=0&SaleOrderId=1726894760637&SaleReferenceId=285303460370&CardHolderInfo=4C4098D60630906B77453B7F681F58F107A675EC339A5DE5E465D1AE2C4FB46A&CardHolderPan=610433******5978&FinalAmount=68000"

            // Parse the query-string style data
            const params = new URLSearchParams(resText);

            const { RefId, ResCode, SaleOrderId, SaleReferenceId, FinalAmount } = Object.fromEntries(params);

            console.log({ RefId, ResCode, SaleOrderId, SaleReferenceId, FinalAmount })

            if (ResCode && (["0", "43"].indexOf(ResCode) === -1)) {
                console.log(ResCode, BehpardakhtErrors[ResCode])
                throw new Error("Payment ResCode error")
            }

            try {

                const res = await fetch(`http://localhost:3000/api/behpardakht/verify`, {
                    method: "post",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        RefId,
                        // saleOrderId,
                        // saleReferenceId,
                    }),
                })

                // for testing purposes, you can use the following code to simulate response timeout and success response
                // const res = (await PromiseWithTimeout(
                //   10000,
                //   new Promise<any>((res) =>
                //     setTimeout(
                //       () => res({ status: 200, resCode: 0, errorMessage: "" }),
                //       1000
                //     )
                //   )
                // )) as Response

                const data = await res.json();

                if (!res.ok || data.ResCode !== "0") {
                    const errorMessage = data.ResDesc || "مشکلی در پرداخت شما بوجود آمده است";

                    // ✅ FIXED: Properly encode Persian text
                    const encodedError = encodeURIComponent(errorMessage);

                    redirect(`${baseUrl}/${failUrl}?errorMessage=${encodedError}`);
                }

                redirect(
                    `${baseUrl}/${successUrl}?saleReferenceId=${encodeURIComponent(SaleReferenceId)}&cartId=${encodeURIComponent(cartId)}`
                );

            } catch (e) {
                // Only catch real errors, ignore NEXT_REDIRECT
                // `e` is unknown here; narrow its type before accessing properties
                if (
                    typeof e === "object" &&
                    e !== null &&
                    "digest" in e &&
                    typeof (e as any).digest === "string" &&
                    (e as any).digest.includes("NEXT_REDIRECT")
                ) {
                    throw e as any; // Let Next.js handle the redirect
                }

                console.error("Payment callback error:", e);

                const encodedError = encodeURIComponent("مشکلی در پرداخت شما بوجود آمده است");
                redirect(`$/checkout/failed?errorMessage=${encodedError}`);
            }
        case "behpardakht":
            // statement 2
            break;
        default:
            // 
            break;
    }
}