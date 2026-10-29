"use client";

import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Plug } from "@medusajs/icons";
import { StoreConfigShell } from "../store-config-layout";
import { IntegrationTab } from "../../../components/store-config";

const IntegrationPage = () => (
  <StoreConfigShell>
    <IntegrationTab />
  </StoreConfigShell>
);

export const config = defineRouteConfig({
  label: "یکپارچه سازی",
  icon: Plug,
  rank: 3
});

export default IntegrationPage;
