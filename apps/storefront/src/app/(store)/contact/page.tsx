import ContactPage from "./client";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { siteConfigRepository } from "@/lib/repositories/site-configs";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "ارتباط با ما",
  description: "راه‌های ارتباطی با فروشگاه، شامل فرم تماس و اطلاعات تماس.",
};

export default async function Page() {
  const siteConfig = await siteConfigRepository.getCoreConfig();
  if (!siteConfig) {
    return notFound();
  }
  const socialLinks = siteConfig.marketing_config?.social_links as Record<
    string,
    string
  >;
  const contact = siteConfig.marketing_config?.contact as
    | { address?: string | null | undefined; phone?: string | null | undefined }
    | undefined;

  return (
    <Suspense fallback={<ContactSkeleton />}>
      <ContactPage data={{ contact, socialLinks }} />
    </Suspense>
  );
}

const ContactSkeleton: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Page Header */}
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-3 h-5 w-full max-w-lg" />

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {/* Contact Info Cards */}
        <div className="space-y-4 lg:col-span-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-lg border p-6 space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 rounded-lg border p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
};
