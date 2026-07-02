import jsPDF from "jspdf";

import { PAGE, PDF_COLORS } from "./pdfConstants";
import { PurchaseOrderDocument } from "@/features/purchase-request-order/types/purchase-order.type";

/**
 * Draws a compact, right-aligned summary box with item/quantity totals.
 * Returns the Y position where the next section should start.
 */
export function addSummary(
  doc: jsPDF,
  document: PurchaseOrderDocument,
  startY: number,
): number {
  const { summary } = document;
  const right = PAGE.width - PAGE.marginRight;
  const boxWidth = 65;
  const boxLeft = right - boxWidth;
  const rowHeight = 6.5;
  const panelPadding = 4;
  const boxHeight = panelPadding * 2 + rowHeight * 2;

  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(0.3);
  doc.setFillColor(...PDF_COLORS.panelBg);
  doc.roundedRect(boxLeft, startY, boxWidth, boxHeight, 1.5, 1.5, "FD");

  const rows: [string, string][] = [
    ["Total Items", String(summary.totalItems)],
    ["Total Ordered Qty", summary.totalOrderedQty.toLocaleString("en-IN")],
  ];

  let rowY = startY + panelPadding + 3;
  doc.setFontSize(9);
  for (const [label, value] of rows) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...PDF_COLORS.secondary);
    doc.text(label, boxLeft + panelPadding, rowY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PDF_COLORS.primary);
    doc.text(value, right - panelPadding, rowY, { align: "right" });

    rowY += rowHeight;
  }

  return startY + boxHeight + 8;
}
