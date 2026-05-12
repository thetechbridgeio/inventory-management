// features/suppliers/components/refresh-button.tsx

"use client"

import { RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useSuppliersContext } from "../context/supplier-provider"

export function RefreshSuppliersButton() {
  const { refreshSuppliers, loading } = useSuppliersContext()

  return (
    <Button
      variant="outline"
      onClick={refreshSuppliers}
      disabled={loading}
      className="h-11 rounded-xl"
    >
      <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />

      {loading ? "Refreshing..." : "Refresh"}
    </Button>
  )
}
