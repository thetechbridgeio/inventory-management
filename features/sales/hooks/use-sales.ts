"use client"

import { useCallback, useEffect, useState } from "react"

import { toast } from "sonner"

import { SalesItem } from "../types/sales.types"

import { useAuth } from "@/features/auth/context/auth.context"

import { fetchSales } from "../services/fetch-sales"
import { createSales } from "../services/create-sales"
import { updateSales } from "../services/update-sales"
import { deleteSales } from "../services/delete-sales"
import { Inventory } from "@/features/inventory/types/inventory.types"
import { useInventoryContext } from "@/features/inventory/context/inventory-provider"

type UseSalesReturn = {
  sales: SalesItem[]

  loading: boolean
  creating: boolean
  updating: boolean
  deleting: boolean

  error: string | null

  refreshSales: () => Promise<void>

  createSales: (
    salesItem: SalesItem,
    inventoryData: Inventory
  ) => Promise<boolean>

  updateSales: (
    originalSales: SalesItem,
    updatedSales: SalesItem
  ) => Promise<boolean>

  deleteSales: (salesItem: SalesItem) => Promise<boolean>
}

export function useSales(): UseSalesReturn {
  const { client, initialized } = useAuth()
  const { updateInventory } = useInventoryContext()

  const [sales, setSales] = useState<SalesItem[]>([])

  const [loading, setLoading] = useState(false)

  const [creating, setCreating] = useState(false)

  const [updating, setUpdating] = useState(false)

  const [deleting, setDeleting] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const refreshSales = useCallback(async () => {
    if (!initialized) {
      toast.error("Client still loading")

      return
    }

    if (!client?.sheetId) {
      toast.error("Client not found")

      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await fetchSales({
        sheetId: client.sheetId,
      })

      setSales(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch Outgoings"

      setError(message)

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [initialized, client?.sheetId])

  const handleCreateSales = useCallback(
    async (
      salesItem: SalesItem,
      inventoryData: Inventory
    ): Promise<boolean> => {
      if (!initialized) {
        toast.error("Client still loading")

        return false
      }

      if (!client?.sheetId) {
        toast.error("Client not found")

        return false
      }

      try {
        setCreating(true)
        setError(null)

        const updateInventoryPayload = {
          ...inventoryData,
          stock: inventoryData.stock - salesItem.quantity,
        }

        await createSales({
          sales,
          salesItem,
          sheetId: client.sheetId,
        })

        await updateInventory(inventoryData, updateInventoryPayload)

        toast.success("Outgoing item added successfully")

        await refreshSales()

        return true
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to add outgoings item"

        setError(message)

        toast.error(message)

        return false
      } finally {
        setCreating(false)
      }
    },
    [initialized, client?.sheetId, sales, refreshSales]
  )

  const handleUpdateSales = useCallback(
    async (
      originalSales: SalesItem,
      updatedSales: SalesItem
    ): Promise<boolean> => {
      if (!initialized) {
        toast.error("Client still loading")

        return false
      }

      if (!client?.sheetId) {
        toast.error("Client not found")

        return false
      }

      try {
        setUpdating(true)
        setError(null)

        await updateSales({
          sales,
          originalSales,
          updatedSales,
          sheetId: client.sheetId,
        })

        toast.success("Sales item updated successfully")

        await refreshSales()

        return true
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update sales item"

        setError(message)

        toast.error(message)

        return false
      } finally {
        setUpdating(false)
      }
    },
    [initialized, client?.sheetId, sales, refreshSales]
  )

  const handleDeleteSales = useCallback(
    async (salesItem: SalesItem): Promise<boolean> => {
      if (!initialized) {
        toast.error("Client still loading")

        return false
      }

      if (!client?.sheetId) {
        toast.error("Client not found")

        return false
      }

      try {
        setDeleting(true)
        setError(null)

        await deleteSales({
          salesItem,
          sheetId: client.sheetId,
        })

        toast.success("Sales item deleted successfully")

        await refreshSales()

        return true
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete sales item"

        setError(message)

        toast.error(message)

        return false
      } finally {
        setDeleting(false)
      }
    },
    [initialized, client?.sheetId, refreshSales]
  )

  useEffect(() => {
    if (initialized && client?.sheetId) {
      refreshSales()
    }
  }, [initialized, client?.sheetId, refreshSales])

  return {
    sales,

    loading,
    creating,
    updating,
    deleting,

    error,

    refreshSales,

    createSales: handleCreateSales,
    updateSales: handleUpdateSales,
    deleteSales: handleDeleteSales,
  }
}
