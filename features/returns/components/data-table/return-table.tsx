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
import { getReturnColumns, SaleReturnRow } from "./return-columns";

export function ReturnTable({
  data,
  isLoading,
}: {
  data: SaleReturnRow[];
  isLoading: boolean;
}) {
  const returnColumns = getReturnColumns();

  const table = useReactTable({
    data,
    columns: returnColumns,
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
              <TableCell colSpan={returnColumns.length} className="h-40">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />

                  <p className="text-muted-foreground text-sm">
                    Loading returns...
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        ) : data.length === 0 ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={returnColumns.length} className="h-40">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-sm font-medium">No returns found</p>
                  <p className="text-xs text-muted-foreground">
                    Returns created from Outgoings will show up here.
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
