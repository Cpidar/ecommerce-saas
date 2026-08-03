"use client";

import { defineRouteConfig } from "@medusajs/admin-sdk";
import { CogSixTooth as Cog } from "@medusajs/icons";
import { StoreConfigShell } from "../store-config-layout";
import { BrandingTab } from "../../../components/store-config";

const BrandingPage = () => (
  <StoreConfigShell>
    <BrandingTab />
  </StoreConfigShell>
);

export const config = defineRouteConfig({
  label: "برندینگ و تماس",
  icon: Cog,
  rank: 2
});

export default BrandingPage;