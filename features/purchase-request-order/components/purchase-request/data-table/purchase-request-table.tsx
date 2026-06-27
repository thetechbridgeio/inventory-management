import {
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PurchaseRequestItem } from "@/features/purchase-request-order/types/purchase-request.type";
import { columns } from "./purchase-request-columns";
import { Button } from "@/components/ui/button";
import { RHFTextarea } from "@/components/react-hook-form-fields/rhf-textarea";
import { PurchaseRequestForm } from "@/features/purchase-request-order/validation/purchase-request-form";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

type PurchaseRequestTableProps = {
  data: PurchaseRequestItem[];
  isLoading: boolean;
  rowSelection: RowSelectionState;
  onRowSelectionChange: React.Dispatch<React.SetStateAction<RowSelectionState>>;
};

export function PurchaseRequestTable({
  data,
  isLoading,
  rowSelection,
  onRowSelectionChange,
}: PurchaseRequestTableProps) {
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    getRowId: (row) => row.productId,
    enableRowSelection: true,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
  });
  const { watch } = useFormContext<PurchaseRequestForm>();
  const items = watch("items");
  const selectedRows = table.getSelectedRowModel().rows;

const hasInvalidSelectedItems = selectedRows.some((row) => {
  const item = items.find((i) => i.productId === row.id);

  return (
    !item?.supplierId ||
    !item.supplierName ||
    !item.requestedQty ||
    item.requestedQty <= 0
  );
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
                  <TableCell colSpan={columns.length} className="h-[550px]">
                    <div className="flex h-full flex-col items-center justify-center gap-4">
                      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />

                      <div className="space-y-1 text-center">
                        <p className="font-medium">Loading products...</p>
                        <p className="text-sm text-muted-foreground">
                          Please wait while we fetch the inventory.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-[550px]">
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                      <p className="font-medium">No products found</p>

                      <p className="text-sm text-muted-foreground">
                        There are no products available to create a purchase
                        request.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row, index) => {
                  const item = items[index];

                  const hasIssue =
                    !item?.supplierId ||
                    !item.supplierName ||
                    !item?.requestedQty ||
                    item.requestedQty <= 0;

                  return (
                    <TableRow
                      key={row.id}
                    //   data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        "transition-colors",

                        hasIssue
                          ? "bg-amber-50/60 hover:bg-amber-50/60"
                          : "hover:bg-muted/40",

                        // Prevent TanStack/Shadcn's selected styling
                        "data-[state=selected]:bg-inherit!",
                      )}
                    >
                      {row.getVisibleCells().map((cell, cellIndex) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "py-4 align-middle",
                            hasIssue &&
                              cellIndex === 0 &&
                              "border-l-4 border-amber-500",
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <div className="">
          <div className="border-t bg-muted/20 px-6 py-4">
            <RHFTextarea<PurchaseRequestForm>
              name="remarks"
              label="Remarks"
              placeholder="Add any notes or special instructions for this purchase request..."
              helperText="Optional. This remark will be included with the purchase request."
            />
          </div>
          <div className="flex items-center justify-between px-6 py-3">
            <p className="text-sm text-muted-foreground">
              {table.getSelectedRowModel().rows.length} product(s) selected
            </p>

            <Button
              type="submit"
              disabled={table.getSelectedRowModel().rows.length === 0}
            >
              Create Purchase Request
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
