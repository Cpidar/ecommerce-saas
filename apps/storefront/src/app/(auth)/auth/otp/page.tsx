"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/data/logo.svg";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import { AuthError } from "@/lib/auth-client";
import { otpSchema } from "@/lib/validators";
import { notFound, useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

const PageLogin = () => {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

  const router = useRouter();

  const loginWithOTP = useAuthStore((s) => s.loginWithOTP);
  const authenticate = useAuthStore((s) => s.authenticate);
  const phone = useAuthStore((s) => s.phone);
  const email = useAuthStore((s) => s.email);
  const [loading, setLoading] = useState(false);
  const [otp, setOTP] = useState("");

  const [minutes, setMinutes] = useState(3);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }

      if (seconds === 0) {
        if (minutes === 0) {
          // fetch(
          //   `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/auth/otp/invalidate`,
          //   {
          //     method: "POST",
          //     body: JSON.stringify({
          //       phone,
          //     }),
          //     headers: {
          //       "content-type": "application/json; charset=utf-8",
          //     },
          //   }
          // )
          clearInterval(interval);
        } else {
          setSeconds(59);
          setMinutes(minutes - 1);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [seconds]);

  const resendOTP = () => {
    authenticate({email, phone});

    setMinutes(3);
    setSeconds(0);
  };

  if (!phone) return notFound();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = otpSchema.safeParse({ pin: otp });
    if (!result.success || !phone) {
      toast.error(result.error?.issues[0].message || t("missingPhoneNumber"));
      return;
    }
    setLoading(true);
    try {
      await loginWithOTP(phone, otp, email);
      toast.success(t("welcomeBackUser"));
      router.push(`/account`);
    } catch (err) {
      const message =
        err instanceof AuthError ? err.message : t("invalidCredentials");
      toast.error(message);
    }
    // if (typeof response === "string") {
    //   console.log(response.includes("expired"));
    //   if (response.includes("expired")) {
    //     setSubmitError("کد وارد شده منقضی شده است");
    //   } else if (response.includes("Invalid OTP")) {
    //     setSubmitError("کد وارد شده صحیح نیست");
    //   } else {
    //     setSubmitError("یک خطای غیر منتظره رخ داده است");
    //   }
    // }
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
          {t("enterVerificationCode")}
        </h1>
        {/* {step === "isSignUp" && (
          <p className="text-xs text-neutral-700 my-4 text-right w-full">{`حساب کاربری با شماره موبایل
        ${phone}
        وجود ندارد. برای ساخت حساب جدید، کد تایید برای این شماره ارسال گردید.`}</p>
        )} */}
        {/* FORM */}
        <form className="" onSubmit={handleSubmit}>
          <div className="">
            <label className="flex justify-center">
              {/* <Input
              type="text"
              placeholder="123456"
              className="text-left mt-1"
              disabled={loading}
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
            /> */}
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOTP(value)}
                pattern={REGEXP_ONLY_DIGITS}
              >
                <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </label>
            <Button
              className="w-full mt-6 lg:mt-8"
              type="submit"
              disabled={loading}
            >
              {loading ? tCommon("signingIn") : tCommon("signIn")}
            </Button>
          </div>
        </form>

        <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
          {seconds > 0 || minutes > 0 ? (
            <p className="text-xs">
              {t("resendCodeTimer", {
                time: `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`,
              })}
            </p>
          ) : (
            <Button
              className="w-full"
              disabled={seconds > 0 || minutes > 0}
              onClick={resendOTP}
            >
              <span className="text-blue-500 text-xs">{t("resendCode")}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageLogin;
