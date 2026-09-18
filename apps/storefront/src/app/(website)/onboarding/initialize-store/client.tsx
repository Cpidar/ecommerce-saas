"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  initializeStore,
  StoreCreationProgress,
  InitializeStoreProgressResponse,
} from "@/lib/medusa/stores-actions";
import { useAuthStore } from "@/store/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { updateCustomerMetadata } from "@/lib/medusa/customer-client";

// Mirrors the percentages set in seedProgress.update() on the backend,
// used only to render a friendly list of milestones.
const MILESTONES = [
  { threshold: 5, label: "کانال فروش و کلید API" },
  { threshold: 15, label: "راه‌اندازی فروشگاه" },
  { threshold: 30, label: "ایجاد منطقه" },
  { threshold: 45, label: "ایجاد انبار" },
  { threshold: 55, label: "تنظیمات ارسال" },
  { threshold: 65, label: "اتصال کانال فروش به انبار" },
  { threshold: 75, label: "دسته‌بندی محصولات" },
  { threshold: 90, label: "ایجاد محصولات" },
  { threshold: 97, label: "موجودی انبار" },
];

export function SeedProgressTracker({
  subscriptionId,
}: {
  subscriptionId: string;
}) {
  const {
    email,
    subscription,
    tempStoreData: { password, name },
  } = useAuthStore();
  const router = useRouter();
  const [state, setState] = useState<InitializeStoreProgressResponse>({
    status: "idle",
    progress: 0,
    step: "در حال آماده‌سازی...",
    error: null,
  });

  const progressKey = subscriptionId;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!subscriptionId) return;
    
    let cancelled = false;
    const lockKey = `init-store:${progressKey}`;
    
    const run = async () => {
      try {
        // prevent double start across remounts in same tab
        if (sessionStorage.getItem(lockKey) === "1") {
          const current = await StoreCreationProgress(progressKey);
          if (!cancelled) setState(current);
          return;
        }

        const current = await StoreCreationProgress(progressKey);
        if (cancelled) return;
        
        if (current.status !== "idle") {
          setState(current);
          if (current.status === "running") {
            sessionStorage.setItem(lockKey, "1");
          }
          return;
        }
        
        setState((s) => ({
          ...s,
          status: "running",
          step: "در حال آماده‌سازی...",
          progress: 0,
          error: null,
        }));
        
        sessionStorage.setItem(lockKey, "1");
        
        if (!subscriptionId || !email || !password || !name) return;
        await initializeStore({
          store: { email, password, store_name: name },
          additional_data: {
            name,
            handle: name,
            subscription_id: subscriptionId,
            subscription_status: "active",
            template: "",
            progressKey,
          },
        })

        if (!cancelled) {
          setState(await StoreCreationProgress(progressKey));
        }
      } catch (err) {
        sessionStorage.removeItem(lockKey);
        if (cancelled) return;
        setState((s) => ({
          ...s,
          status: "failed",
          error: err instanceof Error ? err.message : "خطای ناشناخته",
        }));
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [progressKey, subscriptionId, email, password, name]);

  // Poll while running
  useEffect(() => {
    if (state.status !== "running") return;

    const id = setInterval(async () => {
      try {
        const data = await StoreCreationProgress(progressKey);
        setState(data);
        if (data.status !== "running") clearInterval(id);
      } catch {
        // ignore
      }
    }, 1000);

    return () => clearInterval(id);
  }, [state.status, progressKey]);

  const isDone = state.status === "completed";
  const isFailed = state.status === "failed";

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
    <Card className="w-full max-w-lg mx-auto overflow-hidden" dir="rtl">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <CardTitle className="text-xl">
              {isDone
                ? "فروشگاه شما آماده است"
                : isFailed
                  ? "راه‌اندازی متوقف شد"
                  : "در حال آماده‌سازی فروشگاه"}
            </CardTitle>
            <CardDescription className="leading-relaxed">
              {isFailed
                ? (state.error ??
                  "خطای ناشناخته رخ داده است. می‌توانید دوباره تلاش کنید.")
                : isDone
                  ? "همه مراحل با موفقیت انجام شد. می‌توانید وارد داشبورد شوید."
                  : state.step || "لطفاً چند لحظه صبر کنید..."}
            </CardDescription>
          </div>

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
              isDone
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : isFailed
                  ? "border-destructive/20 bg-destructive/10 text-destructive"
                  : "border-primary/20 bg-primary/10 text-primary"
            }`}
          >
            {isDone && <CheckCircle2 className="h-5 w-5" />}
            {isFailed && <XCircle className="h-5 w-5" />}
            {state.status === "running" && (
              <Loader2 className="h-5 w-5 animate-spin" />
            )}
            {state.status === "idle" && (
              <Loader2 className="h-5 w-5 animate-spin" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>پیشرفت راه‌اندازی</span>
            <span className="tabular-nums font-medium text-foreground">
              {state.progress}%
            </span>
          </div>
          <Progress value={state.progress} className="h-2.5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isFailed ? (
          <div className="rounded-xl border bg-muted/20 p-4">
            <ul className="space-y-3">
              {MILESTONES.map((m) => {
                const reached = state.progress >= m.threshold;
                const isCurrent =
                  !isDone &&
                  reached &&
                  state.progress <
                    (MILESTONES.find((x) => x.threshold > m.threshold)
                      ?.threshold ?? 101);

                return (
                  <li key={m.label} className="flex items-center gap-3 text-sm">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                        reached
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                          : "border-muted-foreground/20 bg-background text-muted-foreground/40"
                      }`}
                    >
                      {reached ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </div>

                    <span
                      className={`transition-colors ${
                        reached
                          ? "text-foreground font-medium"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {m.label}
                    </span>

                    {isCurrent && (
                      <Badge
                        variant="secondary"
                        className="mr-auto text-[10px]"
                      >
                        در حال انجام
                      </Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {state.error ?? "خطای ناشناخته"}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2">
        {isDone && (
          <Button
            className="w-full"
            size="lg"
            onClick={() => updateCustomerMetadata({ onboarding: "completed" })}
          >
            ورود به داشبورد
          </Button>
        )}

        {isFailed && (
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => {
              sessionStorage.removeItem(`init-store:${progressKey}`);
              window.location.reload();
            }}
          >
            تلاش مجدد
          </Button>
        )}

        {state.status === "running" && (
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            این فرایند ممکن است حدود یک تا دو دقیقه زمان ببرد. صفحه را نبندید.
          </p>
        )}
      </CardFooter>
    </Card>
    </div>
  );
}

export default SeedProgressTracker;
