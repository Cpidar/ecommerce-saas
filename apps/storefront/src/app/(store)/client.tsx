"use client";

import config from "@/puck/config";
import type { Data } from "@puckeditor/core";
import { Render } from "@puckeditor/core";
import { useEffect } from "react";

export function Client({ data, path }: { data: Data; path: string; }) {
  console.log(path)
  // this function save the server data in database.json
  useEffect(() => {
    const postData = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/puck`, {
          method: "post",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data, path }),
        });
      } catch (error) {
        console.error('Error:', error);
      }
    };

    postData();
  }, []); // ⬅️ Empty array = runs only once after mount
  return <Render config={config} data={data} />;
}