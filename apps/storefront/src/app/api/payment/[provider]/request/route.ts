import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  let referenceId = ''

  switch (provider) {
    case "sandbox":
      const { RefId } = await fetch("http://localhost:3000/api/behpardakht/request", {
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
      }).then(res => res.json())

      referenceId = RefId
      break;
    case "behpardakht":
      // statement 2
      break;
    default:
      // 
      break;
  }


  return NextResponse.json({ status: "ok", referenceId });
}
