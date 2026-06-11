"use client";

import { format } from "date-fns";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createPDF } from "@/lib/create-pdf";

import { useExportPurchases } from "../hooks/use-purchases";
import { GetPurchasesParams } from "../types/purchase.type";

type PurchaseExportButtonProps = {
  filters: GetPurchasesParams;
};

export function PurchaseExportButton({
  filters,
}: PurchaseExportButtonProps) {
  const exportPurchases = useExportPurchases();


  const handleExport = async () => {
    try {
      const purchases =
        await exportPurchases.mutateAsync(filters);

        console.log(purchases)

      const rows = purchases.map(
        (
          purchase: {
            purchaseNumber: string;
            purchaseDate: string;
            supplierName: string;
            itemsCount: number;
            grandTotal: string | number;
          },
          index: number,
        ) => [
          index + 1,
          purchase.purchaseNumber,
          format(
            new Date(purchase.purchaseDate),
            "dd MMM yyyy",
          ),
          purchase.supplierName,
          purchase.itemsCount,
          Number(purchase.grandTotal).toFixed(2),
        ],
      );

      createPDF({
        title: "Purchases Report",
        fileName: `purchases-${format(
          new Date(),
          "yyyy-MM-dd",
        )}.pdf`,
        headers: [
          "Sr",
          "Purchase #",
          "Purchase Date",
          "Supplier",
          "Items",
          "Grand Total",
        ],
        rows,
      });
    } catch (error) {
      console.error(
        "Failed to export purchases:",
        error,
      );
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={exportPurchases.isPending}
      className="gap-2"
    >
      {exportPurchases.isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}