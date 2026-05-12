// features/inventory/components/refresh-inventory-button.tsx

"use client"

import { RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useInventoryContext } from "../context/inventory-provider"

export function RefreshInventoryButton() {
  const { refreshInventory, loading } = useInventoryContext()

  return (
    <Button
      variant="outline"
      onClick={refreshInventory}
      disabled={loading}
      className="h-11 rounded-xl"
    >
      <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />

      {loading ? "Refreshing..." : "Refresh"}
    </Button>
  )
}
