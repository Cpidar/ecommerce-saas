"use client";

import { defineRouteConfig } from "@medusajs/admin-sdk";
import { CogSixTooth as Cog } from "@medusajs/icons";
import { StoreConfigShell } from "../store-config-layout";
import { SiteSettingsTab } from "../../../components/store-config";

const SiteSettingsPage = () => (
  <StoreConfigShell>
    <SiteSettingsTab />
  </StoreConfigShell>
);

export const config = defineRouteConfig({
  label: "تنظیمات سایت",
  icon: Cog,
});

export default SiteSettingsPage;
