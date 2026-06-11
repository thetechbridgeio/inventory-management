"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { usePurchases } from "../../hooks/use-purchases";
import { usePurchaseFilters } from "../../hooks/use-purchase-filters";

import { PurchaseTable } from "./purchase-table";
import { PurchasePagination } from "./purchase-pagination";
import { PurchaseTableTools } from "./purchase-table-tools";

export function PurchaseList() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [supplierIds, setSupplierIds] = useState<string[]>([]);

  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  const [sortBy, setSortBy] = useState<"supplier" | "grandTotal" | undefined>();

  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>();

  const [debouncedSearch] = useDebounce(search, 500);

  const { data: filters } = usePurchaseFilters();

  const { data, isLoading } = usePurchases({
    page,
    search: debouncedSearch,
    supplierIds,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, supplierIds, startDate, endDate, sortBy, sortOrder]);

  return (
    <div className="space-y-4">
      <PurchaseTableTools
        exportFilters={{
          search: debouncedSearch,
          supplierIds,
          startDate,
          endDate,
          sortBy,
          sortOrder,
        }}
        search={search}
        onSearchChange={setSearch}
        suppliers={filters?.suppliers ?? []}
        selectedSupplierIds={supplierIds}
        onSupplierChange={setSupplierIds}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      <PurchaseTable data={data?.data ?? []} isLoading={isLoading} />

      <PurchasePagination
        page={data?.pagination?.page ?? 1}
        totalPages={data?.pagination?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
