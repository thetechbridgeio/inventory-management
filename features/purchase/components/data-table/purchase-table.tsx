"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Loader2 } from "lucide-react";
import { getPurchaseColumns, PurchaseRow } from "./purchase-columns";
import { useAuth } from "@/features/auth/providers/use-auth.provider";
import { useMemo } from "react";

export function PurchaseTable({
  data,
  isLoading,
}: {
  data: PurchaseRow[];
  isLoading: boolean;
}) {
  const { user } = useAuth();
  const purchaseColumns = useMemo(
    () => getPurchaseColumns(user?.role),
    [user?.role],
  );
  const table = useReactTable({
    data,
    columns: purchaseColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        {isLoading ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={purchaseColumns.length} className="h-40">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />

                  <p className="text-muted-foreground text-sm">
                    Loading Incomings...
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                className={index % 2 === 0 ? "bg-muted/30" : ""}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </div>
  );
}
