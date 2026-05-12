"use client"

import { useCallback, useEffect, useState } from "react"

import { toast } from "sonner"

import { Inventory } from "../types/inventory.types"

import { fetchInventory } from "../services/fetch-inventory"

import { createInventoryService } from "../services/create-inventory"

import { updateInventoryService } from "../services/update-inventory"

import { deleteInventoryService } from "../services/delete-inventory"
import { useAuth } from "@/features/auth/context/auth.context"

type UseInventoryReturn = {
  inventory: Inventory[]

  loading: boolean
  creating: boolean
  updating: boolean
  deleting: boolean

  error: string | null

  refreshInventory: () => Promise<void>

  createInventory: (inventory: Inventory) => Promise<boolean>

  updateInventory: (
    originalInventory: Inventory,
    updatedInventory: Inventory
  ) => Promise<boolean>

  deleteInventory: (inventory: Inventory) => Promise<boolean>
}

export function useInventory(): UseInventoryReturn {
  const { client, initialized } = useAuth()

  const [inventory, setInventory] = useState<Inventory[]>([])

  const [loading, setLoading] = useState(false)

  const [creating, setCreating] = useState(false)

  const [updating, setUpdating] = useState(false)

  const [deleting, setDeleting] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const refreshInventory = useCallback(async () => {
    if (!client?.sheetId) return

    try {
      setLoading(true)
      setError(null)

      const data = await fetchInventory(client.sheetId)

      setInventory(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch inventory"

      setError(message)

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [client?.sheetId])

  const createInventory = useCallback(
    async (inventoryItem: Inventory): Promise<boolean> => {
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

        const success = await createInventoryService({
          inventory: inventoryItem,

          existingInventory: inventory,

          sheetId: client.sheetId,
        })

        if (!success) {
          return false
        }

        await refreshInventory()

        return true
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create inventory"

        setError(message)

        toast.error(message)

        return false
      } finally {
        setCreating(false)
      }
    },
    [client?.sheetId, initialized, inventory, refreshInventory]
  )

  const updateInventory = useCallback(
    async (
      originalInventory: Inventory,
      updatedInventory: Inventory
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

        const success = await updateInventoryService({
          originalInventory,
          updatedInventory,
          existingInventory: inventory,
          sheetId: client.sheetId,
        })

        if (!success) {
          return false
        }

        await refreshInventory()

        return true
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update inventory"

        setError(message)

        toast.error(message)

        return false
      } finally {
        setUpdating(false)
      }
    },
    [client?.sheetId, initialized, inventory, refreshInventory]
  )

  const deleteInventory = useCallback(
    async (inventoryItem: Inventory): Promise<boolean> => {
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

        const success = await deleteInventoryService({
          inventory: inventoryItem,

          sheetId: client.sheetId,
        })

        if (!success) {
          return false
        }

        await refreshInventory()

        return true
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete inventory"

        setError(message)

        toast.error(message)

        return false
      } finally {
        setDeleting(false)
      }
    },
    [client?.sheetId, initialized, refreshInventory]
  )

  useEffect(() => {
    if (initialized && client?.sheetId) {
      refreshInventory()
    }
  }, [initialized, client?.sheetId, refreshInventory])

  return {
    inventory,

    loading,
    creating,
    updating,
    deleting,

    error,

    refreshInventory,

    createInventory,
    updateInventory,
    deleteInventory,
  }
}
