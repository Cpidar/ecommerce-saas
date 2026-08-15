"use client";

import { CogSixTooth as Cog, CreditCard, Globe, LightBulb, TruckFast as Truck, Wrench, Component } from "@medusajs/icons";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Heading,
  Text,
} from "@medusajs/ui";
import type { ReactNode } from "react";

export const NAV_ITEMS = [
  {
    path: "/store-config",
    label: "اطلاعات پایه",
    icon: Cog,
    exact: true,
  },
  {
    path: "/store-config/branding",
    label: "برندینگ و تماس",
    icon: LightBulb,
    exact: false,
  },
    {
    path: "/store-config/site-settings",
    label: "تنظیمات سایت",
    icon: Component,
    exact: false,
  },
  {
    path: "/store-config/seo",
    label: "سئو و متا",
    icon: Globe,
    exact: false,
  },
    {
    path: "/store-config/payment-configs",
    label: "روشهای پرداخت",
    icon: CreditCard,
    exact: false,
  },
      {
    path: "/store-config/shipping-method-configs",
    label: "روشهای ارسال",
    icon: Truck,
    exact: false,
  },
  {
    path: "/store-config/advanced",
    label: "پیشرفته (JSON)",
    icon: Wrench,
    exact: false,
  },
] as const;

export const StoreConfigShell = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <Container className="p-6 my-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Heading level="h1">تنظیمات فروشگاه</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              مدیریت اطلاعات، برندینگ، سئو و تنظیمات پیشرفته فروشگاه
            </Text>
          </div>
        </div>
      </Container>

      {/* Sub-nav */}
      <Container className="p-0 my-3">
        <div className="flex flex-wrap border-b border-ui-border-base">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  isActive(item)
                    ? "border-ui-border-interactive text-ui-fg-base"
                    : "border-transparent text-ui-fg-muted hover:text-ui-fg-base"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </Container>

      {/* Content */}
      {children}
    </div>
  );
};
