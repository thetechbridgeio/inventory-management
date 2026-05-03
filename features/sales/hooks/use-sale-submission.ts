"use client"

import { useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import type { InventoryItem, Supplier } from "@/lib/types"
import type { SearchableSelectOption } from "@/components/ui/searchable-select"
import type { SalesEntryForm, SalesItem } from "@/features/sales/types/sale-entry-form.types"

interface UseSaleSubmissionParams {
  inventoryData: InventoryItem[]
  client?: { id?: string; name?: string } | null
  isAddingNewCompany: boolean
  onSuccess: (params: {
    newSalesItems: SalesItem[]
    updatedInventory: InventoryItem[]
    newCompanies: Supplier[]
  }) => void
  onNewCompanyAdded?: (option: SearchableSelectOption) => void
}

interface UseSaleSubmissionReturn {
  isLoading: boolean
  submitEntries: (entries: SalesEntryForm[]) => Promise<boolean>
}

export function useSaleSubmission({
  inventoryData,
  client,
  isAddingNewCompany,
  onSuccess,
  onNewCompanyAdded,
}: UseSaleSubmissionParams): UseSaleSubmissionReturn {
  const [isLoading, setIsLoading] = useState(false)

  const submitEntries = async (entries: SalesEntryForm[]): Promise<boolean> => {
    // ─────────────────────────────────────────────
    // 1. VALIDATION
    // ─────────────────────────────────────────────
    for (const e of entries) {
      const quantity = Number(e.quantity)

      if (
        !e.product ||
        !e.contact ||
        !quantity ||
        quantity <= 0 ||
        (isAddingNewCompany ? !e.newCompany : !e.companyName)
      ) {
        toast.error("Invalid or missing fields in entries")
        return false
      }
    }

    // ─────────────────────────────────────────────
    // 2. STOCK VALIDATION (PRE-CHECK)
    // ─────────────────────────────────────────────
    const insufficientStock: {
      product: string
      requested: number
      available: number
      unit: string
    }[] = []

    const inventoryMap = new Map(
      inventoryData.map((item) => [item.product, { ...item }])
    )

    for (const entry of entries) {
      const item = inventoryMap.get(entry.product)
      const requested = Number(entry.quantity)

      if (!item || item.stock < requested) {
        insufficientStock.push({
          product: entry.product,
          requested,
          available: item?.stock ?? 0,
          unit: entry.unit,
        })
      }
    }

    if (insufficientStock.length > 0) {
      toast.error("Some items have insufficient stock")
      return false
    }

    setIsLoading(true)

    try {
      // ─────────────────────────────────────────────
      // 3. PROCESS IN PARALLEL
      // ─────────────────────────────────────────────
      const newSalesItems: SalesItem[] = []
      const newCompanies: Supplier[] = []
      const updatedInventory = [...inventoryData]

      const addedCompanies = new Set<string>()

      await Promise.all(
        entries.map(async (entry) => {
          const quantity = Number(entry.quantity)
          const companyName = isAddingNewCompany
            ? entry.newCompany.trim()
            : entry.companyName

          // ── SALES ENTRY ─────────────────────────
          const salesRes = await fetch("/api/sheets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sheetName: "Sales",
              entry: {
                product: entry.product,
                quantity,
                unit: entry.unit,
                contact: entry.contact,
                companyName,
                dateOfIssue: format(entry.dateOfIssue, "yyyy-MM-dd"),
              },
              clientId: client?.id,
            }),
          })

          if (!salesRes.ok) {
            throw new Error(`Failed sale for ${entry.product}`)
          }

          const salesResult = await salesRes.json()
          newSalesItems.push(salesResult.data)

          // ── INVENTORY UPDATE ───────────────────
          const index = updatedInventory.findIndex(
            (i) => i.product === entry.product
          )

          if (index !== -1) {
            const item = updatedInventory[index]
            const newStock = item.stock - quantity
            const newValue = newStock * item.pricePerUnit

            const invRes = await fetch("/api/sheets", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                product: entry.product,
                newStock,
                newValue,
                clientId: client?.id,
              }),
            })

            if (!invRes.ok) {
              throw new Error(`Inventory update failed for ${entry.product}`)
            }

            updatedInventory[index] = {
              ...item,
              stock: newStock,
              value: newValue,
            }
          }

          // ── COMPANY REGISTRATION ───────────────
          if (isAddingNewCompany && entry.newCompany) {
            const normalized = entry.newCompany.trim().toLowerCase()

            if (!addedCompanies.has(normalized)) {
              addedCompanies.add(normalized)

              try {
                const supplierRes = await fetch("/api/sheets", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sheetName: "Suppliers",
                    entry: {
                      supplier: "",
                      companyName: entry.newCompany.trim(),
                    },
                    clientId: client?.id,
                  }),
                })

                if (supplierRes.ok) {
                  const company = entry.newCompany.trim()

                  newCompanies.push({
                    supplier: "",
                    companyName: company,
                  })

                  onNewCompanyAdded?.({
                    value: company,
                    label: company,
                  })
                }
              } catch {
                // non-blocking
              }
            }
          }
        })
      )

      // ─────────────────────────────────────────────
      // 4. SUCCESS HANDLING
      // ─────────────────────────────────────────────
      onSuccess({
        newSalesItems,
        updatedInventory,
        newCompanies,
      })

      toast.success(`${entries.length} entries added successfully`)

      return true
    } catch (error: any) {
      console.error(error)

      toast.error(
        error instanceof Error ? error.message : "Submission failed"
      )

      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, submitEntries }
}