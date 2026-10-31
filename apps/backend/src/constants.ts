export const SUPER_ADMIN_STORE_NAME = "SUPER ADMIN STORE";

export type ProviderConfig = {
  name: string;
  logo: string;
  fields: string[];
  placeholders?: Record<string, string>;
};

export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  pp_behpardakht_behpardakht: {
    name: "به پرداخت",
    logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/payment-methods/paypal.svg",
    fields: ["terminalId", "username", "password", "wsdlUrl", "gatewayUrl"],
    placeholders: {
      terminalId: "ترمینال آیدی",
      username: "نام کاربری",
      password: "رمز عبور",
      wsdlUrl: "آدرس WSDL",
      gatewayUrl: "آدرس Gateway",
    },
  },
  pp_zarinpal: {
    name: "زرین پال",
    logo: "https://www.zarinpal.com/favicon.ico",
    fields: ["merchantId"],
    placeholders: { merchantId: "مرچنت آیدی" },
  },
  pp_saman: {
    name: "سامان",
    logo: "https://www.sep.ir/favicon.ico",
    fields: ["terminalId", "password"],
    placeholders: { terminalId: "ترمینال آیدی", password: "رمز عبور" },
  },
  pp_parsian: {
    name: "پارسیان",
    logo: "https://www.pec.ir/favicon.ico",
    fields: ["terminalId", "username", "password"],
    placeholders: {
      terminalId: "ترمینال آیدی",
      username: "نام کاربری",
      password: "رمز عبور",
    },
  },
  pp_nextpay: {
    name: "نکست پی",
    logo: "https://nextpay.ir/favicon.ico",
    fields: ["apiKey"],
    placeholders: { apiKey: "کلید API" },
  },
};
