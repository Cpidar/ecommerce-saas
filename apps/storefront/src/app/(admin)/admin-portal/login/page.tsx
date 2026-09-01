// app/(admin)/admin-portal/login/page.tsx
export const instant = false

import { LoginForm } from "./login-form";


export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const params = await searchParams;
  const from = params?.from ?? "/admin-portal";
  const error = params?.error;

  return <LoginForm from={from} error={error} />;
}
