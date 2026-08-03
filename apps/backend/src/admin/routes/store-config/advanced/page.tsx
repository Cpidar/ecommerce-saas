"use client";

import { defineRouteConfig } from "@medusajs/admin-sdk";
import { CogSixTooth as Cog } from "@medusajs/icons";
import { StoreConfigShell } from "../store-config-layout";
import { AdvancedTab } from "../../../components/store-config";

const AdvancedPage = () => (
  <StoreConfigShell>
    <AdvancedTab />
  </StoreConfigShell>
);

export const config = defineRouteConfig({
  label: "پیشرفته (JSON)",
  icon: Cog,
});

export default AdvancedPage;