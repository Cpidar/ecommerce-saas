"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCardLayout } from "@/components/auth/emailpass-auth-card-layout";
import { toast } from "sonner";
import { loginSchema } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminSdk } from "@/lib/medusa";
import { AuthError } from "@/lib/utils/auth-error";

interface LoginFormProps {
  from: string;
  error?: string;
}

export function LoginForm({ from, error }: LoginFormProps) {
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      // await login(email, password)
      const result = await adminSdk.auth.login("user", "emailpass", { email, password });
      console.log(result)
      toast.success("Welcome back!");
      router.push(from);
    } catch (err) {
      const message =
        err instanceof AuthError ? err.message : "Invalid email or password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCardLayout
      title={tAuth("welcomeBack")}
      subtitle={tAuth("signInContinue")}
      footerText={tAuth("footerText")}
      footerLinkText={tAuth("footerLinkText")}
      footerLinkHref="https://nitrocommerce.ir"
    >
      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
          {decodeURIComponent(error)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{tAuth("email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{tAuth("password")}</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {tAuth("forgotPassword")}
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? `${tCommon("signIn")}...` : tCommon("signIn")}
        </Button>
      </form>
    </AuthCardLayout>
  );
}
