"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  isLoading: boolean;

  page: number;
  totalPages: number;

  onPageChange: (
    page: number,
  ) => void;
};

export function UserTable<
  TData,
  TValue,
>({
  columns,
  data,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: Props<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel:
      getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          {table
            .getHeaderGroups()
            .map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
              >
                {headerGroup.headers.map(
                  (header) => (
                    <TableHead
                      key={header.id}
                    >
                      {flexRender(
                        header.column
                          .columnDef
                          .header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ),
                )}
              </TableRow>
            ))}
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={
                  columns.length
                }
                className="h-32 text-center"
              >
                Loading users...
              </TableCell>
            </TableRow>
          ) : data.length ? (
            table
              .getRowModel()
              .rows.map((row) => (
                <TableRow
                  key={row.id}
                >
                  {row
                    .getVisibleCells()
                    .map((cell) => (
                      <TableCell
                        key={cell.id}
                      >
                        {flexRender(
                          cell.column
                            .columnDef
                            .cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                </TableRow>
              ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={
                  columns.length
                }
                className="h-32 text-center"
              >
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t p-4">
        <p className="text-sm text-muted-foreground">
          Page {page} of{" "}
          {totalPages}
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() =>
              onPageChange(
                page - 1,
              )
            }
          >
            <ChevronLeft className="mr-1 size-4" />
            Previous
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={
              page >= totalPages
            }
            onClick={() =>
              onPageChange(
                page + 1,
              )
            }
          >
            Next
            <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}