"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCardLayout } from "@/components/auth/emailpass-auth-card-layout";
import { handleLogin } from "./actions";

interface LoginFormProps {
  from: string;
  error?: string;
}

export function LoginForm({ from, error }: LoginFormProps) {
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");

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

      <form action={handleLogin.bind(null, from)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{tAuth("email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
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
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          {tCommon("signIn")}
        </Button>
      </form>
    </AuthCardLayout>
  );
}
