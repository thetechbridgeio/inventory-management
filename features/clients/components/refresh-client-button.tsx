// features/clients/components/refresh-clients-button.tsx

"use client"

import { RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useClients } from "../hooks/use-clients"

export function RefreshClientsButton() {
  const { refreshClients, loading } = useClients()

  const handleRefresh = async () => {
    await refreshClients()
  }

  return (
    <Button
      variant="outline"
      onClick={handleRefresh}
      disabled={loading}
      className="rounded-xl"
    >
      <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />

      {loading ? "Refreshing..." : "Refresh"}
    </Button>
  )
}
