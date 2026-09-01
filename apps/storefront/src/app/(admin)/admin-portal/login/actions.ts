"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validators";
import { loginAdmin } from "@/lib/medusa/admin-auth";

export async function handleLogin(
  from: string,
  formData: FormData,
) {

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    redirect(
      `/admin-portal/login?error=${encodeURIComponent(result.error.issues[0].message)}`,
    );
  }

  try {
    await loginAdmin(email, password);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid email or password";
    redirect(`/admin-portal/login?error=${encodeURIComponent(message)}`);
  }

  redirect(from);
}
