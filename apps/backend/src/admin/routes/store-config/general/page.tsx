"use client";

import { defineRouteConfig } from "@medusajs/admin-sdk";
import { CogSixTooth as Cog } from "@medusajs/icons";
import { StoreConfigShell } from "../store-config-layout";
import { GeneralTab } from "../../../components/store-config";

const GeneralPage = () => (
  <StoreConfigShell>
    <GeneralTab />
  </StoreConfigShell>
);

export const config = defineRouteConfig({
  label: "اطلاعات پایه",
  icon: Cog,
  rank: 1
});

export default GeneralPage;