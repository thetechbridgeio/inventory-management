import jsPDF from "jspdf";

import { CONTENT_WIDTH, PAGE, PDF_COLORS } from "./pdfConstants";
import { PurchaseOrderDocument } from "@/features/purchase-request-order/types/purchase-order.type";

/**
 * Draws a "Remarks" note block if the PO has remarks. No-op otherwise.
 * Returns the Y position where the next section should start.
 */
export function addRemarks(
  doc: jsPDF,
  document: PurchaseOrderDocument,
  startY: number,
): number {
  const remarks = document.purchaseOrder.remarks;
  if (!remarks) return startY;

  const left = PAGE.marginLeft;
  const panelPadding = 4;

  doc.setFontSize(8.5);
  const lines = doc.splitTextToSize(remarks, CONTENT_WIDTH - panelPadding * 2);
  const panelHeight = panelPadding * 2 + 5 + lines.length * 4.2;

  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(0.3);
  doc.setFillColor(...PDF_COLORS.panelBg);
  doc.roundedRect(left, startY, CONTENT_WIDTH, panelHeight, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("REMARKS", left + panelPadding, startY + panelPadding + 2);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_COLORS.secondary);
  doc.text(lines, left + panelPadding, startY + panelPadding + 7);

  return startY + panelHeight + 8;
}
