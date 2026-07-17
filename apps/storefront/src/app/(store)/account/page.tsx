"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Package, MapPin, Settings, Heart, LogOut } from "lucide-react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useAuthStore } from "@/store/auth";
import { useTranslations } from "next-intl";

const accountLinks = [
  {
    titleKey: "ordersTitle",
    descriptionKey: "ordersDescription",
    href: "/account/orders",
    icon: Package,
  },
  {
    titleKey: "addressesTitle",
    descriptionKey: "addressesDescription",
    href: "/account/addresses",
    icon: MapPin,
  },
  {
    titleKey: "wishlistTitle",
    descriptionKey: "wishlistDescription",
    href: "/wishlist",
    icon: Heart,
  },
  {
    titleKey: "settingsTitle",
    descriptionKey: "settingsDescription",
    href: "/account/settings",
    icon: Settings,
  },
];

export default function AccountPage() {
  const tAccount = useTranslations("account");
  const tCommon = useTranslations("common");
  const { customer, isReady } = useAuthGuard();
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  if (!customer) return null;

  const greeting = tAccount("welcomeUser", {
    name: customer?.first_name || customer?.email,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader title={tAccount("title")} description={greeting}>
        <Button
          variant="outline"
          onClick={async () => {
            await logout();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {tCommon("signOut")}
        </Button>
      </PageHeader>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {accountLinks.map((item) => (
          <Link key={item.titleKey} href={item.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  {tAccount(item.titleKey)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {tAccount(item.descriptionKey)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
