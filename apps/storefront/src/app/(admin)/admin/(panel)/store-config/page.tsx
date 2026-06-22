import StoreConfig from "@/components/admin/store-config";
import { STORE_COOKIE } from "@/lib/medusa";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

// ── Page ───────────────────────────────────────────────────────────
export default async function StoreConfigPage() {
  const storeId = (await cookies()).get(STORE_COOKIE)?.value;
  if (!storeId) return notFound();

  return <StoreConfig storeId={storeId}></StoreConfig>;
}
