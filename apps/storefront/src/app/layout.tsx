
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import "./globals.css";
import { IRANSans } from "@/styles/font";
import { AuthProvider } from "@/components/auth/auth-provider";
import { tryGetCurrentCustomer } from "@/lib/medusa/auth-server";
import { Suspense } from "react";
import CartMismatchBanner from "@/components/layout/cart-mismatch-banner";
import { retrieveCart } from "@/lib/medusa/cart-server";
import { siteConfigRepository } from "@/lib/repositories/site-configs";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// export async function generateMetadata(): Promise<Metadata> {
//   const coreData = await siteConfigRepository.getCoreConfig();
//   // Fallbacks
//   const coreTitle = coreData?.title ?? "خانه";
//   const coreTagline = coreData?.tagline ?? "";
//   const coreDescription = (coreData?.description as string) ?? "";

//   const title =
//     (coreData?.seo_config?.default_title as string | undefined) ?? coreTitle;
//   const description =
//     (coreData?.seo_config?.default_description as string | undefined) ??
//     coreDescription;

//   // Title template: replace %s with the page title if present
//   const titleTemplate = coreData?.seo_config?.title_template as
//     | string
//     | undefined;
//   const composedTitle = `${title} — ${coreTagline}`;

//   return {
//     title: {
//       default: composedTitle,
//       template: titleTemplate ?? `%s | ${composedTitle}`,
//     },
//     description,
//     other: {
//       enamad: coreData?.seo_config?.enamad as string,
//     },
//     alternates: {
//       canonical: coreData?.seo_config?.canonical_url
//         ? `${coreData?.seo_config.canonical_url}/home`
//         : `${coreData?.domain}/home`,
//     },
//     robots: {
//       index: (coreData?.seo_config?.robots as any)?.index ?? true,
//       follow: (coreData?.seo_config?.robots as any)?.follow ?? true,
//       ...((coreData?.seo_config?.robots as any)?.noimageindex !== undefined && {
//         noimageindex: (coreData?.seo_config?.robots as any).noimageindex,
//       }),
//     },
//     openGraph: {
//       ...(coreData?.seo_config?.default_image_url
//         ? { images: coreData?.seo_config.default_image_url }
//         : {}),
//       ...((coreData?.seo_config?.open_graph as any)?.site_name && {
//         siteName: (coreData?.seo_config?.open_graph as any).site_name,
//       }),
//       ...((coreData?.seo_config?.open_graph as any)?.type && {
//         type: (coreData?.seo_config?.open_graph as any).type,
//       }),
//       ...((coreData?.seo_config?.open_graph as any)?.image_url && {
//         images: (coreData?.seo_config?.open_graph as any).image_url,
//       }),
//     },
//     twitter: {
//       ...((coreData?.seo_config?.twitter as any)?.card && {
//         card: (coreData?.seo_config?.twitter as any).card,
//       }),
//       ...((coreData?.seo_config?.twitter as any)?.site && {
//         site: (coreData?.seo_config?.twitter as any).site,
//       }),
//     },
//   };
// }

// async function DynamicMarker() {
//   await connection();
//   return null;
// }

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "خانه",
    description: "صفحه اصلی فروشگاه",
    other: {
      enamad: process.env.ENAMAD_CODE as string,
    },
  };
}

export async function DynamicSeoTags() {
  const coreData = await siteConfigRepository.getCoreConfig();

  const coreTitle = coreData?.title ?? "خانه";
  const coreTagline = coreData?.tagline ?? "";
  const description =
    (coreData?.seo_config?.default_description as string | undefined) ??
    (coreData?.description as string) ??
    "";
  const title =
    (coreData?.seo_config?.default_title as string | undefined) ?? coreTitle;
  const composedTitle = `${title} — ${coreTagline}`;

  const canonical = coreData?.seo_config?.canonical_url
    ? `${coreData.seo_config.canonical_url}/home`
    : `${coreData?.domain}/home`;

  const og = coreData?.seo_config?.open_graph as any;
  const twitter = coreData?.seo_config?.twitter as any;
  const robots = coreData?.seo_config?.robots as any;
  const ogImage = og?.image_url ?? coreData?.seo_config?.default_image_url;

  return (
    <>
      <title>{composedTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content={`${(robots?.index ?? true) ? "index" : "noindex"},${
          (robots?.follow ?? true) ? "follow" : "nofollow"
        }`}
      />
      {og?.site_name && <meta property="og:site_name" content={og.site_name} />}
      {og?.type && <meta property="og:type" content={og.type} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {twitter?.card && <meta name="twitter:card" content={twitter.card} />}
      {twitter?.site && <meta name="twitter:site" content={twitter.site} />}
      {coreData?.seo_config?.enamad && (
        <meta name="enamad" content={coreData.seo_config.enamad as string} />
      )}
    </>
  );
}

async function JsonLdProvider() {
  const coreData = await siteConfigRepository.getCoreConfig();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: coreData?.title,
    url: coreData?.domain,
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: coreData?.title,
    url: coreData?.domain,
    potentialAction: {
      "@type": "SearchAction",
      target: `${coreData?.domain}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
      }}
    />
  );
}

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
          <DynamicSeoTags />
        </Suspense>
        <Suspense fallback={null}>
          <JsonLdProvider />
        </Suspense>
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>

        <Toaster />
      </body>
    </html>
  );
}
