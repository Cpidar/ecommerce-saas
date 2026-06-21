import React from "react"
import { CreditCard } from "lucide-react"

export const BASE_URL = ''

export const PLACEHOLDER_IMAGE = "/images/products/placeholder.svg"

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe: {
    title: "Credit card",
    icon: <CreditCard />,
  },
  pp_system_default: {
    title: "Manual Payment",
    icon: <CreditCard />,
  },
  behpardakht: {
    title: "به پرداخت ملت",
    icon: <CreditCard />,
  },
  // Add more payment providers here
}

// This only checks if it is native stripe for card payments, it ignores the other stripe-based providers
export const isStripe = (providerId?: string) => {
  return providerId?.startsWith("pp_stripe_")
}
export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}
export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}

export const isBehpardakht = (providerId?: string) => {
  return providerId === "behpardakht"
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]

export const HIDDEN_PRODUCT_TAG = 'nextjs-frontend-hidden';

export const BehpardakhtErrors: Record<string, string> = {
  '11': 'است نامعتبر كارت شماره',
  '12': 'نيست كافي موجودي',
  '13': 'است نادرست رمز',
  '14': 'است مجاز حد از بيش رمز كردن وارد دفعات تعداد',
  '15': 'است نامعتبر كارت',
  '16': 'است مجاز حد از بيش وجه برداشت دفعات',
  '17': 'است شده منصرف تراكنش انجام از كاربر',
  '18': 'است گذشته كارت انقضاي تاريخ',
  '19': 'است مجاز حد از بيش وجه برداشت مبلغ',
  '111': 'است نامعتبر كارت كننده صادر',
  '112': 'كارت كننده صادر سوييچ خطاي',
  '113': 'نشد دريافت كارت كننده صادر از پاسخي',
  '114': 'نيست تراكنش اين انجام به مجاز كارت دارنده',
  '21': 'است نامعتبر پذيرنده',
  '23': 'است داده رخ امنيتي خطاي',
  '24': 'است نامعتبر پذيرنده كاربري اطلاعات',
  '25': 'است نامعتبر مبلغ',
  '31': 'است نامعتبر پاسخ',
  '32': 'باشد نمي صحيح شده وارد اطلاعات فرمت',
  '33': 'است نامعتبر حساب',
  '34': 'سيستمي خطاي',
  '35': 'است نامعتبر تاريخ',
  '41': 'است تكراري درخواست شماره',
  '42': 'نشد يافت Sale تراكنش',
  '43': 'است شده داده Verify درخواست قبلا',
  '44': 'نشد يافت Verfiy درخواست',
  '45': 'است شده Settle تراكنش',
  '46': 'است نشده Settle تراكنش',
  '47': 'نشد يافت Settle تراكنش',
  '48': 'است شده Reverse تراكنش',
  '49': 'نشد يافت Refund تراكنش',
  '412': 'است نادرست قبض شناسه',
  '413': 'است نادرست پرداخت شناسه',
  '414': 'است نامعتبر قبض كننده صادر سازمان',
  '415': 'است رسيده پايان به كاري جلسه زمان',
  '416': 'اطلاعات ثبت در خطا',
  '417': 'است نامعتبر كننده پرداخت شناسه',
  '418': 'مشتري اطلاعات تعريف در اشكال',
  '419': 'است گذشته مجاز حد از اطلاعات ورود دفعات تعداد',
  '421': 'است نامعتبر IP',
  '51': 'است تكراري تراكنش',
  '54': 'نيست موجود مرجع تراكنش',
  '55': 'است نامعتبر تراكنش',
  '61': 'واريز در خطا',
};

