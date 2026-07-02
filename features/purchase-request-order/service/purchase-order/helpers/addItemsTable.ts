import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { PAGE, PDF_COLORS } from "./pdfConstants";
import { PurchaseOrderDocument } from "@/features/purchase-request-order/types/purchase-order.type";

/**
 * Renders the line items as a striped table.
 * Returns the Y position where the next section should start.
 */
export function addItemsTable(
  doc: jsPDF,
  document: PurchaseOrderDocument,
  startY: number,
): number {
  const { items } = document;

  const head = [["#", "Product", "Description", "Unit", "Ordered Qty"]];
  const body = items.map((item, index) => [
    String(index + 1),
    item.productName,
    item.description ?? "-",
    item.unit,
    item.orderedQty.toLocaleString("en-IN"),
  ]);

  autoTable(doc, {
    head,
    body,
    startY,
    margin: { left: PAGE.marginLeft, right: PAGE.marginRight },
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 3,
      textColor: PDF_COLORS.primary,
      lineColor: PDF_COLORS.border,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: PDF_COLORS.tableHeadBg,
      textColor: PDF_COLORS.tableHeadText,
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: PDF_COLORS.tableStripe,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 50 },
      2: { cellWidth: "auto" },
      3: { cellWidth: 22, halign: "center" },
      4: { cellWidth: 28, halign: "right" },
    },
  });

  // jspdf-autotable augments the doc instance with this field at runtime.
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } })
    .lastAutoTable.finalY;

  return finalY + 8;
}
