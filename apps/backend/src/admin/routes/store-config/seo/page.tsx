"use client";

import { defineRouteConfig } from "@medusajs/admin-sdk";
import { CogSixTooth as Cog } from "@medusajs/icons";
import { StoreConfigShell } from "../store-config-layout";
import { SeoTab } from "../../../components/store-config";

const SeoPage = () => (
  <StoreConfigShell>
    <SeoTab />
  </StoreConfigShell>
);

export const config = defineRouteConfig({
  label: "سئو و متا",
  icon: Cog,
  rank: 3
});

export default SeoPage;