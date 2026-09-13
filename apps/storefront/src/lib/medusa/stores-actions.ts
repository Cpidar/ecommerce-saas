"use server"
import type { ReorderStoreSubscriptionCheckoutResponse, ReorderSubscriptionRecord } from "@/types/subscription"
import { sdk } from "../medusa"
import { medusaError } from "../medusa-error"
import { getAuthHeaders } from "./cookies-client"
import { AdminFileListResponse } from "@medusajs/types"
import { getToken } from "./admin-auth"
import { redirect } from "next/navigation"
import { getCurrentStoreId } from "./cookies"
import { siteConfigRepository, siteConfigRevalidation } from "../repositories/site-configs"
import { Data as PuckData } from "@puckeditor/core"

export async function initializeStore({
    email,
    password,
    storeName,
    handle,
    subscription
}: {
    email: string
    password: string
    storeName: string
    handle: string
    subscription: ReorderSubscriptionRecord
}) {
    const headers = {
        ...(getAuthHeaders()),
    }

    const response = await sdk.client
        .fetch(
            `/stores/regular`,
            {
                method: "POST",
                headers,
                cache: "no-store",
                body: {
                    email,
                    password,
                    storeName,
                    handle,
                    subscription
                }
            }
        )
        .catch(medusaError)

    return response
}

export const savePuckData = async (payload: { data: PuckData; path: string }) => {
    const token = await getToken()

    if (!token) {
        redirect("/admin-portal/login?from=/admin-portal/puck/home/edit")

    }

    const storeId = await getCurrentStoreId()
    if (!storeId) {
        throw new Error("You have not access to any store. Please contact your administrator.");
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
}

// Use native fetch for file uploads because sdk.client.fetch modifies FormData
// requests and prevents them from being sent correctly as multipart/form-data.
export const uploadAdminFile = async (file: File): Promise<string> => {
    const token = await getToken()
    if (!token) {
        redirect("/admin-portal/login?from=/admin-portal/puck/home/edit")
        // throw new Error("No admin token found. Please log in first.");
    }

    const storeId = await getCurrentStoreId()
    if (!storeId) {
        throw new Error("You have not access to any store. Please contact your administrator.");
    }

    const formData = new FormData();
    formData.append("files", file, file.name);

    try {
        const response = await fetch(
            `${process.env.MEDUSA_BACKEND_URL}/admin/uploads`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-store-id": storeId
                },
                body: formData,
            },
        );

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Unable to upload file");
        }

        return data.files[0].url;
    } catch (e: any) {
        throw new Error("Unable to upload file");
    }
};
