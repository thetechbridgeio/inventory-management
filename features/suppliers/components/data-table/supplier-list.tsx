"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { SupplierTable } from "./supplier-table";
import { SupplierTableTools } from "./supplier-table-tools";
import { SupplierPagination } from "./supplier-pagination";
import { useSuppliers } from "../../hooks/use-get-suppliers";

export function SupplierList() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<boolean | null>(null);

  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isLoading } = useSuppliers({
    page,
    search: debouncedSearch,
    isActive,
  });


  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, isActive]);

  return (
    <div className="space-y-4">
      <SupplierTableTools
        filters={{
          search,
          isActive,
        }}
        setFilters={(values) => {
          if (values.search !== undefined) {
            setSearch(values.search);
          }

          if (values.isActive !== undefined) {
            setIsActive(values.isActive);
          }
        }}
      />

      <SupplierTable data={data?.data ?? []} isLoading={isLoading} />

      <SupplierPagination
        total={data?.total ?? 0}
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
