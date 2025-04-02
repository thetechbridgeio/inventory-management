"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Search and select...",
  emptyMessage = "No results found.",
  className,
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const selectedOption = options.find((option) => option.value === value)

  const filteredOptions = React.useMemo(() => {
    const filtered = options.filter((option) => {
      // Ensure label is a string before calling toLowerCase
      const label = typeof option.label === "string" ? option.label : String(option.label || "")
      const query = searchQuery.toLowerCase()
      return label.toLowerCase().includes(query)
    })
    return filtered
  }, [options, searchQuery])

  const handleSelect = (currentValue: string) => {
    onValueChange?.(currentValue)
    setOpen(false)
    setSearchQuery("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange?.("")
    setSearchQuery("")
  }

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          {selectedOption && !disabled ? (
            <X className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100" onClick={handleClear} />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]">
        <div className="flex flex-col">
          <div className="flex items-center border-b p-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-8 w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredOptions.length > 0 ? (
              <div className="flex flex-col py-1">
                {filteredOptions.map((option, index) => (
                  <div
                    key={`${option.value}-${index}`}
                    className={cn(
                      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                      value === option.value && "bg-accent text-accent-foreground",
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                    {option.label || ""}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

