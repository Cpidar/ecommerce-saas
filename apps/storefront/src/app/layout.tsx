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

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale.replace("-", "_"),
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.url}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

async function Providers({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const customer = await tryGetCurrentCustomer();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider customer={customer}>{children}</AuthProvider>
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
          }}
        />
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>

        <Toaster />
      </body>
    </html>
  );
}
