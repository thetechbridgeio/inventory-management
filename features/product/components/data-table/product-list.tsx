"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { ProductTable } from "./product-table";
import { ProductTableTools } from "./product-table-tools";
import { ProductPagination } from "./product-pagination";
import { useProductFilters } from "../../hooks/use-product-filters";
import { useProducts } from "../../hooks/use-products";
import { STOCK_STATUSES, StockStatus } from "../../constants/product-stock-status";

export function ProductList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [selectedStockStatuses, setSelectedStockStatuses] = useState<StockStatus[]>([]);

  const [debouncedSearch] = useDebounce(search, 500);

  const { data: filters } = useProductFilters();

  const { data, isLoading } = useProducts({
    page,
    search: debouncedSearch,
    categories,
    locations,
    units,
    stockStatuses: selectedStockStatuses,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categories, locations, units, selectedStockStatuses]);

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
      />

      <ProductTable data={data?.data ?? []} isLoading={isLoading} />

      <ProductPagination
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
