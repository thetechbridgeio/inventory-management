"use client";

import React from "react";
import {
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { Check, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ViewPurchaseRequestProduct } from "@/features/purchase-request-order/types/purchase-request.type";
import { approvalColumns } from "./approval-column";
import { PRPropDataType } from "../view-PR/view-PR.main";

type PurchaseRequestApprovalTableProps = {
  data: ViewPurchaseRequestProduct[];
  isLoading: boolean;
  rowSelection: RowSelectionState;
  onRowSelectionChange: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  isApprovePending?: boolean;
  isRejectPending?: boolean;
  prData: PRPropDataType;
  onReject: () => Promise<void> | void;
};

export function PurchaseRequestApprovalTable({
  data,
  isLoading,
  rowSelection,
  onRowSelectionChange,
  isApprovePending = false,
  isRejectPending = false,
  onReject,
  prData,
}: PurchaseRequestApprovalTableProps) {
  const table = useReactTable({
    data,
    columns: approvalColumns,
    state: {
      rowSelection,
    },
    getRowId: (row) => row.purchaseRequestItemId,
    enableRowSelection: (row) => Boolean(row.original.supplierId?.trim()),
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="overflow-hidden gap-0 py-0">
      <CardContent className="p-0">
        <div className="max-h-[50vh] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-20 bg-background">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="bg-background py-4 font-semibold whitespace-nowrap"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={approvalColumns.length}
                    className="h-[550px]"
                  >
                    <div className="flex h-full flex-col items-center justify-center gap-4">
                      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />

                      <div className="space-y-1 text-center">
                        <p className="font-medium">
                          Loading purchase request...
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Please wait while we fetch the items.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={approvalColumns.length}
                    className="h-[550px]"
                  >
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                      <p className="font-medium">No items found</p>

                      <p className="text-sm text-muted-foreground">
                        This purchase request doesn't contain any items.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-muted/40 data-[state=selected]:bg-inherit!"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between border-t px-6 py-3">
          <p className="text-sm text-muted-foreground">
            {table.getSelectedRowModel().rows.length} item(s) selected
          </p>

          <div className="flex items-center gap-2">
            {/* <RejectPurchaseRequestDialog
              prData={prData}
              isPending={isRejectPending}
              onReject={onReject}
            /> */}

            <Button
              type="submit"
              variant="outline"
              disabled={
                table.getSelectedRowModel().rows.length === 0 ||
                isApprovePending
              }
              className="
    border-green-200
    bg-green-50
    text-green-700
    hover:border-green-300
    hover:bg-green-100
    hover:text-green-800
  "
            >
              <Check className="mr-2 h-4 w-4" />
              Submit Descision
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
