"use client";

import { useState } from "react";
import Image from "next/image";
// import logo from "@/data/logo.svg";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/lib/utils/auth-error";
import { registerSchema } from "@/lib/validators";
import { useTranslations } from "next-intl";

const Register = () => {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const phone = useAuthStore((s) => s.phone);
  const email = useAuthStore((s) => s.email);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  if (!phone) return notFound();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = registerSchema.safeParse(form);
    if (!validation.success || !phone) {
      toast.error(
        validation.error?.issues[0].message || t("missingPhoneNumber"),
      );
      return;
    }
    setLoading(true);
    try {
      await register({
        first_name: form.firstName,
        last_name: form.lastName,
        email,
        phone,
        password: form.password,
      });
      toast.success(t("accountCreated"));
      router.push(`/auth/otp`);
    } catch (err) {
      const message =
        err instanceof AuthError ? err.message : t("createAccountFailed");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full mx-auto space-y-6">
      <h1 className="text-h4 text-neutral-900 text-right w-full mt-6">
        {t("enterYourDetails")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t("firstName")}</Label>
            <Input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t("lastName")}</Label>
            <Input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          {/* <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          /> */}
          <Input
            id="email"
            name="email"
            value={email}
            onSubmit={handleChange}
            hidden
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? tCommon("creating") : tCommon("createAccount")}
        </Button>
        {/* <span className="text-center text-ui-fg-base text-small-regular mt-6">
            ورود شما به معنای پذیرش شرایط{" "}
            <LocalizedClientLink
              href="/content/privacy-policy"
              className="underline"
            >
              تابش الکتریک
            </LocalizedClientLink>{" "}
            و{" "}
            <LocalizedClientLink
              href="/content/terms-of-use"
              className="underline"
            >
              قوانین حریم خصوصی است
            </LocalizedClientLink>
            .
          </span> */}
      </form>
    </div>
  );
};

export default Register;
