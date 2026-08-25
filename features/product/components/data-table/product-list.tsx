"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import type { DateRange } from "react-day-picker";

import { ProductTable } from "./product-table";
import { ProductTableTools } from "./product-table-tools";
import { ProductPagination } from "./product-pagination";
import { useProductFilters } from "../../hooks/use-product-filters";
import { useProducts } from "../../hooks/use-products";
import { STOCK_STATUSES, StockStatus } from "../../constants/product-stock-status";
import { StockMovement } from "../../constants/product-stock-movement";
import { toDateRangeParams } from "../../utils/to-date-range-params";

export function ProductList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [selectedStockStatuses, setSelectedStockStatuses] = useState<StockStatus[]>([]);
  const [selectedStockMovements, setSelectedStockMovements] = useState<StockMovement[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [createdAtSortOrder, setCreatedAtSortOrder] = useState<"asc" | "desc">("desc");

  const [debouncedSearch] = useDebounce(search, 500);

  const { data: filters } = useProductFilters();

  const { updatedFrom, updatedTo } = toDateRangeParams(dateRange);

  const { data, isLoading } = useProducts({
    page,
    search: debouncedSearch,
    categories,
    locations,
    units,
    stockStatuses: selectedStockStatuses,
    stockMovements: selectedStockMovements,
    sortOrder: createdAtSortOrder,
    updatedFrom,
    updatedTo,
  });

  const toggleCreatedAtSort = useCallback(() => {
    setCreatedAtSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    categories,
    locations,
    units,
    selectedStockStatuses,
    selectedStockMovements,
    createdAtSortOrder,
    updatedFrom,
    updatedTo,
  ]);

  return (
    <div className="space-y-4">
      <ProductTableTools
        search={search}
        onSearchChange={setSearch}
        categories={filters?.categories ?? []}
        locations={filters?.locations ?? []}
        units={filters?.units ?? []}
        selectedCategories={categories}
        onCategoryChange={setCategories}
        selectedLocations={locations}
        onLocationChange={setLocations}
        selectedUnits={units}
        onUnitChange={setUnits}
        selectedStockStatuses={selectedStockStatuses}
        onStockStatusChange={setSelectedStockStatuses}
        selectedStockMovements={selectedStockMovements}
        onStockMovementChange={setSelectedStockMovements}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <ProductTable
        data={data?.data ?? []}
        isLoading={isLoading}
        createdAtSortOrder={createdAtSortOrder}
        onToggleCreatedAtSort={toggleCreatedAtSort}
      />

      <ProductPagination
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
