// app/page.tsx
export const instant = false

import { checkAppMode } from "@/lib/utils/app-mode";
import Register from "./client";

export default async function HomePage() {
  const mode = await checkAppMode();

  return <Register appMode={mode} />;
}
