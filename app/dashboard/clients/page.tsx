"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

import { RefreshCcw, Plus } from "lucide-react"

import { useClientContext } from "@/context/client-context"
import { Client } from "@/lib/types"
import { getClients } from "@/lib/api/clients"

import { ClientForm } from "@/components/clients/client-form"
import { ClientTable } from "@/components/clients/client-table"

export default function ClientsPage() {
  const router = useRouter()
  const { client: selectedClient, setClient } = useClientContext()

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  // 🔐 Role Guard
  useEffect(() => {
    const role = sessionStorage.getItem("userRole")

    if (role !== "admin") {
      toast.error("You don't have permission to access this page")
      router.push("/dashboard/inventory")
    }
  }, [router])

  // 📡 Fetch Clients
  const fetchClients = useCallback(async () => {
    try {
      setError(null)
      setRefreshing(true)

      const res = await getClients()

      if (!res?.data || !Array.isArray(res.data)) {
        throw new Error(res?.error || "Invalid API response")
      }

      setClients(res.data)
    } catch (err: any) {
      console.error("Fetch clients error:", err)
      setError(err.message || "Failed to fetch clients")
      toast.error("Failed to fetch clients")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  // ✅ Add Client (from form)
  const handleAddClient = (client: Client) => {
    setClients((prev) => [client, ...prev])
    setOpen(false)
  }

  // ✅ Select Client
  const handleSelectClient = (client: Client) => {
    setClient(client)
    toast.success(`Selected client: ${client.name}`)
  }

  // 🔄 Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  // ❌ Error State
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Client Management</h1>
          <Button
            variant="outline"
            onClick={fetchClients}
            disabled={refreshing}
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Retry
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Loading Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check your API or Google Sheets configuration.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ✅ Main UI
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Client Management
          </h1>
          <p className="text-muted-foreground">
            Manage clients, credentials, and data access
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={fetchClients}
            disabled={refreshing}
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>

              <ClientForm onSuccess={handleAddClient} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
        </CardHeader>

        <CardContent>
          <ClientTable
            clients={clients}
            selectedClient={selectedClient}
            onSelect={handleSelectClient}
          />
        </CardContent>
      </Card>
    </div>
  )
}