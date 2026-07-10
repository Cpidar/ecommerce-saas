import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { sdk } from "@/lib/medusa";
import { getPage, getStoreConfig } from "@/lib/get-page";

export async function POST(request: Request) {
  const payload = await request.json();
  // Construct the full path
  const dbPath = `puck-data/database.json`

  // 🟢 Create directory if it doesn't exist
  const dirPath = path.dirname(dbPath);
  if (!fs.existsSync(dirPath)) {

    fs.mkdirSync(dirPath, { recursive: true });
  }

  // 🟢 Fix: Use dbPath, not hardcoded "database.json"
  // const existingData = JSON.parse(
  //   fs.existsSync(dbPath)
  //     ? fs.readFileSync(dbPath, "utf-8")  // ✅ Use dbPath here
  //     : "{}"
  // );

  const existingStoreConfig = await getStoreConfig()
  const existingPuckDataForPath = existingStoreConfig?.puck_data?.[payload.path] ?? {}

  // 🟢 Write to the correct path
  // fs.writeFileSync(dbPath, JSON.stringify(updatedData, null, 2)); // Added pretty printing
  await (await sdk()).client.fetch(
    "/store/store-config",
    {
      method: "PUT",
      body: {
        ...existingStoreConfig,
        puck_data: {
          ...existingStoreConfig?.puck_data,
          [payload.path]: {
            ...existingPuckDataForPath,
            ...payload.data
          }
        }
      },
    }
  )

  // Purge Next.js cache
  revalidatePath(payload.path);

  return NextResponse.json({ status: "ok" });
}