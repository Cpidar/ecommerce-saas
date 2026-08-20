import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { BackToTop } from "@/components/layout/back-to-top";
import { categoryRepository } from "@/lib/repositories";
import { Suspense } from "react";
import {
  siteConfigRepository,
  StoreConfigInput,
} from "@/lib/repositories/site-configs";
import { siteConfig as defaultConfig } from "@/lib/config";
import { Providers } from "../layout";
import { Metadata } from "next";
import { connection } from "next/server";

export async function generateMetadata(): Promise<Metadata> {
  const coreData = await siteConfigRepository.getCoreConfig();
  const seoData = await siteConfigRepository.getSeoConfig();

  // Fallbacks
  const coreTitle = coreData?.title ?? "خانه";
  const coreTagline = coreData?.tagline ?? "";
  const coreDescription = (coreData?.description as string) ?? "";

  const title = (seoData?.default_title as string | undefined) ?? coreTitle;
  const description =
    (seoData?.default_description as string | undefined) ?? coreDescription;

  // Title template: replace %s with the page title if present
  const titleTemplate = seoData?.title_template as string | undefined;
  const composedTitle = `${title} — ${coreTagline}`;

  return {
    title: {
      default: composedTitle,
      template: titleTemplate ?? `%s | ${composedTitle}`,
    },
    description,
    alternates: {
      canonical: seoData?.canonical_url
        ? `${seoData.canonical_url}/home`
        : `${coreData?.domain}/home`,
    },
    robots: {
      index: (seoData?.robots as any)?.index ?? true,
      follow: (seoData?.robots as any)?.follow ?? true,
      ...((seoData?.robots as any)?.noimageindex !== undefined && {
        noimageindex: (seoData?.robots as any).noimageindex,
      }),
    },
    openGraph: {
      ...(seoData?.default_image_url
        ? { images: seoData.default_image_url }
        : {}),
      ...((seoData?.open_graph as any)?.site_name && {
        siteName: (seoData?.open_graph as any).site_name,
      }),
      ...((seoData?.open_graph as any)?.type && {
        type: (seoData?.open_graph as any).type,
      }),
      ...((seoData?.open_graph as any)?.image_url && {
        images: (seoData?.open_graph as any).image_url,
      }),
    },
    twitter: {
      ...((seoData?.twitter as any)?.card && {
        card: (seoData?.twitter as any).card,
      }),
      ...((seoData?.twitter as any)?.site && {
        site: (seoData?.twitter as any).site,
      }),
    },
  };
}

async function DynamicMarker() {
  await connection();
  return null;
}

// export async function generateMetadata(): Promise<Metadata> {
//   return {
//     title: "خانه",
//     description: "صفحه اصلی فروشگاه",
//   };
// }
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

async function HeaderProvider() {
  const categories = await categoryRepository.list();
  let siteConfig = await siteConfigRepository.getCoreConfig();
  if (!siteConfig) {
    siteConfig = defaultConfig as unknown as StoreConfigInput;
  }
  return <Header categories={categories} siteConfig={siteConfig} />;
}

async function FooterProvider() {
  let siteConfig = await siteConfigRepository.getCoreConfig();

  if (!siteConfig) {
    siteConfig = defaultConfig as unknown as StoreConfigInput;
  }
  return <Footer siteConfig={siteConfig} />;
}

async function AnnouncementBarProvider() {
  const siteConfig = await siteConfigRepository.getGeneralConfig();
  const announcement = (await siteConfig?.announcement_bar) as any;
  return <AnnouncementBar announcement={announcement} />;
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <JsonLdProvider />
      </Suspense>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <Suspense fallback={<HeaderSkeleton />}>
        <AnnouncementBarProvider />
      </Suspense>
      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderProvider />
      </Suspense>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Suspense fallback={<HeaderSkeleton />}>
        <FooterProvider />
      </Suspense>
      <CartDrawer />
      <BackToTop />
      <Suspense>
        <DynamicMarker />
      </Suspense>
    </>
  );
}

function HeaderSkeleton() {
  return <div className="h-16 bg-muted animate-pulse" />; // or your actual header skeleton
}
