import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import { siteConfig } from "@/lib/config";
import "./globals.css";
import { IRANSans } from "@/styles/font";
import { AuthProvider } from "@/components/auth/auth-provider";
import { tryGetCurrentCustomer } from "@/lib/medusa/auth-server";
import { Suspense } from "react";
import CartMismatchBanner from "@/components/layout/cart-mismatch-banner";
import { retrieveCart } from "@/lib/medusa/cart-server";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: {
//     default: `${siteConfig.name} — ${siteConfig.tagline}`,
//     template: `%s | ${siteConfig.name}`,
//   },
//   description: siteConfig.description,
//   metadataBase: new URL(siteConfig.url),
//   openGraph: {
//     type: "website",
//     siteName: siteConfig.name,
//     locale: siteConfig.locale.replace("-", "_"),
//   },
// };

export async function Providers({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const customer = await tryGetCurrentCustomer();
  const cart = await retrieveCart();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider customer={customer}>
        {customer && cart && (
          <CartMismatchBanner customer={customer} cart={cart} />
        )}
        {children}
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = "fa";
  return (
    <html
      lang={locale}
      className={`${locale === "fa" ? IRANSans.variable : inter.variable} h-full antialiased`}
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>

        <Toaster />
      </body>
    </html>
  );
}
