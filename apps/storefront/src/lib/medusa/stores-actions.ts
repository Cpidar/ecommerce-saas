"use client";
import { sdk } from "../medusa";
import { medusaError } from "../medusa-error";
import {
  AdditionalData,
  AdminFileListResponse,
  HttpTypes,
} from "@medusajs/types";
// import { getToken } from "./admin-auth"
// import { redirect } from "next/navigation"
// import {  getCurrentStoreId } from "./cookies"
// import { siteConfigRepository, siteConfigRevalidation, StoreConfigResponse, storeConfigTags } from "../repositories/site-configs"
import { Data as PuckData } from "@puckeditor/core";
// import { cacheTag, cacheLife } from "next/cache"
import { STORE_CONFIG_CACHE_PROFILE } from "../constants";

const getCurrentStoreId = () => {
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith("current_store_id="))
    ?.split("=")[1];

  return value;
};
export type CreateStoreInput = {
  store_name: string;
  email?: string;
  password?: string;
  user_id?: string;
  is_super_admin?: boolean;
  metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

export type CreateStoreWorkflowInput = {
  store: CreateStoreInput;
} & AdditionalData;

export type InitializeStoreProgressResponse = {
  status: "idle" | "running" | "completed" | "failed";
  progress: number;
  step: string;
  error: string | null;
};

export async function initializeStore(input: CreateStoreWorkflowInput) {
  const storeId = getCurrentStoreId() || process.env.NEXT_PUBLIC_SAAS_STORE_ID!;
  const headers = {
    Authorization: process.env.NEXT_PUBLIC_MEDUSA_SUPER_ADMIN_API_KEY!,
    "Content-Type": "application/json",
    "x-store-id": storeId,
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/stores/regular`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    },
  )
    .then((res) => res.json())
    .catch(medusaError);

  return response;
}

export async function grantCreditAccount(input: {
  amount: number;
  customer_id: string;
  reference: string;
  reference_id: string;
}) {
  console.log(input)
  const storeId = getCurrentStoreId() || process.env.NEXT_PUBLIC_SAAS_STORE_ID!;
  const headers = {
    Authorization: process.env.NEXT_PUBLIC_MEDUSA_SUPER_ADMIN_API_KEY!,
    "Content-Type": "application/json",
    "x-store-id": storeId,
  };

  const { store_credit_account} = await fetch(
    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/stores/credit`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ store_id: storeId, ...input }),
    },
  )
    .then((res) => res.json())
    .catch(medusaError);

  return store_credit_account;
}

export async function deductCreditAccount(input: {
  amount: number;
  customer_id: string;
  reference: string;
  reference_id: string;
}) {
  const storeId = getCurrentStoreId() || process.env.NEXT_PUBLIC_SAAS_STORE_ID!;
  const headers = {
    Authorization: process.env.NEXT_PUBLIC_MEDUSA_SUPER_ADMIN_API_KEY!,
    "Content-Type": "application/json",
    "x-store-id": storeId,
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/stores/debit`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ store_id: storeId, ...input }),
    },
  )
    .then((res) => res.json())
    .catch(medusaError);

  return response;
}

export async function StoreCreationProgress(key: string) {
  const headers = {
    // "Authorization": process.env.MEDUSA_SUPER_ADMIN_API_KEY!,
    // ...(getAuthHeaders()),
  };

  const response = await sdk.client
    .fetch<InitializeStoreProgressResponse>(
      `/store/initialize-store/progress?key=${key}`,
      {
        method: "GET",
        cache: "no-store",
        // headers,
      },
    )
    .catch(medusaError);

  return response;
}

export const savePuckData = async (payload: {
  data: PuckData;
  path: string;
}) => {
  const storeId = await getCurrentStoreId();
  if (!storeId) {
    throw new Error(
      "You have not access to any store. Please contact your administrator.",
    );
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

  const existingStoreConfig = await fetchAdminPuckPage();
  const existingPuckDataForPath =
    existingStoreConfig?.puck_data?.[payload.path] ?? {};

  // 🟢 Write to the correct path
  // fs.writeFileSync(dbPath, JSON.stringify(payload.data, null, 2)); // Added pretty printing

  try {
    await sdk.client
      .fetch("/admin/store-config", {
        method: "PUT",
        credentials: "include",
        // headers: { 'Authorization': `Bearer ${token}` },
        body: {
          id: existingStoreConfig?.id,
          puck_data: {
            ...existingStoreConfig?.puck_data,
            [payload.path]: {
              ...existingPuckDataForPath,
              ...payload.data,
            },
          },
        },
      })
      // .then(() => siteConfigRevalidation.puck(storeId))
      .finally(() => console.log("🔥🔥🔥🔥 Puck Page Updated"));
  } catch (e) {
    console.error(e);
    throw new Error("Something was wrong");
  }
  // Purge Next.js cache
  // revalidatePath(payload.path);
};

// Use native fetch for file uploads because sdk.client.fetch modifies FormData
// requests and prevents them from being sent correctly as multipart/form-data.
export const uploadAdminFile = async (file: File): Promise<string> => {
  // const token = await getToken()
  // if (!token) {
  //     redirect("/admin-portal/login?from=/admin-portal/puck/home/edit")
  //     // throw new Error("No admin token found. Please log in first.");
  // }

  const storeId = await getCurrentStoreId();
  if (!storeId) {
    throw new Error(
      "You have not access to any store. Please contact your administrator.",
    );
  }

  const formData = new FormData();
  formData.append("files", file, file.name);

  try {
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/admin/uploads`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          // Authorization: `Bearer ${token}`,
          "x-store-id": storeId,
        },
        body: formData,
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Unable to upload file");
    }

    return data.files[0].url;
  } catch {
    throw new Error("Unable to upload file");
  }
};

const fetchAdminPuckPage = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await sdk.client.fetch<Record<string, any>>(
    "/store/store-config?fields=puck_data,id",
    {
      method: "GET",
      credentials: "include",
      //   headers: { 'Authorization': `Bearer ${token}` },
    },
  );

  return response.store_config;
};
