import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { BackToTop } from "@/components/layout/back-to-top";
import { categoryRepository } from "@/lib/repositories";
import { Suspense } from "react";
import { siteConfigRepository, StoreConfigInput } from "@/lib/repositories/site-configs";
import { siteConfig as defaultConfig } from "@/lib/config";

async function HeaderProvider() {
  const categories = await categoryRepository.list();
  const coreConfig = await siteConfigRepository.getCoreConfig();
  const logo = await coreConfig?.logo_url;
  return <Header categories={categories} logoUrl={logo} />;
}

async function FooterProvider() {
  let siteConfig = await siteConfigRepository.getCoreConfig();
  console.log(siteConfig)
  if (!siteConfig) {
    siteConfig = defaultConfig as unknown as StoreConfigInput ;
  }
  return <Footer siteConfig={siteConfig} />;
}

async function AnnouncementBarProvider() {
  const siteConfig = await siteConfigRepository.getGeneralConfig();
  const announcement = await siteConfig?.announcement as string;
  return <AnnouncementBar  announcement={announcement} />;
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <Suspense fallback={<HeaderSkeleton />}>
        <AnnouncementBarProvider />
      </Suspense>
      {/* Wrap the dynamic part */}
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
    </>
  );
}

// Simple skeleton (optional but recommended)
function HeaderSkeleton() {
  return <div className="h-16 bg-muted animate-pulse" />; // or your actual header skeleton
}
