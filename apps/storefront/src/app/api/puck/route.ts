import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { sdk } from "@/lib/medusa";
import { siteConfigRepository, siteConfigRevalidation } from "@/lib/repositories/site-configs";
import { cookies } from 'next/headers';
import { ADMIN_COOKIE } from "@/lib/medusa/admin-auth";
import { getCurrentStoreId } from "@/lib/medusa/cookies";

export async function POST(request: Request) {
  const payload = await request.json();
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ message: "invalid token" }, { status: 401 })
  }

  const storeId = await getCurrentStoreId()
  if (!storeId) {
    return NextResponse.json({ message: "Invalid store context" }, { status: 400 })
  }

  // Construct the full path
  // const dbPath = `puck-data/database.json`

  // 🟢 Create directory if it doesn't exist
  // const dirPath = path.dirname(dbPath);
  // if (!fs.existsSync(dirPath)) {

  //   fs.mkdirSync(dirPath, { recursive: true });
  // }

  // 🟢 Fix: Use dbPath, not hardcoded "database.json"
  // const existingData = JSON.parse(
  //   fs.existsSync(dbPath)
  //     ? fs.readFileSync(dbPath, "utf-8")  // ✅ Use dbPath here
  //     : "{}"
  // );

  const existingStoreConfig = await siteConfigRepository.getPageFromAdmin()
  const existingPuckDataForPath = existingStoreConfig?.puck_data?.[payload.path] ?? {}

  // 🟢 Write to the correct path
  // fs.writeFileSync(dbPath, JSON.stringify(payload.data, null, 2)); // Added pretty printing

  try {

    await sdk.client.fetch(
      "/admin/store-config",
      {
        method: "PUT",
        headers: { 'Authorization': `Bearer ${token}` },
        body: {
          id: existingStoreConfig?.id,
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
      .then(() => siteConfigRevalidation.puck(storeId))
      .finally(() => console.log("🔥🔥🔥🔥 Puck Page Updated"))
  } catch (e) {
    console.error(e)
    throw new Error("Something was wrong")
  }
  // Purge Next.js cache
  // revalidatePath(payload.path);

  return NextResponse.json({ status: "ok" });
}