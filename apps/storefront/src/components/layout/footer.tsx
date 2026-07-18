import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { StoreConfigInput } from "@/lib/repositories/site-configs";
import { SocialLinks } from "./social-links";

const footerLinks = {
  shop: [
    { name: "محصولات", href: "/shop" },
    { name: "دسته بندی محصولات", href: "/brands" },
    { name: "تازه ها", href: "/shop?sort=newest" },
    { name: "تخفیف دارها", href: "/shop?sale=true" },
  ],
  company: [
    { name: "درباره فروشگاه", href: "/about" },
    { name: "بلاگ", href: "/blog" },
    { name: "تماس با ما", href: "/contact" },
    { name: "سوالات متداول", href: "/faq" },
  ],
  legal: [
    { name: "رویه ارسال سفارش", href: "/policies/shipping" },
    { name: "سیاست بازگشت کالا", href: "/policies/returns" },
    { name: "حریم خصوصی", href: "/policies/privacy" },
    { name: "شرایط استفاده", href: "/policies/terms" },
  ],
};

export function Footer({ siteConfig }: { siteConfig: StoreConfigInput }) {
  const socialLinks = siteConfig.marketing_config?.social_links as Record<
    string,
    string
  >;

  return (
    <footer className="border-t bg-muted">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              {siteConfig.title}
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {siteConfig.tagline || siteConfig.description}
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold">دسترسی سریع</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold">فروشگاه</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold">خدمات مشتریان</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; 1405 {siteConfig.title}. تمامی حقوق محفوظ است.
            <br className="sm:hidden" /> 
            ساخته شده با{" "}
            <a
              href="https://epicdesignlabs.com"
              target="_blank"
              rel="noopener"
              className="underline hover:text-foreground"
            >
              فروشگاه ساز نیتروکامرس
            </a>
          </p>
          <div className="flex items-center gap-4">
            {socialLinks && (
              <SocialLinks
                socialLinks={socialLinks}
                iconClassName="w-4 h-4 text-blue-500 hover:text-blue-700"
              />
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
