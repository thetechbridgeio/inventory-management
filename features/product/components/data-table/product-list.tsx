"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { ProductTable } from "./product-table";
import { ProductTableTools } from "./product-table-tools";
import { ProductPagination } from "./product-pagination";
import { useProductFilters } from "../../hooks/use-product-filters";
import { useProducts } from "../../hooks/use-products";
import { ProductCategory } from "../../constants/product-category";

export function ProductList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);

  const [debouncedSearch] = useDebounce(search, 500);

  const { data: filters } = useProductFilters();

  console.log(filters);

  const { data, isLoading } = useProducts({
    page,
    search: debouncedSearch,
    categories,
    locations,
    units,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categories, locations, units]);


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
      />

      <ProductTable data={data?.items ?? []} isLoading={isLoading}/>

      <ProductPagination
        page={data?.pagination?.page ?? 1}
        totalPages={data?.pagination?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
