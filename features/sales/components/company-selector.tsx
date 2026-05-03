"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select"

interface CompanySelectorProps {
  isAddingNew: boolean
  companyName: string
  newCompany: string
  companyOptions: SearchableSelectOption[]
  onCompanyChange: (value: string) => void
  onNewCompanyChange: (value: string) => void
  onToggle: () => void
}

export function CompanySelector({
  isAddingNew,
  companyName,
  newCompany,
  companyOptions,
  onCompanyChange,
  onNewCompanyChange,
  onToggle,
}: CompanySelectorProps) {
  if (isAddingNew) {
    return (
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="newCompany" className="text-right">
          New Company
        </Label>
        <div className="col-span-3 flex gap-2">
          <Input
            id="newCompany"
            name="newCompany"
            placeholder="Enter new company name"
            value={newCompany}
            onChange={(e) => onNewCompanyChange(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-10 w-10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="companyName" className="text-right">
          Company
        </Label>
        <div className="col-span-3">
          <SearchableSelect
            options={companyOptions}
            value={companyName}
            onValueChange={onCompanyChange}
            placeholder="Search for a company..."
            emptyMessage="No companies found."
          />
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <div className="col-span-3 col-start-2">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-xs"
            onClick={onToggle}
          >
            + Add New Company
          </Button>
        </div>
      </div>
    </>
  )
}
