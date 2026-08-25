"use client";

import { format } from "date-fns";
import { CalendarDays, Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  STOCK_STATUS_OPTIONS,
  STOCK_STATUSES,
  StockStatus,
} from "../../constants/product-stock-status";
import {
  STOCK_MOVEMENT_OPTIONS,
  StockMovement,
} from "../../constants/product-stock-movement";
import { useExportProductsPdf } from "../../hooks/use-export-product";
import { toDateRangeParams } from "../../utils/to-date-range-params";

type ProductTableToolsProps = {
  search: string;
  onSearchChange: (value: string) => void;

  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (values: string[]) => void;

  locations: string[];
  selectedLocations: string[];
  onLocationChange: (values: string[]) => void;

  units: string[];
  selectedUnits: string[];
  onUnitChange: (values: string[]) => void;
  selectedStockStatuses: string[];
  onStockStatusChange: (values: StockStatus[]) => void;
  selectedStockMovements: string[];
  onStockMovementChange: (values: StockMovement[]) => void;

  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
};

export function ProductTableTools({
  search,
  onSearchChange,
  categories,
  selectedCategories,
  onCategoryChange,
  locations,
  selectedLocations,
  onLocationChange,
  units,
  selectedUnits,
  onUnitChange,
  selectedStockStatuses,
  onStockStatusChange,
  selectedStockMovements,
  onStockMovementChange,
  dateRange,
  onDateRangeChange,
}: ProductTableToolsProps) {
  const { mutate: exportPdf, isPending } = useExportProductsPdf();
  const hasFilters =
    selectedCategories.length > 0 ||
    selectedLocations.length > 0 ||
    selectedUnits.length > 0 ||
    selectedStockStatuses.length > 0 ||
    selectedStockMovements.length > 0 ||
    dateRange?.from != null;

  return (
    <div className="flex items-center justify-between gap-4 bg-white p-4 shadow-sm rounded-xl">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
          />
        </div>

        <DateRangePickerButton
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
        />
      </div>
      <div className="flex justify-end gap-4">
        <Button
          onClick={() =>
            exportPdf({
              search,
              categories: selectedCategories,
              locations: selectedLocations,
              units: selectedUnits,
              stockStatuses: selectedStockStatuses as StockStatus[],
              stockMovements: selectedStockMovements as StockMovement[],
              ...toDateRangeParams(dateRange),
            })
          }
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            "Export PDF"
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 bg-white p-4">
            <FilterSection
              title="Stock Status"
              options={STOCK_STATUS_OPTIONS}
              selected={selectedStockStatuses}
              onChange={onStockStatusChange}
            />
            <div className="my-4 border-t" />
            <FilterSection
              title="Stock Movement"
              options={STOCK_MOVEMENT_OPTIONS}
              selected={selectedStockMovements}
              onChange={onStockMovementChange}
            />
            <div className="my-4 border-t" />
            <FilterSection
              title="Category"
              options={categories}
              selected={selectedCategories}
              onChange={onCategoryChange}
            />

            <div className="my-4 border-t" />

            <FilterSection
              title="Location"
              options={locations}
              selected={selectedLocations}
              onChange={onLocationChange}
            />

            <div className="my-4 border-t" />

            <FilterSection
              title="Unit"
              options={units}
              selected={selectedUnits}
              onChange={onUnitChange}
            />
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          className="w-fit"
          disabled={!hasFilters}
          onClick={() => {
            onCategoryChange([]);
            onLocationChange([]);
            onUnitChange([]);
            onStockStatusChange([]);
            onStockMovementChange([]);
            onDateRangeChange(undefined);
          }}
        >
          <X />
          Clear Filters
        </Button>
      </div>
    </div>
  );
}

type FilterSectionProps = {
  title: string;
  options: string[];
  selected: string[];
  onChange: (values: any[]) => void;
};

function FilterSection({
  title,
  options,
  selected,
  onChange,
}: FilterSectionProps) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold">{title}</h4>

      <div className="max-h-40 space-y-2 overflow-y-auto">
        {options.map((option) => (
          <div key={option} className="flex items-center gap-2">
            <Checkbox
              checked={selected.includes(option)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...selected, option]);
                } else {
                  onChange(selected.filter((item) => item !== option));
                }
              }}
            />

            <label className="text-sm">{option}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

type DateRangePickerButtonProps = {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
};

function DateRangePickerButton({
  dateRange,
  onDateRangeChange,
}: DateRangePickerButtonProps) {
  const label =
    dateRange?.from && dateRange.to
      ? `${format(dateRange.from, "dd MMM yyyy")} – ${format(dateRange.to, "dd MMM yyyy")}`
      : dateRange?.from
        ? `${format(dateRange.from, "dd MMM yyyy")} – ...`
        : "Added / Updated";

  return (
    <div className="flex items-center gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2 font-normal">
            <CalendarDays className="h-4 w-4" />
            {label}
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={1}
            defaultMonth={dateRange?.from}
          />

          {dateRange?.from && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => onDateRangeChange(undefined)}
              >
                Clear date range
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {dateRange?.from && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Clear date range"
          onClick={() => onDateRangeChange(undefined)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
