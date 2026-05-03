"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { CompanySelector } from "./company-selector" 
import type { SearchableSelectOption } from "@/components/ui/searchable-select"

interface SharedSaleFieldsProps {
  contact: string
  companyName: string
  newCompany: string
  dateOfIssue: Date
  isAddingNewCompany: boolean
  companyOptions: SearchableSelectOption[]
  onContactChange: (value: string) => void
  onCompanyChange: (value: string) => void
  onNewCompanyChange: (value: string) => void
  onDateChange: (date: Date) => void
  onToggleNewCompany: () => void
}

export function SharedSaleFields({
  contact,
  companyName,
  newCompany,
  dateOfIssue,
  isAddingNewCompany,
  companyOptions,
  onContactChange,
  onCompanyChange,
  onNewCompanyChange,
  onDateChange,
  onToggleNewCompany,
}: SharedSaleFieldsProps) {
  return (
    <>
      {/* Contact */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="contact" className="text-right">
          Contact
        </Label>
        <Input
          id="contact"
          name="contact"
          value={contact}
          onChange={(e) => onContactChange(e.target.value)}
          className="col-span-3"
        />
      </div>

      {/* Company — delegates to CompanySelector */}
      <CompanySelector
        isAddingNew={isAddingNewCompany}
        companyName={companyName}
        newCompany={newCompany}
        companyOptions={companyOptions}
        onCompanyChange={onCompanyChange}
        onNewCompanyChange={onNewCompanyChange}
        onToggle={onToggleNewCompany}
      />

      {/* Date */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Date</Label>
        <div className="col-span-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateOfIssue && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateOfIssue ? format(dateOfIssue, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateOfIssue}
                onSelect={(date) => onDateChange(date ?? new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  )
}
