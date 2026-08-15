"use client"

import { Button } from "@/components/ui/button"

export default function StoreError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">خطایی رخ داده است</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        این صفحه قابل دسترس نیست
      </h1>
      <p className="mt-4 text-muted-foreground">
        لطفا بعدا تلاش کنید یا با مدیر سایت تماس بگیرید
      </p>
      <Button onClick={reset} className="mt-8">
        تلاش دوباره
      </Button>
    </div>
  )
}


// JUST for debuging
// "use client";

// import { useEffect } from "react";

// export default function Error({
//   error,
//   reset,
// }: {
//   error: Error & { digest?: string };
//   reset: () => void;
// }) {
//   useEffect(() => {
//     console.error(error);
//   }, [error]);

//   return (
//     <div className="p-8">
//       <h1>Something went wrong</h1>

//       <pre>{error.message}</pre>

//       <pre>{error.stack}</pre>

//       <button onClick={reset}>Retry</button>
//     </div>
//   );
// }