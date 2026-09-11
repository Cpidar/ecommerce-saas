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
import { clearToken, isAuthed } from "@/lib/medusa/admin-auth";
import { AdminBar } from "@/components/admin/admin-bar";
import { redirect } from "next/navigation";

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

export async function AdminBarProvider() {
  const isAuthenticated = await isAuthed();
  const handleLogout = async () => {
    "use server";
    await clearToken();
    redirect("/admin-portal/login");
  };

  return (
    <AdminBar 
      isAuthenticated={isAuthenticated} 
      onLogout={handleLogout}
      adminName="John Doe" // You can fetch this from your admin session
    />
  );

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
        <AdminBarProvider />
      </Suspense>
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
      <Suspense>{/* <DynamicMarker /> */}</Suspense>
    </>
  );
}

function HeaderSkeleton() {
  return <div className="h-16 bg-muted animate-pulse" />; // or your actual header skeleton
}
