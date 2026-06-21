import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/medusa"
import { Modules } from "@medusajs/framework/utils"

export default async function sendOtpHandler({
  event: { data: {
    phone,
    otp,
  } },
  container,
}: SubscriberArgs<{ phone: string, otp: string }>) {
  const notificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )

  await notificationModuleService.createNotifications({
    to: phone,
    channel: "feed",
    template: "otp-template",
    data: {
      otp,
      // code: res.code
    },
  })
}

export const config: SubscriberConfig = {
  event: "phone-auth.otp.generated",
}
