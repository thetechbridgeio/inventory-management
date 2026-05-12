// features/sales/components/refresh-sales-button.tsx

"use client"

import { useState } from "react"

import { Loader2, RefreshCw } from "lucide-react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { useSalesContext } from "../context/sales-provider"

export function RefreshSalesButton() {
  const [refreshing, setRefreshing] = useState(false)

  const { refreshSales } = useSalesContext()

  const handleRefresh = async () => {
    try {
      setRefreshing(true)

      await refreshSales()

      toast.success("Sales refreshed successfully")
    } catch (error) {
      console.error(error)

      toast.error("Failed to refresh sales")
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
