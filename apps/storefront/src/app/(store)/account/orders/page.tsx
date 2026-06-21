"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { Card, CardContent } from "@/components/ui/card"
import { Package } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { listMyOrders } from "@/lib/customer-client"
import { formatPrice, formatDate } from "@/lib/utils/utils"
import { useTranslations } from "next-intl"

type StoreOrder = HttpTypes.StoreOrder

export default function OrdersPage() {
  const tAccount = useTranslations("account")
  const tCommon = useTranslations("common")
  const { isReady } = useAuthGuard()
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!isReady) return
    let cancelled = false
    listMyOrders().then(({ orders }) => {
      if (!cancelled) {
        setOrders(orders)
        setLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [isReady])

  if (!isReady) return null

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title={tAccount("orderHistory")}
        description={
          orders.length > 0
            ? `${orders.length} ${
                orders.length === 1 ? tCommon("order") : tCommon("orders")
              }`
            : undefined
        }
      />

      {!loaded ? (
        <p className="mt-8 text-sm text-muted-foreground">
          {tCommon("loading")}
        </p>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title={tAccount("noOrders")}
          description={tAccount("noOrdersDescription")}
          actionLabel={tCommon("startShopping")}
          actionHref="/shop"
        />
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const currency = (order.currency_code ?? "usd").toLowerCase()
            return (
              <Link key={order.id} href={(`/account/orders/${order.id}`)} className="block">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {order.display_id
                          ? tAccount("orderNumberLabel", {
                              number: `#${order.display_id}`,
                            })
                          : order.id}
                      </p>
                      {order.created_at && (
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {order.status && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                          {order.status}
                        </span>
                      )}
                      <span className="text-sm font-medium tabular-nums">
                        {formatPrice(order.total ?? 0, currency)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    {(order.items ?? []).map((item) => (
                      <span key={item.id} className="mr-3">
                        {item.product_title ?? item.title} &times; {item.quantity}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
