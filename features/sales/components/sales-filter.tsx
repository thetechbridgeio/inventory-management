import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Filter } from 'lucide-react'
import React from 'react'
import { SalesFilterState } from '../types/sale-entry-form.types'

const SalesFilter = ({
    isFiltersOpen,
    setIsFiltersOpen,
    filters,
    setFilters,
    productFilters,
    setProductFilters,
    companyFilters,
    setCompanyFilters,

}: {
    isFiltersOpen: boolean;
    setIsFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
    filters: SalesFilterState;
    setFilters: React.Dispatch<React.SetStateAction<SalesFilterState>>;
    productFilters: Record<string, boolean>;
    setProductFilters: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    companyFilters: Record<string, boolean>;
    setCompanyFilters: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) => {

    const handleProductFilterChange = (product: string, checked: boolean) => {
        setProductFilters((prev) => ({
            ...prev,
            [product]: checked,
        }))
    }

    const handleCompanyFilterChange = (company: string, checked: boolean) => {
        setCompanyFilters((prev) => ({
            ...prev,
            [company]: checked,
        }))
    }

    const handleDateRangeChange = (field: "from" | "to", date?: Date) => {
        setFilters((prev: any) => ({
            ...prev,
            dateRange: {
                ...prev.dateRange,
                [field]: date,
            },
        }))
    }


    return (
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="gap-1">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                    {(filters.product.length > 0 ||
                        filters.company.length > 0 ||
                        filters.dateRange.from ||
                        filters.dateRange.to) && (
                            <span className="ml-1 rounded-full bg-primary w-5 h-5 text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                                {filters.product.length +
                                    filters.company.length +
                                    (filters.dateRange.from || filters.dateRange.to ? 1 : 0)}
                            </span>
                        )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-4" align="end">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Products</h4>
                        <div className="max-h-[150px] overflow-auto space-y-2">
                            {Object.keys(productFilters).map((product) => (
                                <div key={product} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`product-filter-${product}`}
                                        checked={productFilters[product] || false}
                                        onCheckedChange={(checked) => handleProductFilterChange(product, !!checked)}
                                    />
                                    <Label htmlFor={`product-filter-${product}`} className="text-sm">
                                        {product}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Companies</h4>
                        <div className="max-h-[150px] overflow-auto space-y-2">
                            {Object.keys(companyFilters).map((company) => (
                                <div key={company} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`company-filter-${company}`}
                                        checked={companyFilters[company] || false}
                                        onCheckedChange={(checked) => handleCompanyFilterChange(company, !!checked)}
                                    />
                                    <Label htmlFor={`company-filter-${company}`} className="text-sm">
                                        {company}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Date Range</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="dateFrom" className="text-xs">
                                    From
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="dateFrom"
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal text-xs h-8",
                                                !filters.dateRange.from && "text-muted-foreground",
                                            )}
                                        >
                                            {filters.dateRange.from ? format(filters.dateRange.from, "PP") : "Pick date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={filters.dateRange.from}
                                            onSelect={(date) => handleDateRangeChange("from", date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div>
                                <Label htmlFor="dateTo" className="text-xs">
                                    To
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="dateTo"
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal text-xs h-8",
                                                !filters.dateRange.to && "text-muted-foreground",
                                            )}
                                        >
                                            {filters.dateRange.to ? format(filters.dateRange.to, "PP") : "Pick date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={filters.dateRange.to}
                                            onSelect={(date) => handleDateRangeChange("to", date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                // Reset product filters
                                const resetProductFilters: Record<string, boolean> = {}
                                Object.keys(productFilters).forEach((product) => {
                                    resetProductFilters[product] = false
                                })
                                setProductFilters(resetProductFilters)

                                // Reset company filters
                                const resetCompanyFilters: Record<string, boolean> = {}
                                Object.keys(companyFilters).forEach((company) => {
                                    resetCompanyFilters[company] = false
                                })
                                setCompanyFilters(resetCompanyFilters)

                                // Reset date range
                                setFilters((prev: any) => ({
                                    ...prev,
                                    dateRange: {
                                        from: undefined,
                                        to: undefined,
                                    },
                                }))
                            }}
                        >
                            Reset
                        </Button>
                        <Button size="sm" onClick={() => setIsFiltersOpen(false)}>
                            Apply
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default SalesFilter