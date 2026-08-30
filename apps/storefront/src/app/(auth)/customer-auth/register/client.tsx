"use client";

import { useState } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/lib/utils/auth-error";
import { registerSchema } from "@/lib/validators";
import { useTranslations } from "next-intl";
import { registerWithPhone, transferCart } from "@/lib/medusa/auth-server";
import { initializeStore } from "@/lib/medusa/store-creation";
import { completeSubscriptionCheckout } from "@/lib/repositories/subscriptions";
import { useCartStore } from "@/store/cart";
import { AppMode } from "@/lib/utils/app-mode";

const Register = ({ appMode }: { appMode: AppMode }) => {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

  const router = useRouter();
  const phone = useAuthStore((s) => s.phone);
  const phoneVerfied = useAuthStore(s => s.phoneVerfied)
  const email = useAuthStore((s) => s.email);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Saas
    storeName: "",
    storeHandle: "",
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
      const res = await registerWithPhone({
        first_name: form.firstName,
        last_name: form.lastName,
        email,
        phone,
        password: form.password,
      });

      if (appMode === "saas") {
        await transferCart();
        const result = await completeSubscriptionCheckout();
        if (result?.type === "order") {
          useCartStore.setState({ cart: null, hasHydrated: false });
          await initializeStore({
            email,
            password: form.password,
            storeName: form.storeName,
            handle: form.storeHandle,
            subscription: result.subscription,
          });
          toast.success("");
          router.push(`/customer-auth/initialize-store`)
          return result;
        } else {
          toast.error("");
          return null;
        }
      }

      if (res.location === "otp") {
        // toast.success(t("accountCreated"));
        router.push(`/customer-auth/otp`);
      }
    } catch (err) {
      console.error(err);
      const message =
        err instanceof AuthError ? err.message : t("createAccountFailed");
      toast.error(t("createAccountFailed"));
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
        {appMode === "saas" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="storeName">{t("storeName")}</Label>
              <Input
                id="storeName"
                name="storeName"
                type="text"
                value={form.storeName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeHandle">{t("storeHandle")}</Label>
              <Input
                id="storeHandle"
                name="storeHandle"
                type="text"
                value={form.storeHandle}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}
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
