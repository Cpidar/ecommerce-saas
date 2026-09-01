import "server-only";
import { cookies } from "next/headers";
import { sdk } from "../medusa";
import { AuthLoginResponse } from "@medusajs/js-sdk";

export const ADMIN_COOKIE = "admin_session";

/** Whether the current request carries a valid admin session. */
export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value
  if (!token) return false

  try {
    const verifyRes = await sdk.client.fetch(
      `/admin/users/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return true
  } catch {
    return false;
  }
}

async function setToken(token: string) {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value;
}

export async function clearToken() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function loginAdmin(email: string, password: string) {
  console.log("🦒🦒🦒🦒🦒🦒", email, password)
  try {
    const { token } = await sdk.client.fetch<{ token: string }>(
      `/auth/user/emailpass`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { email, password },
        credentials: "include", // important for cookies if you prefer session
        cache: "no-store",
      }
    )
    if (typeof token !== "string") {
      throw new Error("Authentication requires additional steps")
      // replace with the redirect logic of your application
      return
    }

    await setToken(token)
  }

  catch (e) {
    console.log("🦒🦒🦒🦒🦒🦒", e)
    throw new Error("Invalid admin credentials")
  }
}
