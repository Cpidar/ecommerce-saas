"use client";

import { defineRouteConfig } from "@medusajs/admin-sdk";
import { CogSixTooth as Cog } from "@medusajs/icons";
import { StoreConfigShell } from "./store-config-layout";
import { GeneralTab } from "../../components/store-config";

const StoreConfigPage = () => (
  <StoreConfigShell>
    <GeneralTab />
  </StoreConfigShell>
);

export const config = defineRouteConfig({
  label: "Store Config",
  icon: Cog,
});

export const handle = {
  breadcrumb: () => "Store Config",
};

export default StoreConfigPage;