// features/sales/components/sales-filter-dropdown.tsx

"use client"

import { useMemo } from "react"

import { CalendarIcon, Filter, X } from "lucide-react"

import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"

import { Button } from "@/components/ui/button"

import { Calendar } from "@/components/ui/calendar"

import { Checkbox } from "@/components/ui/checkbox"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { ScrollArea } from "@/components/ui/scroll-area"

import { cn } from "@/lib/utils"
import { SalesItem } from "../../types/sales.types"

export type SalesFilters = {
  products: string[]

  companies: string[]

  startDate?: Date

  endDate?: Date
}

type Props = {
  sales: SalesItem[]

  filters: SalesFilters

  onFiltersChange: (filters: SalesFilters) => void
}

export function SalesFilterDropdown({
  sales,
  filters,
  onFiltersChange,
}: Props) {
  const products = useMemo(() => {
    return Array.from(new Set(sales.map((item) => item.product.trim()))).sort(
      (a, b) => a.localeCompare(b)
    )
  }, [sales])

  const companies = useMemo(() => {
    return Array.from(
      new Set(sales.map((item) => item.companyName.trim()))
    ).sort((a, b) => a.localeCompare(b))
  }, [sales])

  const totalFilters =
    filters.products.length +
    filters.companies.length +
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0)

  const toggleValue = (current: string[], value: string) => {
    if (current.includes(value)) {
      return current.filter((item) => item !== value)
    }

    return [...current, value]
  }

  const clearFilters = () => {
    onFiltersChange({
      products: [],
      companies: [],
      startDate: undefined,
      endDate: undefined,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-xl">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {totalFilters > 0 && (
            <Badge className="ml-2 rounded-full px-2 py-0 text-xs">
              {totalFilters}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[380px] rounded-2xl p-0">
        <ScrollArea className="h-112">
          <div className="space-y-6 p-4">
            {/* PRODUCTS */}
            <FilterSection
              title="Products"
              description="Select one or multiple products."
            >
              <div className="rounded-2xl border">
                <ScrollArea className="h-[180px]">
                  <div className="space-y-1 p-2">
                    {products.map((product) => (
                      <CheckboxRow
                        key={product}
                        label={product}
                        checked={filters.products.includes(product)}
                        onCheckedChange={() => {
                          onFiltersChange({
                            ...filters,

                            products: toggleValue(filters.products, product),
                          })
                        }}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </FilterSection>

            {/* COMPANIES */}
            <FilterSection
              title="Companies"
              description="Filter by one or multiple client companies."
            >
              <div className="rounded-2xl border">
                <ScrollArea className="h-[180px]">
                  <div className="space-y-1 p-2">
                    {companies.map((company) => (
                      <CheckboxRow
                        key={company}
                        label={company}
                        checked={filters.companies.includes(company)}
                        onCheckedChange={() => {
                          onFiltersChange({
                            ...filters,

                            companies: toggleValue(filters.companies, company),
                          })
                        }}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </FilterSection>

            {/* DATE RANGE */}
            <FilterSection
              title="Date Range"
              description="Filter sales records between issue dates."
            >
              <div className="grid gap-4">
                {/* START DATE */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Start Date
                  </p>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start rounded-xl text-left font-normal",
                          !filters.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />

                        {filters.startDate ? (
                          format(filters.startDate, "PPP")
                        ) : (
                          <span>Select start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.startDate}
                        onSelect={(date) => {
                          onFiltersChange({
                            ...filters,

                            startDate: date,
                          })
                        }}
                        // initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* END DATE */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    End Date
                  </p>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start rounded-xl text-left font-normal",
                          !filters.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />

                        {filters.endDate ? (
                          format(filters.endDate, "PPP")
                        ) : (
                          <span>Select end date</span>
                        )}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.endDate}
                        onSelect={(date) => {
                          onFiltersChange({
                            ...filters,

                            endDate: date,
                          })
                        }}
                        // initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </FilterSection>
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type FilterSectionProps = {
  title: string

  description: string

  children: React.ReactNode
}

function FilterSection({ title, description, children }: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">{title}</h4>

        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>

      {children}
    </div>
  )
}

type CheckboxRowProps = {
  label: string

  checked: boolean

  onCheckedChange: () => void
}

function CheckboxRow({ label, checked, onCheckedChange }: CheckboxRowProps) {
  return (
    <button
      type="button"
      onClick={onCheckedChange}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
        checked ? "bg-primary/10" : "hover:bg-muted/60"
      )}
    >
      <Checkbox checked={checked} className="pointer-events-none" />

      <span className="truncate text-sm">{label}</span>
    </button>
  )
}
