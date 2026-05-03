"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { getSalesTerm } from "@/lib/client-terminology"
import type { InventoryItem, Supplier } from "@/lib/types"
import type { SearchableSelectOption } from "@/components/ui/searchable-select"

import { emptyEntry, SalesItem, type SalesEntryForm } from "../types/sale-entry-form.types"
import { SaleEntryRow } from "./sale-entry-row" 
import { useSaleSubmission } from "../hooks/use-sale-submission" 

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddSaleDialogProps {
  productOptions: SearchableSelectOption[]
  companyOptions: SearchableSelectOption[]
  inventoryData: InventoryItem[]
  client?: { id?: string; name?: string } | null
  onSuccess: (params: {
    newSalesItems: SalesItem[]
    updatedInventory: InventoryItem[]
    newCompanies: Supplier[]
  }) => void
  onNewCompanyAdded?: (option: SearchableSelectOption) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AddSaleDialog({
  productOptions,
  companyOptions,
  inventoryData,
  client,
  onSuccess,
  onNewCompanyAdded,
}: AddSaleDialogProps) {
  // ── Dialog & form state ───────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false)
  const [isAddingNewCompany, setIsAddingNewCompany] = useState(false)
  const [formEntries, setFormEntries] = useState<SalesEntryForm[]>([emptyEntry()])

  const salesTerm = getSalesTerm(client?.name)

  // ── Submission hook ───────────────────────────────────────────────────────
  const { isLoading, submitEntries } = useSaleSubmission({
    inventoryData,
    client,
    isAddingNewCompany,
    onSuccess,
    onNewCompanyAdded,
  })

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormEntries([emptyEntry()])
    setIsAddingNewCompany(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) resetForm()
  }

  // ── Entry-level updaters ──────────────────────────────────────────────────
  const updateEntry = (index: number, patch: Partial<SalesEntryForm>) =>
    setFormEntries((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...patch }
      return next
    })

  const handleProductChange = (product: string, index: number) => {
    const match = inventoryData.find((item) => item.product === product)
    updateEntry(index, { product, unit: match ? match.unit : formEntries[index].unit })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    updateEntry(index, { [e.target.name]: e.target.value })
  }

  // ── Shared-field updaters (apply to all entries) ──────────────────────────
  const setAllEntries = (patch: Partial<SalesEntryForm>) =>
    setFormEntries((prev) => prev.map((e) => ({ ...e, ...patch })))

  const handleContactChange = (value: string) => setAllEntries({ contact: value })
  const handleCompanyChange = (value: string) => setAllEntries({ companyName: value })
  const handleNewCompanyChange = (value: string) => setAllEntries({ newCompany: value })
  const handleDateChange = (date: Date) => setAllEntries({ dateOfIssue: date })

  const handleToggleNewCompany = () => {
    if (!isAddingNewCompany) setAllEntries({ companyName: "" })
    else setAllEntries({ newCompany: "" })
    setIsAddingNewCompany((v) => !v)
  }

  // ── Add / remove entries ──────────────────────────────────────────────────
  const addEntry = () =>
    setFormEntries((prev) => [
      ...prev,
      {
        ...emptyEntry(),
        contact: prev[0].contact,
        companyName: isAddingNewCompany ? "" : prev[0].companyName,
        newCompany: isAddingNewCompany ? prev[0].newCompany : "",
        dateOfIssue: prev[0].dateOfIssue,
      },
    ])

  const removeEntry = (index: number) => {
    if (formEntries.length <= 1) return
    setFormEntries((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await submitEntries(formEntries)
    if (success) {
      resetForm()
      setIsOpen(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add {salesTerm}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New {salesTerm}</DialogTitle>
          <DialogDescription>
            Enter the details of the new {salesTerm.toLowerCase()} entries.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {formEntries.map((entry, index) => (
            <SaleEntryRow
              key={index}
              entry={entry}
              index={index}
              productOptions={productOptions}
              onProductChange={handleProductChange}
              onInputChange={handleInputChange}
              onRemove={removeEntry}
              isAddingNewCompany={isAddingNewCompany}
              companyOptions={companyOptions}
              onContactChange={handleContactChange}
              onCompanyChange={handleCompanyChange}
              onNewCompanyChange={handleNewCompanyChange}
              onDateChange={handleDateChange}
              onToggleNewCompany={handleToggleNewCompany}
            />
          ))}

          <div className="flex justify-center my-4">
            <Button type="button" variant="outline" onClick={addEntry} className="w-full max-w-xs">
              <Plus className="mr-2 h-4 w-4" />
              Add Another Entry
            </Button>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Adding...
                </>
              ) : (
                `Add ${formEntries.length} ${salesTerm} ${formEntries.length > 1 ? "Entries" : "Entry"}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}