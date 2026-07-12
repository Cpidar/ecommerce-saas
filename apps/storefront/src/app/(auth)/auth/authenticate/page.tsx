"use client"

import React, { useState } from "react";
import Image from "next/image";
// import logo from "@/images/logo.svg";
import { ArrowRightIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { phoneAuthSchema } from "@/lib/validators";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { AuthError } from "@/lib/utils/auth-error";

const PageLogin = () => {
  const router = useRouter();
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");
  const authenticate = useAuthStore((s) => s.authenticate);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const email = `${phone}@${process.env.NEXT_PUBLIC_EMAIL_DOMAIN || "liana.com"}`
    const result = phoneAuthSchema.safeParse({ phone });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const response = await authenticate({ phone, email });

      if (typeof response === "string") {
        throw new Error(response);
      }

      const { location } = response;

      return location === "register"
        ? router.push(`/auth/register`)
        : router.push(`/auth/password`);
    } catch (err) {
      const message =
        err instanceof AuthError ? err.message : tAuth("invalidCredentials");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="nc-PageLogin mb-8 p-5 lg:mb-10 flex flex-col items-center lg:justify-center">
      <div className="w-full relative flex items-center justify-center">
        <div className="flex right-0 text-neutral-700 transition-all duration-300 ease-out cursor-pointer fixed lg:absolute">
          {/* <ArrowRightIcon /> */}
        </div>
        <Image
          className="mx-auto h-10 w-auto"
          src={'/next.svg'}
          width={200}
          height={200}
          alt={tCommon("companyLogoAlt")}
        />
      </div>
      <div className="w-full mx-auto space-y-6">
        <div className="w-full">
          <h1 className="text-h4 text-neutral-900 text-right w-full mt-4">
            {tAuth("authenticateTitle")}
          </h1>
          <p className="text-xs text-neutral-700 mt-4 text-right w-full">
            {tAuth("greeting")}
          </p>
          <p className="text-xs text-neutral-700 mb-4 text-right w-full">
            {tAuth("enterPhoneNumber")}
          </p>
          {/* FORM */}
          <form className="" onSubmit={handleSubmit}>
            <label className="block w-full">
              <Input
                type="number"
                placeholder={tAuth("phonePlaceholder")}
                className="text-left mt-1"
                disabled={loading}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <Button type="submit" className="w-full mt-6 lg:mt-8" disabled={loading}>
              {loading ? tCommon("signingIn") : tCommon("signIn")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PageLogin;
