// utils/initialize-store-progress.ts
import { Modules } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework"

export type SeedState = {
  status: "idle" | "running" | "completed" | "failed"
  progress: number
  step: string
  error: string | null
}

export const DEFAULT: SeedState = {
  status: "idle",
  progress: 0,
  step: "در حال آماده‌سازی...",
  error: null,
}

function getKey(progressKey: string) {
  return `store:seed:progress:${progressKey}`
}

/**
 * Factory – keeps the same method names as before
 * Usage:
 *   const progress = createSeedProgress(container, progressKey)
 *   await progress.update(45, "ایجاد انبار")
 */
export function createSeedProgress(
  container: MedusaContainer,
  progressKey: string
) {
  const caching = container.resolve(Modules.CACHING)
  const key = getKey(progressKey)

  return {
    async get(): Promise<SeedState> {
      const data = await caching.get({ key })
      console.log((data && Object.keys(data).length > 0) ? data : DEFAULT)
      return (data && Object.keys(data).length > 0) ? data : DEFAULT
    },

    async start() {
      await caching.set({
        key,
        data: {
          status: "running",
          progress: 0,
          step: "شروع فرآیند...",
          error: null,
        } satisfies SeedState,
      })
    },

    async update(progress: number, step: string) {
      const current = await this.get()
      await caching.set({
        key,
        data: {
          ...current,
          status: "running",
          progress,
          step,
        } satisfies SeedState,
      })
    },

    async complete() {
      await caching.set({
        key,
        data: {
          status: "completed",
          progress: 100,
          step: "فروشگاه شما آماده است!",
          error: null,
        } satisfies SeedState,
      })
    },

    async fail(error: string) {
      const current = await this.get()
      await caching.set({
        key,
        data: {
          ...current,
          status: "failed",
          error,
          step: "مشکلی پیش آمد",
        } satisfies SeedState,
      })
    },

    async reset() {
      await caching.clear({ key })
    },
  }
}