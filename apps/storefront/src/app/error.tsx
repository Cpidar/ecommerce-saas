"use client"

import { Button } from "@/components/ui/button"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">500</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        خطایی رخ داده است
      </h1>
      <p className="mt-4 text-muted-foreground">
        یک خطای غیرمنتظره رخ داده است لطفا بعدا امتحان کنید
      </p>
      <Button onClick={reset} className="mt-8">
        تلاش دوباره
      </Button>
    </div>
  )
}
