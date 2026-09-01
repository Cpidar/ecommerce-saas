"use client"

import { transferCart } from "@/lib/medusa/auth-server"
import { StoreCart, StoreCustomer } from "@medusajs/types"
import { CircleAlert } from "lucide-react"
import { useState } from "react"
import { Button } from "../ui/button"

function CartMismatchBanner(props: {
  customer: StoreCustomer
  cart: StoreCart
}) {
  const { customer, cart } = props
  const [isPending, setIsPending] = useState(false)
  const [actionText, setActionText] = useState("Run transfer again")

  if (!customer || !!cart.customer_id) {
    return
  }

  const handleSubmit = async () => {
    try {
      setIsPending(true)
      setActionText("Transferring..")

      await transferCart()
    } catch {
      setActionText("Run transfer again")
      setIsPending(false)
    }
  }

  return (
    <div className="flex items-center justify-center small:p-4 p-2 text-center bg-orange-300 small:gap-2 gap-1 text-sm mt-2 text-orange-800">
      <div className="flex flex-col small:flex-row small:gap-2 gap-1 items-center">
        <span className="flex items-center gap-1">
          <CircleAlert className="inline" />
          Something went wrong when we tried to transfer your cart
        </span>

        <span>·</span>

        <Button
          variant="link"
          className="hover:bg-transparent active:bg-transparent focus:bg-transparent disabled:text-orange-500 text-orange-950 p-0 bg-transparent"
          disabled={isPending}
          onClick={handleSubmit}
        >
          {actionText}
        </Button>
      </div>
    </div>
  )
}

export default CartMismatchBanner
