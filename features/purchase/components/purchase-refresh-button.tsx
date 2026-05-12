// features/purchases/components/refresh-purchases-button.tsx

"use client"

import { useState } from "react"

import { Loader2, RefreshCw } from "lucide-react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { usePurchasesContext } from "../context/purchase-provider"

export function RefreshPurchasesButton() {
  const [refreshing, setRefreshing] = useState(false)

  const { refreshPurchases } = usePurchasesContext()

  const handleRefresh = async () => {
    try {
      setRefreshing(true)

      await refreshPurchases()

      toast.success("Purchases refreshed successfully")
    } catch (error) {
      console.error(error)

      toast.error("Failed to refresh purchases")
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleRefresh}
      disabled={refreshing}
      className="rounded-xl"
    >
      {refreshing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Refreshing...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </>
      )}
    </Button>
  )
}
