"use client";

import { useState } from "react";
import { useDebounce } from "use-debounce";

import { useSaleReturns } from "../../hooks/use-returns";
import { SaleReturnStatus } from "../../constants/sale-return-status";

import { ReturnPagination } from "./return-pagination";
import { ReturnTable } from "./return-table";
import { ReturnTableTools } from "./return-table-tools";

export function ReturnList() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<SaleReturnStatus>();

  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isLoading } = useSaleReturns({
    page,
    search: debouncedSearch,
    status,
    startDate,
    endDate,
  });

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateStatus(value?: SaleReturnStatus) {
    setStatus(value);
    setPage(1);
  }

  function updateStartDate(value?: string) {
    setStartDate(value);
    setPage(1);
  }

  function updateEndDate(value?: string) {
    setEndDate(value);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <ReturnTableTools
        search={search}
        onSearchChange={updateSearch}
        status={status}
        onStatusChange={updateStatus}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={updateStartDate}
        onEndDateChange={updateEndDate}
      />

      <ReturnTable data={data?.data ?? []} isLoading={isLoading} />

      <ReturnPagination
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
