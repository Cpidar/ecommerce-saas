"use client";

import config from "@/puck/config";
import type { Data } from "@puckeditor/core";
import { Render } from "@puckeditor/core";
import { useEffect } from "react";

export function Client({ data, path }: { data: Data; path: string; }) {
  return <Render config={config} data={data} />;
}