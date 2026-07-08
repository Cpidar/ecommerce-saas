"use client";

import { useState } from "react";
import Image from "next/image";
import logo from "@/data/logo.svg";
import { ArrowRightIcon } from "lucide-react";
import { notFound, useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { loginSchema } from "@/lib/validators";
import { toast } from "sonner";
import { AuthError } from "@/lib/auth-server";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const PageLogin = () => {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const email = useAuthStore((s) => s.email);
  const authenticate = useAuthStore((s) => s.authenticate);

  const phone = useAuthStore((s) => s.phone);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!phone) return notFound();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success(t("welcomeBackUser"));
      router.push(`/account`);
    } catch (err) {
      const message =
        err instanceof AuthError ? err.message : t("invalidCredentials");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function loginByOTP() {
    if (!phone) {
      toast.error(t("missingPhoneNumber"));
      router.push("/auth/authenticate");
      return;
    }
    setLoading(true);
    try {
      const response = await authenticate({ phone, email });

      if (typeof response === "string") {
        throw new Error(response);
      }

      router.push(`/auth/otp`);
    } catch (err) {
      const message =
        err instanceof AuthError ? err.message : t("invalidCredentials");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="nc-PageLogin mb-8 p-5 lg:mb-10 flex flex-col items-center lg:justify-center">
      <div className="w-full relative flex items-center justify-center">
        <button
          onClick={router.back}
          className="flex right-0 w-6 text-neutral-700 transition-all duration-300 ease-out cursor-pointer fixed lg:absolute"
        >
          <ArrowRightIcon />
        </button>
        <Image
          className="mx-auto h-10 w-auto"
          src={logo}
          width={200}
          height={200}
          alt={tCommon("companyLogoAlt")}
        />
      </div>
      <div className="w-full mx-auto space-y-6">
        <h1 className="text-h4 text-neutral-900 text-right w-full mt-6">
          {t("enterPassword")}
        </h1>
        {/* FORM */}
        <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
          <label className="block">
            <Input
              type="password"
              required
              minLength={4}
              className="mt-1"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {/* {message && (
            <p className="mt-2 text-xs text-red-500 ltr:text-left rtl:text-right">
              {message}
            </p>
          )} */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? tCommon("loading") : tCommon("signIn")}
          </Button>
        </form>
        <button onClick={loginByOTP} className="text-sm text-green-600">
          {t("loginWithOTP")}
        </button>
      </div>
    </div>
  );
};

export default PageLogin;
