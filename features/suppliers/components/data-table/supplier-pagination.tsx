
"use client";

import { Button } from "@/components/ui/button";

export function SupplierPagination({
  page,
  totalPages,
  onPageChange,
}: any) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>

      <span>
        Page {page} of {totalPages}
      </span>

      <Button
        variant="outline"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
