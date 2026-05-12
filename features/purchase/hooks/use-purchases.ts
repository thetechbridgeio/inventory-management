"use client"

import { useCallback, useEffect, useState } from "react"

import { toast } from "sonner"

import type { Purchase } from "../types/purchase.types"

import { fetchPurchases } from "../services/fetch-purchases"

import { createPurchaseService } from "../services/create-purchase"

import { updatePurchaseService } from "../services/update-purchase"

import { deletePurchaseService } from "../services/delete-purchase"
import { useAuth } from "@/features/auth/context/auth.context"

type UsePurchasesReturn = {
  purchases: Purchase[]

  loading: boolean
  creating: boolean
  updating: boolean
  deleting: boolean

  error: string | null

  refreshPurchases: () => Promise<void>

  createPurchase: (purchase: Purchase) => Promise<boolean>

  updatePurchase: (
    originalPurchase: Purchase,
    updatedPurchase: Purchase
  ) => Promise<boolean>

  deletePurchase: (purchase: Purchase) => Promise<boolean>
}

export function usePurchases(): UsePurchasesReturn {
  const { client, initialized } = useAuth()

  const [purchases, setPurchases] = useState<Purchase[]>([])

  const [loading, setLoading] = useState(false)

  const [creating, setCreating] = useState(false)

  const [updating, setUpdating] = useState(false)

  const [deleting, setDeleting] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const refreshPurchases = useCallback(async () => {
    if (!client?.sheetId) return

    try {
      setLoading(true)
      setError(null)

      const data = await fetchPurchases(client.sheetId)

      setPurchases(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch purchases"

      setError(message)

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [client?.sheetId])

  const createPurchase = useCallback(
    async (purchase: Purchase): Promise<boolean> => {
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

        await createPurchaseService({
          purchase,

          existingPurchases: purchases,

          sheetId: client.sheetId,
        })

        toast.success("Purchase added successfully")

        await refreshPurchases()

        return true
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to add purchase"

        setError(message)

        toast.error(message)

        return false
      } finally {
        setCreating(false)
      }
    },
    [client?.sheetId, initialized, purchases, refreshPurchases]
  )

  const updatePurchase = useCallback(
    async (
      originalPurchase: Purchase,
      updatedPurchase: Purchase
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

        await updatePurchaseService({
          originalPurchase,

          updatedPurchase,

          existingPurchases: purchases,

          sheetId: client.sheetId,
        })

        toast.success("Purchase updated successfully")

        await refreshPurchases()

        return true
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update purchase"

        setError(message)

        toast.error(message)

        return false
      } finally {
        setUpdating(false)
      }
    },
    [client?.sheetId, initialized, purchases, refreshPurchases]
  )

  const deletePurchase = useCallback(
    async (purchase: Purchase): Promise<boolean> => {
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

        await deletePurchaseService({
          purchase,

          sheetId: client.sheetId,
        })

        toast.success("Purchase deleted successfully")

        await refreshPurchases()

        return true
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete purchase"

        setError(message)

        toast.error(message)

        return false
      } finally {
        setDeleting(false)
      }
    },
    [client?.sheetId, initialized, refreshPurchases]
  )

  useEffect(() => {
    if (initialized && client?.sheetId) {
      refreshPurchases()
    }
  }, [initialized, client?.sheetId, refreshPurchases])

  return {
    purchases,

    loading,
    creating,
    updating,
    deleting,

    error,

    refreshPurchases,

    createPurchase,
    updatePurchase,
    deletePurchase,
  }
}
