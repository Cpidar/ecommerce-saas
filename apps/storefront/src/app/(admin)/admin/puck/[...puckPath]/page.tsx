/**
 * This file implements a *magic* catch-all route that renders the Puck editor.
 *
 * This route exposes /puck/[...puckPath], but is disabled by middleware.ts. The middleware
 * then rewrites all URL requests ending in `/edit` to this route, allowing you to visit any
 * page in your application and add /edit to the end to spin up a Puck editor.
 *
 * This approach enables public pages to be statically rendered whilst the /puck route can
 * remain dynamic.
 *
 * NB this route is public, and you will need to add authentication
 */

import "@puckeditor/core/puck.css";
import { Client } from "./client";
import { Metadata } from "next";
import { getPage } from "@/lib/get-page";
import { DEFAULT_REGION } from "@/lib/medusa";
import { shouldHandleEditPath } from "@/puck/utils/slug-matcher";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ puckPath: string[]; countryCode: string }>;
}): Promise<Metadata> {
  const { puckPath = [] } = await params;

  // 🟢 Handle "home" slug correctly for metadata
  const displayPath =
    puckPath.length === 1 && puckPath[0] === "home"
      ? "/home"
      : `/${puckPath.join("/")}`;

  return {
    title: "Puck: " + displayPath,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}) {
  const { puckPath = [] } = await params;
  const countryCode = DEFAULT_REGION;
  const path =
    puckPath.length === 1 && puckPath[0] === "home"
      ? "/home"
      : `/${puckPath.join("/")}`;

  const data = getPage(path);

  if (!shouldHandleEditPath(puckPath)) {
    notFound();
  }

  return <Client path={path} data={data || {}} countryCode={countryCode} />;
}

export const dynamic = "force-dynamic";
