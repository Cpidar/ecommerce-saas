import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { CheckoutClient } from "./client"

export default async function CheckoutPage() {
  const cookieStore = await cookies()
  const subscriptionId = cookieStore.get("_medusa_subscription_id")?.value

  if (subscriptionId) {
    redirect("/onboarding/initialize-store")
  }

  return <CheckoutClient />
}