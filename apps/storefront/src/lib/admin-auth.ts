import "server-only";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";

/** Whether the current request carries a valid admin session. */
export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value
  if (!token) return false

  try {
    const verifyRes = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/admin/users/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!verifyRes.ok) {
      return false;
    }
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

export async function loginAdmin(email: string, password: string) {
  const res = await fetch(
    `http://localhost:9000/auth/user/emailpass`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // important for cookies if you prefer session
      cache: "no-store",
    }
  )

  if (res.ok) {
    const { token } = await res.json() // JWT token
    await setToken(token)
  } else {
    alert("Invalid admin credentials")
  }
}
