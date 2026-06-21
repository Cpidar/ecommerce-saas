import { BehpardakhtErrors } from "@/lib/constants"
import { redirect } from "next/navigation"

export async function POST(request: Request) {
  const resText = await request.text()
  // sample response: "RefId=923C8C729C825473&ResCode=0&SaleOrderId=1726894760637&SaleReferenceId=285303460370&CardHolderInfo=4C4098D60630906B77453B7F681F58F107A675EC339A5DE5E465D1AE2C4FB46A&CardHolderPan=610433******5978&FinalAmount=68000"

  const formData = await request.formData()

  // Access params directly
  const refId = formData.get('RefId')?.toString()
  const resCode = formData.get('ResCode')?.toString()
  const saleOrderId = formData.get('SaleOrderId')?.toString()
  const saleReferenceId = formData.get('SaleReferenceId')?.toString()
  const cardHolderInfo = formData.get('CardHolderInfo')?.toString()
  const cardHolderPan = formData.get('CardHolderPan')?.toString()
  const finalAmount = formData.get('FinalAmount')?.toString()

  console.log({ refId, resCode, saleOrderId, saleReferenceId, finalAmount })

  if (resCode && (["0", "43"].indexOf(resCode) === -1)) {
    console.log(resCode, BehpardakhtErrors[resCode])
    throw new Error("Payment ResCode error")
  }
  // Build query string from formData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryString = new URLSearchParams(formData as any).toString()

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

    const res = await fetch(`${baseUrl}/api/behpardakht/verify`, {
      method: "POST",
      body: JSON.stringify({
        refId,
        saleOrderId,
        saleReferenceId,
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

    const { errorMessage } = await res.json();

    if (res.status === 400) {
      redirect(`checkout/failed?errorMessage=${errorMessage}`)
    }
    // TODO: create loading ui when verifying payment and then redirecting to success page
    // for this purpose must create a page and transfer verifying state to that page and then redirect to success page after showing loading ui for few seconds
    redirect(`/checkout/success?saleReferenceId=${saleReferenceId}`)
  } catch (e) {
    console.error(e);
    redirect(`checkout/failed?errorMessage=${"مشکلی در پرداخت شما بوجود آمده است"}`)
  }

  // console.log(resText)
  // redirect(`/behpardakht/confirmation?${queryString}`)
}
