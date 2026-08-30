"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

type SeedState = {
  status: "idle" | "running" | "completed" | "failed"
  progress: number
  step: string
  error: string | null
}

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
]

export function SeedProgressTracker({ storeId }: { storeId?: string }) {
  const router = useRouter()
  const [state, setState] = useState<SeedState>({
    status: "idle",
    progress: 0,
    step: "در حال آماده‌سازی...",
    error: null,
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Kick off the seed job once on mount
  useEffect(() => {
    const start = async () => {
      setState((s) => ({ ...s, status: "running" }))
      try {
        const res = await fetch("/store/initialize-store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId }),
        })
        if (!res.ok && res.status !== 409) {
          throw new Error("خطا در آغاز فرآیند")
        }
      } catch (err) {
        setState((s) => ({
          ...s,
          status: "failed",
          error: err instanceof Error ? err.message : "خطای ناشناخته",
        }))
      }
    }
    start()
  }, [storeId])

  // Poll while running
  useEffect(() => {
    if (state.status !== "running") return

    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch("/store/seed/progress")
        const data: SeedState = await res.json()
        setState(data)
        if (data.status !== "running" && intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      } catch {
        // transient network hiccup — keep polling, don't fail the whole flow
      }
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state.status])

  const isDone = state.status === "completed"
  const isFailed = state.status === "failed"

  return (
    // <Card className="w-full max-w-md mx-auto" dir="rtl">
      <div className="w-full mx-auto space-y-6 mt-6">
        <div className="flex items-center gap-3">
          {isDone && <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />}
          {isFailed && <XCircle className="h-6 w-6 text-destructive shrink-0" />}
          {state.status === "running" && (
            <Loader2 className="h-6 w-6 text-primary shrink-0 animate-spin" />
          )}
          <div className="min-w-0">
            <p className="font-medium leading-none">
              {isDone
                ? "فروشگاه شما آماده است!"
                : isFailed
                ? "مشکلی پیش آمد"
                : "در حال آماده‌سازی فروشگاه"}
            </p>
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {isFailed ? state.error ?? "خطای ناشناخته" : state.step}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={state.progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-left tabular-nums">
            {state.progress}%
          </p>
        </div>

        {!isFailed && (
          <ul className="space-y-1.5">
            {MILESTONES.map((m) => {
              const reached = state.progress >= m.threshold
              return (
                <li
                  key={m.label}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    reached ? "text-foreground" : "text-muted-foreground/50"
                  }`}
                >
                  <CheckCircle2
                    className={`h-3.5 w-3.5 shrink-0 ${
                      reached ? "text-emerald-500" : "text-muted-foreground/30"
                    }`}
                  />
                  {m.label}
                </li>
              )
            })}
          </ul>
        )}

        {isDone && (
          <Button className="w-full" onClick={() => router.push("/account")}>
            ورود به داشبورد مشتری
          </Button>
        )}

        {isFailed && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            تلاش مجدد
          </Button>
        )}
      </div>
    // </Card>
  )
}

export default SeedProgressTracker;
