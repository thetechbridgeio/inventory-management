// features/suppliers/hooks/use-suppliers.ts

"use client"

import { useCallback, useEffect, useState } from "react"

import { toast } from "sonner"

import { Supplier } from "../types/supplier.types"

import { SUPPLIER_SHEET_NAME } from "../constants/supplier.constants"

import {
  normalizeSupplier,
  supplierExists,
  suppliersMatch,
} from "../handlers/supplier.handlers"
import { useAuth } from "@/features/auth/context/auth.context"

type ClientSession = {
  id: string
  sheetId: string
}

type UseSuppliersReturn = {
  suppliers: Supplier[]

  loading: boolean
  creating: boolean
  updating: boolean
  deleting: boolean

  error: string | null

  refreshSuppliers: () => Promise<void>

  createSupplier: (supplier: Supplier) => Promise<boolean>

  updateSupplier: (
    originalSupplier: Supplier,
    updatedSupplier: Supplier
  ) => Promise<boolean>

  deleteSupplier: (supplier: Supplier) => Promise<boolean>
}

export function useSuppliers(): UseSuppliersReturn {
  const { client, initialized } = useAuth()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ─────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────

  const refreshSuppliers = useCallback(async () => {
    if (!client?.sheetId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/sheets?sheet=${SUPPLIER_SHEET_NAME}&sheetId=${client.sheetId}`,
        {
          method: "GET",
          cache: "no-store",
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch suppliers")
      }

      setSuppliers(result.data || [])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch suppliers"

      setError(message)

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [client?.sheetId])

  // ─────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────

  const createSupplier = useCallback(
    async (supplier: Supplier): Promise<boolean> => {
      if (!initialized) {
        toast.error("Client still loading")

        return false
      }

      if (!client?.id) {
        toast.error("Client not found")

        return false
      }

      try {
        setCreating(true)
        setError(null)

        const normalizedSupplier = normalizeSupplier(supplier)

        const alreadyExists = supplierExists(suppliers, normalizedSupplier)

        if (alreadyExists) {
          toast.error("Supplier already exists")

          return false
        }

        toast.loading("Adding supplier...")

        const response = await fetch("/api/sheets", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            sheetName: SUPPLIER_SHEET_NAME,

            entry: normalizedSupplier,

            sheetId: client.sheetId,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to add supplier")
        }

        toast.dismiss()

        toast.success("Supplier added successfully")

        await refreshSuppliers()

        return true
      } catch (err) {
        toast.dismiss()

        const message =
          err instanceof Error ? err.message : "Failed to add supplier"

        setError(message)

        toast.error(message)

        return false
      } finally {
        setCreating(false)
      }
    },
    [client, suppliers, refreshSuppliers]
  )

  // ─────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────

  const updateSupplier = useCallback(
    async (
      originalSupplier: Supplier,
      updatedSupplier: Supplier
    ): Promise<boolean> => {
      if (!initialized) {
        toast.error("Client still loading")

        return false
      }

      if (!client?.id) {
        toast.error("Client not found")

        return false
      }

      try {
        setUpdating(true)
        setError(null)

        const normalizedSupplier = normalizeSupplier(updatedSupplier)

        const duplicateExists = suppliers.some((supplier) => {
          if (suppliersMatch(supplier, originalSupplier)) {
            return false
          }

          return suppliersMatch(supplier, normalizedSupplier)
        })

        if (duplicateExists) {
          toast.error("Another supplier already exists")

          return false
        }

        toast.loading("Updating supplier...")

        const response = await fetch("/api/sheet-rows", {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            sheetName: SUPPLIER_SHEET_NAME,

            match: {
              companyName: originalSupplier.companyName,

              phoneNumber: originalSupplier.phoneNumber,
            },

            updates: normalizedSupplier,

            sheetId: client.sheetId,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to update supplier")
        }

        toast.dismiss()

        toast.success("Supplier updated successfully")

        await refreshSuppliers()

        return true
      } catch (err) {
        toast.dismiss()

        const message =
          err instanceof Error ? err.message : "Failed to update supplier"

        setError(message)

        toast.error(message)

        return false
      } finally {
        setUpdating(false)
      }
    },
    [client, suppliers, refreshSuppliers]
  )

  // ─────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────

  const deleteSupplier = useCallback(
    async (supplier: Supplier): Promise<boolean> => {
      if (!initialized) {
        toast.error("Client still loading")

        return false
      }

      if (!client?.id) {
        toast.error("Client not found")

        return false
      }

      try {
        setDeleting(true)
        setError(null)

        toast.loading("Deleting supplier...")

        const response = await fetch("/api/sheet-rows", {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            sheetName: SUPPLIER_SHEET_NAME,

            items: [supplier],

            matchFields: ["companyName", "phoneNumber"],

            sheetId: client.sheetId,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to delete supplier")
        }

        toast.dismiss()

        toast.success("Supplier deleted successfully")

        await refreshSuppliers()

        return true
      } catch (err) {
        toast.dismiss()

        const message =
          err instanceof Error ? err.message : "Failed to delete supplier"

        setError(message)

        toast.error(message)

        return false
      } finally {
        setDeleting(false)
      }
    },
    [client, refreshSuppliers]
  )

  // ─────────────────────────────────────
  // INITIAL LOAD
  // ─────────────────────────────────────

  useEffect(() => {
    if (initialized && client?.sheetId) {
      refreshSuppliers()
    }
  }, [client, refreshSuppliers])

  return {
    suppliers,

    loading,
    creating,
    updating,
    deleting,

    error,

    refreshSuppliers,

    createSupplier,
    updateSupplier,
    deleteSupplier,
  }
}
