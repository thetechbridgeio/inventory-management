"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MinusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select"
import { SharedSaleFields } from "./shared-sale-fields" 
import type { SalesEntryForm } from "../types/sale-entry-form.types"

interface SaleEntryRowProps {
  entry: SalesEntryForm
  index: number
  // Product dropdown options
  productOptions: SearchableSelectOption[]
  // Handlers scoped to this row
  onProductChange: (product: string, index: number) => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void
  onRemove: (index: number) => void
  // Shared-field props — only rendered for index === 0
  isAddingNewCompany: boolean
  companyOptions: SearchableSelectOption[]
  onContactChange: (value: string) => void
  onCompanyChange: (value: string) => void
  onNewCompanyChange: (value: string) => void
  onDateChange: (date: Date) => void
  onToggleNewCompany: () => void
}

export function SaleEntryRow({
  entry,
  index,
  productOptions,
  onProductChange,
  onInputChange,
  onRemove,
  isAddingNewCompany,
  companyOptions,
  onContactChange,
  onCompanyChange,
  onNewCompanyChange,
  onDateChange,
  onToggleNewCompany,
}: SaleEntryRowProps) {
  const isFirst = index === 0

  return (
    <div className={cn("py-4", !isFirst && "border-t border-gray-200 mt-4")}>
      {/* Row header — only for non-first entries */}
      {!isFirst && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium">Entry #{index + 1}</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <MinusCircle className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {/* Product */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`product-${index}`} className="text-right">
            Product
          </Label>
          <div className="col-span-3">
            <SearchableSelect
              options={productOptions}
              value={entry.product}
              onValueChange={(value) => onProductChange(value, index)}
              placeholder="Search for a product..."
              emptyMessage="No products found."
            />
          </div>
        </div>

        {/* Quantity */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`quantity-${index}`} className="text-right">
            Quantity
          </Label>
          <Input
            id={`quantity-${index}`}
            name="quantity"
            type="number"
            value={entry.quantity}
            onChange={(e) => onInputChange(e, index)}
            className="col-span-3"
          />
        </div>

        {/* Unit (auto-filled, read-only) */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`unit-${index}`} className="text-right">
            Unit
          </Label>
          <Input
            id={`unit-${index}`}
            name="unit"
            value={entry.unit}
            readOnly
            className="col-span-3 bg-muted"
          />
        </div>

        {/* Shared fields — contact, company, date — only on the first entry */}
        {isFirst && (
          <SharedSaleFields
            contact={entry.contact}
            companyName={entry.companyName}
            newCompany={entry.newCompany}
            dateOfIssue={entry.dateOfIssue}
            isAddingNewCompany={isAddingNewCompany}
            companyOptions={companyOptions}
            onContactChange={onContactChange}
            onCompanyChange={onCompanyChange}
            onNewCompanyChange={onNewCompanyChange}
            onDateChange={onDateChange}
            onToggleNewCompany={onToggleNewCompany}
          />
        )}
      </div>
    </div>
  )
}
