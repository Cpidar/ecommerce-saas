"use client";

import config from "@/puck/config";
import type { Data } from "@puckeditor/core";
import { Puck } from "@puckeditor/core";

export function Client({ path, data, countryCode }: { path: string; data: Partial<Data>, countryCode: string }) {
  console.log(JSON.stringify({ data, path, countryCode }))
  return (
    <Puck
      config={config}
      data={data}
      onPublish={async (data) => {
        await fetch(`/api/puck`, {
          method: "post",
          body: JSON.stringify({ data, path }),
        });
      }}
    />
  );
}