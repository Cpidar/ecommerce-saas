"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { completeSubscriptionCheckout } from "@/lib/repositories/subscriptions";
import { useAuthStore } from "@/store/auth";
import { useAuthGuard } from "@/hooks/use-auth-guard";

const TRIAL_FEATURES = [
  "راه‌اندازی کامل فروشگاه",
  "محصولات و دسته‌بندی نمونه",
  "مدیریت موجودی و ارسال",
  "پنل مدیریت فروشگاه",
];

export function CheckoutClient() {
  const router = useRouter();
  const { email, subscription } = useAuthStore();
  const { customer, isReady } = useAuthGuard();
  // if (!isReady || !customer) return null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartTrial = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await completeSubscriptionCheckout();

      if (!res?.subscription) {
        throw new Error("فعال‌سازی دوره آزمایشی با خطا مواجه شد.");
      }

      useAuthStore.setState({ subscription: res.subscription });
      router.push("/onboarding/initialize-store");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[80vh] flex items-center justify-center p-4"
      dir="rtl"
    >
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-xl">فعال‌سازی فروشگاه</CardTitle>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              نسخه آزمایشی
            </Badge>
          </div>
          <CardDescription>
            بدون نیاز به پرداخت، دوره آزمایشی خود را شروع کنید و فروشگاه‌تان را
            راه‌اندازی کنید.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">پلن انتخابی</p>
                <p className="text-lg font-semibold">Trial</p>
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold">۰ تومان</p>
                <p className="text-xs text-muted-foreground">شروع فوری</p>
              </div>
            </div>

            <Separator />

            <ul className="space-y-2">
              {TRIAL_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {email && (
            <div className="text-sm text-muted-foreground">
              حساب کاربری:{" "}
              <span className="font-medium text-foreground">{email}</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>خطا</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full"
            size="lg"
            onClick={handleStartTrial}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                در حال فعال‌سازی...
              </>
            ) : (
              "شروع دوره آزمایشی"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            با ادامه، فروشگاه شما در مرحله بعد به‌صورت خودکار راه‌اندازی می‌شود.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
